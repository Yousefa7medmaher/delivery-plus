import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Updated full name for the user profile.',
    example: 'Morgan Lee Jr.',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Updated phone number for the profile.',
    example: '+1-555-0199',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Updated address for the profile.',
    example: '10 Main Street, Apt 2B, Brooklyn, NY',
  })
  @IsOptional()
  @IsString()
  address?: string;
}
