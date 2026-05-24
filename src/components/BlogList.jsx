export default function BlogList({ posts, onEdit, onDelete }) {
  if (!posts.length) {
    return <div className="empty">No posts yet. Publish your first one.</div>;
  }

  return (
    <div className="post-grid">
      {posts.map((post) => (
        <article key={post.id} className="post-card">
          <header>
            <p className="kicker">By {post.author}</p>
            <h3>{post.title}</h3>
            <span className="likes">{post.likes ?? 0} likes</span>
          </header>

          <p className="content">{post.content}</p>

          <div className="actions">
            <button className="btn btn-ghost" type="button" onClick={() => onEdit(post)}>
              Edit
            </button>
            <button className="btn btn-danger" type="button" onClick={() => onDelete(post.id)}>
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
