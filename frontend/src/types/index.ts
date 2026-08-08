export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ColumnWithTasks extends Column {
  tasks: Task[];
}

export interface BoardWithColumns extends Board {
  columns: ColumnWithTasks[];
}

export interface CreateBoardInput {
  title: string;
  description?: string;
}

export type UpdateBoardInput = Partial<CreateBoardInput>;

export interface CreateColumnInput {
  title: string;
}

export type UpdateColumnInput = Partial<CreateColumnInput>;

export interface ReorderColumnsInput {
  orderedColumnIds: string[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface MoveTaskInput {
  toColumnId: string;
  toPosition: number;
}
