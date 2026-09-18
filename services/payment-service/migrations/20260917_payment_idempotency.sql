-- payment-service: idempotent payment creation and retry-safe processing (issue #10)
--
-- Production runs with TypeORM `synchronize: false`, so this script must be applied
-- manually (psql) to the payment_service database BEFORE deploying the new code.
-- It is idempotent: re-running it is a no-op.
--
-- Step 0 (pre-check) — the unique index in step 2 fails if an order already has
-- more than one active payment. Find them with:
--
--   SELECT "orderId", array_agg(id ORDER BY "createdAt") AS payment_ids
--   FROM payments
--   WHERE status IN ('PENDING', 'PROCESSING', 'COMPLETED')
--   GROUP BY "orderId"
--   HAVING count(*) > 1;
--
-- Resolve each row by hand (keep the COMPLETED one, or the oldest; mark the others
-- FAILED with a failureReason) before continuing.

BEGIN;

-- 1. New columns (all nullable → no table rewrite, existing rows unaffected).
ALTER TABLE payments ADD COLUMN IF NOT EXISTS "idempotencyKey" character varying(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS "publishedEventStatus" character varying(20);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS "orderSyncedStatus" character varying(20);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS "sideEffectsLeaseUntil" TIMESTAMP WITH TIME ZONE;

-- Existing payments already had their side effects performed by the old code path.
-- Mark them as done so a retry after deploy doesn't republish old events.
UPDATE payments
SET "publishedEventStatus" = status, "orderSyncedStatus" = status
WHERE "publishedEventStatus" IS NULL
  AND status IN ('PENDING', 'COMPLETED', 'FAILED');

COMMIT;

-- 2. Uniqueness. Built outside the transaction so it can use CONCURRENTLY
--    (no write lock on a live table). If a CONCURRENTLY build fails it leaves an
--    INVALID index behind: DROP INDEX it, fix the data, and re-run.
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "UQ_payments_active_order"
  ON payments ("orderId")
  WHERE "status" IN ('PENDING', 'PROCESSING', 'COMPLETED');

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "UQ_payments_customer_idempotency_key"
  ON payments ("customerId", "idempotencyKey")
  WHERE "idempotencyKey" IS NOT NULL;
