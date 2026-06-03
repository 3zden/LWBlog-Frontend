export default function BlogList({ posts, onEdit, onDelete, onView }) {
  if (!posts.length) {
    return (
      <div className="empty empty-card">
        <p className="eyebrow">Nothing published</p>
        <h3>No posts yet</h3>
        <p className="section-note">Create the first article to populate the feed and unlock the editorial dashboard.</p>
      </div>
    );
  }

  return (
    <div className="post-grid">
      {posts.map((post) => (
        <article key={post.id} className="post-card">
          <div className="post-card-top">
            <header>
              <p className="kicker">By {post.author}</p>
              <h3>{post.title}</h3>
            </header>

            <span className="likes">{post.likes ?? 0} likes</span>
          </div>

          <p className="content">{post.content}</p>

          <div className="actions">
            <button className="btn btn-ghost" type="button" onClick={() => onView(post)}>
              View
            </button>
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
