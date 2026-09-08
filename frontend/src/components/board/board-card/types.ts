import type { Board } from "../../../types";

export interface BoardCardProps {
  board: Board;
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
  isDraggingBoard?: boolean;
}
