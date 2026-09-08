import { Navigate } from "react-router-dom";
import useAuthStore from "../../../store/auth/useAuthStore";
import type { GuestOnlyProps } from "./types";

export default function GuestOnly({ children }: GuestOnlyProps) {
  const token = useAuthStore((state) => state.token);
  if (token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
