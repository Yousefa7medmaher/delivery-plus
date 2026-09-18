import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  @ApiOperation({ summary: 'Health check for the notification service' })
  check() {
    return { status: 'OK', service: 'notification-service' };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check for the notification service' })
  liveness() {
    return { status: 'OK' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check for the notification service' })
  async readiness() {
    try {
      await this.connection.query('SELECT 1');
      return { status: 'OK', database: 'connected' };
    } catch (error) {
      return { status: 'ERROR', database: 'disconnected' };
    }
  }
}
