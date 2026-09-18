import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocationRepository } from '../repositories/location.repository';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly locationRepository: LocationRepository) {}

  @Get()
  @ApiOperation({ summary: 'Health check for the tracking service' })
  health() {
    return { status: 'ok' };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check for the tracking service' })
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check for the tracking service' })
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
