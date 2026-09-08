import { Link } from "react-router-dom";
import ToastHost from "../../common/toast-host/ToastHost";
import { classNames } from "./classNames";
import type { AppLayoutProps } from "./types";
import { useAppLayoutModel } from "./useAppLayoutModel";
import "./AppLayout.css";

export default function AppLayout(props: AppLayoutProps) {
  const { children, username, handleLogout } = useAppLayoutModel(props);

  return (
    <div className={classNames.layout}>
      <header className={classNames.header}>
        <Link to="/" className={classNames.title}>
          Kanban
        </Link>
        {username && (
          <div className={classNames.headerActions}>
            <span className={classNames.username}>{username}</span>
            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
      </header>
      <main className={classNames.main}>{children}</main>
      <ToastHost />
    </div>
  );
}
