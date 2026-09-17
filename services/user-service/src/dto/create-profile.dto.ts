import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProfileDto {
  @IsUUID()
  userId!: string;

  @IsEmail()
  email!: string;

  @IsString()
  fullName!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
