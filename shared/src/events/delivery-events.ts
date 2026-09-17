import { BaseEvent } from './base-event';

export enum DeliveryEventType {
  CREATED = 'delivery.created',
  DRIVER_ASSIGNED = 'delivery.driver_assigned',
  PICKED_UP = 'delivery.picked_up',
  IN_TRANSIT = 'delivery.in_transit',
  COMPLETED = 'delivery.completed',
  CANCELLED = 'delivery.cancelled',
}

export interface DeliveryPayload {
  deliveryId: string;
  orderId: string;
  driverId?: string;
  status: string; // PENDING, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED
}

export interface DeliveryEvent extends BaseEvent<DeliveryPayload> {
  eventType: DeliveryEventType;
}
