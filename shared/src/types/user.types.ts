export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  VOTER = 'voter',
  CANDIDATE = 'candidate',
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}
