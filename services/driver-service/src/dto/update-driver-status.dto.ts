import { DriverStatus } from '@food-delivery/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateDriverStatusDto {
  @ApiProperty({
    description: 'The new driver status to assign.',
    enum: DriverStatus,
    example: DriverStatus.AVAILABLE,
  })
  @IsEnum(DriverStatus)
  status!: DriverStatus;
}
