import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { APP_CONFIG, AppConfig } from '../config/app-config';
import { DriverLocation } from '../entities/location.model';

function locationKey(userId: string): string {
  return `driver:location:${userId}`;
}

@Injectable()
export class LocationRepository {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async save(location: DriverLocation): Promise<void> {
    await this.redis.set(
      locationKey(location.userId),
      JSON.stringify(location),
      'EX',
      this.config.locationTtlSeconds,
    );
  }

  async find(userId: string): Promise<DriverLocation | null> {
    const raw = await this.redis.get(locationKey(userId));
    return raw ? (JSON.parse(raw) as DriverLocation) : null;
  }

  async ping(): Promise<boolean> {
    const result = await this.redis.ping();
    return result === 'PONG';
  }
}

