import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({
    description: 'Email address to resend a verification token for.',
    example: 'customer@example.com',
    format: 'email',
  })
  @IsEmail()
  email!: string;
}
