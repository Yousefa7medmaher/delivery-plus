import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { BaseEvent } from '../events/base-event';
import { KafkaModuleOptions } from './kafka.module';

export type MessageHandler<T> = (event: BaseEvent<T>) => Promise<void>;

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;
  private handlers = new Map<string, Map<string, MessageHandler<any>>>();
  // In-memory idempotency store for demonstration (in prod, use Redis or Postgres)
  private processedEvents = new Set<string>();
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(@Inject('KAFKA_OPTIONS') private options: KafkaModuleOptions) {
    this.kafka = new Kafka({
      clientId: this.options.clientId,
      brokers: this.options.brokers,
    });
    this.consumer = this.kafka.consumer({ groupId: this.options.groupId || `${this.options.clientId}-group` });
  }

  async onModuleInit() {
    await this.consumer.connect();
    this.logger.log(`Kafka Consumer connected for ${this.options.clientId}`);
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  async subscribe<T>(topic: string, eventType: string, handler: MessageHandler<T>) {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Map());
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }
    this.handlers.get(topic)!.set(eventType, handler);
  }

  async start() {
    await this.consumer.run({
      autoCommit: false, // Manual offset commit
      eachMessage: async (payload: EachMessagePayload) => {
        const { topic, partition, message } = payload;
        
        if (!message.value) return;

        let event: BaseEvent<any>;
        try {
          event = JSON.parse(message.value.toString());
        } catch (e) {
          this.logger.error(`Failed to parse message from topic ${topic}`, e);
          await this.commitOffset(topic, partition, message.offset);
          return;
        }

        // Idempotency check
        if (this.processedEvents.has(event.eventId)) {
          this.logger.log(`Event ${event.eventId} already processed, skipping`);
          await this.commitOffset(topic, partition, message.offset);
          return;
        }

        const topicHandlers = this.handlers.get(topic);
        if (topicHandlers) {
          const handler = topicHandlers.get(event.eventType);
          if (handler) {
            let attempt = 0;
            const maxRetries = 3;
            let success = false;

            while (attempt < maxRetries && !success) {
              try {
                await handler(event);
                success = true;
                this.processedEvents.add(event.eventId);
                await this.commitOffset(topic, partition, message.offset);
              } catch (error) {
                attempt++;
                this.logger.warn(`Failed to process event ${event.eventId}, attempt ${attempt}/${maxRetries}`, error);
                if (attempt >= maxRetries) {
                  this.logger.error(`Exhausted retries for event ${event.eventId}. Sending to DLQ.`);
                  // DLQ logic goes here in a real scenario
                  await this.commitOffset(topic, partition, message.offset);
                } else {
                  // Exponential backoff
                  await new Promise((res) => setTimeout(res, Math.pow(2, attempt) * 100));
                }
              }
            }
          } else {
             // No handler for this event type, just commit and ignore
             await this.commitOffset(topic, partition, message.offset);
          }
        }
      },
    });
  }

  private async commitOffset(topic: string, partition: number, offset: string) {
    await this.consumer.commitOffsets([{ topic, partition, offset: (BigInt(offset) + 1n).toString() }]);
  }
}
