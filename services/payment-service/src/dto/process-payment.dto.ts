import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ProcessPaymentDto {
  /** Testing hook: force a specific outcome instead of the simulated random one. */
  @ApiPropertyOptional({
    description: 'Optional test hook to force a failed payment result instead of the normal simulated random outcome.',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  simulateFailure?: boolean;
}
