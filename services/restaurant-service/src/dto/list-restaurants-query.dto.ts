import { RestaurantStatus } from '@food-delivery/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, IsPositive, IsString } from 'class-validator';

export class ListRestaurantsQueryDto {
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
    description: 'Maximum number of restaurants to return.',
    minimum: 1,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Filter restaurants by operational status.',
    enum: RestaurantStatus,
    example: RestaurantStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(RestaurantStatus)
  status?: RestaurantStatus;

  @ApiPropertyOptional({
    description: 'Optional free-text search across restaurant names and metadata.',
    example: 'pizza',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Field to sort by.',
    enum: ['name', 'createdAt'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsIn(['name', 'createdAt'])
  sortBy: 'name' | 'createdAt' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort direction for the list.',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';
}
