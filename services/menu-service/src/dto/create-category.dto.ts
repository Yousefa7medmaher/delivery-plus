import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsUUID()
  restaurantId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
