import BlogForm from "../components/BlogForm";
import PageTopBar from "../components/PageTopBar";
import { createBlog } from "../api/blogApi";

export default function BlogPublishPage({ navigate }) {
  async function handleCreate(payload) {
    await createBlog(payload);
    navigate("/blogs");
  }

  return (
    <div className="app-shell detail-shell">
      <PageTopBar navigate={navigate} />

      <section className="panel detail-panel publish-stage">
        <div className="publish-intro">
          <p className="eyebrow">New post</p>
          <h1 className="detail-title">Publish a post</h1>
          <p className="tagline">
            Compose a clean article with a concise title, author, and body. The experience is tuned for focus and polish.
          </p>
        </div>

        <BlogForm mode="create" onCreate={handleCreate} busy={false} />
      </section>
    </div>
  );
}