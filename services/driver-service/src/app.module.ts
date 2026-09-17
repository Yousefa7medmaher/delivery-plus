import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorrelationIdMiddleware, KafkaModule } from '@food-delivery/shared';
import { DriversModule } from './modules/drivers/drivers.module';
import { HealthController } from './controllers/health.controller';
import { ConfigModule } from './config/config.module';
import { loadConfig } from './config/app-config';
import { Driver } from './entities/driver.entity';

const config = loadConfig();

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: config.databaseUrl,
      entities: [Driver],
      synchronize: config.nodeEnv !== 'production',
      logging: false,
    }),
    KafkaModule.register({
      clientId: 'driver-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      groupId: 'driver-service-group',
    }),
    DriversModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
