import { Inject, Injectable } from '@nestjs/common';
import { BadRequestError, DeliveryStatus, NotFoundError, assertValidUuidV4 } from '@food-delivery/shared';
import { APP_CONFIG, AppConfig } from '../config/app-config';

export interface DeliveryDto {
  id: string;
  orderId: string;
  driverId?: string;
  status: DeliveryStatus;
}

@Injectable()
export class DeliveryServiceClient {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  async getDelivery(deliveryId: string, authHeader: string): Promise<DeliveryDto> {
    const safeDeliveryId = assertValidUuidV4(deliveryId, 'deliveryId');
    const response = await fetch(`${this.config.deliveryServiceUrl}/deliveries/${safeDeliveryId}`, {
      headers: { Authorization: authHeader },
    });

    if (response.status === 404) {
      throw new NotFoundError(`Delivery ${safeDeliveryId} not found`);
    }
    if (!response.ok) {
      throw new BadRequestError(`Failed to fetch delivery ${safeDeliveryId}`);
    }

    return (await response.json()) as DeliveryDto;
  }
}
