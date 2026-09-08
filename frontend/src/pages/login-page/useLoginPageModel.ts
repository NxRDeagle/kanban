import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { ApiError } from "../../api/http";
import useAuthStore from "../../store/auth/useAuthStore";
import type { LoginLocationState } from "./types";

export function useLoginPageModel() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const from =
    (location.state as LoginLocationState | null)?.from?.pathname ?? "/";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const session = await login({ email: email.trim(), password });
      setSession(session.token, session.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    email,
    password,
    error,
    isSubmitting,
    setEmail,
    setPassword,
    handleSubmit,
  };
}
