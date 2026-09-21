import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  /** Executes the forward migration as a no-op query, leaving the database schema unchanged. */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    `);

    await queryRunner.query(`
      CREATE TYPE "payment_status" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');
    `);

    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "orderId" uuid NOT NULL,
        "customerId" uuid NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "status" "payment_status" NOT NULL DEFAULT 'PENDING',
        "failureReason" character varying,
        "idempotencyKey" character varying(255),
        "publishedEventStatus" character varying(20),
        "orderSyncedStatus" character varying(20),
        "sideEffectsLeaseUntil" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_payments_orderId"
      ON "payments" ("orderId");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_payments_customerId"
      ON "payments" ("customerId");
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_payments_active_order"
      ON "payments" ("orderId")
      WHERE "status" IN ('PENDING', 'PROCESSING', 'COMPLETED');
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_payments_customer_idempotency_key"
      ON "payments" ("customerId", "idempotencyKey")
      WHERE "idempotencyKey" IS NOT NULL;
    `);
  }

  /** Executes the reverse migration as a no-op query, leaving the database schema unchanged. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "payments";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_status";`);
  }
}
