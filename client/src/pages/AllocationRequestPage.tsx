import React, { useState } from "react";
import { useAllocations } from "../hooks/useAllocations";
import type { AllocationInsert, AllocationRequest } from "../lib/supabase";
import { CROP_OPTIONS, UNIT_OPTIONS, GRADE_OPTIONS } from "../constants/cropOptions";

// ─── Status badge helpers ───────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: "#FEF3C7", text: "#92400E", label: "Pending" },
  reviewing: { bg: "#DBEAFE", text: "#1E40AF", label: "Reviewing" },
  allocated: { bg: "#D1FAE5", text: "#065F46", label: "Allocated" },
  dispatched:{ bg: "#E0E7FF", text: "#3730A3", label: "Dispatched" },
  completed: { bg: "#D1FAE5", text: "#065F46", label: "Completed" },
  cancelled: { bg: "#FEE2E2", text: "#991B1B", label: "Cancelled" },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
};

// ─── New Request Modal ──────────────────────────────────────────────────────

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AllocationInsert) => Promise<void>;
}

const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AllocationInsert>({
    crop: "",
    quantity: 0,
    location: "",
    unit: "kg",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCustomCrop, setUseCustomCrop] = useState(false);
  const [customCrop, setCustomCrop] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const resolvedCrop =
        useCustomCrop || formData.crop === "Other" ? customCrop : formData.crop;
      await onSubmit({ ...formData, crop: resolvedCrop });
      onClose();
      setFormData({ crop: "", quantity: 0, location: "", unit: "kg" });
      setUseCustomCrop(false);
      setCustomCrop("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: "#25671E" }}>
            New Allocation Request
          </h2>

          {error && (
            <div
              className="mb-4 rounded-lg p-3 text-sm"
              style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Crop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crop *
              </label>
              {useCustomCrop ? (
                <div className="flex gap-2">
                  <input
                    required
                    value={customCrop}
                    onChange={(e) => setCustomCrop(e.target.value)}
                    placeholder="Enter crop name"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "#E5E7EB", "--tw-ring-color": "#48A111" } as React.CSSProperties}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomCrop(false);
                      setCustomCrop("");
                      setFormData((p) => ({ ...p, crop: "" }));
                    }}
                    className="px-3 py-2 text-xs font-medium rounded-lg border transition-colors hover:bg-gray-50"
                    style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
                  >
                    Use List
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    required
                    value={formData.crop}
                    onChange={(e) => {
                      if (e.target.value === "Other") {
                        setUseCustomCrop(true);
                        setFormData((p) => ({ ...p, crop: "Other" }));
                      } else {
                        setFormData((p) => ({ ...p, crop: e.target.value }));
                      }
                    }}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "#E5E7EB", "--tw-ring-color": "#48A111" } as React.CSSProperties}
                  >
                    <option value="">Select crop</option>
                    {CROP_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setUseCustomCrop(true)}
                    className="px-3 py-2 text-xs font-medium rounded-lg text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#48A111" }}
                    title="Manually enter crop/fruit name"
                  >
                    ✏️ Custom
                  </button>
                </div>
              )}
            </div>

            {/* Variety */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variety
              </label>
              <input
                value={formData.variety ?? ""}
                onChange={(e) => setFormData((p) => ({ ...p, variety: e.target.value }))}
                placeholder="e.g. Roma"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "#E5E7EB", "--tw-ring-color": "#48A111" } as React.CSSProperties}
              />
            </div>

            {/* Quantity + Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={formData.quantity || ""}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, quantity: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: "#E5E7EB", "--tw-ring-color": "#48A111" } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  value={formData.unit ?? "kg"}
                  onChange={(e) => setFormData((p) => ({ ...p, unit: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: "#E5E7EB", "--tw-ring-color": "#48A111" } as React.CSSProperties}
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              <select
                value={(formData as any).grade ?? ""}
                onChange={(e) => setFormData((p) => ({ ...p, grade: e.target.value } as any))}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "#E5E7EB", "--tw-ring-color": "#48A111" } as React.CSSProperties}
              >
                <option value="">Select grade (optional)</option>
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Location *
              </label>
              <input
                required
                value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                placeholder="e.g. Mumbai, Maharashtra"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "#E5E7EB", "--tw-ring-color": "#48A111" } as React.CSSProperties}
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <input
                type="date"
                value={formData.deadline ?? ""}
                onChange={(e) => setFormData((p) => ({ ...p, deadline: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "#E5E7EB", "--tw-ring-color": "#48A111" } as React.CSSProperties}
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Offered Price (₹ per unit)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    price: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "#E5E7EB", "--tw-ring-color": "#48A111" } as React.CSSProperties}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes ?? ""}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Any special requirements..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 resize-none"
                style={{ borderColor: "#E5E7EB", "--tw-ring-color": "#48A111" } as React.CSSProperties}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50"
                style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg text-white transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "#48A111" }}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Allocation Request Page ────────────────────────────────────────────────

export const AllocationRequestPage: React.FC = () => {
  const { allocations, isLoading, error, createRequest } = useAllocations();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = async (data: AllocationInsert) => {
    const { error: createErr } = await createRequest(data);
    if (createErr) throw new Error(createErr);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#48A111", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl p-6 border text-sm"
        style={{ backgroundColor: "#FEF2F2", borderColor: "#DC2626", color: "#DC2626" }}
      >
        Failed to load allocations: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#25671E" }}>
            My Allocation Requests
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {allocations.length} request{allocations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#48A111" }}
        >
          + New Request
        </button>
      </div>

      {/* Table */}
      {allocations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <span className="text-4xl mb-3 block">📦</span>
          <p className="text-gray-500 text-sm">
            No allocation requests yet. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ backgroundColor: "#F9FAFB" }}>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Request ID
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Crop
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Quantity
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Location
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Deadline
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((a: AllocationRequest) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{a.request_id}</td>
                    <td className="px-4 py-3">
                      {a.crop}
                      {a.variety && (
                        <span className="text-gray-400 ml-1">({a.variety})</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {a.quantity} {a.unit}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.location}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {a.deadline
                        ? new Date(a.deadline).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(a.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <RequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
