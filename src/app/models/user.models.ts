export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  roles: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
  roles?: string[];
}
