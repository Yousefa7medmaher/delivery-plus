import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({
    description: 'Name of the restaurant.',
    minLength: 2,
    example: 'Sunset Grill',
  })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional description for the restaurant.',
    example: 'Neighborhood favorite for fresh seafood and burgers.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Street address for the restaurant location.',
    example: '123 Park Avenue, New York, NY',
  })
  @IsString()
  address!: string;
}
