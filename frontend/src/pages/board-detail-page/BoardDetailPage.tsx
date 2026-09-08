import { useParams } from "react-router-dom";
import AppLoader from "../../components/app-loader/AppLoader";
import Board from "../../components/board/board/Board";
import { useBoardQuery } from "../../hooks/useBoards";

export default function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { data: board, isLoading, isError } = useBoardQuery(boardId!);

  if (isLoading) return <AppLoader />;
  if (isError || !board) return <p>Board not found.</p>;

  return <Board board={board} />;
}
