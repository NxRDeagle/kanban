import type {
  MoveTaskInput,
  UpdateBoardInput,
  UpdateColumnInput,
  UpdateTaskInput,
} from "../types";

export interface UpdateBoardVariables {
  boardId: string;
  input: UpdateBoardInput;
}

export interface UpdateColumnVariables {
  columnId: string;
  input: UpdateColumnInput;
}

export interface CreateTaskVariables {
  columnId: string;
  title: string;
  description?: string | null;
}

export interface UpdateTaskVariables {
  taskId: string;
  input: UpdateTaskInput;
}

export interface MoveTaskVariables {
  taskId: string;
  input: MoveTaskInput;
}
