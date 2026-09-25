import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'User email address.',
    example: 'customer@example.com',
    format: 'email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'The one-time verification token sent by email.',
    example: 'abc123',
  })
  @IsString()
  token!: string;
}
