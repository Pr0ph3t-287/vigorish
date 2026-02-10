export interface ProjectTask {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskItemStatus;
  createdAt: string;
  updatedAt?: string;
  projectId: number;
  project?: {
    id: number;
    name: string;
    client?: {
      id: number;
      name: string;
    };
  };
}

export enum TaskPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

export enum TaskItemStatus {
  Todo = 0,
  InProgress = 1,
  Done = 2,
  Blocked = 3
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskItemStatus;
  projectId: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskItemStatus;
}
