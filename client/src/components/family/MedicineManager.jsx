import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import { apiClient } from "../../api.js";

export default function MedicineManager({ elderId }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", dosage: "", times: "" });

  const fetchMedicines = () => {
    setLoading(true);
    apiClient
      .get(`/medicine/${elderId}`)
      .then((res) => setMedicines(res.data || []))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (elderId) fetchMedicines();
  }, [elderId]);

  const resetForm = () => {
    setForm({ name: "", dosage: "", times: "" });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const times = form.times
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (times.length === 0) {
      setError("Please enter at least one time (HH:mm).");
      return;
    }

    try {
      if (editing) {
        await apiClient.put(`/medicine/${elderId}/${editing._id}`, {
          name: form.name,
          dosage: form.dosage,
          times,
        });
      } else {
        await apiClient.post(`/medicine/${elderId}`, {
          name: form.name,
          dosage: form.dosage,
          times,
        });
      }
      resetForm();
      fetchMedicines();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleEdit = (med) => {
    setEditing(med);
    setForm({
      name: med.name,
      dosage: med.dosage,
      times: med.times.join(", "),
    });
    setShowForm(true);
  };

  const handleDelete = async (med) => {
    if (!confirm(`Remove "${med.name}" from the schedule?`)) return;
    try {
      await apiClient.delete(`/medicine/${elderId}/${med._id}`);
      fetchMedicines();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const sorted = [...medicines].sort((a, b) =>
    (a.times?.[0] || "").localeCompare(b.times?.[0] || "")
  );

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-companion-ink">Medicine Schedule</h2>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-companion-accent px-4 py-2 text-sm text-white hover:bg-companion-accent/90 transition"
        >
          Add Medicine
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-companion-ink">
              {editing ? "Edit Medicine" : "Add Medicine"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <input
            type="text"
            placeholder="Medicine name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-companion-calm"
            required
          />

          <input
            type="text"
            placeholder="Dosage (e.g. 1 tablet)"
            value={form.dosage}
            onChange={(e) => setForm({ ...form, dosage: e.target.value })}
            className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-companion-calm"
            required
          />

          <input
            type="text"
            placeholder="Times, comma-separated (e.g. 08:00, 20:00)"
            value={form.times}
            onChange={(e) => setForm({ ...form, times: e.target.value })}
            className="w-full rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-companion-calm"
            required
          />

          <button
            type="submit"
            className="rounded-xl bg-companion-calm px-4 py-2 text-sm text-white hover:bg-companion-calm/90 transition"
          >
            {editing ? "Update" : "Add"}
          </button>
        </form>
      )}

      {error && <p className="text-companion-alert text-sm mb-2">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : sorted.length === 0 ? (
        <p className="text-gray-500">No medicines scheduled yet.</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((med) => (
            <li
              key={med._id}
              className="border border-gray-200 rounded-xl p-3 flex items-center justify-between"
            >
              <div>
                <span className="font-medium text-companion-ink">{med.name}</span>
                <span className="text-sm text-gray-600"> — {med.dosage}</span>
                <div className="text-xs text-gray-500 mt-1">
                  {med.times.join(", ")}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(med)}
                  className="text-companion-accent hover:text-companion-accent/80"
                  aria-label={`Edit ${med.name}`}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(med)}
                  className="text-companion-alert hover:text-companion-alert/80"
                  aria-label={`Delete ${med.name}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
