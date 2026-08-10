import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask, deleteTask, moveTask, updateTask } from "../api/tasks";
import type {
  BoardWithColumns,
  MoveTaskInput,
  UpdateTaskInput,
} from "../types";
import { boardsKeys } from "../api/queryKeys";

function applyOptimisticMove(
  board: BoardWithColumns,
  taskId: string,
  input: MoveTaskInput,
): BoardWithColumns {
  const { columns } = board;

  const sourceColumn = columns.find((c) =>
    c.tasks.some((t) => t.id === taskId),
  );

  const task = sourceColumn?.tasks.find((t) => t.id === taskId);
  if (!sourceColumn || !task) return board;

  if (sourceColumn.id === input.toColumnId) {
    const siblings = sourceColumn.tasks.filter((t) => t.id !== taskId);
    const clamped = Math.max(0, Math.min(input.toPosition, siblings.length));
    siblings.splice(clamped, 0, task);
    const reordered = siblings.map((t, index) => ({ ...t, position: index }));

    return {
      ...board,
      columns: columns.map((c) =>
        c.id === sourceColumn.id ? { ...c, tasks: reordered } : c,
      ),
    };
  }

  const destColumn = columns.find((c) => c.id === input.toColumnId);
  if (!destColumn) return board;

  const sourceRemaining = sourceColumn.tasks
    .filter((t) => t.id !== taskId)
    .map((t, index) => ({ ...t, position: index }));

  const destTasks = [...destColumn.tasks];

  const clamped = Math.max(0, Math.min(input.toPosition, destTasks.length));
  destTasks.splice(clamped, 0, { ...task, columnId: input.toColumnId });
  const reorderedDest = destTasks.map((t, index) => ({
    ...t,
    position: index,
  }));

  return {
    ...board,
    columns: columns.map((c) => {
      if (c.id === sourceColumn.id) return { ...c, tasks: sourceRemaining };
      if (c.id === destColumn.id) return { ...c, tasks: reorderedDest };
      return c;
    }),
  };
}

export function useCreateTaskMutation(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      columnId,
      title,
      description,
    }: {
      columnId: string;
      title: string;
      description?: string;
    }) => createTask(columnId, { title, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardsKeys.detail(boardId) });
    },
  });
}

export function useUpdateTaskMutation(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      input,
    }: {
      taskId: string;
      input: UpdateTaskInput;
    }) => updateTask(taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardsKeys.detail(boardId) });
    },
  });
}

export function useDeleteTaskMutation(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardsKeys.detail(boardId) });
    },
  });
}

export function useMoveTaskMutation(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: MoveTaskInput }) =>
      moveTask(taskId, input),
    onMutate: async ({ taskId, input }) => {
      await queryClient.cancelQueries({ queryKey: boardsKeys.detail(boardId) });
      const previous = queryClient.getQueryData<BoardWithColumns>(
        boardsKeys.detail(boardId),
      );
      if (previous) {
        queryClient.setQueryData<BoardWithColumns>(
          boardsKeys.detail(boardId),
          (old) => (old ? applyOptimisticMove(old, taskId, input) : old),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(boardsKeys.detail(boardId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardsKeys.detail(boardId) });
    },
  });
}
