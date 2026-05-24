const API_BASE = "/v1/blogs";

async function parseResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const reason = data?.message || text || `Request failed with status ${response.status}`;
    throw new Error(reason);
  }

  return data;
}

export async function getBlogs() {
  const response = await fetch(API_BASE);
  return parseResponse(response);
}

export async function createBlog(payload) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function updateBlog(id, payload) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function deleteBlog(id) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });

  return parseResponse(response);
}
