import { BaseEvent } from './base-event';

export enum PaymentEventType {
  CREATED = 'payment.created',
  COMPLETED = 'payment.completed',
  FAILED = 'payment.failed',
}

export interface PaymentPayload {
  paymentId: string;
  orderId: string;
  amount: number;
  status: string; // PENDING, PROCESSING, COMPLETED, FAILED
}

export interface PaymentEvent extends BaseEvent<PaymentPayload> {
  eventType: PaymentEventType;
}
