import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: number; // User ID
  username: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload {
  sub: number; // User ID
  tokenId: string; // Refresh token ID for rotation
  iat?: number;
  exp?: number;
}
