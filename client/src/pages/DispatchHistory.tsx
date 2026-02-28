import React, { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { API_URL } from "../config/api";
import {
  Truck,
  MapPin,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpDown,
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
    requester?: {
      name: string;
      email: string;
      role: string;
    } | null;
  } | null;
}

// ─── Status Styles ──────────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
    label: string;
    icon: React.ReactNode;
  }
> = {
  pending: {
    bg: "#FEF3C7",
    text: "#92400E",
    border: "#FCD34D",
    label: "Pending",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  "in-transit": {
    bg: "#DBEAFE",
    text: "#1E40AF",
    border: "#93C5FD",
    label: "In Transit",
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  delivered: {
    bg: "#D1FAE5",
    text: "#065F46",
    border: "#6EE7B7",
    label: "Delivered",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  cancelled: {
    bg: "#FEE2E2",
    text: "#991B1B",
    border: "#FCA5A5",
    label: "Cancelled",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
      style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
    >
      {s.icon}
      {s.label}
    </span>
  );
};

// ─── Component ──────────────────────────────────────────────────────────────

export const DispatchHistory: React.FC = () => {
  const { session } = useAuthContext();
  const [dispatches, setDispatches] = useState<DispatchRecord[]>([]);
  const [filtered, setFiltered] = useState<DispatchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "quantity">("date");
  const [sortAsc, setSortAsc] = useState(false);

  // ── Fetch dispatches ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDispatches = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }
        const res = await fetch(`${API_URL}/api/allocation/dispatches/list`, {
          headers,
        });
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
    fetchDispatches();
  }, [session]);

  // ── Filter & sort ─────────────────────────────────────────────────────────
  useEffect(() => {
    let result = [...dispatches];

    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.dispatch_id.toLowerCase().includes(q) ||
          d.destination.toLowerCase().includes(q) ||
          d.batch?.crop?.toLowerCase().includes(q) ||
          d.batch?.batch_id?.toLowerCase().includes(q) ||
          d.allocation?.request_id?.toLowerCase().includes(q) ||
          d.allocation?.requester?.name?.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      if (sortField === "date") {
        const da = new Date(a.dispatch_date).getTime();
        const db = new Date(b.dispatch_date).getTime();
        return sortAsc ? da - db : db - da;
      }
      return sortAsc ? a.quantity - b.quantity : b.quantity - a.quantity;
    });

    setFiltered(result);
  }, [dispatches, statusFilter, searchQuery, sortField, sortAsc]);

  // ── Update status handler ─────────────────────────────────────────────────
  const updateStatus = async (dispatchId: string, newStatus: string) => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      const res = await fetch(
        `${API_URL}/api/allocation/dispatches/${dispatchId}/status`,
        { method: "PUT", headers, body: JSON.stringify({ status: newStatus }) },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update");
      }
      // Optimistically update
      setDispatches((prev) =>
        prev.map((d) =>
          d.id === dispatchId ? { ...d, status: newStatus } : d,
        ),
      );
    } catch (err) {
      console.error("Failed to update dispatch status:", err);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total: dispatches.length,
    pending: dispatches.filter((d) => d.status === "pending").length,
    inTransit: dispatches.filter((d) => d.status === "in-transit").length,
    delivered: dispatches.filter((d) => d.status === "delivered").length,
    cancelled: dispatches.filter((d) => d.status === "cancelled").length,
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
        style={{
          backgroundColor: "#FEF2F2",
          borderColor: "#DC2626",
          color: "#DC2626",
        }}
      >
        Failed to load dispatches: {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#25671E" }}>
          Dispatch History
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Track all dispatches from your warehouses
        </p>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total",
            value: stats.total,
            color: "#6B7280",
            bg: "#F3F4F6",
          },
          {
            label: "Pending",
            value: stats.pending,
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
            className="rounded-xl p-4 border"
            style={{ backgroundColor: s.bg, borderColor: `${s.color}20` }}
          >
            <p className="text-xs font-medium" style={{ color: s.color }}>
              {s.label}
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search dispatch ID, batch, crop, destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button
          onClick={() => {
            if (sortField === "date") {
              setSortAsc(!sortAsc);
            } else {
              setSortField("date");
              setSortAsc(false);
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowUpDown className="w-4 h-4" />
          {sortField === "date"
            ? sortAsc
              ? "Oldest First"
              : "Newest First"
            : "Sort by Date"}
        </button>
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">
            {statusFilter !== "all"
              ? `No ${statusFilter} dispatches found.`
              : "No dispatches yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ backgroundColor: "#F9FAFB" }}>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Dispatch
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Batch / Crop
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Destination
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Qty
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Est. Delivery
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
                {filtered.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-medium">
                        {d.dispatch_id}
                      </span>
                      {d.allocation?.request_id && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          Order: {d.allocation.request_id}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {d.batch?.crop ?? "—"}
                        {d.batch?.variety && (
                          <span className="text-gray-400 ml-1">
                            ({d.batch.variety})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {d.batch?.batch_id ?? "—"} · Zone {d.batch?.zone ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs">{d.destination}</span>
                      </div>
                      {d.allocation?.requester?.name && (
                        <div className="text-xs text-gray-400 mt-0.5 ml-5">
                          To: {d.allocation.requester.name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {d.quantity} {d.unit}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {new Date(d.dispatch_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {d.estimated_delivery
                        ? new Date(d.estimated_delivery).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {d.status === "pending" && (
                        <button
                          onClick={() => updateStatus(d.id, "in-transit")}
                          className="px-3 py-1 text-xs font-medium rounded-md text-white transition-opacity hover:opacity-90"
                          style={{ backgroundColor: "#1E40AF" }}
                        >
                          Ship
                        </button>
                      )}
                      {d.status === "in-transit" && (
                        <button
                          onClick={() => updateStatus(d.id, "delivered")}
                          className="px-3 py-1 text-xs font-medium rounded-md text-white transition-opacity hover:opacity-90"
                          style={{ backgroundColor: "#065F46" }}
                        >
                          Mark Delivered
                        </button>
                      )}
                      {(d.status === "delivered" ||
                        d.status === "cancelled") && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
