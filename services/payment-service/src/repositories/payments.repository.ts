import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaymentStatus } from '@food-delivery/shared';
import { ACTIVE_PAYMENT_STATUSES, Payment } from '../entities/payment.entity';

export type CreatePaymentData = Pick<Payment, 'orderId' | 'customerId' | 'amount'> & {
  idempotencyKey?: string | null;
};

@Injectable()
export class PaymentsRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
  ) {}

  findById(id: string): Promise<Payment | null> {
    return this.repo.findOne({ where: { id } });
  }

  /** Returns the most recent payment attempt for an order, if any. */
  findLatestByOrder(orderId: string): Promise<Payment | null> {
    return this.repo.findOne({ where: { orderId }, order: { createdAt: 'DESC' } });
  }

  /** Returns the order's active (PENDING/PROCESSING/COMPLETED) payment, if any. */
  findActiveByOrder(orderId: string): Promise<Payment | null> {
    return this.repo.findOne({
      where: { orderId, status: In([...ACTIVE_PAYMENT_STATUSES]) },
    });
  }

  findByIdempotencyKey(customerId: string, idempotencyKey: string): Promise<Payment | null> {
    return this.repo.findOne({ where: { customerId, idempotencyKey } });
  }

  /**
   * Inserts a new payment. Throws a unique-violation error (Postgres 23505) when
   * the order already has an active payment or the customer's idempotency key
   * was already used; callers must handle that — see `isUniqueViolation`.
   */
  create(data: CreatePaymentData): Promise<Payment> {
    return this.repo.save(this.repo.create(data));
  }

  /**
   * Atomic compare-and-set status change: only updates the row while it is
   * still in `from`. Returns true when this caller performed the transition,
   * false when another request changed the status first.
   */
  async transition(
    id: string,
    from: PaymentStatus,
    to: PaymentStatus,
    failureReason?: string,
  ): Promise<boolean> {
    const changes: Partial<Payment> = { status: to };
    if (failureReason !== undefined) changes.failureReason = failureReason;
    const result = await this.repo.update({ id, status: from }, changes);
    return (result.affected ?? 0) === 1;
  }

  /**
   * Atomically takes the side-effects lease if it is free or expired. Uses the
   * database clock so app-server clock skew cannot produce two holders.
   */
  async acquireSideEffectsLease(id: string, ttlMs: number): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(Payment)
      .set({ sideEffectsLeaseUntil: () => `now() + (:ttlMs * interval '1 millisecond')` })
      .where('id = :id', { id })
      .andWhere('("sideEffectsLeaseUntil" IS NULL OR "sideEffectsLeaseUntil" < now())')
      .setParameters({ ttlMs })
      .execute();
    return (result.affected ?? 0) === 1;
  }

  async releaseSideEffectsLease(id: string): Promise<void> {
    await this.repo.update({ id }, { sideEffectsLeaseUntil: null });
  }

  async markEventPublished(id: string, status: PaymentStatus): Promise<void> {
    await this.repo.update({ id }, { publishedEventStatus: status });
  }

  async markOrderSynced(id: string, status: PaymentStatus): Promise<void> {
    await this.repo.update({ id }, { orderSyncedStatus: status });
  }
}

const PG_UNIQUE_VIOLATION = '23505';

/** Detects a Postgres unique-constraint violation, optionally for a specific constraint. */
export function isUniqueViolation(err: unknown, constraint?: string): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string; constraint?: string; driverError?: { code?: string; constraint?: string } };
  const code = e.driverError?.code ?? e.code;
  if (code !== PG_UNIQUE_VIOLATION) return false;
  if (!constraint) return true;
  return (e.driverError?.constraint ?? e.constraint) === constraint;
}
