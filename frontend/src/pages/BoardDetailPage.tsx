import { useParams } from "react-router-dom";
import { useBoardQuery } from "../hooks/useBoards";
import { Board } from "../components/board/Board";

export function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { data: board, isLoading, isError } = useBoardQuery(boardId!);

  if (isLoading) return <p>Loading…</p>;
  if (isError || !board) return <p>Board not found.</p>;

  return <Board board={board} />;
}
