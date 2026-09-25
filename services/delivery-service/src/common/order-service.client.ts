import { Inject, Injectable } from '@nestjs/common';
import { BadRequestError, NotFoundError, OrderStatus, assertValidUuidV4 } from '@food-delivery/shared';
import { APP_CONFIG, AppConfig } from '../config/app-config';
import { SystemTokenService } from './system-token.service';

export interface OrderDto {
  id: string;
  customerId: string;
  restaurantId: string;
  status: OrderStatus;
}

@Injectable()
export class OrderServiceClient {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly systemToken: SystemTokenService,
  ) {}

  async getOrder(orderId: string): Promise<OrderDto> {
    const safeOrderId = assertValidUuidV4(orderId, 'orderId');
    const authHeader = await this.systemToken.mint();
    const response = await fetch(`${this.config.orderServiceUrl}/orders/${safeOrderId}`, {
      headers: { Authorization: authHeader },
    });

    if (response.status === 404) {
      throw new NotFoundError(`Order ${safeOrderId} not found`);
    }
    if (!response.ok) {
      throw new BadRequestError(`Failed to fetch order ${safeOrderId}`);
    }

    return (await response.json()) as OrderDto;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const safeOrderId = assertValidUuidV4(orderId, 'orderId');
    const authHeader = await this.systemToken.mint();
    const response = await fetch(`${this.config.orderServiceUrl}/orders/${safeOrderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update order ${safeOrderId} to ${status} (status ${response.status})`);
    }
  }
}
