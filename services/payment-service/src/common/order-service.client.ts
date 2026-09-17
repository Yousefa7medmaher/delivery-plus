import { Inject, Injectable } from '@nestjs/common';
import { BadRequestError, ForbiddenError, NotFoundError, OrderStatus } from '@food-delivery/shared';
import { APP_CONFIG, AppConfig } from '../config/app-config';
import { SystemTokenService } from './system-token.service';

export interface OrderDto {
  id: string;
  customerId: string;
  restaurantId: string;
  status: OrderStatus;
  totalAmount: string;
}

@Injectable()
export class OrderServiceClient {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly systemToken: SystemTokenService,
  ) {}

  /** Uses the customer's own token — they're allowed to read their own order. */
  async getOrder(orderId: string, authHeader: string): Promise<OrderDto> {
    const response = await fetch(`${this.config.orderServiceUrl}/orders/${orderId}`, {
      headers: { Authorization: authHeader },
    });

    if (response.status === 404) {
      throw new NotFoundError(`Order ${orderId} not found`);
    }
    if (response.status === 403) {
      throw new ForbiddenError('You do not have access to this order');
    }
    if (!response.ok) {
      throw new BadRequestError(`Failed to fetch order ${orderId}`);
    }

    return (await response.json()) as OrderDto;
  }

  /** Uses a minted service token (see SystemTokenService) since this is a system-triggered transition. */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const authHeader = await this.systemToken.mint();
    const response = await fetch(`${this.config.orderServiceUrl}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update order ${orderId} to ${status} (status ${response.status})`);
    }
  }
}
