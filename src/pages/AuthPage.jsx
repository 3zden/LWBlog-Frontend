import { useEffect, useMemo, useState } from "react";
import PageTopBar from "../components/PageTopBar";
import useAppSession from "../hooks/useAppSession";

const loginInitial = {
  email: "",
  password: "",
};

const registerInitial = {
  fullName: "",
  email: "",
  password: "",
  headline: "",
};

export default function AuthPage({ navigate, initialMode = "login" }) {
  const { currentUser, signIn, signUp } = useAppSession();
  const [mode, setMode] = useState(initialMode === "register" ? "register" : "login");
  const [loginForm, setLoginForm] = useState(loginInitial);
  const [registerForm, setRegisterForm] = useState(registerInitial);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMode(initialMode === "register" ? "register" : "login");
  }, [initialMode]);

  const heading = useMemo(() => (mode === "login" ? "Welcome back" : "Create your account"), [mode]);

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setMessage({ type: "", text: "" });

    try {
      await signIn(loginForm);
      setMessage({ type: "ok", text: "Signed in successfully." });
      navigate("/profile");
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setBusy(true);
    setMessage({ type: "", text: "" });

    try {
      await signUp(registerForm);
      setMessage({ type: "ok", text: "Account created." });
      navigate("/profile");
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  if (currentUser) {
    return (
      <div className="app-shell">
        <PageTopBar navigate={navigate} />
        <section className="auth-stage panel">
          <div className="auth-hero-card">
            <p className="eyebrow">Signed in</p>
            <h1>You're already inside the workspace.</h1>
            <p className="tagline">
              Continue to the profile editor or return to the feed to keep writing.
            </p>
            <div className="actions">
              <button className="btn btn-primary" type="button" onClick={() => navigate("/profile")}>Open profile</button>
              <button className="btn btn-ghost" type="button" onClick={() => navigate("/blogs")}>Go to feed</button>
            </div>
          </div>

          <aside className="auth-side-card">
            <p className="feature-label">Current account</p>
            <h2>{currentUser.fullName}</h2>
            <p className="section-note">{currentUser.headline || "No headline yet."}</p>
            <span className="feature-meta">{currentUser.email}</span>
          </aside>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <PageTopBar navigate={navigate} />

      <section className="auth-stage">
        <article className="panel auth-hero-card">
          <p className="eyebrow">Access</p>
          <h1>{heading}</h1>
          <p className="tagline">
            Sign in to publish comments, manage your profile, and keep your editorial identity consistent across the app.
          </p>

          <div className="auth-signal-grid">
            <div className="signal-card">
              <span>1</span>
              <p>Log in to personalize posts and comments.</p>
            </div>
            <div className="signal-card">
              <span>2</span>
              <p>Register to create a polished public profile.</p>
            </div>
            <div className="signal-card">
              <span>3</span>
              <p>Use the demo account to explore instantly.</p>
            </div>
          </div>

          <div className="demo-credentials">
            <span>Demo</span>
            <strong>demo@editorialdesk.app</strong>
            <strong>demo1234</strong>
          </div>
        </article>

        <article className="panel auth-form-card">
          <div className="auth-tabs">
            <button className={`auth-tab ${mode === "login" ? "is-active" : ""}`} type="button" onClick={() => setMode("login")}>
              Sign in
            </button>
            <button className={`auth-tab ${mode === "register" ? "is-active" : ""}`} type="button" onClick={() => setMode("register")}>
              Register
            </button>
          </div>

          {message.text && <p className={`message ${message.type === "error" ? "is-error" : "is-ok"}`}>{message.text}</p>}

          {mode === "login" ? (
            <form className="blog-form" onSubmit={handleLogin}>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="••••••••"
                  required
                />
              </label>

              <div className="actions">
                <button className="btn btn-primary" type="submit" disabled={busy}>
                  {busy ? "Signing in..." : "Sign in"}
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setMode("register")}>
                  Create account
                </button>
              </div>
            </form>
          ) : (
            <form className="blog-form" onSubmit={handleRegister}>
              <label>
                <span>Full name</span>
                <input
                  value={registerForm.fullName}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Your name"
                  required
                />
              </label>

              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="At least 6 characters"
                  required
                />
              </label>

              <label>
                <span>Headline</span>
                <input
                  value={registerForm.headline}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, headline: event.target.value }))}
                  placeholder="A short professional line"
                />
              </label>

              <div className="actions">
                <button className="btn btn-primary" type="submit" disabled={busy}>
                  {busy ? "Creating..." : "Create account"}
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setMode("login")}>
                  Back to sign in
                </button>
              </div>
            </form>
          )}
        </article>
      </section>
    </div>
  );
}