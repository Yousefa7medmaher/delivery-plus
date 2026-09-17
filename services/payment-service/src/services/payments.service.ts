import { Inject, Injectable } from '@nestjs/common';
import {
  ConflictError,
  ForbiddenError,
  InvalidStateTransitionError,
  NotFoundError,
  OrderStatus,
  PAYMENT_TRANSITIONS,
  PaymentStatus,
  UserRole,
  isTransitionAllowed,
  KafkaProducerService,
  TOPICS,
  PaymentEventType,
  generateCorrelationId,
} from '@food-delivery/shared';
import { PaymentsRepository } from '../repositories/payments.repository';
import { OrderServiceClient } from '../common/order-service.client';
import { APP_CONFIG, AppConfig } from '../config/app-config';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ProcessPaymentDto } from '../dto/process-payment.dto';
import { Payment } from '../entities/payment.entity';
import { v4 as uuidv4 } from 'uuid';

const ACTIVE_PAYMENT_STATUSES: PaymentStatus[] = [
  PaymentStatus.PENDING,
  PaymentStatus.PROCESSING,
  PaymentStatus.COMPLETED,
];

@Injectable()
export class PaymentsService {
  constructor(
    private readonly payments: PaymentsRepository,
    private readonly orderClient: OrderServiceClient,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async createPayment(customerId: string, dto: CreatePaymentDto, authHeader: string): Promise<Payment> {
    const order = await this.orderClient.getOrder(dto.orderId, authHeader);

    if (order.customerId !== customerId) {
      throw new ForbiddenError('You do not own this order');
    }
    if (order.status !== OrderStatus.CREATED) {
      throw new ConflictError(`Order ${dto.orderId} is not awaiting payment (status ${order.status})`);
    }

    const existing = await this.payments.findLatestByOrder(dto.orderId);
    if (existing && ACTIVE_PAYMENT_STATUSES.includes(existing.status)) {
      throw new ConflictError(`Order ${dto.orderId} already has an active payment`);
    }

    const payment = await this.payments.create({
      orderId: dto.orderId,
      customerId,
      amount: order.totalAmount,
    });

    await this.kafkaProducer.publish(TOPICS.PAYMENT_EVENTS, {
      eventId: uuidv4(),
      eventType: PaymentEventType.CREATED,
      timestamp: new Date().toISOString(),
      correlationId: generateCorrelationId(),
      payload: {
        paymentId: payment.id,
        orderId: payment.orderId,
        amount: parseFloat(payment.amount),
        status: payment.status,
      },
    });

    await this.orderClient.updateOrderStatus(payment.orderId, OrderStatus.PAYMENT_PENDING);

    return payment;
  }

  async processPayment(paymentId: string, requesterId: string, dto: ProcessPaymentDto): Promise<Payment> {
    const payment = await this.findOrThrow(paymentId);

    if (payment.customerId !== requesterId) {
      throw new ForbiddenError('You do not own this payment');
    }

    this.assertTransition(payment.status, PaymentStatus.PROCESSING);
    await this.payments.updateStatus(paymentId, PaymentStatus.PROCESSING);

    const succeeded = this.simulateOutcome(dto.simulateFailure);

    if (succeeded) {
      this.assertTransition(PaymentStatus.PROCESSING, PaymentStatus.COMPLETED);
      const updated = await this.payments.updateStatus(paymentId, PaymentStatus.COMPLETED);
      
      await this.kafkaProducer.publish(TOPICS.PAYMENT_EVENTS, {
        eventId: uuidv4(),
        eventType: PaymentEventType.COMPLETED,
        timestamp: new Date().toISOString(),
        correlationId: generateCorrelationId(),
        payload: {
          paymentId: updated!.id,
          orderId: updated!.orderId,
          amount: parseFloat(updated!.amount),
          status: updated!.status,
        },
      });

      await this.orderClient.updateOrderStatus(updated!.orderId, OrderStatus.CONFIRMED);

      return updated as Payment;
    }

    this.assertTransition(PaymentStatus.PROCESSING, PaymentStatus.FAILED);
    const updated = await this.payments.updateStatus(
      paymentId,
      PaymentStatus.FAILED,
      'Simulated payment decline',
    );

    await this.kafkaProducer.publish(TOPICS.PAYMENT_EVENTS, {
      eventId: uuidv4(),
      eventType: PaymentEventType.FAILED,
      timestamp: new Date().toISOString(),
      correlationId: generateCorrelationId(),
      payload: {
        paymentId: updated!.id,
        orderId: updated!.orderId,
        amount: parseFloat(updated!.amount),
        status: updated!.status,
      },
    });

    await this.orderClient.updateOrderStatus(updated!.orderId, OrderStatus.FAILED);

    return updated as Payment;
  }

  async getStatus(paymentId: string, requesterId: string, requesterRole: UserRole): Promise<Payment> {
    const payment = await this.findOrThrow(paymentId);
    if (requesterRole !== UserRole.ADMIN && payment.customerId !== requesterId) {
      throw new ForbiddenError('You do not have access to this payment');
    }
    return payment;
  }

  async refund(paymentId: string, requesterId: string, requesterRole: UserRole): Promise<Payment> {
    const payment = await this.findOrThrow(paymentId);

    if (requesterRole !== UserRole.ADMIN && payment.customerId !== requesterId) {
      throw new ForbiddenError('You do not have access to this payment');
    }

    this.assertTransition(payment.status, PaymentStatus.REFUNDED);
    const updated = await this.payments.updateStatus(paymentId, PaymentStatus.REFUNDED);
    return updated as Payment;
  }

  private assertTransition(from: PaymentStatus, to: PaymentStatus): void {
    if (!isTransitionAllowed(PAYMENT_TRANSITIONS, from, to)) {
      throw new InvalidStateTransitionError('Payment', from, to);
    }
  }

  private simulateOutcome(forceFailure?: boolean): boolean {
    if (forceFailure === true) return false;
    if (forceFailure === false) return true;
    return Math.random() < this.config.paymentSuccessRate;
  }

  private async findOrThrow(id: string): Promise<Payment> {
    const payment = await this.payments.findById(id);
    if (!payment) {
      throw new NotFoundError(`Payment ${id} not found`);
    }
    return payment;
  }
}
