import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class ListDriversQueryDto {
  @ApiPropertyOptional({
    description: 'Page number to fetch, starting at 1.',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Maximum number of drivers to return in the page.',
    minimum: 1,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit: number = 20;
}
