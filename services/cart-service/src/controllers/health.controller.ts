import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { CartRepository } from '../repositories/cart.repository';

@Controller('health')
export class HealthController {
  constructor(private readonly cartRepository: CartRepository) {}

  @Get()
  health() {
    return { status: 'ok' };
  }

  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready() {
    const checks: Record<string, 'ok' | 'error'> = { redis: 'ok' };

    try {
      const pong = await this.cartRepository.ping();
      checks.redis = pong ? 'ok' : 'error';
    } catch {
      checks.redis = 'error';
    }

    const healthy = Object.values(checks).every((v) => v === 'ok');
    if (!healthy) {
      throw new ServiceUnavailableException({ status: 'error', checks });
    }

    return { status: 'ok', checks };
  }
}
