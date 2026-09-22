import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import RosePetalHeader from "../components/shared/RosePetalHeader.jsx";

export default function Home({ navigate }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("family");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        const user = await register({ name, email, password });
        navigate("/family");
      } else {
        const user = await login({ email, password });
        navigate(user.role === "family" ? "/family" : "/elder");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white font-sans text-slate-900 antialiased flex flex-col justify-between">
      {/* Top Header Navigation */}
      <header className="border-b border-rose-100 bg-white/95 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600 text-white font-bold shadow-sm shadow-rose-200">
              <span className="text-sm font-bold">EC</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-rose-700">ElderCare AI</span>
          </div>
          <p className="text-sm text-rose-500 font-medium hidden sm:block">Voice-first companion for seniors</p>
        </div>
      </header>

      {/* Main Login / Register Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          
          {/* 3D Rose Petal ELDERCARE-AI Animated Header */}
          <div className="mb-2 flex flex-col items-center">
            <RosePetalHeader />
            <p className="text-xs font-serif italic text-rose-600 -mt-2 mb-3">
              Voice-first companion for seniors
            </p>
          </div>

          {/* Clean White Card */}
          <div className="rounded-2xl border border-rose-100 bg-white p-7 sm:p-8 shadow-xl shadow-rose-950/5">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-rose-700">
                {mode === "login" ? "Sign In" : "Create Account"}
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                {mode === "login" ? "Welcome back to ElderCare AI" : "Set up your family dashboard"}
              </p>
            </div>

            {mode === "login" && (
              <div className="mb-6 flex rounded-xl border border-rose-100 bg-rose-50/60 p-1">
                <button
                  type="button"
                  onClick={() => setRole("family")}
                  className={
                    "flex-1 rounded-lg py-2 text-sm font-semibold transition duration-200 " +
                    (role === "family"
                      ? "bg-rose-600 text-white shadow-sm font-bold"
                      : "text-rose-700 hover:text-rose-900")
                  }
                >
                  Family
                </button>
                <button
                  type="button"
                  onClick={() => setRole("elder")}
                  className={
                    "flex-1 rounded-lg py-2 text-sm font-semibold transition duration-200 " +
                    (role === "elder"
                      ? "bg-rose-600 text-white shadow-sm font-bold"
                      : "text-rose-700 hover:text-rose-900")
                  }
                >
                  Elder
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-rose-900">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-rose-900">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-rose-900">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 text-center font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 transition duration-200 shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {loading
                  ? mode === "login"
                    ? "Signing in…"
                    : "Creating account…"
                  : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500 border-t border-rose-100 pt-4">
              {mode === "login" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="font-semibold text-rose-600 underline underline-offset-4 hover:text-rose-800 transition"
                >
                  Need an account? Register
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="font-semibold text-rose-600 underline underline-offset-4 hover:text-rose-800 transition"
                >
                  Already have an account? Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-rose-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-xs text-rose-700 font-medium">ElderCare AI © 2026</p>
          <p className="text-xs text-slate-400">Voice-first · Privacy-respecting · Built with care</p>
        </div>
      </footer>
    </div>
  );
}
