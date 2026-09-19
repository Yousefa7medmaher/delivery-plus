import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateDeliveryDto {
  @ApiProperty({
    description: 'UUID of the order that should be assigned a delivery.',
    format: 'uuid',
    example: 'f0d7030a-2d8b-4b7d-bdb2-8d2d65b8f284',
  })
  @IsUUID()
  orderId!: string;
}
