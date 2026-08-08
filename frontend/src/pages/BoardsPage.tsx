import { useState } from "react";
import {
  useBoardsQuery,
  useCreateBoardMutation,
  useDeleteBoardMutation,
  useUpdateBoardMutation,
} from "../hooks/useBoards";
import { BoardCard } from "../components/board/BoardCard";
import { BoardForm } from "../components/board/forms/BoardForm";
import type { BoardFormValues } from "../components/board/forms/BoardForm";
import { Modal } from "../components/common/Modal";
import type { Board } from "../types";
import "./BoardsPage.css";

export function BoardsPage() {
  const { data: boards, isLoading, isError } = useBoardsQuery();
  const createBoardMutation = useCreateBoardMutation();
  const updateBoardMutation = useUpdateBoardMutation();
  const deleteBoardMutation = useDeleteBoardMutation();

  const [isCreating, setIsCreating] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);

  function handleCreate(values: BoardFormValues) {
    createBoardMutation.mutate(values, {
      onSuccess: () => setIsCreating(false),
    });
  }

  function handleEditSubmit(values: BoardFormValues) {
    if (!editingBoard) return;
    updateBoardMutation.mutate(
      { boardId: editingBoard.id, input: values },
      { onSuccess: () => setEditingBoard(null) },
    );
  }

  function handleDelete(board: Board) {
    if (
      !window.confirm(
        `Delete "${board.title}"? This also deletes its columns and tasks.`,
      )
    ) {
      return;
    }
    deleteBoardMutation.mutate(board.id);
  }

  return (
    <div>
      <h1>Boards</h1>

      {isCreating ? (
        <BoardForm
          mode="create"
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
          isSubmitting={createBoardMutation.isPending}
        />
      ) : (
        <button type="button" onClick={() => setIsCreating(true)}>
          + New board
        </button>
      )}

      {isLoading && <p>Loading…</p>}
      {isError && <p>Something went wrong loading boards.</p>}
      {boards && (
        <div className="boards-grid">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onEdit={setEditingBoard}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={editingBoard !== null}
        onClose={() => setEditingBoard(null)}
        title="Edit board"
      >
        {editingBoard && (
          <BoardForm
            mode="edit"
            initialValues={{
              title: editingBoard.title,
              description: editingBoard.description ?? undefined,
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingBoard(null)}
            isSubmitting={updateBoardMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
