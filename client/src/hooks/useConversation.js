import { useState, useRef, useCallback } from "react";
import axios from "axios";
import { apiClient } from "../api.js";
import { useAudioRecorder } from "./useAudioRecorder.js";
import { speakText, stopSpeaking } from "../utils/speakText.js";

/**
 * States: idle -> recording -> transcribing -> thinking -> speaking -> idle
 *
 * This is the exact mechanism that fixed the v1 feedback-loop bug (AI's
 * own voice getting re-recorded). See docs/ARCHITECTURE.md and
 * docs/KNOWN_ISSUES.md #4. The two load-bearing rules:
 *
 *   1. Recording can only be *started* from `idle`.
 *   2. Every turn gets a fresh sessionId; any async response whose
 *      sessionId doesn't match the CURRENT session is discarded.
 */
export function useConversation() {
  const [state, setState] = useState("idle"); // idle | recording | transcribing | thinking | speaking
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState(null);

  const recorder = useAudioRecorder();
  const sessionIdRef = useRef(null);
  const abortControllerRef = useRef(null);

  const isStale = (sessionId) => sessionId !== sessionIdRef.current;

  const startRecording = useCallback(async () => {
    if (state !== "idle") return; // rule #1 — the whole bug fix in one line

    const sessionId = crypto.randomUUID();
    sessionIdRef.current = sessionId;
    abortControllerRef.current = new AbortController();

    setError(null);
    setTranscript("");
    setReply("");

    try {
      await recorder.start();
      setState("recording");
    } catch (err) {
      setError("Microphone access failed. Please check permissions.");
      setState("idle");
    }
  }, [state, recorder]);

  const stopRecording = useCallback(async () => {
    if (state !== "recording") return;
    const sessionId = sessionIdRef.current;

    setState("transcribing");
    const blob = await recorder.stop();

    if (!blob) {
      // Too short / silent — treat as "didn't catch that" and go back to idle
      // rather than sending junk to the backend. See KNOWN_ISSUES.md #5.
      setState("idle");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("audio", blob, "voice.webm");
      formData.append("sessionId", sessionId);

      const res = await apiClient.post("/voice/transcribe", formData, {
        signal: abortControllerRef.current?.signal,
      });

      if (isStale(sessionId)) return; // interrupted mid-transcription

      if (res.status === 204 || !res.data?.transcript) {
        setState("idle");
        return;
      }

      setTranscript(res.data.transcript);
      setState("thinking");

      const chatRes = await apiClient.post(
        "/chat",
        { message: res.data.transcript, sessionId },
        { signal: abortControllerRef.current?.signal }
      );

      if (isStale(sessionId)) return; // interrupted mid-thinking

      setReply(chatRes.data.reply);
      setState("speaking");
      speakText(chatRes.data.reply, {
        onEnd: () => {
          if (!isStale(sessionId)) setState("idle");
        },
      });
    } catch (err) {
      if (axios.isCancel(err) || err.name === "CanceledError") return; // expected on interrupt
      const message = err.response?.data?.error || err.message || "Something went wrong. Please try again.";
      console.error("Voice transcription failed:", err.response?.data || err);
      alert(message);
      setError(message);
      setState("idle");
    }
  }, [state, recorder]);

  /** Called when the user interrupts (e.g. presses the button while AI is speaking). */
  const interrupt = useCallback(() => {
    sessionIdRef.current = null; // invalidates any in-flight responses immediately
    abortControllerRef.current?.abort();
    stopSpeaking();
    recorder.abort();
    setState("idle");
  }, [recorder]);

  return { state, transcript, reply, error, startRecording, stopRecording, interrupt };
}
