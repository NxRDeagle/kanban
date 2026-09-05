import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  CollisionDetection,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { BoardWithColumns, ColumnWithTasks, Task } from "../../types";
import { Column } from "./Column";
import { ColumnForm } from "./forms/ColumnForm";
import type { ColumnFormValues } from "./forms/ColumnForm";
import type { TaskFormValues } from "./forms/TaskForm";
import { Modal } from "../common/Modal";
import { TaskModal } from "./TaskModal";
import {
  useCreateColumnMutation,
  useDeleteColumnMutation,
  useReorderColumnsMutation,
  useUpdateColumnMutation,
} from "../../hooks/useColumns";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useMoveTaskMutation,
  useUpdateTaskMutation,
} from "../../hooks/useTasks";
import {
  columnSortableId,
  parseColumnDroppableId,
  parseColumnSortableId,
  parseTaskDndId,
} from "../../dnd/ids";
import {
  DND_TRANSITION_MS,
  dropAnimation,
  isSameDropTarget,
} from "../../dnd/config";
import {
  applyOptimisticTaskMove,
  resolveTaskMoveInput,
  wouldTaskMoveChange,
} from "../../dnd/taskMove";
import { boardsKeys } from "../../api/queryKeys";
import "./Board.css";

interface BoardProps {
  board: BoardWithColumns;
}

function resolveColumnTargetId(
  id: string,
  columns: ColumnWithTasks[],
): string | null {
  const sortableId = parseColumnSortableId(id);
  if (sortableId) return sortableId;

  const droppableId = parseColumnDroppableId(id);
  if (droppableId) return droppableId;

  const taskId = parseTaskDndId(id);
  if (!taskId) return null;

  return (
    columns.find((column) => column.tasks.some((task) => task.id === taskId))
      ?.id ?? null
  );
}

const collisionDetection: CollisionDetection = (args) => {
  const activeId = String(args.active.id);
  if (parseColumnSortableId(activeId)) {
    return closestCorners({
      ...args,
      droppableContainers: args.droppableContainers.filter((container) =>
        parseColumnSortableId(String(container.id)),
      ),
    });
  }

  return closestCorners({
    ...args,
    droppableContainers: args.droppableContainers.filter((container) => {
      const id = String(container.id);
      return parseTaskDndId(id) !== null || parseColumnDroppableId(id) !== null;
    }),
  });
};

export function Board({ board }: BoardProps) {
  const queryClient = useQueryClient();
  const { id: boardId, description: boardDescription, columns } = board;
  const createColumnMutation = useCreateColumnMutation(boardId);
  const updateColumnMutation = useUpdateColumnMutation(boardId);
  const deleteColumnMutation = useDeleteColumnMutation(boardId);
  const reorderColumnsMutation = useReorderColumnsMutation(boardId);

  const createTaskMutation = useCreateTaskMutation(boardId);
  const updateTaskMutation = useUpdateTaskMutation(boardId);
  const deleteTaskMutation = useDeleteTaskMutation(boardId);
  const moveTaskMutation = useMoveTaskMutation(boardId);

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ColumnWithTasks | null>(
    null,
  );
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnWithTasks | null>(
    null,
  );
  const dragStartColumnIdsRef = useRef<string[] | null>(null);
  const dragStartTaskRef = useRef<{
    taskId: string;
    columnId: string;
    position: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const columnSortableIds = columns.map((column) =>
    columnSortableId(column.id),
  );

  function findColumnByTaskId(taskId: string): ColumnWithTasks | undefined {
    return columns.find((c) => c.tasks.some((t) => t.id === taskId));
  }

  function handleAddColumn(values: ColumnFormValues) {
    createColumnMutation.mutate(values, {
      onSuccess: () => setIsAddingColumn(false),
    });
  }

  function handleEditColumn(values: ColumnFormValues) {
    if (!editingColumn) return;
    updateColumnMutation.mutate(
      { columnId: editingColumn.id, input: values },
      { onSuccess: () => setEditingColumn(null) },
    );
  }

  function handleDeleteColumn(column: ColumnWithTasks) {
    if (
      !window.confirm(
        `Delete column "${column.title}"? This also deletes its tasks.`,
      )
    ) {
      return;
    }
    deleteColumnMutation.mutate(column.id);
  }

  function handleAddTask(
    columnId: string,
    values: TaskFormValues,
    onDone: VoidFunction,
  ) {
    createTaskMutation.mutate({ columnId, ...values }, { onSuccess: onDone });
  }

  function handleEditTask(values: TaskFormValues) {
    if (!editingTask) return;
    updateTaskMutation.mutate(
      { taskId: editingTask.id, input: values },
      { onSuccess: () => setEditingTask(null) },
    );
  }

  function handleDeleteTask() {
    if (!editingTask) return;
    if (!window.confirm(`Delete task "${editingTask.title}"?`)) return;
    deleteTaskMutation.mutate(editingTask.id, {
      onSuccess: () => setEditingTask(null),
    });
  }

  function restoreColumnOrder(orderedIds: string[]) {
    queryClient.setQueryData<BoardWithColumns>(
      boardsKeys.detail(boardId),
      (current) => {
        if (!current) return current;
        const byId = new Map(
          current.columns.map((column) => [column.id, column]),
        );
        return {
          ...current,
          columns: orderedIds.flatMap((id, index) => {
            const column = byId.get(id);
            return column ? [{ ...column, position: index }] : [];
          }),
        };
      },
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const activeId = String(event.active.id);
    const taskId = parseTaskDndId(activeId);
    if (taskId) {
      const column = findColumnByTaskId(taskId);
      const position =
        column?.tasks.findIndex((task) => task.id === taskId) ?? -1;
      dragStartTaskRef.current =
        column && position >= 0
          ? { taskId, columnId: column.id, position }
          : null;
      dragStartColumnIdsRef.current = null;
      setActiveTask(column?.tasks.find((t) => t.id === taskId) ?? null);
      setActiveColumn(null);
      return;
    }

    const columnId = parseColumnSortableId(activeId);
    dragStartColumnIdsRef.current = columns.map((column) => column.id);
    dragStartTaskRef.current = null;
    setActiveColumn(columns.find((column) => column.id === columnId) ?? null);
    setActiveTask(null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || isSameDropTarget(active.id, over.id)) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeColumnId = parseColumnSortableId(activeId);
    if (activeColumnId) {
      queryClient.setQueryData<BoardWithColumns>(
        boardsKeys.detail(boardId),
        (current) => {
          if (!current) return current;
          const overColumnId = resolveColumnTargetId(overId, current.columns);
          if (!overColumnId || activeColumnId === overColumnId) return current;

          const oldIndex = current.columns.findIndex(
            (column) => column.id === activeColumnId,
          );
          const newIndex = current.columns.findIndex(
            (column) => column.id === overColumnId,
          );
          if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
            return current;
          }

          return {
            ...current,
            columns: arrayMove(current.columns, oldIndex, newIndex).map(
              (column, index) => ({ ...column, position: index }),
            ),
          };
        },
      );
      return;
    }

    const activeTaskId = parseTaskDndId(activeId);
    if (!activeTaskId) return;

    queryClient.setQueryData<BoardWithColumns>(
      boardsKeys.detail(boardId),
      (current) => {
        if (!current) return current;
        const moveInput = resolveTaskMoveInput(current, activeTaskId, overId);
        if (
          !moveInput ||
          !wouldTaskMoveChange(current, activeTaskId, moveInput)
        ) {
          return current;
        }
        return applyOptimisticTaskMove(current, activeTaskId, moveInput);
      },
    );
  }

  function finishBoardItemDrag(cancelled: boolean) {
    window.setTimeout(() => {
      setActiveTask(null);
      setActiveColumn(null);
    }, DND_TRANSITION_MS);

    const startColumnIds = dragStartColumnIdsRef.current;
    const startTask = dragStartTaskRef.current;
    dragStartColumnIdsRef.current = null;
    dragStartTaskRef.current = null;

    const currentBoard = queryClient.getQueryData<BoardWithColumns>(
      boardsKeys.detail(boardId),
    );

    if (startColumnIds) {
      if (cancelled) {
        restoreColumnOrder(startColumnIds);
        return;
      }
      if (!currentBoard) return;

      const currentOrder = currentBoard.columns.map((column) => column.id);
      const changed = currentOrder.some(
        (id, index) => id !== startColumnIds[index],
      );
      if (!changed) return;

      reorderColumnsMutation.mutate({ orderedColumnIds: currentOrder });
      return;
    }

    if (!startTask) return;

    if (cancelled) {
      queryClient.setQueryData<BoardWithColumns>(
        boardsKeys.detail(boardId),
        (current) =>
          current
            ? applyOptimisticTaskMove(current, startTask.taskId, {
                toColumnId: startTask.columnId,
                toPosition: startTask.position,
              })
            : current,
      );
      return;
    }

    if (!currentBoard) return;

    const currentColumn = currentBoard.columns.find((column) =>
      column.tasks.some((task) => task.id === startTask.taskId),
    );
    if (!currentColumn) return;

    const currentPosition = currentColumn.tasks.findIndex(
      (task) => task.id === startTask.taskId,
    );
    if (
      currentColumn.id === startTask.columnId &&
      currentPosition === startTask.position
    ) {
      return;
    }

    moveTaskMutation.mutate({
      taskId: startTask.taskId,
      input: {
        toColumnId: currentColumn.id,
        toPosition: currentPosition,
      },
    });
  }

  function handleDragEnd() {
    finishBoardItemDrag(false);
  }

  function handleDragCancel() {
    finishBoardItemDrag(true);
  }

  return (
    <div>
      <h1>{board.title}</h1>
      {boardDescription && (
        <p className="board-description">{boardDescription}</p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        measuring={{
          droppable: { strategy: MeasuringStrategy.Always },
        }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="board-columns">
          <SortableContext
            items={columnSortableIds}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                onEdit={setEditingColumn}
                onDelete={handleDeleteColumn}
                onTaskClick={setEditingTask}
                onAddTask={handleAddTask}
                isAddingTaskPending={createTaskMutation.isPending}
              />
            ))}
          </SortableContext>

          <div className="add-column">
            {isAddingColumn ? (
              <ColumnForm
                mode="create"
                onSubmit={handleAddColumn}
                onCancel={() => setIsAddingColumn(false)}
                isSubmitting={createColumnMutation.isPending}
              />
            ) : (
              <button type="button" onClick={() => setIsAddingColumn(true)}>
                + Add column
              </button>
            )}
          </div>
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask && (
            <div className="task-card task-card-overlay">
              <p className="task-card-title">{activeTask.title}</p>
              {activeTask.description && (
                <p className="task-card-description">
                  {activeTask.description}
                </p>
              )}
            </div>
          )}
          {activeColumn && (
            <div className="column column-overlay">
              <div className="column-header">
                <h3 className="column-title">{activeColumn.title}</h3>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <Modal
        isOpen={editingColumn !== null}
        onClose={() => setEditingColumn(null)}
        title="Edit column"
      >
        {editingColumn && (
          <ColumnForm
            mode="edit"
            initialValues={{ title: editingColumn.title }}
            onSubmit={handleEditColumn}
            onCancel={() => setEditingColumn(null)}
            isSubmitting={updateColumnMutation.isPending}
          />
        )}
      </Modal>

      <TaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleEditTask}
        onDelete={handleDeleteTask}
        isSubmitting={
          updateTaskMutation.isPending || deleteTaskMutation.isPending
        }
      />
    </div>
  );
}
