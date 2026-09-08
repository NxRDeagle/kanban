import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../../../store/auth/useAuthStore";
import type { RequireAuthProps } from "./types";

export default function RequireAuth({ children }: RequireAuthProps) {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
