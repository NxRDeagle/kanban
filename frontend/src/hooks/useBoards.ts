import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBoard,
  deleteBoard,
  getBoard,
  getBoards,
  reorderBoards,
  updateBoard,
} from "../api/boards";
import type { Board, ReorderBoardsInput, UpdateBoardInput } from "../types";
import { boardsKeys } from "../api/queryKeys";

export function useBoardsQuery() {
  return useQuery({
    queryKey: boardsKeys.all,
    queryFn: getBoards,
  });
}

export function useBoardQuery(boardId: string) {
  return useQuery({
    queryKey: boardsKeys.detail(boardId),
    queryFn: () => getBoard(boardId),
  });
}

export function useCreateBoardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardsKeys.all });
    },
  });
}

export function useUpdateBoardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      boardId,
      input,
    }: {
      boardId: string;
      input: UpdateBoardInput;
    }) => updateBoard(boardId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardsKeys.all });
    },
  });
}

export function useDeleteBoardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardsKeys.all });
    },
  });
}

function applyOptimisticBoardReorder(
  boards: Board[],
  orderedBoardIds: string[],
): Board[] {
  const byId = new Map(boards.map((board) => [board.id, board]));
  return orderedBoardIds.flatMap((id, index) => {
    const board = byId.get(id);
    return board ? [{ ...board, position: index }] : [];
  });
}

export function useReorderBoardsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReorderBoardsInput) => reorderBoards(input),
    onMutate: async ({ orderedBoardIds }) => {
      await queryClient.cancelQueries({ queryKey: boardsKeys.all });
      const previous = queryClient.getQueryData<Board[]>(boardsKeys.all);
      if (previous) {
        queryClient.setQueryData(
          boardsKeys.all,
          applyOptimisticBoardReorder(previous, orderedBoardIds),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(boardsKeys.all, context.previous);
      }
    },
    onSuccess: (boards) => {
      queryClient.setQueryData(boardsKeys.all, boards);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardsKeys.all });
    },
  });
}
