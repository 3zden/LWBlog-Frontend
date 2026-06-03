import { useEffect, useMemo, useState } from "react";
import useAppSession from "../hooks/useAppSession";
import { APP_EVENT, addComment, getComments } from "../lib/appState";

function formatCommentTime(timestamp) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function buildInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function CommentsSection({ blogId, navigate, onCountChange }) {
  const { currentUser } = useAppSession();
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    function syncComments() {
      const nextComments = getComments(blogId);
      setComments(nextComments);
      onCountChange?.(nextComments.length);
    }

    syncComments();

    window.addEventListener(APP_EVENT, syncComments);
    window.addEventListener("storage", syncComments);

    return () => {
      window.removeEventListener(APP_EVENT, syncComments);
      window.removeEventListener("storage", syncComments);
    };
  }, [blogId, onCountChange]);

  const canComment = Boolean(currentUser);

  const emptyMessage = useMemo(() => {
    if (canComment) {
      return "Be the first to add a note to this post.";
    }

    return "Sign in to join the conversation.";
  }, [canComment]);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage({ type: "", text: "" });

    try {
      const nextComment = addComment(blogId, {
        text: body,
        authorId: currentUser.id,
        authorName: currentUser.fullName,
        avatarColor: currentUser.avatarColor,
      });

      setComments((current) => {
        const nextComments = [nextComment, ...current];
        onCountChange?.(nextComments.length);
        return nextComments;
      });
      setBody("");
      setMessage({ type: "ok", text: "Comment published." });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel comments-panel">
      <div className="comments-head">
        <div>
          <p className="eyebrow">Comments</p>
          <h2>Conversation</h2>
        </div>
        <span className="comment-count">{comments.length} total</span>
      </div>

      {canComment ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <label>
            <span>Write a comment</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Share a thoughtful response"
              rows={4}
            />
          </label>
          <div className="actions">
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Posting..." : "Post comment"}
            </button>
          </div>
        </form>
      ) : (
        <div className="comment-gate">
          <p>{emptyMessage}</p>
          <div className="actions">
            <button className="btn btn-primary" type="button" onClick={() => navigate("/auth")}>
              Sign in
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => navigate("/register")}>
              Create account
            </button>
          </div>
        </div>
      )}

      {message.text && <p className={`message ${message.type === "error" ? "is-error" : "is-ok"}`}>{message.text}</p>}

      <div className="comment-list">
        {comments.length ? (
          comments.map((comment) => (
            <article key={comment.id} className="comment-card">
              <span className="comment-avatar" style={{ backgroundColor: comment.avatarColor || "#2f5d50" }}>
                {buildInitials(comment.authorName)}
              </span>
              <div className="comment-body">
                <div className="comment-meta">
                  <strong>{comment.authorName}</strong>
                  <span>{formatCommentTime(comment.createdAt)}</span>
                </div>
                <p>{comment.body}</p>
              </div>
            </article>
          ))
        ) : (
          <p className="empty-state">{emptyMessage}</p>
        )}
      </div>
    </section>
  );
}