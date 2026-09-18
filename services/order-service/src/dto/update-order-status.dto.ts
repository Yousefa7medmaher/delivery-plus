import { OrderStatus } from '@food-delivery/shared';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'The next status to assign to the order.',
    enum: OrderStatus,
    example: OrderStatus.CREATED,
  })
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
