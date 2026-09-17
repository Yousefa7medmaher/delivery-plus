import { IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateMenuItemDto {
  @IsUUID()
  restaurantId!: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
