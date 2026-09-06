import { useEffect, useState } from "react";
import { apiClient } from "../../api.js";

export default function SosAlertsPanel({ elderId }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = () => {
    setLoading(true);
    apiClient
      .get(`/sos/${elderId}`)
      .then((res) => setAlerts(res.data || []))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (elderId) fetchAlerts();
  }, [elderId]);

  const unresolved = alerts.filter((a) => !a.resolved);
  const resolved = alerts.filter((a) => a.resolved);

  const handleResolve = async (alertId) => {
    try {
      await apiClient.put(`/sos/${elderId}/${alertId}/resolve`);
      fetchAlerts();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  if (loading) {
    return (
      <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-companion-ink mb-4">SOS Alerts</h2>
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-companion-ink mb-4">SOS Alerts</h2>
        <p className="text-companion-alert">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-companion-ink mb-4">SOS Alerts</h2>

      {unresolved.length === 0 && resolved.length === 0 ? (
        <p className="text-gray-500">No SOS alerts yet.</p>
      ) : (
        <>
          {unresolved.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-companion-alert mb-3 uppercase tracking-wide">
                Unresolved ({unresolved.length})
              </h3>
              <ul className="space-y-3">
                {unresolved.map((alert) => (
                  <li
                    key={alert._id}
                    className="border-2 border-companion-alert rounded-xl p-4 bg-companion-alert/5 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-companion-ink">
                        SOS triggered{" "}
                        {alert.triggeredAt
                          ? new Date(alert.triggeredAt).toLocaleString()
                          : ""}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {alert._id}
                      </p>
                    </div>
                    <button
                      onClick={() => handleResolve(alert._id)}
                      className="rounded-xl bg-companion-calm px-4 py-2 text-sm text-white hover:bg-companion-calm/90 transition"
                    >
                      Mark resolved
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resolved.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                Resolved ({resolved.length})
              </h3>
              <ul className="space-y-2">
                {resolved.map((alert) => (
                  <li
                    key={alert._id}
                    className="border border-gray-200 rounded-xl p-3 bg-gray-50"
                  >
                    <p className="text-sm text-gray-600">
                      Resolved{" "}
                      {alert.resolvedAt
                        ? new Date(alert.resolvedAt).toLocaleString()
                        : ""}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Triggered{" "}
                      {alert.triggeredAt
                        ? new Date(alert.triggeredAt).toLocaleString()
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
