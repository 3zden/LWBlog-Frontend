import { useEffect, useMemo, useState } from "react";
import PageTopBar from "../components/PageTopBar";
import useAppSession from "../hooks/useAppSession";
import { getBlogs } from "../api/blogApi";
import { getUserCommentCount } from "../lib/appState";

const emptyForm = {
  fullName: "",
  headline: "",
  bio: "",
  website: "",
  location: "",
  avatarColor: "#2f5d50",
};

export default function ProfilePage({ navigate }) {
  const { currentUser, saveProfile } = useAppSession();
  const [form, setForm] = useState(emptyForm);
  const [posts, setPosts] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setForm({
      fullName: currentUser.fullName || "",
      headline: currentUser.headline || "",
      bio: currentUser.bio || "",
      website: currentUser.website || "",
      location: currentUser.location || "",
      avatarColor: currentUser.avatarColor || "#2f5d50",
    });
  }, [currentUser]);

  useEffect(() => {
    let isActive = true;

    async function loadPosts() {
      const data = await getBlogs();
      if (isActive) {
        setPosts(Array.isArray(data) ? data : []);
      }
    }

    loadPosts().catch(() => setPosts([]));

    return () => {
      isActive = false;
    };
  }, []);

  const authoredPosts = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    const candidates = [currentUser.fullName, currentUser.name, currentUser.email].filter(Boolean);
    return posts.filter((post) => candidates.includes(post.author));
  }, [currentUser, posts]);

  const commentCount = currentUser ? getUserCommentCount(currentUser.id) : 0;

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage({ type: "", text: "" });

    try {
      await saveProfile(form);
      setMessage({ type: "ok", text: "Profile updated." });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  if (!currentUser) {
    return (
      <div className="app-shell">
        <PageTopBar navigate={navigate} />
        <section className="panel profile-empty">
          <p className="eyebrow">Profile</p>
          <h1>Sign in to view your profile.</h1>
          <p className="tagline">Your profile stores the name, headline, bio, and activity that appear across the app.</p>
          <div className="actions">
            <button className="btn btn-primary" type="button" onClick={() => navigate("/auth")}>Sign in</button>
            <button className="btn btn-ghost" type="button" onClick={() => navigate("/register")}>Create account</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell profile-shell">
      <PageTopBar navigate={navigate} />

      <section className="profile-stage">
        <aside className="panel profile-summary">
          <div className="profile-avatar" style={{ backgroundColor: currentUser.avatarColor || "#2f5d50" }}>
            {currentUser.fullName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0].toUpperCase())
              .join("")}
          </div>

          <div>
            <p className="eyebrow">Profile</p>
            <h1>{currentUser.fullName}</h1>
            <p className="tagline">{currentUser.headline || "No headline set yet."}</p>
          </div>

          <div className="profile-stats">
            <article className="profile-stat">
              <span>{authoredPosts.length}</span>
              <p>Authored posts</p>
            </article>
            <article className="profile-stat">
              <span>{commentCount}</span>
              <p>Comments written</p>
            </article>
            <article className="profile-stat">
              <span>{currentUser.role || "Writer"}</span>
              <p>Role</p>
            </article>
          </div>

          <div className="profile-meta-list">
            <div>
              <span>Email</span>
              <strong>{currentUser.email}</strong>
            </div>
            <div>
              <span>Location</span>
              <strong>{currentUser.location || "Unknown"}</strong>
            </div>
            <div>
              <span>Website</span>
              <strong>{currentUser.website || "Not added"}</strong>
            </div>
          </div>
        </aside>

        <article className="panel profile-editor">
          <div className="panel-head">
            <p className="eyebrow">Profile editor</p>
            <h2>Refine your public identity</h2>
            <p className="section-note">These details surface in the app when you publish posts and comments.</p>
          </div>

          {message.text && <p className={`message ${message.type === "error" ? "is-error" : "is-ok"}`}>{message.text}</p>}

          <form className="blog-form" onSubmit={handleSubmit}>
            <label>
              <span>Full name</span>
              <input
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                placeholder="Your name"
              />
            </label>

            <label>
              <span>Headline</span>
              <input
                value={form.headline}
                onChange={(event) => setForm((current) => ({ ...current, headline: event.target.value }))}
                placeholder="A short professional line"
              />
            </label>

            <label>
              <span>Bio</span>
              <textarea
                value={form.bio}
                onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                rows={5}
                placeholder="A concise bio"
              />
            </label>

            <div className="dual-fields">
              <label>
                <span>Website</span>
                <input
                  value={form.website}
                  onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
                  placeholder="https://"
                />
              </label>

              <label>
                <span>Location</span>
                <input
                  value={form.location}
                  onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                  placeholder="City, country"
                />
              </label>
            </div>

            <label>
              <span>Accent color</span>
              <input
                type="color"
                value={form.avatarColor}
                onChange={(event) => setForm((current) => ({ ...current, avatarColor: event.target.value }))}
              />
            </label>

            <div className="actions">
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? "Saving..." : "Save profile"}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => navigate("/blogs")}>Back to feed</button>
            </div>
          </form>
        </article>
      </section>

      <section className="panel profile-feed">
        <div className="panel-head row">
          <div>
            <p className="eyebrow">Your posts</p>
            <h2>Published articles</h2>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => navigate("/blogs/new")}>New post</button>
        </div>

        <div className="profile-post-list">
          {authoredPosts.length ? (
            authoredPosts.map((post) => (
              <article key={post.id} className="profile-post-card">
                <div>
                  <p className="feature-label">Post #{post.id}</p>
                  <h3>{post.title}</h3>
                  <p className="section-note">{post.content}</p>
                </div>
                <div className="actions">
                  <button className="btn btn-ghost" type="button" onClick={() => navigate(`/blogs/${post.id}`)}>View</button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty empty-card">
              <p className="eyebrow">No posts yet</p>
              <h3>This profile has not published anything.</h3>
              <p className="section-note">Create your first post to fill this section and appear in the feed.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}