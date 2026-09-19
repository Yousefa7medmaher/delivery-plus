import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'Updated quantity for the cart item. Set to 0 to remove the item.',
    minimum: 0,
    example: 0,
  })
  @IsInt()
  @Min(0)
  quantity!: number; // 0 removes the item
}
