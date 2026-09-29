import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import HealthBrandHeader from "../components/shared/HealthBrandHeader.jsx";

export default function Register({ navigate }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register({ name, email, password });
      navigate("/family");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Registration failed.");
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

      {/* Main Register Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Health Brand Header */}
          <HealthBrandHeader />

          {/* Clean White Card */}
          <div className="rounded-2xl border border-rose-100 bg-white p-7 sm:p-8 shadow-xl shadow-rose-950/5">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-rose-700">
                Create Family Account
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Set up your family dashboard to manage elder care
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500 border-t border-rose-100 pt-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="font-semibold text-rose-600 underline underline-offset-4 hover:text-rose-800 transition"
              >
                Already have an account? Sign in
              </button>
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
