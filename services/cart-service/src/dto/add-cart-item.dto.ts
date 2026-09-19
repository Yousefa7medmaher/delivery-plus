import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({
    description: 'UUID of the menu item to add to the cart.',
    format: 'uuid',
    example: '7d8f7c1d-2b60-4e08-8d8a-3456ee86e9d1',
  })
  @IsUUID()
  menuItemId!: string;

  @ApiProperty({
    description: 'Quantity of the menu item to add.',
    minimum: 1,
    example: 2,
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}
