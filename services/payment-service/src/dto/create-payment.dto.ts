import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'UUID of the order for which a payment record should be created.',
    format: 'uuid',
    example: '61b7d471-d714-4f4a-93fe-b72d0a1f3609',
  })
  @IsUUID()
  orderId!: string;
}
