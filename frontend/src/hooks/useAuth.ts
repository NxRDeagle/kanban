import { useEffect, useState } from "react";
import { getMe } from "../api/auth";
import { useAuthStore } from "../store/auth";

export function useAuthBootstrap(): boolean {
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const logout = useAuthStore((state) => state.logout);
  const [ready, setReady] = useState(!token);

  useEffect(() => {
    if (!token) {
      setReady(true);
      return;
    }

    let cancelled = false;
    getMe()
      .then((user) => {
        if (!cancelled) {
          setSession(token, user);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          logout();
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, setSession, logout]);

  return ready;
}
