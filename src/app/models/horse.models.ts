export interface Horse {
  id: number;
  name: string;
  breed?: string;
  dateOfBirth?: string;
  gender?: string;
  color?: string;
  registrationNumber?: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  clientId: number;
  client?: Client;
}

interface ClientRef {
  id: number;
  name: string;
  email?: string;
}

export type Client = ClientRef;

export interface CreateHorseRequest {
  name: string;
  breed?: string;
  dateOfBirth?: string;
  gender?: string;
  color?: string;
  registrationNumber?: string;
  clientId: number;
}

export interface UpdateHorseRequest {
  name?: string;
  breed?: string;
  dateOfBirth?: string;
  gender?: string;
  color?: string;
  registrationNumber?: string;
  isActive?: boolean;
}
