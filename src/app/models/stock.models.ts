export interface Stock {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  category?: string;
  createdAt: string;
  updatedAt?: string;
  clientId: number;
  client?: {
    id: number;
    name: string;
  };
}

export interface CreateStockRequest {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  category?: string;
  clientId: number;
}

export interface UpdateStockRequest {
  name?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  category?: string;
}
