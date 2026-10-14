import { UserRole } from '../../users/entities/user.entity.js';

export interface JwtPayload {
  sub: string;
  phoneNumber: string;
  role: UserRole;
}
