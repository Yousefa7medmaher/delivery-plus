import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { LocationRepository } from '../repositories/location.repository';

@Controller('health')
export class HealthController {
  constructor(private readonly locationRepository: LocationRepository) {}

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
      const pong = await this.locationRepository.ping();
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
