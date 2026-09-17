import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from '../../entities/credential.entity';
import { CredentialsRepository } from '../../repositories/credentials.repository';
import { UserServiceClient } from '../../common/user-service.client';
import { AuthService } from '../../services/auth.service';
import { AuthController } from '../../controllers/auth.controller';
import { APP_CONFIG, AppConfig } from '../../config/app-config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Credential]),
    JwtModule.registerAsync({
      useFactory: (config: AppConfig) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: config.jwtExpiresIn },
      }),
      inject: [APP_CONFIG],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, CredentialsRepository, UserServiceClient],
})
export class AuthModule {}
