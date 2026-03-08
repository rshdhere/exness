import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Navbar } from "../components/Navbar";
import { setAuthToken } from "../lib/auth";
import { getErrorMessage } from "../lib/error";
import { trpcClient } from "../lib/trpc";
import type { AuthInput } from "../lib/types";

export function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<AuthInput>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await trpcClient.v1.user.signup.mutate(form);
      const signinResponse = await trpcClient.v1.user.signin.mutate(form);
      setAuthToken(signinResponse.token);
      navigate("/trading", { replace: true });
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main className="auth-wrap">
        <section className="card auth-card">
          <h1 className="card-title">Sign up</h1>

          <form className="trade-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                required
              />
            </label>

            {error ? <p className="error-text">{error}</p> : null}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="muted-text">
            Already have an account? <Link to="/signin">Sign in</Link>.
          </p>
        </section>
      </main>
    </div>
  );
}
