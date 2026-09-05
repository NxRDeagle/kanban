import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useBoardsQuery,
  useCreateBoardMutation,
  useDeleteBoardMutation,
  useReorderBoardsMutation,
  useUpdateBoardMutation,
} from "../hooks/useBoards";
import { BoardCard } from "../components/board/BoardCard";
import { BoardForm } from "../components/board/forms/BoardForm";
import type { BoardFormValues } from "../components/board/forms/BoardForm";
import { Modal } from "../components/common/Modal";
import type { Board } from "../types";
import { boardDndId, parseBoardDndId } from "../dnd/ids";
import {
  DND_TRANSITION_MS,
  dropAnimation,
  isSameDropTarget,
} from "../dnd/config";
import { boardsKeys } from "../api/queryKeys";
import "./BoardsPage.css";

export function BoardsPage() {
  const queryClient = useQueryClient();
  const { data: boards, isLoading, isError } = useBoardsQuery();
  const createBoardMutation = useCreateBoardMutation();
  const updateBoardMutation = useUpdateBoardMutation();
  const deleteBoardMutation = useDeleteBoardMutation();
  const reorderBoardsMutation = useReorderBoardsMutation();

  const [isCreating, setIsCreating] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [isDraggingBoard, setIsDraggingBoard] = useState(false);
  const dragStartBoardIdsRef = useRef<string[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

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

  function restoreBoardOrder(orderedIds: string[]) {
    queryClient.setQueryData<Board[]>(boardsKeys.all, (items) => {
      if (!items) return items;
      const byId = new Map(items.map((board) => [board.id, board]));
      return orderedIds.flatMap((id, index) => {
        const board = byId.get(id);
        return board ? [{ ...board, position: index }] : [];
      });
    });
  }

  function handleDragStart(event: DragStartEvent) {
    if (!boards) return;
    setIsDraggingBoard(true);
    dragStartBoardIdsRef.current = boards.map((board) => board.id);
    const boardId = parseBoardDndId(String(event.active.id));
    setActiveBoard(boards.find((board) => board.id === boardId) ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || isSameDropTarget(active.id, over.id)) return;

    const activeBoardId = parseBoardDndId(String(active.id));
    const overBoardId = parseBoardDndId(String(over.id));
    if (!activeBoardId || !overBoardId) return;

    queryClient.setQueryData<Board[]>(boardsKeys.all, (items) => {
      if (!items) return items;
      const oldIndex = items.findIndex((board) => board.id === activeBoardId);
      const newIndex = items.findIndex((board) => board.id === overBoardId);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return items;
      return arrayMove(items, oldIndex, newIndex).map((board, index) => ({
        ...board,
        position: index,
      }));
    });
  }

  function finishBoardDrag(cancelled: boolean) {
    setIsDraggingBoard(false);
    window.setTimeout(() => setActiveBoard(null), DND_TRANSITION_MS);

    const startOrder = dragStartBoardIdsRef.current;
    dragStartBoardIdsRef.current = null;
    if (!startOrder) return;

    if (cancelled) {
      restoreBoardOrder(startOrder);
      return;
    }

    const currentBoards = queryClient.getQueryData<Board[]>(boardsKeys.all);
    if (!currentBoards) return;

    const currentOrder = currentBoards.map((board) => board.id);
    const changed = currentOrder.some((id, index) => id !== startOrder[index]);
    if (!changed) return;

    reorderBoardsMutation.mutate({ orderedBoardIds: currentOrder });
  }

  function handleDragEnd() {
    finishBoardDrag(false);
  }

  function handleDragCancel() {
    finishBoardDrag(true);
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          measuring={{
            droppable: { strategy: MeasuringStrategy.Always },
          }}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={boards.map((board) => boardDndId(board.id))}
            strategy={rectSortingStrategy}
          >
            <div className="boards-grid">
              {boards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onEdit={setEditingBoard}
                  onDelete={handleDelete}
                  isDraggingBoard={isDraggingBoard}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeBoard && (
              <div className="board-card board-card-overlay">
                <h3 className="board-card-title">{activeBoard.title}</h3>
                {activeBoard.description && (
                  <p className="board-card-description">
                    {activeBoard.description}
                  </p>
                )}
              </div>
            )}
          </DragOverlay>
        </DndContext>
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
