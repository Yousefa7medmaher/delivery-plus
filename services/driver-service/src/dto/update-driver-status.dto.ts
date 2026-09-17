import { DriverStatus } from '@food-delivery/shared';
import { IsEnum } from 'class-validator';

export class UpdateDriverStatusDto {
  @IsEnum(DriverStatus)
  status!: DriverStatus;
}
