import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { BoardsPage } from "./pages/BoardsPage";
import { BoardDetailPage } from "./pages/BoardDetailPage";
import { LoginPage } from "./pages/LoginPage";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<BoardsPage />} />
        <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<p>Page not found</p>} />
      </Routes>
    </AppLayout>
  );
}

export default App;
