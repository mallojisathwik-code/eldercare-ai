import { useConversation } from "../../hooks/useConversation.js";
import VoiceControls from "../voice/VoiceControls.jsx";

export default function AICompanionCard() {
  const { state, transcript, reply, error, startRecording, stopRecording, interrupt } =
    useConversation();

  return (
    <div className="bg-white rounded-3xl shadow-md p-8 max-w-md mx-auto flex flex-col items-center gap-6">
      <h2 className="text-xl font-semibold text-companion-ink">Your Companion</h2>

      <VoiceControls
        state={state}
        onStart={startRecording}
        onStop={stopRecording}
        onInterrupt={interrupt}
      />

      {error && <p className="text-companion-alert text-base">{error}</p>}

      {transcript && (
        <div className="w-full bg-companion-bg rounded-xl p-4">
          <p className="text-sm text-companion-ink/60 mb-1">You said</p>
          <p className="text-base">{transcript}</p>
        </div>
      )}

      {reply && (
        <div className="w-full bg-companion-calm/10 rounded-xl p-4">
          <p className="text-sm text-companion-ink/60 mb-1">Companion says</p>
          <p className="text-base">{reply}</p>
        </div>
      )}
    </div>
  );
}
