import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CorrelationIdMiddleware, KafkaModule } from '@food-delivery/shared';
import { ConfigModule } from './config/config.module';
import { APP_CONFIG, AppConfig } from './config/app-config';
import { HealthController } from './controllers/health.controller';
import { NotificationsModule } from './modules/notifications.module';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => ({
        type: 'postgres',
        url: config.databaseUrl,
        entities: [Notification],
        synchronize: true, // dev only
      }),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: '1h' },
      }),
    }),
    KafkaModule.register({
      clientId: 'notification-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      groupId: 'notification-service-group',
    }),
    NotificationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
