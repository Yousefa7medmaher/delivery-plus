import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateRestaurantDto {
  @ApiPropertyOptional({
    description: 'Updated restaurant name.',
    example: 'Sunset Grill & Bar',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated restaurant description.',
    example: 'Expanded menu with seasonal specials.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated restaurant address.',
    example: '456 Market Street, Brooklyn, NY',
  })
  @IsOptional()
  @IsString()
  address?: string;
}
