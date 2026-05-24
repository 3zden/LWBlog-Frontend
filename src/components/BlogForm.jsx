import { useEffect, useState } from "react";

const initialForm = {
  title: "",
  content: "",
  author: "",
};

export default function BlogForm({ selectedPost, onCreate, onUpdate, onCancel, busy }) {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (selectedPost) {
      setFormData({
        title: selectedPost.title,
        content: selectedPost.content,
        author: selectedPost.author,
      });
      return;
    }

    setFormData(initialForm);
  }, [selectedPost]);

  const isEditing = Boolean(selectedPost);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const title = formData.title.trim();
    const content = formData.content.trim();
    const author = formData.author.trim();

    if (title.length < 5) {
      window.alert("Title must be at least 5 characters.");
      return;
    }

    if (content.length < 5) {
      window.alert("Content must be at least 5 characters.");
      return;
    }

    if (!isEditing && !author) {
      window.alert("Author is required for new posts.");
      return;
    }

    if (isEditing) {
      onUpdate(selectedPost.id, { title, content });
      return;
    }

    onCreate({ title, content, author });
  }

  return (
    <section className="panel panel-form">
      <div className="panel-head">
        <p className="kicker">Editor</p>
        <h2>{isEditing ? `Editing #${selectedPost.id}` : "Create a post"}</h2>
      </div>

      <form className="blog-form" onSubmit={handleSubmit}>
        <label>
          <span>Title</span>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="A strong headline"
            maxLength={25}
            required
          />
        </label>

        <label>
          <span>Author</span>
          <input
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Your name"
            disabled={isEditing}
            required={!isEditing}
          />
        </label>

        <label>
          <span>Content</span>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={10}
            maxLength={2000}
            placeholder="Write your post"
            required
          />
        </label>

        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? "Saving..." : isEditing ? "Update post" : "Publish post"}
          </button>

          {isEditing && (
            <button className="btn btn-ghost" type="button" onClick={onCancel} disabled={busy}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
