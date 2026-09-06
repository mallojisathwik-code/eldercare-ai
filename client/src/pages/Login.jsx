import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";
import NeuralBrainBackground from "../components/shared/NeuralBrainBackground.jsx";

export default function Login({ navigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x, y });
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login({ email, password });
      navigate(user?.role === "elder" ? "/elder" : "/family");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      <div className="relative h-64 w-full lg:h-screen lg:w-1/2">
        <NeuralBrainBackground mousePos={mousePos} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/30 lg:bg-gradient-to-r" />
      </div>

      <div className="flex w-full items-center justify-center bg-slate-950 px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/85 p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white">Sign In</h1>
              <p className="mt-2 text-sm text-slate-400">Welcome back to ElderCare AI</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-3 px-4 text-base text-slate-100 placeholder-slate-600 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-3 px-4 text-base text-slate-100 placeholder-slate-600 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-center text-sm text-rose-300">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-cyan-600 py-3.5 text-base font-semibold text-white hover:bg-cyan-500 transition duration-200 shadow-lg shadow-cyan-900/20 disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              <button type="button" onClick={() => navigate("/")} className="font-medium text-cyan-400 hover:underline">
                ← Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
