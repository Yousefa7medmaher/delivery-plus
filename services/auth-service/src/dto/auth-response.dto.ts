import { UserRole } from '@food-delivery/shared';

export class AuthResponseDto {
  accessToken!: string;
  userId!: string;
  email!: string;
  role!: UserRole;
}
