import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth";
import { ToastHost } from "../common/ToastHost";
import "./AppLayout.css";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  function handleLogout() {
    logout();
    queryClient.clear();
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <Link to="/" className="app-title">
          Kanban
        </Link>
        {user && (
          <div className="app-header-actions">
            <span className="app-username">{user.username}</span>
            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
      </header>
      <main className="app-main">{children}</main>
      <ToastHost />
    </div>
  );
}
