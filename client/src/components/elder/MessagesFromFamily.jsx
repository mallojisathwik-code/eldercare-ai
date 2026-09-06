import { useEffect, useState, useRef, useCallback } from "react";
import { apiClient } from "../../api.js";

/**
 * Elder-facing inbox of voice messages from family.
 * Each message has a play button; once played it's marked via PUT.
 * Elder can tap Reply to send a voice message back to the sender.
 */
export default function MessagesFromFamily() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [recording, setRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const fetchMessages = () => {
    setLoading(true);
    apiClient
      .get("/messages")
      .then((res) => setMessages(res.data || []))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handlePlay = async (msg) => {
    if (playingId === msg._id && audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }

    setPlayingId(msg._id);
    const audio = new Audio(`data:${msg.audioContentType};base64,${msg.audioBase64}`);
    audioRef.current = audio;

    audio.onended = () => {
      setPlayingId(null);
      audioRef.current = null;
      markPlayed(msg._id);
    };

    audio.onerror = () => {
      setPlayingId(null);
      audioRef.current = null;
      setError("Failed to play audio.");
    };

    try {
      await audio.play();
    } catch (err) {
      setError("Playback failed. Please try again.");
      setPlayingId(null);
      audioRef.current = null;
    }
  };

  const markPlayed = async (id) => {
    try {
      await apiClient.put(`/messages/${id}/played`);
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, playedAt: new Date().toISOString() } : m))
      );
    } catch {
      // best-effort
    }
  };

  const startReplyRecording = useCallback(async () => {
    setError(null);
    setReplySuccess(false);
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

  const stopReplyRecording = useCallback(async () => {
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
      const targetMsg = messages.find((m) => m._id === replyingTo);
      if (!targetMsg) {
        setError("Message not found.");
        return;
      }

      await apiClient.post("/messages", {
        toUserId: targetMsg.fromUserId,
        audio: base64,
        contentType: blob.type || "audio/webm",
        transcript: "",
      });

      setReplySuccess(true);
      setReplyingTo(null);
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reply.");
    } finally {
      setSending(false);
    }
  }, [replyingTo, messages]);

  if (loading) {
    return (
      <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-companion-ink mb-4">Messages from family</h2>
        <p className="text-gray-500">Loading messages…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-companion-ink mb-4">Messages from family</h2>
        <p className="text-companion-alert">{error}</p>
      </div>
    );
  }

  const unplayed = messages.filter((m) => !m.playedAt);
  const played = messages.filter((m) => m.playedAt);

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-companion-ink mb-4">Messages from family</h2>

      {messages.length === 0 ? (
        <p className="text-gray-500">No messages yet. Your family can send you voice notes.</p>
      ) : (
        <div className="space-y-6">
          {unplayed.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-companion-accent mb-3 uppercase tracking-wide">
                New ({unplayed.length})
              </h3>
              <ul className="space-y-3">
                {unplayed.map((msg) => (
                  <MessageItem
                    key={msg._id}
                    msg={msg}
                    playingId={playingId}
                    replyingTo={replyingTo}
                    recording={recording}
                    sending={sending}
                    replySuccess={replySuccess}
                    onPlay={() => handlePlay(msg)}
                    onReplyStart={() => setReplyingTo(msg._id)}
                    onReplyStop={stopReplyRecording}
                    onReplyCancel={() => {
                      setReplyingTo(null);
                      setRecording(false);
                      mediaRecorderRef.current?.stream?.getTracks()?.forEach((t) => t.stop());
                    }}
                    onStartRecording={startReplyRecording}
                  />
                ))}
              </ul>
            </div>
          )}

          {played.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                Played ({played.length})
              </h3>
              <ul className="space-y-2">
                {played.map((msg) => (
                  <MessageItem
                    key={msg._id}
                    msg={msg}
                    playingId={playingId}
                    replyingTo={replyingTo}
                    recording={recording}
                    sending={sending}
                    replySuccess={replySuccess}
                    onPlay={() => handlePlay(msg)}
                    onReplyStart={() => setReplyingTo(msg._id)}
                    onReplyStop={stopReplyRecording}
                    onReplyCancel={() => {
                      setReplyingTo(null);
                      setRecording(false);
                      mediaRecorderRef.current?.stream?.getTracks()?.forEach((t) => t.stop());
                    }}
                    onStartRecording={startReplyRecording}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MessageItem({
  msg,
  playingId,
  replyingTo,
  recording,
  sending,
  replySuccess,
  onPlay,
  onReplyStart,
  onReplyStop,
  onReplyCancel,
  onStartRecording,
}) {
  const isReplying = replyingTo === msg._id;

  return (
    <li className="border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onPlay}
          className="w-12 h-12 rounded-full bg-companion-accent text-white flex items-center justify-center hover:bg-companion-accent/90 active:scale-95 transition transform"
          aria-label="Play message"
        >
          {playingId === msg._id ? (
            <span className="text-xs font-bold">Stop</span>
          ) : (
            <span className="text-xl leading-none">▶</span>
          )}
        </button>
        <div className="text-sm text-gray-600 flex-1">
          {msg.transcript ? (
            <p className="text-companion-ink">"{msg.transcript}"</p>
          ) : (
            <p>Voice message</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {new Date(msg.createdAt).toLocaleString()}
          </p>
        </div>

        {!isReplying ? (
          <button
            onClick={onReplyStart}
            disabled={playingId === msg._id}
            className="rounded-xl border border-companion-accent px-3 py-2 text-sm text-companion-accent hover:bg-companion-accent/5 transition disabled:opacity-50"
            aria-label="Reply to message"
          >
            Reply
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {!recording ? (
              <button
                onClick={onStartRecording}
                disabled={sending}
                className="w-10 h-10 rounded-full bg-companion-alert text-white flex items-center justify-center hover:bg-companion-alert/90 active:scale-95 transition transform disabled:opacity-70"
                aria-label="Start reply recording"
              >
                {sending ? <span className="text-xs">...</span> : <span className="text-sm">🎤</span>}
              </button>
            ) : (
              <button
                onClick={onReplyStop}
                className="w-10 h-10 rounded-full bg-companion-alert text-white flex items-center justify-center hover:bg-companion-alert/90 active:scale-95 transition transform animate-pulse"
                aria-label="Stop reply recording"
              >
                <span className="text-sm">⏹</span>
              </button>
            )}
            <button
              onClick={onReplyCancel}
              className="text-xs text-gray-500 hover:text-gray-700"
              aria-label="Cancel reply"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {isReplying && replySuccess && (
        <p className="text-companion-calm text-xs mt-2 ml-15">Reply sent!</p>
      )}
      {isReplying && recording && (
        <p className="text-companion-alert text-xs mt-2 ml-15">Recording... tap ⏹ to stop</p>
      )}
      {isReplying && sending && (
        <p className="text-gray-500 text-xs mt-2 ml-15">Sending...</p>
      )}
    </li>
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
