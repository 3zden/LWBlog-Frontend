const STORAGE_KEYS = {
  users: "lwblog:users",
  currentUser: "lwblog:currentUser",
  comments: "lwblog:comments",
};

export const APP_STATE_EVENT = "lwblog:state-change";
// Compatibility alias expected by other modules
export const APP_EVENT = APP_STATE_EVENT;

function getWindow() {
  return typeof window === "undefined" ? null : window;
}

function safeParse(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function readStorage(key, fallback) {
  const targetWindow = getWindow();
  if (!targetWindow) {
    return fallback;
  }

  return safeParse(targetWindow.localStorage.getItem(key), fallback);
}

function writeStorage(key, value) {
  const targetWindow = getWindow();
  if (!targetWindow) {
    return;
  }

  targetWindow.localStorage.setItem(key, JSON.stringify(value));
  targetWindow.dispatchEvent(new Event(APP_STATE_EVENT));
}

function removeStorage(key) {
  const targetWindow = getWindow();
  if (!targetWindow) {
    return;
  }

  targetWindow.localStorage.removeItem(key);
  targetWindow.dispatchEvent(new Event(APP_STATE_EVENT));
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeName(value) {
  return value.trim().replace(/\s+/g, " ");
}

function readUsers() {
  return readStorage(STORAGE_KEYS.users, []);
}

function writeUsers(users) {
  writeStorage(STORAGE_KEYS.users, users);
}

function readCommentsMap() {
  return readStorage(STORAGE_KEYS.comments, {});
}

function writeCommentsMap(map) {
  writeStorage(STORAGE_KEYS.comments, map);
}

export function subscribeToAppState(handler) {
  const targetWindow = getWindow();
  if (!targetWindow) {
    return () => {};
  }

  targetWindow.addEventListener(APP_STATE_EVENT, handler);
  targetWindow.addEventListener("storage", handler);

  return () => {
    targetWindow.removeEventListener(APP_STATE_EVENT, handler);
    targetWindow.removeEventListener("storage", handler);
  };
}

export function readCurrentUser() {
  return readStorage(STORAGE_KEYS.currentUser, null);
}

// Compatibility alias expected by hooks
export function getCurrentUser() {
  return readCurrentUser();
}

// Ensure some minimal seed data exists for the app (no-op if present)
export function ensureSeedData() {
  const users = readUsers();
  if (!users || users.length === 0) {
    const seedUser = {
      id: generateId(),
      name: "Editorial User",
      fullName: "Editorial User",
      email: "editor@example.com",
      password: "password",
      bio: "Seeded user",
      role: "Contributor",
      createdAt: new Date().toISOString(),
    };

    writeUsers([seedUser]);
    writeStorage(STORAGE_KEYS.currentUser, null);
  }
}

export function registerUser({ name, email, password }) {
  const trimmedName = normalizeName(name || "");
  const trimmedEmail = (email || "").trim().toLowerCase();
  const trimmedPassword = (password || "").trim();

  if (trimmedName.length < 2) {
    throw new Error("Name must be at least 2 characters.");
  }

  if (!trimmedEmail.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  if (trimmedPassword.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const users = readUsers();
  const existing = users.find((user) => user.email === trimmedEmail);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const user = {
    id: generateId(),
    name: trimmedName,
    email: trimmedEmail,
    password: trimmedPassword,
    bio: "Writer, editor, and collector of short clean sentences.",
    role: "Contributor",
    createdAt: new Date().toISOString(),
  };

  writeUsers([user, ...users]);
  writeStorage(STORAGE_KEYS.currentUser, user);
  return user;
}

export function loginUser({ email, password }) {
  const trimmedEmail = (email || "").trim().toLowerCase();
  const trimmedPassword = (password || "").trim();

  if (!trimmedEmail || !trimmedPassword) {
    throw new Error("Email and password are required.");
  }

  const users = readUsers();
  const user = users.find((entry) => entry.email === trimmedEmail && entry.password === trimmedPassword);

  if (!user) {
    throw new Error("Incorrect email or password.");
  }

  writeStorage(STORAGE_KEYS.currentUser, user);
  return user;
}

export function logoutUser() {
  removeStorage(STORAGE_KEYS.currentUser);
}

export function updateCurrentUser(updates) {
  const currentUser = readCurrentUser();
  if (!currentUser) {
    throw new Error("No user is signed in.");
  }

  const nextUser = {
    ...currentUser,
    name: normalizeName(updates.name ?? currentUser.name),
    bio: normalizeName(updates.bio ?? currentUser.bio),
  };

  if (nextUser.name.length < 2) {
    throw new Error("Name must be at least 2 characters.");
  }

  const users = readUsers().map((user) => (user.id === currentUser.id ? { ...user, ...nextUser } : user));
  writeUsers(users);
  writeStorage(STORAGE_KEYS.currentUser, nextUser);
  return nextUser;
}

export function getCommentsForBlog(blogId) {
  const commentsMap = readCommentsMap();
  return Array.isArray(commentsMap[String(blogId)]) ? commentsMap[String(blogId)] : [];
}

// Compatibility alias used by components
export function getComments(blogId) {
  return getCommentsForBlog(blogId);
}

export function getAllComments() {
  const commentsMap = readCommentsMap();
  return Object.entries(commentsMap).flatMap(([blogId, comments]) =>
    Array.isArray(comments)
      ? comments.map((comment) => ({
          ...comment,
          blogId,
        }))
      : [],
  );
}

export function getUserCommentCount(userId) {
  return getAllComments().filter((comment) => comment.userId === userId).length;
}

export function addComment(blogId, { body, user }) {
  // Accept two payload shapes for compatibility:
  // 1) { body, user }
  // 2) { text, authorId, authorName, avatarColor }
  const text = body ?? (arguments[1] && arguments[1].text) ?? "";
  const trimmedBody = (text || "").trim();
  if (trimmedBody.length < 2) {
    throw new Error("Comment must be at least 2 characters.");
  }

  // Build a user object either from `user` or from explicit fields
  const payload = arguments[1] || {};
  const payloadUser = payload.user
    ? payload.user
    : payload.authorId || payload.authorName
    ? {
        id: payload.authorId || generateId(),
        name: payload.authorName || payload.authorName,
      }
    : null;

  if (!payloadUser) {
    throw new Error("Sign in to add a comment.");
  }

  const commentsMap = readCommentsMap();
  const nextComment = {
    id: generateId(),
    blogId: String(blogId),
    userId: payloadUser.id,
    authorName: payloadUser.fullName || payloadUser.name || payloadUser.authorName || "",
    body: trimmedBody,
    avatarColor: payload.avatarColor,
    createdAt: new Date().toISOString(),
  };

  const existing = Array.isArray(commentsMap[String(blogId)]) ? commentsMap[String(blogId)] : [];
  const nextComments = [nextComment, ...existing];
  writeCommentsMap({
    ...commentsMap,
    [String(blogId)]: nextComments,
  });

  return nextComment;
}

export function deleteComment(blogId, commentId) {
  const commentsMap = readCommentsMap();
  const existing = Array.isArray(commentsMap[String(blogId)]) ? commentsMap[String(blogId)] : [];
  const nextComments = existing.filter((comment) => comment.id !== commentId);

  writeCommentsMap({
    ...commentsMap,
    [String(blogId)]: nextComments,
  });
}
