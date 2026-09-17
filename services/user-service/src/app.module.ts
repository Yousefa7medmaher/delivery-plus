import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorrelationIdMiddleware } from '@food-delivery/shared';
import { UsersModule } from './modules/users/users.module';
import { HealthController } from './controllers/health.controller';
import { ConfigModule } from './config/config.module';
import { loadConfig } from './config/app-config';
import { UserProfile } from './entities/user-profile.entity';

const config = loadConfig();

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: config.databaseUrl,
      entities: [UserProfile],
      synchronize: config.nodeEnv !== 'production', // simplification: no migration runner wired yet (Phase 12)
      logging: false,
    }),
    UsersModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
