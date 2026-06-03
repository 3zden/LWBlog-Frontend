import { useEffect, useState } from "react";
import BlogListPage from "./pages/BlogListPage";
import BlogDetailsPage from "./pages/BlogDetailsPage";
import BlogPublishPage from "./pages/BlogPublishPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";

function getRouteFromPath(pathname) {
  if (pathname === "/" || pathname === "") {
    return { name: "blogs" };
  }

  if (pathname === "/blogs") {
    return { name: "blogs" };
  }

  if (pathname === "/blogs/new") {
    return { name: "blog-create" };
  }

  if (pathname === "/auth" || pathname === "/login") {
    return { name: "auth", mode: "login" };
  }

  if (pathname === "/register") {
    return { name: "auth", mode: "register" };
  }

  if (pathname === "/profile") {
    return { name: "profile" };
  }

  const detailMatch = pathname.match(/^\/blogs\/(\d+)$/);
  if (detailMatch) {
    return { name: "blog-details", id: detailMatch[1] };
  }

  return { name: "blogs" };
}

export default function App() {
  const [route, setRoute] = useState(() => getRouteFromPath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRouteFromPath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);

    if (window.location.pathname === "/") {
      window.history.replaceState({}, "", "/blogs");
      setRoute({ name: "blogs" });
    }

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(pathname) {
    if (window.location.pathname !== pathname) {
      window.history.pushState({}, "", pathname);
    }

    setRoute(getRouteFromPath(pathname));
  }

  if (route.name === "blog-details") {
    return <BlogDetailsPage blogId={route.id} navigate={navigate} />;
  }

  if (route.name === "blog-create") {
    return <BlogPublishPage navigate={navigate} />;
  }

  if (route.name === "auth") {
    return <AuthPage navigate={navigate} initialMode={route.mode} />;
  }

  if (route.name === "profile") {
    return <ProfilePage navigate={navigate} />;
  }

  return <BlogListPage navigate={navigate} />;
}
