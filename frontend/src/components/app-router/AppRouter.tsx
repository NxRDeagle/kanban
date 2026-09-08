import { Route, Routes } from "react-router-dom";
import GuestOnly from "../auth/guest-only/GuestOnly";
import RequireAuth from "../auth/require-auth/RequireAuth";
import BoardDetailPage from "../../pages/board-detail-page/BoardDetailPage";
import BoardsPage from "../../pages/boards-page/BoardsPage";
import LoginPage from "../../pages/login-page/LoginPage";
import RegisterPage from "../../pages/register-page/RegisterPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireAuth>
            <BoardsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/boards/:boardId"
        element={
          <RequireAuth>
            <BoardDetailPage />
          </RequireAuth>
        }
      />
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        }
      />
      <Route path="*" element={<p>Page not found</p>} />
    </Routes>
  );
}
