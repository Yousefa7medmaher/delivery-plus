import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartRepository } from '../repositories/cart.repository';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly cartRepository: CartRepository) {}

  @Get()
  @ApiOperation({ summary: 'Health check for the cart service' })
  health() {
    return { status: 'ok' };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check for the cart service' })
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check for the cart service' })
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
