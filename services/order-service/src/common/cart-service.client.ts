import { Inject, Injectable } from '@nestjs/common';
import { BadRequestError } from '@food-delivery/shared';
import { APP_CONFIG, AppConfig } from '../config/app-config';

export interface CartItemDto {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartDto {
  userId: string;
  restaurantId: string | null;
  items: CartItemDto[];
  total: number;
}

/**
 * Forwards the customer's own Authorization header to cart-service rather
 * than using an internal/service token, since these calls happen on behalf
 * of the authenticated customer placing the order.
 */
@Injectable()
export class CartServiceClient {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  async getCart(authHeader: string): Promise<CartDto> {
    const response = await fetch(`${this.config.cartServiceUrl}/cart`, {
      headers: { Authorization: authHeader },
    });

    if (!response.ok) {
      throw new BadRequestError(`Failed to read cart (status ${response.status})`);
    }

    return (await response.json()) as CartDto;
  }

  async clearCart(authHeader: string): Promise<void> {
    const response = await fetch(`${this.config.cartServiceUrl}/cart`, {
      method: 'DELETE',
      headers: { Authorization: authHeader },
    });

    if (!response.ok) {
      throw new BadRequestError(`Failed to clear cart (status ${response.status})`);
    }
  }
}
