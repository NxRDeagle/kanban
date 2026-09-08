import { Link } from "react-router-dom";
import { classNames } from "../auth/classNames";
import { useRegisterPageModel } from "./useRegisterPageModel";
import "../auth/AuthPage.css";

export default function RegisterPage() {
  const {
    email,
    username,
    password,
    error,
    isSubmitting,
    setEmail,
    setUsername,
    setPassword,
    handleSubmit,
  } = useRegisterPageModel();

  return (
    <div className={classNames.page}>
      <form className={classNames.form} onSubmit={handleSubmit}>
        <h1>Register</h1>
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
          Username
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            minLength={3}
            maxLength={32}
            pattern="[A-Za-z0-9_]+"
          />
        </label>
        <label className={classNames.field}>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
        </label>
        {error && <p className={classNames.error}>{error}</p>}
        <div className={classNames.actions}>
          <button type="submit" disabled={isSubmitting}>
            Create account
          </button>
        </div>
        <p className={classNames.switch}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
