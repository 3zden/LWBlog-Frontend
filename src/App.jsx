import { useEffect, useMemo, useState } from "react";
import BlogForm from "./components/BlogForm";
import BlogList from "./components/BlogList";
import { createBlog, deleteBlog, getBlogs, updateBlog } from "./api/blogApi";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  async function loadPosts() {
    setBusy(true);

    try {
      const data = await getBlogs();
      setPosts(Array.isArray(data) ? data : []);
      setMessage({
        type: "ok",
        text: "Posts loaded.",
      });
    } catch (error) {
      setMessage({ type: "error", text: `Could not load posts: ${error.message}` });
      setPosts([]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleCreate(payload) {
    setBusy(true);
    try {
      await createBlog(payload);
      setMessage({ type: "ok", text: "Post published." });
      await loadPosts();
    } catch (error) {
      setMessage({ type: "error", text: `Create failed: ${error.message}` });
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(id, payload) {
    setBusy(true);
    try {
      await updateBlog(id, payload);
      setSelectedPost(null);
      setMessage({ type: "ok", text: "Post updated." });
      await loadPosts();
    } catch (error) {
      setMessage({ type: "error", text: `Update failed: ${error.message}` });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) {
      return;
    }

    setBusy(true);
    try {
      await deleteBlog(id);
      setSelectedPost((current) => (current?.id === id ? null : current));
      setMessage({ type: "ok", text: "Post deleted." });
      await loadPosts();
    } catch (error) {
      setMessage({ type: "error", text: `Delete failed: ${error.message}` });
    } finally {
      setBusy(false);
    }
  }

  const filteredPosts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return posts;
    }

    return posts.filter((post) => {
      const stack = `${post.title} ${post.author} ${post.content}`.toLowerCase();
      return stack.includes(needle);
    });
  }, [posts, query]);

  const uniqueAuthors = new Set(posts.map((post) => post.author)).size;

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="kicker">Blogging App</p>
          <h1>Publishing cockpit</h1>
          <p className="tagline">
            A separate React frontend that consumes your Spring API and keeps writing and feed management on one screen.
          </p>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <span>{posts.length}</span>
            <p>Total posts</p>
          </article>
          <article className="stat-card">
            <span>{uniqueAuthors}</span>
            <p>Authors</p>
          </article>
          <article className="stat-card">
            <span>{busy ? "Syncing" : "Ready"}</span>
            <p>Status</p>
          </article>
        </div>
      </header>

      <main className="layout">
        <BlogForm
          selectedPost={selectedPost}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onCancel={() => setSelectedPost(null)}
          busy={busy}
        />

        <section className="panel panel-feed">
          <div className="panel-head row">
            <div>
              <p className="kicker">Feed</p>
              <h2>Published posts</h2>
            </div>
            <input
              className="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, author, or content"
            />
          </div>

          {message.text && (
            <p className={`message ${message.type === "error" ? "is-error" : "is-ok"}`}>{message.text}</p>
          )}

          <BlogList posts={filteredPosts} onEdit={setSelectedPost} onDelete={handleDelete} />
        </section>
      </main>
    </div>
  );
}
