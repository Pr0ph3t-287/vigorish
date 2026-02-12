export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface RevokeTokenRequest {
  refreshToken: string;
}

export interface UserRolesResponse {
  email: string;
  roles: string[];
}
