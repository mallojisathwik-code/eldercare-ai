/**
 * Thin wrapper around the Web Speech Synthesis API. Kept isolated behind
 * this one function so swapping in a cloud TTS provider later only means
 * changing this file.
 */
export function speakText(text, { onEnd } = {}) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95; // slightly slower — easier to follow for elderly listeners
  utterance.pitch = 1;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
  return utterance;
}

/** Immediately stops any in-progress speech. Critical for the interrupt fix. */
export function stopSpeaking() {
  window.speechSynthesis.cancel();
}
