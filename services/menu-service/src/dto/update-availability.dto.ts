import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateAvailabilityDto {
  @ApiProperty({
    description: 'Whether the menu item should be available for purchase.',
    example: true,
  })
  @IsBoolean()
  available!: boolean;
}
