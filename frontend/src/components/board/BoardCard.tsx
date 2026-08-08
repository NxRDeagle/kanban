import { Link } from "react-router-dom";
import type { MouseEvent } from "react";
import type { Board } from "../../types";
import "./BoardCard.css";

interface BoardCardProps {
  board: Board;
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
}

export function BoardCard({ board, onEdit, onDelete }: BoardCardProps) {
  function handleEdit(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    onEdit(board);
  }

  function handleDelete(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    onDelete(board);
  }

  return (
    <Link to={`/boards/${board.id}`} className="board-card">
      <div className="board-card-header">
        <h3 className="board-card-title">{board.title}</h3>
        <div className="board-card-actions">
          <button type="button" onClick={handleEdit} aria-label="Edit board">
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete board"
          >
            Delete
          </button>
        </div>
      </div>
      {board.description && (
        <p className="board-card-description">{board.description}</p>
      )}
    </Link>
  );
}
