import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { API_URL } from "../config/api";
import { MessageButton } from "../components/common/MessageThread";
import {
  Truck,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Calendar,
  ArrowLeft,
  Search,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface DispatchRecord {
  id: string;
  dispatch_id: string;
  batch_id: string;
  allocation_id: string | null;
  destination: string;
  dispatch_date: string;
  estimated_delivery: string | null;
  quantity: number;
  unit: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  batch?: {
    batch_id: string;
    crop: string;
    variety: string | null;
    zone: string;
    warehouse_id: string;
  } | null;
  allocation?: {
    request_id: string;
    requester_id: string;
    crop: string;
    variety: string | null;
    location: string;
    quantity: number;
    unit: string;
    deadline: string | null;
    status: string;
  } | null;
}

// ─── Progress Steps ─────────────────────────────────────────────────────────

const PROGRESS_STEPS = [
  { key: "allocated", label: "Allocated", icon: Package },
  { key: "pending", label: "Dispatched", icon: Truck },
  { key: "in-transit", label: "In Transit", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const getStepIndex = (status: string): number => {
  switch (status) {
    case "pending":
      return 1;
    case "in-transit":
      return 2;
    case "delivered":
      return 3;
    case "cancelled":
      return -1;
    default:
      return 0;
  }
};

const ProgressTracker: React.FC<{ status: string }> = ({ status }) => {
  const currentStep = getStepIndex(status);
  const isCancelled = status === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
        <XCircle className="w-5 h-5 text-red-500" />
        <span className="text-sm font-medium text-red-700">
          This dispatch has been cancelled
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full">
      {PROGRESS_STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isCompleted = idx <= currentStep;
        const isCurrent = idx === currentStep;

        return (
          <React.Fragment key={step.key}>
            {/* Step circle */}
            <div className="flex flex-col items-center relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? isCurrent
                      ? "border-green-500 bg-green-500 text-white shadow-lg shadow-green-200"
                      : "border-green-500 bg-green-100 text-green-600"
                    : "border-gray-300 bg-gray-50 text-gray-400"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
              </div>
              <span
                className={`text-xs mt-2 font-medium whitespace-nowrap ${
                  isCompleted ? "text-green-700" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {/* Connector line */}
            {idx < PROGRESS_STEPS.length - 1 && (
              <div className="flex-1 mx-2 mt-[-20px]">
                <div
                  className={`h-1 rounded-full transition-all ${
                    idx < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Status Badge ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  pending: {
    bg: "#FEF3C7",
    text: "#92400E",
    border: "#FCD34D",
    label: "Dispatched",
  },
  "in-transit": {
    bg: "#DBEAFE",
    text: "#1E40AF",
    border: "#93C5FD",
    label: "In Transit",
  },
  delivered: {
    bg: "#D1FAE5",
    text: "#065F46",
    border: "#6EE7B7",
    label: "Delivered",
  },
  cancelled: {
    bg: "#FEE2E2",
    text: "#991B1B",
    border: "#FCA5A5",
    label: "Cancelled",
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export const QCOrderTracking: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuthContext();
  const [dispatches, setDispatches] = useState<DispatchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState<"active" | "history">("active");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMyDispatches = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }
        const res = await fetch(
          `${API_URL}/api/allocation/dispatches/my`,
          { headers },
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const data: DispatchRecord[] = await res.json();
        setDispatches(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dispatches",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyDispatches();
  }, [session]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const activeDispatches = dispatches.filter(
    (d) => d.status === "pending" || d.status === "in-transit",
  );
  const historyDispatches = dispatches.filter(
    (d) => d.status === "delivered" || d.status === "cancelled",
  );

  const currentList = tab === "active" ? activeDispatches : historyDispatches;

  const filtered = searchQuery.trim()
    ? currentList.filter((d) => {
        const q = searchQuery.toLowerCase();
        return (
          d.dispatch_id.toLowerCase().includes(q) ||
          d.destination.toLowerCase().includes(q) ||
          d.batch?.crop?.toLowerCase().includes(q) ||
          d.allocation?.request_id?.toLowerCase().includes(q)
        );
      })
    : currentList;

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total: dispatches.length,
    active: activeDispatches.length,
    inTransit: dispatches.filter((d) => d.status === "in-transit").length,
    delivered: dispatches.filter((d) => d.status === "delivered").length,
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const daysUntil = (dateStr: string | null) => {
    if (!dateStr) return null;
    const diff = Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return diff;
  };

  // ── Loading / Error ───────────────────────────────────────────────────────
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
      <div className="rounded-xl p-6 border text-sm bg-red-50 border-red-200 text-red-700">
        Failed to load tracking data: {error}
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* ── Header ── */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/qc/dashboard")}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              Order Tracking & History
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Track dispatch progress and view completed orders
            </p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            {
              label: "Total Dispatches",
              value: stats.total,
              color: "#6B7280",
              bg: "#F3F4F6",
            },
            {
              label: "Active",
              value: stats.active,
              color: "#92400E",
              bg: "#FEF3C7",
            },
            {
              label: "In Transit",
              value: stats.inTransit,
              color: "#1E40AF",
              bg: "#DBEAFE",
            },
            {
              label: "Delivered",
              value: stats.delivered,
              color: "#065F46",
              bg: "#D1FAE5",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-3.5 border"
              style={{
                backgroundColor: s.bg,
                borderColor: `${s.color}20`,
              }}
            >
              <p className="text-xs font-medium" style={{ color: s.color }}>
                {s.label}
              </p>
              <p
                className="text-2xl font-bold mt-0.5"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Tabs + Search ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setTab("active")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                tab === "active"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Active ({activeDispatches.length})
            </button>
            <button
              onClick={() => setTab("history")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                tab === "history"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              History ({historyDispatches.length})
            </button>
          </div>
          <div className="flex-1 relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by dispatch ID, crop, destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* ── Dispatch Cards ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          {tab === "active" ? (
            <>
              <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-600 font-medium mb-1">
                No active dispatches
              </p>
              <p className="text-xs text-gray-500">
                Dispatches will appear here once your orders are approved and
                shipped
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-600 font-medium mb-1">
                No order history yet
              </p>
              <p className="text-xs text-gray-500">
                Completed and cancelled orders will show up here
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((d) => {
            const isExpanded = expandedId === d.id;
            const statusStyle =
              STATUS_STYLES[d.status] ?? STATUS_STYLES.pending;
            const daysLeft = daysUntil(d.estimated_delivery);

            return (
              <div
                key={d.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* ── Card Header ── */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : d.id)
                  }
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500">
                          {d.dispatch_id}
                        </span>
                        {d.allocation?.request_id && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs text-gray-400">
                              Order {d.allocation.request_id}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {d.batch?.crop ?? d.allocation?.crop ?? "—"}
                        {(d.batch?.variety ?? d.allocation?.variety) && (
                          <span className="text-gray-400 text-base font-normal ml-2">
                            (
                            {d.batch?.variety ?? d.allocation?.variety}
                            )
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
                        style={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          borderColor: statusStyle.border,
                        }}
                      >
                        {statusStyle.label}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* ── Quick Info Row ── */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>
                        {d.quantity} {d.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{d.destination}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(d.dispatch_date)}</span>
                    </div>
                    {d.estimated_delivery &&
                      d.status !== "delivered" &&
                      d.status !== "cancelled" && (
                        <div
                          className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                            daysLeft !== null && daysLeft <= 1
                              ? "bg-red-50 text-red-600"
                              : daysLeft !== null && daysLeft <= 3
                                ? "bg-amber-50 text-amber-600"
                                : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {daysLeft !== null
                            ? daysLeft <= 0
                              ? "Due today"
                              : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`
                            : "—"}
                        </div>
                      )}
                  </div>

                  {/* ── Progress Tracker (always visible for active) ── */}
                  {tab === "active" && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <ProgressTracker status={d.status} />
                    </div>
                  )}
                </div>

                {/* ── Expanded Details ── */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Dispatch Info */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Dispatch Details
                        </h4>
                        <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Dispatch ID</span>
                            <span className="font-mono font-medium text-gray-900">
                              {d.dispatch_id}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Batch</span>
                            <span className="font-mono text-gray-700">
                              {d.batch?.batch_id ?? "—"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Zone</span>
                            <span className="text-gray-700">
                              {d.batch?.zone ?? "—"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Dispatched</span>
                            <span className="text-gray-700">
                              {formatDate(d.dispatch_date)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              Est. Delivery
                            </span>
                            <span className="text-gray-700">
                              {d.estimated_delivery
                                ? formatDate(d.estimated_delivery)
                                : "—"}
                            </span>
                          </div>
                          {d.notes && (
                            <div className="pt-2 border-t border-gray-100">
                              <p className="text-xs text-gray-500 mb-0.5">
                                Notes
                              </p>
                              <p className="text-sm text-gray-700">
                                {d.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Info */}
                      {d.allocation && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Original Order
                          </h4>
                          <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Order ID</span>
                              <span className="font-mono font-medium text-gray-900">
                                {d.allocation.request_id}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Requested</span>
                              <span className="text-gray-700">
                                {d.allocation.quantity} {d.allocation.unit}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Dispatched</span>
                              <span className="text-gray-700">
                                {d.quantity} {d.unit}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Location</span>
                              <span className="text-gray-700">
                                {d.allocation.location}
                              </span>
                            </div>
                            {d.allocation.deadline && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Deadline</span>
                                <span className="text-gray-700">
                                  {formatDate(d.allocation.deadline)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress tracker in history tab */}
                    {tab === "history" && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <ProgressTracker status={d.status} />
                      </div>
                    )}

                    {/* Actions row */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {d.allocation_id && (
                          <MessageButton
                            allocationId={d.allocation_id}
                            allocationRequestId={
                              d.allocation?.request_id ?? ""
                            }
                            variant="button"
                          />
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/qc/orders/${d.allocation_id}`);
                        }}
                        className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
                        style={{ color: "#48A111" }}
                      >
                        <Eye className="w-4 h-4" />
                        View Order
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
