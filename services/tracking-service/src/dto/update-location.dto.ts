import { ApiProperty } from '@nestjs/swagger';
import { IsLatitude, IsLongitude } from 'class-validator';

export class UpdateLocationDto {
  @ApiProperty({
    description: 'Latitude of the driver location in decimal degrees.',
    minimum: -90,
    maximum: 90,
    example: 40.7128,
  })
  @IsLatitude()
  latitude!: number;

  @ApiProperty({
    description: 'Longitude of the driver location in decimal degrees.',
    minimum: -180,
    maximum: 180,
    example: -74.006,
  })
  @IsLongitude()
  longitude!: number;
}
