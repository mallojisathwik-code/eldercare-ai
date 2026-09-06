import { useCallback, useRef, useState } from "react";
import { Mic, Square, Loader2, Send } from "lucide-react";
import { apiClient } from "../../api.js";

export default function VoiceMessageRecorder({ elderId, onSent }) {
  const [recording, setRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = useCallback(async () => {
    setError(null);
    setSuccess(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      setRecording(true);
    } catch (err) {
      setError("Microphone access failed. Please check permissions.");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") return;
    setRecording(false);

    const blob = await new Promise((resolve) => {
      mediaRecorderRef.current.onstop = () => {
        mediaRecorderRef.current?.stream?.getTracks()?.forEach((t) => t.stop());
        resolve(new Blob(chunksRef.current, { type: "audio/webm" }));
      };
      mediaRecorderRef.current.stop();
    });

    setSending(true);
    try {
      const base64 = await blobToBase64(blob);
      await apiClient.post(`/messages/${elderId}`, {
        toUserId: elderId,
        audio: base64,
        contentType: blob.type || "audio/webm",
      });
      setSuccess(true);
      onSent?.();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send message.");
    } finally {
      setSending(false);
    }
  }, [elderId, onSent]);

  if (!elderId) {
    return null;
  }

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-companion-ink mb-4">Send a voice message</h2>

      {error && <p className="text-companion-alert text-sm mb-3">{error}</p>}
      {success && (
        <p className="text-companion-calm text-sm mb-3">Message sent!</p>
      )}

      <div className="flex items-center gap-4">
        {!recording ? (
          <button
            onClick={startRecording}
            disabled={sending}
            className="w-16 h-16 rounded-full bg-companion-accent text-white flex items-center justify-center shadow-lg hover:bg-companion-accent/90 active:scale-95 transition transform disabled:opacity-70"
            aria-label="Start recording"
          >
            {sending ? <Loader2 size={28} className="animate-spin" /> : <Mic size={28} />}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-companion-alert text-white flex items-center justify-center shadow-lg hover:bg-companion-alert/90 active:scale-95 transition transform animate-pulse"
            aria-label="Stop recording"
          >
            <Square size={28} />
          </button>
        )}

        <span className="text-sm text-gray-600">
          {recording
            ? "Recording... tap to stop"
            : sending
              ? "Sending..."
              : "Tap to record a message"}
        </span>
      </div>
    </div>
  );
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
