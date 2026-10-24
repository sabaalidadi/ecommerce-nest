
export interface JwtPayload {
  sub: string;           
  phoneNumber: string;
  roles: string[];       // e.g. ['admin']
  permissions: string[]; // e.g. ['product:create', 'product:update', ...]
}

