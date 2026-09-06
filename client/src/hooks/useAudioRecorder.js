import { useRef, useCallback } from "react";

// Below this duration, don't even bother sending to the backend — this is
// the frontend half of the fix for junk transcripts on silent recordings.
// See docs/KNOWN_ISSUES.md #5.
const MIN_RECORDING_MS = 600;

/**
 * Wraps the browser MediaRecorder API. Returns a blob only if the
 * recording looks like it contains real speech (duration-based check for
 * v1 — volume-threshold analysis is a documented future improvement).
 */
export function useAudioRecorder() {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const startTimeRef = useRef(0);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    chunksRef.current = [];

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.start();
    startTimeRef.current = Date.now();
  }, []);

  /** Resolves to a Blob, or null if the recording was too short to be real speech. */
  const stop = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) return resolve(null);

      recorder.onstop = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        const duration = Date.now() - startTimeRef.current;

        if (duration < MIN_RECORDING_MS || chunksRef.current.length === 0) {
          resolve(null);
          return;
        }

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        resolve(blob);
      };
      recorder.stop();
    });
  }, []);

  /** Hard stop with no resolution — used on interrupt. */
  const abort = useCallback(() => {
    try {
      mediaRecorderRef.current?.stop();
    } catch {
      // recorder may already be inactive — safe to ignore
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  return { start, stop, abort };
}
