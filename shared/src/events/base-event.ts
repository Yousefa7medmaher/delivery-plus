/**
 * Envelope every Kafka event must follow. Service-specific payload
 * interfaces (OrderCreatedEvent, etc.) are added in the Kafka phase (Phase 9)
 * alongside the services that publish/consume them, extending BaseEvent<T>.
 */
export interface BaseEvent<T = unknown> {
  eventId: string;
  eventType: string;
  timestamp: string;
  correlationId: string;
  payload: T;
}
