import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentStatus } from '@food-delivery/shared';
import { Payment } from '../entities/payment.entity';

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

  create(data: Pick<Payment, 'orderId' | 'customerId' | 'amount'>): Promise<Payment> {
    return this.repo.save(this.repo.create(data));
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
    failureReason?: string,
  ): Promise<Payment | null> {
    await this.repo.update({ id }, { status, failureReason });
    return this.findById(id);
  }
}
