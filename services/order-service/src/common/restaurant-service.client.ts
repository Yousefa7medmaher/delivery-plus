import { Inject, Injectable } from '@nestjs/common';
import {
  RestaurantStatus,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
  assertValidUuidV4,
} from '@food-delivery/shared';
import { APP_CONFIG, AppConfig } from '../config/app-config';

export interface RestaurantDto {
  id: string;
  ownerId: string;
  name: string;
  status: RestaurantStatus;
}

@Injectable()
export class RestaurantServiceClient {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  async getRestaurant(restaurantId: string): Promise<RestaurantDto> {
    const safeRestaurantId = assertValidUuidV4(restaurantId, 'restaurantId');
    const response = await fetch(`${this.config.restaurantServiceUrl}/restaurants/${safeRestaurantId}`);

    if (response.status === 404) {
      throw new NotFoundError(`Restaurant ${safeRestaurantId} not found`);
    }
    if (!response.ok) {
      throw new BadRequestError(`Failed to fetch restaurant ${safeRestaurantId}`);
    }

    return (await response.json()) as RestaurantDto;
  }

  async assertOwnership(restaurantId: string, requesterId: string): Promise<void> {
    const safeRestaurantId = assertValidUuidV4(restaurantId, 'restaurantId');
    const safeRequesterId = assertValidUuidV4(requesterId, 'requesterId');
    const response = await fetch(
      `${this.config.restaurantServiceUrl}/restaurants/${safeRestaurantId}/ownership/${safeRequesterId}`,
    );

    if (response.status === 404) {
      throw new NotFoundError(`Restaurant ${safeRestaurantId} not found`);
    }
    if (response.status === 403) {
      throw new ForbiddenError('You do not own this restaurant');
    }
    if (!response.ok) {
      throw new Error(`restaurant-service ownership check failed (status ${response.status})`);
    }
  }
}
