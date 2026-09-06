import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";

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
    <div className="min-h-screen w-full bg-white font-sans text-slate-900 antialiased">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <span className="text-sm font-bold">EC</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">ElderCare AI</span>
          </div>
          <p className="text-sm text-slate-500">Voice-first companion for seniors</p>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {mode === "login" ? "Sign In" : "Create Account"}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {mode === "login" ? "Welcome back to ElderCare AI" : "Set up your family dashboard"}
              </p>
            </div>

            {mode === "login" && (
              <div className="mb-6 flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setRole("family")}
                  className={"flex-1 rounded-md py-2 text-sm font-medium transition " + (role === "family" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                >
                  Family
                </button>
                <button
                  type="button"
                  onClick={() => setRole("elder")}
                  className={"flex-1 rounded-md py-2 text-sm font-medium transition " + (role === "elder" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                >
                  Elder
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "register" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50"
              >
                {loading ? (mode === "login" ? "Signing in…" : "Creating account…") : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
              {mode === "login" ? (
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(""); }}
                  className="font-medium text-slate-900 underline underline-offset-4 hover:text-slate-700"
                >
                  Need an account? Register
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); }}
                  className="font-medium text-slate-900 underline underline-offset-4 hover:text-slate-700"
                >
                  Already have an account? Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">ElderCare AI © 2026</p>
          <p className="text-xs text-slate-400">Voice-first · Privacy-respecting · Built with care</p>
        </div>
      </footer>
    </div>
  );
}
