import { RestaurantStatus } from '@food-delivery/shared';
import { IsEnum } from 'class-validator';

export class UpdateRestaurantStatusDto {
  @IsEnum(RestaurantStatus)
  status!: RestaurantStatus;
}
