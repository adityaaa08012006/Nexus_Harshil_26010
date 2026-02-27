import React, { useState } from "react";
import { useAllocations } from "../hooks/useAllocations";
import { useInventory } from "../hooks/useInventory";
import { useAuthContext } from "../context/AuthContext";
import type { AllocationRequest, Batch } from "../lib/supabase";

// ─── Status badge ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending:    { bg: "#FEF3C7", text: "#92400E", label: "Pending" },
  reviewing:  { bg: "#DBEAFE", text: "#1E40AF", label: "Reviewing" },
  allocated:  { bg: "#D1FAE5", text: "#065F46", label: "Allocated" },
  dispatched: { bg: "#E0E7FF", text: "#3730A3", label: "Dispatched" },
  completed:  { bg: "#D1FAE5", text: "#065F46", label: "Completed" },
  cancelled:  { bg: "#FEE2E2", text: "#991B1B", label: "Cancelled" },
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

// ─── Approve Dialog ─────────────────────────────────────────────────────────

interface AiFarmer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  location: string;
  growing_crop: string | null;
  crop_variety: string | null;
  expected_quantity: number | null;
}

interface ApproveDialogProps {
  isOpen: boolean;
  request: AllocationRequest | null;
  batches: Batch[];
  onConfirm: (batchId: string) => Promise<void>;
  onCancel: () => void;
}

const ApproveDialog: React.FC<ApproveDialogProps> = ({
  isOpen,
  request,
  batches,
  onConfirm,
  onCancel,
}) => {
  const { session } = useAuthContext();
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Gemini suggestion state ──────────────────────────────────────────────
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiFarmers, setAiFarmers] = useState<AiFarmer[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  // Filter matching batches: same crop, active, enough quantity
  const matching = batches.filter(
    (b) =>
      b.status === "active" &&
      b.crop.toLowerCase() === request.crop.toLowerCase() &&
      b.quantity >= request.quantity,
  );

  const handleConfirm = async () => {
    if (!selectedBatch) {
      setError("Please select a batch to allocate from.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm(selectedBatch);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetSuggestion = async () => {
    if (!request) return;
    setAiLoading(true);
    setAiSuggestion(null);
    setAiFarmers([]);
    setAiError(null);
    try {
      const params = new URLSearchParams({
        crop: request.crop,
        quantity: String(request.quantity),
        unit: request.unit,
      });
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      const res = await fetch(
        `http://localhost:5000/api/allocation/suggest-farmers?${params}`,
        { headers },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setAiSuggestion(data.suggestion);
      setAiFarmers(data.farmers ?? []);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to get suggestion");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-bold text-gray-900 mb-1">
          Approve Allocation
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Request <span className="font-mono">{request.request_id}</span> —{" "}
          {request.quantity} {request.unit} of {request.crop}
          {request.variety ? ` (${request.variety})` : ""}
        </p>

        {error && (
          <div
            className="mb-3 rounded-lg p-3 text-sm"
            style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
          >
            {error}
          </div>
        )}

        {matching.length === 0 ? (
          <div className="space-y-4">
            {/* No stock notice */}
            <div className="rounded-lg p-4 bg-amber-50 border border-amber-200 text-sm text-amber-800">
              <p className="font-medium mb-1">No matching stock available</p>
              <p className="text-amber-700">
                No active batch has sufficient {request.crop} to fulfil this
                order ({request.quantity} {request.unit}).
              </p>
            </div>

            {/* AI Suggestion trigger */}
            {!aiSuggestion && !aiLoading && (
              <button
                onClick={handleGetSuggestion}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed text-sm font-medium transition-all hover:bg-green-50"
                style={{ borderColor: "#48A111", color: "#25671E" }}
              >
                <span>✨</span>
                AI Sourcing Suggestion — find farmers who can supply
              </button>
            )}

            {aiLoading && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
                <div
                  className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: "#48A111", borderTopColor: "transparent" }}
                />
                Asking AI for sourcing options…
              </div>
            )}

            {aiError && (
              <div className="rounded-lg p-3 text-sm bg-red-50 text-red-700 border border-red-200">
                {aiError}
              </div>
            )}

            {aiSuggestion && (
              <div className="rounded-lg border border-green-200 overflow-hidden">
                {/* Header */}
                <div
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold"
                  style={{ backgroundColor: "#F0FDF4", color: "#25671E" }}
                >
                  <span>✨</span>
                  AI Sourcing Suggestion
                </div>

                {/* Suggestion text */}
                <div className="px-4 py-3 text-sm text-gray-700 leading-relaxed border-b border-green-100">
                  {aiSuggestion}
                </div>

                {/* Farmer list */}
                {aiFarmers.length > 0 && (
                  <div className="px-4 py-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Matching Registered Farmers
                    </p>
                    {aiFarmers.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                      >
                        {/* Avatar */}
                        <div
                          className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: "#48A111" }}
                        >
                          {f.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {f.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {f.location}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-1">
                            {f.phone && (
                              <a
                                href={`tel:${f.phone}`}
                                className="text-xs hover:underline"
                                style={{ color: "#48A111" }}
                              >
                                📞 {f.phone}
                              </a>
                            )}
                            {f.expected_quantity && (
                              <span className="text-xs text-gray-500">
                                ~{f.expected_quantity} kg available
                              </span>
                            )}
                            {f.crop_variety && (
                              <span className="text-xs text-gray-400">
                                Variety: {f.crop_variety}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Refresh */}
                <div className="px-4 py-2 border-t border-green-100">
                  <button
                    onClick={handleGetSuggestion}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ↺ Refresh suggestion
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
            {matching.map((b) => (
              <label
                key={b.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedBatch === b.id
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="batch"
                  value={b.id}
                  checked={selectedBatch === b.id}
                  onChange={() => setSelectedBatch(b.id)}
                  className="accent-[#48A111]"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {b.batch_id} — {b.crop}
                    {b.variety ? ` (${b.variety})` : ""}
                  </div>
                  <div className="text-xs text-gray-500">
                    Zone {b.zone} · {b.quantity} {b.unit} available · Risk{" "}
                    {b.risk_score}%
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50"
            style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting || matching.length === 0}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "#48A111" }}
          >
            {submitting ? "Approving..." : "Approve & Deduct"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Reject Dialog ──────────────────────────────────────────────────────────

interface RejectDialogProps {
  isOpen: boolean;
  request: AllocationRequest | null;
  onConfirm: (reason: string) => Promise<void>;
  onCancel: () => void;
}

const RejectDialog: React.FC<RejectDialogProps> = ({
  isOpen,
  request,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(reason);
    } finally {
      setSubmitting(false);
      setReason("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-base font-bold text-gray-900 mb-1">
          Reject Request
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Reject <span className="font-mono">{request.request_id}</span>?
        </p>

        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 resize-none mb-4"
          style={{ borderColor: "#E5E7EB", "--tw-ring-color": "#DC2626" } as React.CSSProperties}
        />

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50"
            style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg text-white transition-opacity disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: "#DC2626" }}
          >
            {submitting ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Allocation Management Page (Manager / Owner) ───────────────────────────

export const AllocationManagePage: React.FC = () => {
  const {
    allocations,
    isLoading: allocLoading,
    error: allocError,
    approveRequest,
    rejectRequest,
  } = useAllocations();
  const { batches, isLoading: invLoading } = useInventory();

  const [approveTarget, setApproveTarget] = useState<AllocationRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AllocationRequest | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const isLoading = allocLoading || invLoading;

  const filtered =
    filter === "all"
      ? allocations
      : allocations.filter((a) => a.status === filter);

  const handleApprove = async (batchId: string) => {
    if (!approveTarget) return;
    const { error } = await approveRequest(approveTarget.id, batchId);
    if (error) throw new Error(error);
    setApproveTarget(null);
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    const { error } = await rejectRequest(rejectTarget.id, reason);
    if (error) throw new Error(error);
    setRejectTarget(null);
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

  if (allocError) {
    return (
      <div
        className="rounded-xl p-6 border text-sm"
        style={{ backgroundColor: "#FEF2F2", borderColor: "#DC2626", color: "#DC2626" }}
      >
        Failed to load allocations: {allocError}
      </div>
    );
  }

  const pendingCount = allocations.filter(
    (a) => a.status === "pending" || a.status === "reviewing",
  ).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#25671E" }}>
            Allocation Requests
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pendingCount > 0
              ? `${pendingCount} pending request${pendingCount !== 1 ? "s" : ""} require action`
              : "All requests handled"}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {["all", "pending", "allocated", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <span className="text-4xl mb-3 block">📋</span>
          <p className="text-gray-500 text-sm">
            {filter === "all"
              ? "No allocation requests yet."
              : `No ${filter} requests.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ backgroundColor: "#F9FAFB" }}>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Request
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Requester
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Crop
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Qty
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Location
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a: AllocationRequest) => {
                  const canAct =
                    a.status === "pending" || a.status === "reviewing";
                  return (
                    <tr
                      key={a.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs">{a.request_id}</span>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(a.created_at).toLocaleDateString("en-IN")}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 text-sm">
                          {a.requester?.name ?? "Unknown"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {a.requester?.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {a.crop}
                        {a.variety && (
                          <span className="text-gray-400 ml-1">
                            ({a.variety})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {a.quantity} {a.unit}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {a.location}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canAct ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setApproveTarget(a)}
                              className="px-3 py-1 text-xs font-medium rounded-md text-white transition-opacity hover:opacity-90"
                              style={{ backgroundColor: "#48A111" }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectTarget(a)}
                              className="px-3 py-1 text-xs font-medium rounded-md transition-colors border hover:bg-red-50"
                              style={{ borderColor: "#DC2626", color: "#DC2626" }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ApproveDialog
        isOpen={!!approveTarget}
        request={approveTarget}
        batches={batches}
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      />
      <RejectDialog
        isOpen={!!rejectTarget}
        request={rejectTarget}
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
};
