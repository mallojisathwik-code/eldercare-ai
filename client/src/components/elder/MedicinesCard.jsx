import { useEffect, useState } from "react";
import { apiClient } from "../../api.js";

/**
 * Read-only view of the elder's medicine schedule.
 * Medicines are managed by the family member via the FamilyDashboard.
 * Sorted by the first scheduled time of day.
 */
export default function MedicinesCard() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .get("/medicine")
      .then((res) => setMedicines(res.data || []))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  // Backend already sorts by time, but re-sort on the client for safety.
  const sorted = [...medicines].sort((a, b) =>
    (a.times?.[0] || "").localeCompare(b.times?.[0] || "")
  );

  if (loading) {
    return (
      <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-companion-ink mb-4">Today's Medicines</h2>
        <p className="text-gray-500">Loading medicines…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-companion-ink mb-4">Today's Medicines</h2>
        <p className="text-companion-alert">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-companion-ink mb-4">Today's Medicines</h2>

      {sorted.length === 0 ? (
        <p className="text-gray-500">No medicines scheduled.</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((med) => (
            <li
              key={med._id}
              className="border border-gray-200 rounded-xl p-4"
            >
              <div className="font-medium text-lg text-companion-ink">{med.name}</div>
              <div className="text-sm text-gray-600 mt-1">Dosage: {med.dosage}</div>
              <div className="text-sm text-gray-600 mt-1">
                Times: {med.times.join(", ")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
