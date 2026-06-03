import useAppSession from "../hooks/useAppSession";

export default function PageTopBar({ navigate }) {
  const { currentUser, signOut } = useAppSession();

  return (
    <header className="topbar panel">
      <button className="brand" type="button" onClick={() => navigate("/blogs")}>
        <span className="brand-mark">ED</span>
        <span className="brand-copy">
          <strong>Editorial Desk</strong>
          <small>Premium blog workspace</small>
        </span>
      </button>

      <div className="topbar-actions">
        <button className="btn btn-ghost btn-chip" type="button" onClick={() => navigate("/blogs")}>Feed</button>
        <button className="btn btn-ghost btn-chip" type="button" onClick={() => navigate("/blogs/new")}>New post</button>
        <button className="btn btn-ghost btn-chip" type="button" onClick={() => navigate("/profile")}>Profile</button>

        {currentUser ? (
          <>
            <span className="user-chip">
              <span className="user-dot" />
              {currentUser.fullName}
            </span>
            <button
              className="btn btn-primary btn-chip"
              type="button"
              onClick={() => {
                signOut();
                navigate("/auth");
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost btn-chip" type="button" onClick={() => navigate("/auth")}>Sign in</button>
            <button className="btn btn-primary btn-chip" type="button" onClick={() => navigate("/register")}>Register</button>
          </>
        )}
      </div>
    </header>
  );
}