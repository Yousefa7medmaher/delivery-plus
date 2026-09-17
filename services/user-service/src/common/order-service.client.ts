import { Inject, Injectable } from '@nestjs/common';
import { BadRequestError } from '@food-delivery/shared';
import { APP_CONFIG, AppConfig } from '../config/app-config';

/**
 * Forwards the customer's own Authorization header to order-service, the
 * same pattern order-service uses when calling cart-service.
 */
@Injectable()
export class OrderServiceClient {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  async getOrderHistory(authHeader: string, page: number, limit: number): Promise<unknown> {
    const response = await fetch(
      `${this.config.orderServiceUrl}/orders?page=${page}&limit=${limit}`,
      { headers: { Authorization: authHeader } },
    );

    if (!response.ok) {
      throw new BadRequestError(`Failed to fetch order history (status ${response.status})`);
    }

    return response.json();
  }
}
