import { useEffect, useMemo, useState } from "react";
import BlogForm from "../components/BlogForm";
import BlogList from "../components/BlogList";
import PageTopBar from "../components/PageTopBar";
import { createBlog, deleteBlog, getBlogs, updateBlog } from "../api/blogApi";

export default function BlogListPage({ navigate }) {
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

  const uniqueAuthors = new Set(posts.map((post) => post.author).filter(Boolean)).size;
  const totalLikes = posts.reduce((sum, post) => sum + Number(post.likes ?? 0), 0);
  const featuredPost = [...posts].sort((left, right) => Number(right.likes ?? 0) - Number(left.likes ?? 0))[0] ?? null;
  const recentPost = posts[0] ?? null;
  const hasResults = filteredPosts.length > 0;

  return (
    <div className="app-shell">
      <PageTopBar navigate={navigate} />

      <header className="masthead panel">
        <div className="masthead-top">
          <div>
            <p className="eyebrow">Blog platform</p>
            <h1>Editorial desk</h1>
            <p className="tagline">
              A premium workspace for drafting, reviewing, and publishing posts with a calm, structured surface.
            </p>
          </div>

          <div className="hero-actions">
            <button className="btn btn-primary" type="button" onClick={() => navigate("/blogs/new")}>New post</button>
          </div>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <span>{posts.length}</span>
            <p>Posts</p>
          </article>
          <article className="stat-card">
            <span>{uniqueAuthors}</span>
            <p>Writers</p>
          </article>
          <article className="stat-card">
            <span>{totalLikes}</span>
            <p>Likes</p>
          </article>
          <article className="stat-card">
            <span>{busy ? "Syncing" : "Ready"}</span>
            <p>State</p>
          </article>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <p className="feature-label">Featured post</p>
            {featuredPost ? (
              <>
                <h2>{featuredPost.title}</h2>
                <p>{featuredPost.author}</p>
                <span className="feature-meta">{featuredPost.likes ?? 0} likes · top signal</span>
              </>
            ) : (
              <p className="feature-empty">Publish a post to surface it here.</p>
            )}
          </article>

          <article className="feature-card muted">
            <p className="feature-label">Latest draft</p>
            {recentPost ? (
              <>
                <h2>{recentPost.title}</h2>
                <p>{recentPost.author}</p>
                <span className="feature-meta">Recently loaded into the feed</span>
              </>
            ) : (
              <p className="feature-empty">Your feed is empty right now.</p>
            )}
          </article>
        </div>
      </header>

      <main className="layout">
        <BlogForm
          mode="edit"
          selectedPost={selectedPost}
          onUpdate={handleUpdate}
          onCancel={() => setSelectedPost(null)}
          busy={busy}
        />

        <section className="panel panel-feed">
          <div className="panel-head row">
            <div>
              <p className="eyebrow">Feed</p>
              <h2>Published posts</h2>
              <p className="section-note">
                Browse every post, inspect details, and keep the editorial queue moving.
              </p>
            </div>
            <div className="search-bar">
              <input
                className="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title, author, or body"
              />
              <span className="search-meta">{hasResults ? `${filteredPosts.length} result${filteredPosts.length === 1 ? "" : "s"}` : "No matches"}</span>
            </div>
          </div>

          {message.text && (
            <p className={`message ${message.type === "error" ? "is-error" : "is-ok"}`}>{message.text}</p>
          )}

          <BlogList
            posts={filteredPosts}
            onEdit={setSelectedPost}
            onDelete={handleDelete}
            onView={(post) => navigate(`/blogs/${post.id}`)}
          />
        </section>
      </main>
    </div>
  );
}