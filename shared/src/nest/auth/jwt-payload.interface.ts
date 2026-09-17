import { UserRole } from '../../types/enums';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
