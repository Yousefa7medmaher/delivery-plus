import { Inject, Injectable } from '@nestjs/common';
import { BadRequestError, NotFoundError } from '@food-delivery/shared';
import { APP_CONFIG, AppConfig } from '../config/app-config';

export interface MenuItemDetails {
  id: string;
  restaurantId: string;
  name: string;
  price: number;
  available: boolean;
}

@Injectable()
export class MenuServiceClient {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  async getItem(menuItemId: string): Promise<MenuItemDetails> {
    const response = await fetch(`${this.config.menuServiceUrl}/menu-items/${menuItemId}`);

    if (response.status === 404) {
      throw new NotFoundError(`Menu item ${menuItemId} not found`);
    }
    if (!response.ok) {
      throw new BadRequestError(`Failed to fetch menu item ${menuItemId}`);
    }

    const body = (await response.json()) as {
      id: string;
      restaurantId: string;
      name: string;
      price: string;
      available: boolean;
    };
    return {
      id: body.id,
      restaurantId: body.restaurantId,
      name: body.name,
      price: parseFloat(body.price),
      available: body.available,
    };
  }
}
