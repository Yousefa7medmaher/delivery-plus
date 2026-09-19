import { RestaurantStatus } from '@food-delivery/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateRestaurantStatusDto {
  @ApiProperty({
    description: 'The new restaurant status to assign.',
    enum: RestaurantStatus,
    example: RestaurantStatus.OPEN,
  })
  @IsEnum(RestaurantStatus)
  status!: RestaurantStatus;
}
