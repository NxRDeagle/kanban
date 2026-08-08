import { useParams } from "react-router-dom";

export function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();

  return (
    <div>
      <h1>Board {boardId}</h1>
    </div>
  );
}
