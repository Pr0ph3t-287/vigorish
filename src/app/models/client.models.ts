export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  projects?: any[];
  horses?: any[];
  stocks?: any[];
}

export interface CreateClientRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateClientRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}
