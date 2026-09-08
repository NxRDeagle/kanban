import { Link } from "react-router-dom";
import { classNames } from "../auth/classNames";
import { useLoginPageModel } from "./useLoginPageModel";
import "../auth/AuthPage.css";

export default function LoginPage() {
  const {
    email,
    password,
    error,
    isSubmitting,
    setEmail,
    setPassword,
    handleSubmit,
  } = useLoginPageModel();

  return (
    <div className={classNames.page}>
      <form className={classNames.form} onSubmit={handleSubmit}>
        <h1>Log in</h1>
        <label className={classNames.field}>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoFocus
          />
        </label>
        <label className={classNames.field}>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p className={classNames.error}>{error}</p>}
        <div className={classNames.actions}>
          <button type="submit" disabled={isSubmitting}>
            Log in
          </button>
        </div>
        <p className={classNames.switch}>
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
