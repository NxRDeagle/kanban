import type { BoardWithColumns } from "../../../types";

export interface BoardProps {
  board: BoardWithColumns;
}

export interface DragStartTaskSnapshot {
  taskId: string;
  columnId: string;
  position: number;
}
