import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RegisterDriverDto {
  @ApiProperty({
    description: 'Type of vehicle operated by the driver.',
    minLength: 2,
    example: 'Sedan',
  })
  @IsString()
  @MinLength(2)
  vehicleType!: string;

  @ApiProperty({
    description: 'License plate for the driver vehicle.',
    minLength: 2,
    example: 'ABC-1234',
  })
  @IsString()
  @MinLength(2)
  licensePlate!: string;
}
