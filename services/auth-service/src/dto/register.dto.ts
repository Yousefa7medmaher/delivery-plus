import { UserRole } from '@food-delivery/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Email address for the new account.',
    example: 'customer@example.com',
    format: 'email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Password for the account. Minimum 8 characters.',
    minLength: 8,
    example: 'StrongPass123!',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;

  @ApiProperty({
    description: 'Display name for the user profile.',
    example: 'Jane Customer',
  })
  @IsString()
  fullName!: string;

  @ApiPropertyOptional({
    description: 'Optional phone number for the user profile.',
    example: '+1-555-0101',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Role to create the account with. Defaults to CUSTOMER when omitted.',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'role must be one of CUSTOMER, RESTAURANT_OWNER, DRIVER, ADMIN' })
  role?: UserRole;
}
