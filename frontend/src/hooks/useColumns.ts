import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createColumn,
  deleteColumn,
  reorderColumns,
  updateColumn,
} from "../api/columns";
import type {
  BoardWithColumns,
  ReorderColumnsInput,
  UpdateColumnInput,
} from "../types";
import { boardsKeys } from "../api/queryKeys";

export function useCreateColumnMutation(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string }) => createColumn(boardId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardsKeys.detail(boardId) });
    },
  });
}

export function useUpdateColumnMutation(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      columnId,
      input,
    }: {
      columnId: string;
      input: UpdateColumnInput;
    }) => updateColumn(columnId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardsKeys.detail(boardId) });
    },
  });
}

export function useDeleteColumnMutation(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (columnId: string) => deleteColumn(columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardsKeys.detail(boardId) });
    },
  });
}

function applyOptimisticColumnReorder(
  board: BoardWithColumns,
  orderedColumnIds: string[],
): BoardWithColumns {
  const byId = new Map(board.columns.map((column) => [column.id, column]));
  const columns = orderedColumnIds.flatMap((id, index) => {
    const column = byId.get(id);
    return column ? [{ ...column, position: index }] : [];
  });
  return { ...board, columns };
}

export function useReorderColumnsMutation(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReorderColumnsInput) => reorderColumns(boardId, input),
    onMutate: async ({ orderedColumnIds }) => {
      await queryClient.cancelQueries({
        queryKey: boardsKeys.detail(boardId),
      });
      const previous = queryClient.getQueryData<BoardWithColumns>(
        boardsKeys.detail(boardId),
      );
      if (previous) {
        queryClient.setQueryData<BoardWithColumns>(
          boardsKeys.detail(boardId),
          (old) =>
            old ? applyOptimisticColumnReorder(old, orderedColumnIds) : old,
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(boardsKeys.detail(boardId), context.previous);
      }
    },
    onSuccess: (columns) => {
      queryClient.setQueryData<BoardWithColumns>(
        boardsKeys.detail(boardId),
        (old) => {
          if (!old) return old;
          const tasksByColumn = new Map(
            old.columns.map((column) => [column.id, column.tasks]),
          );
          return {
            ...old,
            columns: columns.map((column) => ({
              ...column,
              tasks: tasksByColumn.get(column.id) ?? [],
            })),
          };
        },
      );
    },
  });
}
