import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RateLimiterService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async incrementAndCheck(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, windowSeconds);
    }
    return current <= limit;
  }
}
