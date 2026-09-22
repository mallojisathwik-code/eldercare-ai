import { useCallback, useEffect, useState } from "react";
import { AuthProvider } from "./context/AuthContext.jsx";
import { useAuth } from "./hooks/useAuth.js";
import ElderDashboard from "./pages/ElderDashboard.jsx";
import FamilyDashboard from "./pages/FamilyDashboard.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import RosePetalIntro from "./components/shared/RosePetalIntro.jsx";

function Router() {
  const auth = useAuth();
  const [showIntro, setShowIntro] = useState(true);
  const [path, setPath] = useState(window.location.pathname);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

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

  return (
    <>
      {/* 3D Rose Petals Falling & Forming ELDERCARE-AI Animation on White Background */}
      {showIntro && <RosePetalIntro onComplete={handleIntroComplete} />}

      {!auth.isAuthenticated && (path === "/" || path === "/register") && (
        path === "/register" ? <Register navigate={navigate} /> : <Home navigate={navigate} />
      )}

      {!auth.isAuthenticated && path !== "/" && path !== "/register" && (
        <Home navigate={navigate} />
      )}

      {auth.isAuthenticated && path === "/elder" && (
        <ElderDashboard navigate={navigate} />
      )}

      {auth.isAuthenticated && path === "/family" && (
        <FamilyDashboard navigate={navigate} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
