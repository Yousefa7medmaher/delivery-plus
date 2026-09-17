import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CorrelationIdMiddleware, RedisModule } from '@food-delivery/shared';
import { CartModule } from './modules/cart/cart.module';
import { HealthController } from './controllers/health.controller';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule, RedisModule.register({ url: process.env.REDIS_URL || 'redis://localhost:6379' }), CartModule],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}

