import { Inject, Injectable } from '@nestjs/common';
import { ForbiddenError, NotFoundError } from '@food-delivery/shared';
import { APP_CONFIG, AppConfig } from '../config/app-config';

/**
 * Synchronous internal HTTP call to restaurant-service to confirm the
 * requesting user owns the restaurant before allowing menu mutations.
 * SIMPLIFICATION: same pattern/limitation as UserServiceClient in
 * auth-service — replaced by cached/event-driven ownership data once Kafka
 * exists, to avoid a hard runtime dependency on restaurant-service uptime.
 */
@Injectable()
export class RestaurantServiceClient {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  async assertOwnership(restaurantId: string, requesterId: string): Promise<void> {
    const response = await fetch(
      `${this.config.restaurantServiceUrl}/restaurants/${restaurantId}/ownership/${requesterId}`,
    );

    if (response.status === 404) {
      throw new NotFoundError(`Restaurant ${restaurantId} not found`);
    }
    if (response.status === 403) {
      throw new ForbiddenError('You do not own this restaurant');
    }
    if (!response.ok) {
      throw new Error(`restaurant-service ownership check failed (status ${response.status})`);
    }
  }
}
