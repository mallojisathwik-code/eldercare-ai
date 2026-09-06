import { useState } from "react";
import { apiClient } from "../../api.js";
import { AlertTriangle } from "lucide-react";

/**
 * High-contrast SOS button for the elder's dashboard.
 * Requires a two-step confirmation to prevent accidental triggers.
 */
export default function SosButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [error, setError] = useState(null);

  const handleTrigger = async () => {
    setError(null);
    try {
      await apiClient.post("/sos");
      setTriggered(true);
      setTimeout(() => setTriggered(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  if (triggered) {
    return (
      <div className="w-full rounded-3xl bg-companion-alert/10 border-2 border-companion-alert p-6 shadow-lg text-center">
        <AlertTriangle size={48} className="text-companion-alert mx-auto mb-2" />
        <p className="text-lg font-semibold text-companion-alert">SOS Sent!</p>
        <p className="text-sm text-gray-600 mt-1">Your family has been notified.</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-companion-ink mb-4">Emergency</h2>

      {error && <p className="text-companion-alert text-sm mb-3">{error}</p>}

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full rounded-2xl bg-companion-alert px-6 py-5 text-white text-lg font-bold shadow-lg hover:bg-companion-alert/90 active:scale-95 transition transform"
          aria-label="Trigger SOS alert"
        >
          <AlertTriangle size={32} className="inline-block mr-2" />
          SOS
        </button>
      ) : (
        <div className="border-2 border-companion-alert rounded-2xl p-4 bg-companion-alert/5">
          <p className="text-sm font-medium text-companion-ink mb-3">
            Are you sure? This will send an alert to your family.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleTrigger}
              className="flex-1 rounded-xl bg-companion-alert px-4 py-3 text-white font-medium hover:bg-companion-alert/90 transition"
            >
              Yes, send alert
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
