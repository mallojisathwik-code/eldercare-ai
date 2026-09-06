import { useAuth } from "../hooks/useAuth.js";
import AICompanionCard from "../components/elder/AICompanionCard.jsx";
import MedicinesCard from "../components/elder/MedicinesCard.jsx";
import SosButton from "../components/elder/SosButton.jsx";
import MessagesFromFamily from "../components/elder/MessagesFromFamily.jsx";

export default function ElderDashboard({ navigate }) {
  const { user, logout } = useAuth();

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Elder Dashboard</h1>
          <p className="mt-2 text-base text-slate-600">Your voice companion and wellness tools</p>
        </div>

        <div className="grid gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">AI Companion</h2>
            <AICompanionCard />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Medicines</h2>
            <MedicinesCard />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Emergency</h2>
            <SosButton />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Messages from Family</h2>
            <MessagesFromFamily />
          </div>
        </div>
      </main>
    </div>
  );
}
