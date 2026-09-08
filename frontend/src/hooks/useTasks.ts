import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask, deleteTask, moveTask, updateTask } from "../api/tasks";
import type { BoardWithColumns } from "../types";
import { boardsKeys } from "../api/queryKeys";
import { applyOptimisticTaskMove } from "../dnd/taskMove";
import type {
  CreateTaskVariables,
  MoveTaskVariables,
  UpdateTaskVariables,
} from "./types";

export function useCreateTaskMutation(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ columnId, title, description }: CreateTaskVariables) =>
      createTask(columnId, { title, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardsKeys.detail(boardId) });
    },
  });
}

export function useUpdateTaskMutation(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, input }: UpdateTaskVariables) =>
      updateTask(taskId, input),
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
    mutationFn: ({ taskId, input }: MoveTaskVariables) =>
      moveTask(taskId, input),
    onMutate: async ({ taskId, input }) => {
      await queryClient.cancelQueries({ queryKey: boardsKeys.detail(boardId) });
      const previous = queryClient.getQueryData<BoardWithColumns>(
        boardsKeys.detail(boardId),
      );
      if (previous) {
        queryClient.setQueryData<BoardWithColumns>(
          boardsKeys.detail(boardId),
          (old) => (old ? applyOptimisticTaskMove(old, taskId, input) : old),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(boardsKeys.detail(boardId), context.previous);
      }
    },
  });
}
