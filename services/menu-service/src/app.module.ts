import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorrelationIdMiddleware, RedisModule } from '@food-delivery/shared';
import { MenuModule } from './modules/menu/menu.module';
import { HealthController } from './controllers/health.controller';
import { ConfigModule } from './config/config.module';
import { loadConfig } from './config/app-config';
import { Category } from './entities/category.entity';
import { MenuItem } from './entities/menu-item.entity';

const config = loadConfig();

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: config.databaseUrl,
      entities: [Category, MenuItem],
      synchronize: config.nodeEnv !== 'production',
      logging: false,
    }),
    RedisModule.register({ url: process.env.REDIS_URL || 'redis://localhost:6379' }),
    MenuModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
