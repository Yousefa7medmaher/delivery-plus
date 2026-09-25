import { Inject, Injectable } from '@nestjs/common';
import { BadRequestError, NotFoundError, assertValidUuidV4 } from '@food-delivery/shared';
import { APP_CONFIG, AppConfig } from '../config/app-config';

export interface DriverDto {
  id: string;
  userId: string;
}

@Injectable()
export class DriverServiceClient {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  async getDriver(driverId: string): Promise<DriverDto> {
    const safeDriverId = assertValidUuidV4(driverId, 'driverId');
    const response = await fetch(`${this.config.driverServiceUrl}/drivers/${safeDriverId}`);
    if (response.status === 404) {
      throw new NotFoundError(`Driver ${safeDriverId} not found`);
    }
    if (!response.ok) {
      throw new BadRequestError(`Failed to fetch driver ${safeDriverId}`);
    }
    return (await response.json()) as DriverDto;
  }
}
