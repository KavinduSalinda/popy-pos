import type { Role } from '@/constants/roles';
import type { Permission } from '@/constants/permissions';
import type { ID } from '@/types';

export interface Shop {
  id: ID;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  role: Role;
  permissions?: Permission[];
  avatarUrl?: string;
  isActive?: boolean;
  shopId?: ID | null;
  defaultShopId?: ID | null;
  shops?: Shop[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface RefreshResponse extends AuthTokens {
  user?: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  currentShopId: ID | null;
  isInitialized: boolean;
}
