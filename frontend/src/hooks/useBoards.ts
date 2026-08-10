import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBoard,
  deleteBoard,
  getBoard,
  getBoards,
  updateBoard,
} from "../api/boards";
import type { UpdateBoardInput } from "../types";
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
