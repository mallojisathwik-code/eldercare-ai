import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { apiClient } from "../api.js";
import MedicineManager from "../components/family/MedicineManager.jsx";
import SosAlertsPanel from "../components/family/SosAlertsPanel.jsx";
import VoiceMessageRecorder from "../components/family/VoiceMessageRecorder.jsx";
import WeeklyReport from "../components/family/WeeklyReport.jsx";

export default function FamilyDashboard({ navigate }) {
  const { user, logout } = useAuth();
  const [elder, setElder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);
  const [addSuccess, setAddSuccess] = useState(false);
  const [elderForm, setElderForm] = useState({ name: "", email: "", password: "" });
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const fetchLinkedElder = () => {
    setLoading(true);
    apiClient
      .get("/family/elder")
      .then((res) => {
        setElder(res.data.elder);
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLinkedElder();
  }, []);

  const handleAddElder = async (event) => {
    event.preventDefault();
    setAddError(null);
    setAdding(true);

    try {
      const res = await apiClient.post("/family/elder", elderForm);
      setElder(res.data.elder);
      setAddSuccess(true);
      setShowAddForm(false);
      setElderForm({ name: "", email: "", password: "" });
    } catch (err) {
      setAddError(err.response?.data?.error || err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setResetError(null);
    setResetSuccess(false);
    setResetting(true);

    try {
      await apiClient.put(`/family/elder/${elder.id}/password`, { password: newPassword });
      setResetSuccess(true);
      setNewPassword("");
    } catch (err) {
      setResetError(err.response?.data?.error || err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-900 antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <span className="text-sm font-bold">EC</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">ElderCare AI</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Welcome, {user?.name}</span>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Family Dashboard</h1>
          <p className="mt-2 text-base text-slate-600">Manage your loved ones care and stay connected</p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">Loading elder information…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : !elder ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Add Elder</h2>
            <p className="text-sm text-slate-600 mb-6">
              Create an elder account so they can use the voice companion. You will set their password so you can share it with them in person.
            </p>

            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Add Elder
              </button>
            ) : (
              <form onSubmit={handleAddElder} className="mt-6 space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Full name</label>
                  <input
                    type="text"
                    value={elderForm.name}
                    onChange={(e) => setElderForm({ ...elderForm, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={elderForm.email}
                    onChange={(e) => setElderForm({ ...elderForm, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Password (min 6 characters)</label>
                  <input
                    type="password"
                    value={elderForm.password}
                    onChange={(e) => setElderForm({ ...elderForm, password: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    required
                    minLength={6}
                  />
                </div>

                {addError && <p className="text-sm text-red-600">{addError}</p>}
                {addSuccess && <p className="text-sm text-emerald-600">Elder account created!</p>}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={adding}
                    className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    {adding ? "Creating…" : "Create Elder Account"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setAddError(null);
                      setElderForm({ name: "", email: "", password: "" });
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Linked Elder
                  </label>
                  <p className="text-lg font-medium text-slate-900">{elder.name}</p>
                  <p className="text-sm text-slate-500">{elder.email}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Link Another Elder
                  </button>
                </div>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddElder} className="mt-6 space-y-4 max-w-md border-t border-slate-200 pt-6">
                  <h3 className="text-base font-semibold text-slate-900">Link Another Elder</h3>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Full name</label>
                    <input
                      type="text"
                      value={elderForm.name}
                      onChange={(e) => setElderForm({ ...elderForm, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      value={elderForm.email}
                      onChange={(e) => setElderForm({ ...elderForm, email: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Password (min 6 characters)</label>
                    <input
                      type="password"
                      value={elderForm.password}
                      onChange={(e) => setElderForm({ ...elderForm, password: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      required
                      minLength={6}
                    />
                  </div>

                  {addError && <p className="text-sm text-red-600">{addError}</p>}
                  {addSuccess && <p className="text-sm text-emerald-600">Elder account linked!</p>}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={adding}
                      className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50"
                    >
                      {adding ? "Linking…" : "Link Elder Account"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setAddError(null);
                        setElderForm({ name: "", email: "", password: "" });
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Elder Login Info</h2>
              <p className="text-sm text-slate-600 mb-4">
                Share these credentials with the elder so they can sign in from the home page.
              </p>
              <div className="space-y-3">
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</span>
                  <p className="text-sm text-slate-900 font-mono">{elder.email}</p>
                </div>
              </div>

              <form onSubmit={handleResetPassword} className="mt-6 space-y-4 max-w-md border-t border-slate-200 pt-6">
                <h3 className="text-base font-semibold text-slate-900">Reset Password</h3>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">New Password (min 6 characters)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    required
                    minLength={6}
                  />
                </div>
                {resetError && <p className="text-sm text-red-600">{resetError}</p>}
                {resetSuccess && <p className="text-sm text-emerald-600">Password reset successfully!</p>}
                <button
                  type="submit"
                  disabled={resetting}
                  className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {resetting ? "Resetting…" : "Reset Password"}
                </button>
              </form>
            </div>

            <div className="grid gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Weekly Report</h2>
                <WeeklyReport elderId={elder.id} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">SOS Alerts</h2>
                <SosAlertsPanel elderId={elder.id} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Medicine Schedule</h2>
                <MedicineManager elderId={elder.id} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Voice Messages</h2>
                <VoiceMessageRecorder elderId={elder.id} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
