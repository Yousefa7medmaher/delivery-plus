import { Inject, Injectable } from '@nestjs/common';
import { BadRequestError, NotFoundError } from '@food-delivery/shared';
import { APP_CONFIG, AppConfig } from '../config/app-config';

export interface DriverDto {
  id: string;
  userId: string;
}

@Injectable()
export class DriverServiceClient {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  async getDriver(driverId: string): Promise<DriverDto> {
    const response = await fetch(`${this.config.driverServiceUrl}/drivers/${driverId}`);
    if (response.status === 404) {
      throw new NotFoundError(`Driver ${driverId} not found`);
    }
    if (!response.ok) {
      throw new BadRequestError(`Failed to fetch driver ${driverId}`);
    }
    return (await response.json()) as DriverDto;
  }
}
