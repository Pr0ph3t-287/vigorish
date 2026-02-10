export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt?: string;
  clientId: number;
  client?: {
    id: number;
    name: string;
  };
  tasks?: any[];
}

export enum ProjectStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
  OnHold = 3,
  Cancelled = 4
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  clientId: number;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
}
