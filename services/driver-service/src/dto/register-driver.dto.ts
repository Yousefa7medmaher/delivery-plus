import { IsString, MinLength } from 'class-validator';

export class RegisterDriverDto {
  @IsString()
  @MinLength(2)
  vehicleType!: string;

  @IsString()
  @MinLength(2)
  licensePlate!: string;
}
