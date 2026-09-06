import { Mic, Square, Loader2, Volume2 } from "lucide-react";

const STATE_CONFIG = {
  idle: { label: "Press to talk", icon: Mic, className: "bg-companion-accent" },
  recording: { label: "Listening… press to stop", icon: Square, className: "bg-companion-alert animate-pulse" },
  transcribing: { label: "Understanding…", icon: Loader2, className: "bg-companion-calm" },
  thinking: { label: "Thinking…", icon: Loader2, className: "bg-companion-calm" },
  speaking: { label: "Speaking… press to interrupt", icon: Volume2, className: "bg-companion-calm" },
};

export default function VoiceControls({ state, onStart, onStop, onInterrupt }) {
  const config = STATE_CONFIG[state] ?? STATE_CONFIG.idle;
  const Icon = config.icon;
  const isBusy = state === "transcribing" || state === "thinking";

  function handlePress() {
    if (state === "idle") onStart();
    else if (state === "recording") onStop();
    else if (state === "speaking") onInterrupt();
    // transcribing/thinking: ignore taps, nothing useful to interrupt mid-flight yet
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handlePress}
        disabled={isBusy}
        aria-label={config.label}
        className={`${config.className} w-28 h-28 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 disabled:opacity-70`}
      >
        <Icon size={40} className={isBusy ? "animate-spin" : ""} />
      </button>
      <p className="text-lg font-medium">{config.label}</p>
    </div>
  );
}
