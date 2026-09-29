import React from "react";

export default function HealthBrandHeader() {
  return (
    <div className="flex flex-col items-center text-center select-none mb-6">
      {/* Bio-Shield & Vital Pulse Emblem */}
      <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 shadow-sm shadow-rose-100">
        <svg
          className="h-8 w-8 text-rose-600"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 82C50 82 22 66 22 42C22 28 34 20 44 26C47 28 50 32 50 32C50 32 53 28 56 26C66 20 78 28 78 42C78 66 50 82 50 82Z"
            stroke="#e11d48"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M32 46H42L46 36L52 56L56 46H68"
            stroke="#be123c"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Lockup */}
      <div className="flex items-center gap-1.5">
        <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          ELDER<span className="text-rose-600 font-extrabold">CARE</span>
        </span>
        <span className="rounded-lg bg-rose-600 px-2 py-0.5 text-sm sm:text-base font-black text-white shadow-sm shadow-rose-600/30">
          AI
        </span>
      </div>

      {/* Subtitle */}
      <p className="mt-1 text-xs text-slate-500 font-medium tracking-wide">
        Autonomous Cognitive & Health Companion for Seniors
      </p>
    </div>
  );
}
