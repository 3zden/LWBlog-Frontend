import { useEffect, useState } from "react";
import CommentsSection from "../components/CommentsSection";
import PageTopBar from "../components/PageTopBar";
import { getBlog } from "../api/blogApi";

export default function BlogDetailsPage({ blogId, navigate }) {
  const [blog, setBlog] = useState(null);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadBlog() {
      setBusy(true);
      setMessage({ type: "", text: "" });

      try {
        const data = await getBlog(blogId);
        if (isActive) {
          setBlog(data);
          if (!data) {
            setMessage({ type: "error", text: "Blog not found." });
          }
        }
      } catch (error) {
        if (isActive) {
          setBlog(null);
          setMessage({ type: "error", text: `Could not load the blog: ${error.message}` });
        }
      } finally {
        if (isActive) {
          setBusy(false);
        }
      }
    }

    loadBlog();

    return () => {
      isActive = false;
    };
  }, [blogId]);

  return (
    <div className="app-shell detail-shell">
      <PageTopBar navigate={navigate} />

      <section className="detail-stage">
        <div className="detail-main-column">
          <article className="panel detail-panel detail-main">
            <p className="eyebrow">Blog details</p>

            {busy && <h1 className="detail-title">Loading post...</h1>}

            {!busy && message.text && <p className={`message ${message.type === "error" ? "is-error" : "is-ok"}`}>{message.text}</p>}

            {!busy && blog && (
              <>
                <header className="detail-header">
                  <div>
                    <h1 className="detail-title">{blog.title}</h1>
                    <p className="detail-meta">By {blog.author}</p>
                  </div>

                  <span className="likes">{blog.likes ?? 0} likes</span>
                </header>

                <div className="detail-body">
                  <p>{blog.content}</p>
                </div>
              </>
            )}
          </article>

          {!busy && blog && <CommentsSection blogId={blogId} navigate={navigate} onCountChange={setCommentCount} />}
        </div>

        <aside className="panel detail-sidebar">
          <p className="eyebrow">At a glance</p>
          <div className="sidebar-stack">
            <div className="sidebar-card">
              <span>Title</span>
              <strong>{busy ? "—" : blog?.title ?? "Unavailable"}</strong>
            </div>
            <div className="sidebar-card">
              <span>Author</span>
              <strong>{busy ? "—" : blog?.author ?? "Unavailable"}</strong>
            </div>
            <div className="sidebar-card">
              <span>Likes</span>
              <strong>{busy ? "—" : `${blog?.likes ?? 0}`}</strong>
            </div>
            <div className="sidebar-card">
              <span>Comments</span>
              <strong>{busy ? "—" : `${commentCount}`}</strong>
            </div>
          </div>

          <div className="sidebar-actions">
            <button className="btn btn-primary" type="button" onClick={() => navigate("/blogs/new")}>Publish new</button>
            <button className="btn btn-ghost" type="button" onClick={() => navigate("/blogs")}>Open feed</button>
          </div>
        </aside>
      </section>
    </div>
  );
}