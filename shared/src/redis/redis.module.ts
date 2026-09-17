import { Module, DynamicModule, Global } from '@nestjs/common';
import { Redis } from 'ioredis';
import { CacheService } from './cache.service';
import { RateLimiterService } from './rate-limiter.service';
import { RateLimitGuard } from './rate-limit.guard';

export interface RedisModuleOptions {
  url: string;
}

@Global()
@Module({})
export class RedisModule {
  static register(options: RedisModuleOptions): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: 'REDIS_CLIENT',
          useFactory: () => {
            return new Redis(options.url);
          },
        },
        CacheService,
        RateLimiterService,
        RateLimitGuard,
      ],
      exports: ['REDIS_CLIENT', CacheService, RateLimiterService, RateLimitGuard],
    };
  }
}
