export interface ApiErrorResponse {
  error: string;
}

export interface ApiBoard {
  id: number;
  ownerId: number;
  title: string;
  description: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiColumn {
  id: number;
  boardId: number;
  title: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiTask {
  id: number;
  columnId: number;
  title: string;
  description: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiColumnWithTasks extends ApiColumn {
  tasks: ApiTask[];
}

export interface ApiBoardWithColumns extends ApiBoard {
  columns: ApiColumnWithTasks[];
}

export interface ApiUser {
  id: number;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiAuthResponse {
  token: string;
  user: ApiUser;
}

export interface RegisterInput extends LoginInput {
  username: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
