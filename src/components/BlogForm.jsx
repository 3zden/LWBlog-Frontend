import { useEffect, useState } from "react";
import useAppSession from "../hooks/useAppSession";

const initialForm = {
  title: "",
  content: "",
  author: "",
};

export default function BlogForm({ mode = "create", selectedPost, onCreate, onUpdate, onCancel, busy }) {
  const { currentUser } = useAppSession();
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

    setFormData({
      title: "",
      content: "",
      author: currentUser?.fullName || "",
    });
  }, [currentUser, selectedPost]);

  const isEditing = Boolean(selectedPost);
  const isCreateMode = mode === "create";
  const authorLocked = !isEditing && Boolean(currentUser);

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

    if (onCreate) {
      onCreate({ title, content, author });
    }
  }

  if (!isEditing && !isCreateMode) {
    return (
      <section className="panel panel-form">
        <div className="panel-head">
          <p className="eyebrow">Editor</p>
          <h2>Select a post to edit</h2>
        </div>
        <p className="section-note">Choose Edit on a post from the feed to load it into this panel.</p>
      </section>
    );
  }

  return (
    <section className="panel panel-form">
      <div className="panel-head">
        <p className="eyebrow">Editor</p>
        <h2>{isEditing ? `Editing #${selectedPost.id}` : "Draft a post"}</h2>
        <p className="section-note">Keep the tone concise. Title and content are required; author is locked once editing starts.</p>
      </div>

      <form className="blog-form" onSubmit={handleSubmit}>
        <label>
          <span>Title</span>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="A strong headline"
            maxLength={60}
            required
          />
          <small className="field-hint">Aim for a sharp, readable title.</small>
        </label>

        <label>
          <span>Author</span>
          <input
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder={authorLocked ? "Pulled from your profile" : "Your name"}
            disabled={isEditing || authorLocked}
            required={!isEditing && !authorLocked}
          />
          <small className="field-hint">
            {authorLocked ? "Signed-in profile will be used for this post." : "Shown beneath the post title."}
          </small>
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
          <small className="field-hint">Longer drafts are welcome, but keep paragraphs clean and direct.</small>
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
