import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { BaseEvent } from '../events/base-event';
import { KafkaModuleOptions } from './kafka.module';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor(@Inject('KAFKA_OPTIONS') private options: KafkaModuleOptions) {
    this.kafka = new Kafka({
      clientId: this.options.clientId,
      brokers: this.options.brokers,
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log(`Kafka Producer connected for ${this.options.clientId}`);
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async publish<T>(topic: string, event: BaseEvent<T>) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: event.correlationId, // Keeps related events in the same partition
            value: JSON.stringify(event),
          },
        ],
      });
      this.logger.log(`Published event ${event.eventType} to topic ${topic}`, {
        correlationId: event.correlationId,
        eventId: event.eventId,
      });
    } catch (error) {
      this.logger.error(`Failed to publish event ${event.eventType} to topic ${topic}`, error);
      throw error;
    }
  }
}
