import { IsBoolean, IsOptional } from 'class-validator';

export class ProcessPaymentDto {
  /** Testing hook: force a specific outcome instead of the simulated random one. */
  @IsOptional()
  @IsBoolean()
  simulateFailure?: boolean;
}
