import { useCallback, useEffect, useState } from "react";
import { AuthProvider } from "./context/AuthContext.jsx";
import { useAuth } from "./hooks/useAuth.js";
import ElderDashboard from "./pages/ElderDashboard.jsx";
import FamilyDashboard from "./pages/FamilyDashboard.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";

function Router() {
  const auth = useAuth();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((nextPath) => {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  }, []);

  useEffect(() => {
    if (!auth.isAuthenticated && path !== "/register" && path !== "/") {
      navigate("/");
      return;
    }

    if (auth.isAuthenticated) {
      if (path === "/" || path === "/register") {
        navigate(auth.user.role === "elder" ? "/elder" : "/family");
        return;
      }

      if (path !== "/elder" && path !== "/family") {
        navigate(auth.user.role === "elder" ? "/elder" : "/family");
      }
    }
  }, [auth.isAuthenticated, auth.user?.role, path, navigate]);

  if (!auth.isAuthenticated && (path === "/" || path === "/register")) {
    if (path === "/register") return <Register navigate={navigate} />;
    return <Home navigate={navigate} />;
  }

  if (!auth.isAuthenticated) {
    return <Home navigate={navigate} />;
  }

  if (path === "/elder") {
    return <ElderDashboard navigate={navigate} />;
  }

  if (path === "/family") {
    return <FamilyDashboard navigate={navigate} />;
  }

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
