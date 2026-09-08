import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { boardsKeys } from "../../../api/queryKeys";
import { boardCollisionDetection } from "../../../dnd/collision";
import { DND_TRANSITION_MS, dropAnimation } from "../../../dnd/config";
import {
  columnSortableId,
  parseColumnSortableId,
  parseTaskDndId,
} from "../../../dnd/ids";
import {
  applyOptimisticTaskMove,
  resolveTaskMoveInput,
  wouldTaskMoveChange,
} from "../../../dnd/taskMove";
import { isSameDropTarget, resolveColumnTargetId } from "../../../dnd/utils";
import {
  useCreateColumnMutation,
  useDeleteColumnMutation,
  useReorderColumnsMutation,
  useUpdateColumnMutation,
} from "../../../hooks/useColumns";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useMoveTaskMutation,
  useUpdateTaskMutation,
} from "../../../hooks/useTasks";
import type { BoardWithColumns, ColumnWithTasks, Task } from "../../../types";
import { classNames as columnClassNames } from "../column/classNames";
import type { ColumnFormValues } from "../column-form/types";
import { classNames as taskCardClassNames } from "../task-card/classNames";
import type { TaskFormValues } from "../task-form/types";
import type { BoardProps, DragStartTaskSnapshot } from "./types";

export function useBoardModel({ board }: BoardProps) {
  const queryClient = useQueryClient();
  const { id: boardId, title, description, columns } = board;
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
  const dragStartTaskRef = useRef<DragStartTaskSnapshot | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
  const columnSortableIds = columns.map((column) =>
    columnSortableId(column.id),
  );
  const activeTaskDescription = activeTask?.description ?? null;
  const editingColumnTitle = editingColumn?.title;
  const isTaskModalSubmitting =
    updateTaskMutation.isPending || deleteTaskMutation.isPending;

  function findColumnByTaskId(taskId: string): ColumnWithTasks | undefined {
    return columns.find((column) =>
      column.tasks.some((task) => task.id === taskId),
    );
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
      setActiveTask(column?.tasks.find((task) => task.id === taskId) ?? null);
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

  return {
    title,
    description,
    columns,
    sensors,
    collisionDetection: boardCollisionDetection,
    measuring: { droppable: { strategy: MeasuringStrategy.Always } },
    dropAnimation,
    columnSortableIds,
    isAddingColumn,
    editingColumn,
    editingColumnTitle,
    editingTask,
    activeTask,
    activeTaskDescription,
    activeColumn,
    isCreatingColumn: createColumnMutation.isPending,
    isUpdatingColumn: updateColumnMutation.isPending,
    isAddingTaskPending: createTaskMutation.isPending,
    isTaskModalSubmitting,
    columnClassNames,
    taskCardClassNames,
    handleDragStart,
    handleDragOver,
    handleDragEnd: () => finishBoardItemDrag(false),
    handleDragCancel: () => finishBoardItemDrag(true),
    handleAddColumn,
    handleEditColumn,
    handleDeleteColumn,
    handleAddTask,
    handleEditTask,
    handleDeleteTask,
    setIsAddingColumn,
    setEditingColumn,
    setEditingTask,
  };
}
