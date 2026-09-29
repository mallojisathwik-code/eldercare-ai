import React, { useEffect, useState, useRef } from "react";

export default function PrestigiousHealthIntro({ onComplete }) {
  const [phase, setPhase] = useState(1); // 1: Emblem draw, 2: Typography reveal, 3: Exit
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(2), 1600); // Reveal typography
    const t2 = setTimeout(() => setPhase(3), 4200); // Start smooth exit
    const t3 = setTimeout(() => {
      if (onCompleteRef.current) onCompleteRef.current();
    }, 4800); // Complete

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleSkip = () => {
    if (onCompleteRef.current) onCompleteRef.current();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between select-none py-8 px-6 transition-opacity duration-700 ${
        phase === 3 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(circle at 50% 40%, #ffffff 0%, #fbfbfc 60%, #f4f4f7 100%)",
      }}
    >
      {/* Top Header Row with Skip Button */}
      <div className="w-full max-w-5xl flex justify-end z-30">
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-full border border-slate-200 bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition backdrop-blur-md shadow-sm cursor-pointer"
        >
          Skip ➔
        </button>
      </div>

      {/* Main Prestigious Healthcare Emblem & Brand Reveal */}
      <div className="flex flex-col items-center justify-center flex-1 text-center -mt-8">
        
        {/* Animated Healthcare & Cognitive Pulse Emblem */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Subtle Ambient Glow */}
          <div
            className={`absolute h-36 w-36 rounded-full bg-rose-500/15 blur-3xl transition-opacity duration-1000 ${
              phase >= 2 ? "opacity-100 scale-125" : "opacity-40 scale-90"
            }`}
          />

          {/* SVG Bio-Shield & Heart Pulse Emblem */}
          <svg
            className="relative h-20 w-20 sm:h-24 sm:w-24 text-rose-600 drop-shadow-sm"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Protective Embrace Ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="280"
              strokeDashoffset={phase === 1 ? "140" : "0"}
              className="transition-all duration-1000 ease-out opacity-25"
            />
            
            {/* Inner Shield / Heart Contour */}
            <path
              d="M50 82C50 82 22 66 22 42C22 28 34 20 44 26C47 28 50 32 50 32C50 32 53 28 56 26C66 20 78 28 78 42C78 66 50 82 50 82Z"
              stroke="url(#roseGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="240"
              strokeDashoffset={phase === 1 ? "120" : "0"}
              className="transition-all duration-1000 ease-out"
            />

            {/* Live Vital Pulse Line through the Center */}
            <path
              d="M32 46H42L46 36L52 56L56 46H68"
              stroke="#e11d48"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="60"
              strokeDashoffset={phase >= 2 ? "0" : "60"}
              className="transition-all duration-700 ease-out delay-500"
            />

            <defs>
              <linearGradient id="roseGradient" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#e11d48" />
                <stop offset="1" stopColor="#be123c" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Clean, Prestigious Brand Typography */}
        <div className="overflow-hidden">
          <h1
            className={`font-sans font-black tracking-tight text-3xl sm:text-5xl lg:text-6xl text-slate-900 transition-all duration-1000 ease-out ${
              phase >= 2
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            ElderCare <span className="text-rose-600 font-extrabold">AI</span>
          </h1>
        </div>

        {/* Authoritative Subtitle */}
        <div className="overflow-hidden mt-3 max-w-md">
          <p
            className={`text-xs sm:text-sm font-medium tracking-wide text-slate-500 transition-all duration-1000 ease-out delay-200 ${
              phase >= 2
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            Autonomous Cognitive & Health Companion for Seniors
          </p>
        </div>

        {/* Clean Minimalist Progress Indicator */}
        <div className="mt-8 h-1 w-32 sm:w-40 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full bg-rose-600 transition-all duration-1000 ease-linear ${
              phase >= 2 ? "w-full" : "w-1/3"
            }`}
          />
        </div>
      </div>

      {/* Bottom Security / Privacy Badge */}
      <div className="relative z-20 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>HIPAA & Privacy Compliant</span>
        <span>·</span>
        <span>Voice-First Telemetry</span>
      </div>
    </div>
  );
}
