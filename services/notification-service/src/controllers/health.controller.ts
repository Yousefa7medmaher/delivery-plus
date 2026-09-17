import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  check() {
    return { status: 'OK', service: 'notification-service' };
  }

  @Get('live')
  liveness() {
    return { status: 'OK' };
  }

  @Get('ready')
  async readiness() {
    try {
      await this.connection.query('SELECT 1');
      return { status: 'OK', database: 'connected' };
    } catch (error) {
      return { status: 'ERROR', database: 'disconnected' };
    }
  }
}
