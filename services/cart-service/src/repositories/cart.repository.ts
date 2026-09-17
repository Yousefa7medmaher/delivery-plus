import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { APP_CONFIG, AppConfig } from '../config/app-config';
import { Cart } from '../entities/cart.model';

function cartKey(userId: string): string {
  return `cart:${userId}`;
}

@Injectable()
export class CartRepository {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async find(userId: string): Promise<Cart | null> {
    const raw = await this.redis.get(cartKey(userId));
    return raw ? (JSON.parse(raw) as Cart) : null;
  }

  async save(cart: Cart): Promise<void> {
    await this.redis.set(
      cartKey(cart.userId),
      JSON.stringify(cart),
      'EX',
      this.config.cartTtlSeconds,
    );
  }

  async delete(userId: string): Promise<void> {
    await this.redis.del(cartKey(userId));
  }

  async ping(): Promise<boolean> {
    const result = await this.redis.ping();
    return result === 'PONG';
  }
}

