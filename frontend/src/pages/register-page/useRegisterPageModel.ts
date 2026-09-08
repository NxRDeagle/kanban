import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../api/auth";
import { ApiError } from "../../api/http";
import useAuthStore from "../../store/auth/useAuthStore";

export function useRegisterPageModel() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const session = await register({
        email: email.trim(),
        username: username.trim(),
        password,
      });
      setSession(session.token, session.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    email,
    username,
    password,
    error,
    isSubmitting,
    setEmail,
    setUsername,
    setPassword,
    handleSubmit,
  };
}
