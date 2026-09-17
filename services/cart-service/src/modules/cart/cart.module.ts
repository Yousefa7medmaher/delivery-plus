import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CartRepository } from '../../repositories/cart.repository';
import { CartService } from '../../services/cart.service';
import { CartController } from '../../controllers/cart.controller';
import { MenuServiceClient } from '../../common/menu-service.client';
import { APP_CONFIG, AppConfig } from '../../config/app-config';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: AppConfig) => ({ secret: config.jwtSecret }),
      inject: [APP_CONFIG],
    }),
  ],
  controllers: [CartController],
  providers: [CartService, CartRepository, MenuServiceClient],
  exports: [CartRepository],
})
export class CartModule {}

