import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Health check for the auth service' })
  health() {
    return { status: 'ok' };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check for the auth service' })
  live() {
    // Liveness: process is up and can respond. No dependency checks.
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check for the auth service' })
  async ready() {
    // Readiness: can this instance actually serve traffic right now?
    const checks: Record<string, 'ok' | 'error'> = { postgres: 'ok' };

    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      checks.postgres = 'error';
    }

    const healthy = Object.values(checks).every((v) => v === 'ok');
    if (!healthy) {
      throw new ServiceUnavailableException({ status: 'error', checks });
    }

    return { status: 'ok', checks };
  }
}
