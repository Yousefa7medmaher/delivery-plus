import { BaseEvent } from './base-event';
import { OrderStatus } from '../types/enums';

export enum OrderEventType {
  CREATED = 'order.created',
  CONFIRMED = 'order.confirmed',
  CANCELLED = 'order.cancelled',
  PREPARING = 'order.preparing',
  READY_FOR_PICKUP = 'order.ready_for_pickup',
  DRIVER_ASSIGNED = 'order.driver_assigned',
  PICKED_UP = 'order.picked_up',
  DELIVERED = 'order.delivered',
}

export interface OrderPayload {
  orderId: string;
  customerId: string;
  restaurantId: string;
  total: number;
  status: OrderStatus;
}

export interface OrderEvent extends BaseEvent<OrderPayload> {
  eventType: OrderEventType;
}
