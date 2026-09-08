import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../../../store/auth/useAuthStore";
import type { AppLayoutProps } from "./types";

export function useAppLayoutModel({ children }: AppLayoutProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const username = user?.username;

  function handleLogout() {
    logout();
    queryClient.clear();
  }

  return { children, username, handleLogout };
}
