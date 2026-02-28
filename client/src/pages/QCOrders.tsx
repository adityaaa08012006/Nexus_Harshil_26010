import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useAllocations } from "../hooks/useAllocations";
import { MessageButton } from "../components/common/MessageThread";
import { OrderStatusTimeline } from "../components/common/OrderStatusTimeline";
import type { AllocationInsert } from "../lib/supabase";
import {
  FileText,
  Package,
  Calendar,
  MapPin,
  ArrowLeft,
  Search,
  Filter,
  PenLine,
  Truck,
} from "lucide-react";

interface Order {
  id: string;
  request_id: string;
  crop: string;
  variety: string | null;
  quantity: number;
  unit: string;
  location: string;
  status: string;
  deadline: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  dispatch_status?: string | null;
  estimated_delivery?: string | null;
}

export const QCOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { createRequest } = useAllocations();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [manualOrderOpen, setManualOrderOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("allocation_requests")
        .select("*")
        .eq("requester_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch dispatch info for these orders to get delivery status
      const orderIds = (data || []).map((o: any) => o.id);
      let dispatchMap: Record<
        string,
        { status: string; estimated_delivery: string | null }
      > = {};
      if (orderIds.length > 0) {
        const { data: dispatches } = await supabase
          .from("dispatches")
          .select("allocation_id, status, estimated_delivery")
          .in("allocation_id", orderIds);
        if (dispatches) {
          for (const d of dispatches) {
            if (d.allocation_id) {
              dispatchMap[d.allocation_id] = {
                status: d.status,
                estimated_delivery: d.estimated_delivery,
              };
            }
          }
        }
      }

      const enriched = (data || []).map((o: any) => ({
        ...o,
        dispatch_status: dispatchMap[o.id]?.status ?? null,
        estimated_delivery: dispatchMap[o.id]?.estimated_delivery ?? null,
      }));

      setOrders(enriched);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Status filter (uses effective status)
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => getEffectiveStatus(order) === statusFilter,
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.request_id.toLowerCase().includes(query) ||
          order.crop.toLowerCase().includes(query) ||
          order.location.toLowerCase().includes(query) ||
          order.variety?.toLowerCase().includes(query),
      );
    }

    setFilteredOrders(filtered);
  };

  // Compute effective status: overlay dispatch status on top of allocation status
  const getEffectiveStatus = (order: Order): string => {
    if (order.dispatch_status) {
      if (order.dispatch_status === "delivered") return "delivered";
      if (order.dispatch_status === "in-transit") return "in-transit";
      if (order.dispatch_status === "pending") return "dispatched";
      if (order.dispatch_status === "cancelled") return order.status; // fall back
    }
    return order.status;
  };

  const getStatusCounts = () => {
    const effective = orders.map(getEffectiveStatus);
    return {
      all: orders.length,
      pending: effective.filter((s) => s === "pending").length,
      reviewing: effective.filter((s) => s === "reviewing").length,
      allocated: effective.filter((s) => s === "allocated").length,
      dispatched: effective.filter((s) => s === "dispatched").length,
      "in-transit": effective.filter((s) => s === "in-transit").length,
      delivered: effective.filter((s) => s === "delivered").length,
      completed: effective.filter((s) => s === "completed").length,
      cancelled: effective.filter((s) => s === "cancelled").length,
    };
  };

  const counts = getStatusCounts();

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

  return (
    <div className="space-y-6 pb-6">
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
            <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track all your placed orders and their fulfillment status
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setManualOrderOpen(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all hover:bg-green-50 flex items-center gap-1.5"
              style={{ borderColor: "#48A111", color: "#48A111" }}
            >
              <PenLine className="w-4 h-4" />
              Manual
            </button>
            <button
              onClick={() => navigate("/qc/upload")}
              className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-all hover:opacity-90 shadow-sm"
              style={{ backgroundColor: "#48A111" }}
            >
              + Upload PDF
            </button>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Product, Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              <option value="all">All ({counts.all})</option>
              <option value="pending">Pending ({counts.pending})</option>
              <option value="reviewing">Reviewing ({counts.reviewing})</option>
              <option value="allocated">Allocated ({counts.allocated})</option>
              <option value="dispatched">
                Dispatched ({counts.dispatched})
              </option>
              <option value="in-transit">
                In Transit ({counts["in-transit"]})
              </option>
              <option value="delivered">Delivered ({counts.delivered})</option>
              <option value="completed">Completed ({counts.completed})</option>
              <option value="cancelled">Cancelled ({counts.cancelled})</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Orders Grid ── */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-600 font-medium mb-2">
            {searchQuery || statusFilter !== "all"
              ? "No orders match your filters"
              : "No orders placed yet"}
          </p>
          <p className="text-xs text-gray-500 mb-4">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Start by uploading a PDF to place your first order"}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <button
              onClick={() => navigate("/qc/upload")}
              className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#48A111" }}
            >
              Place Your First Order
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const effectiveStatus = getEffectiveStatus(order);
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Header */}
                <div
                  className="p-5 border-b border-gray-100 cursor-pointer"
                  onClick={() => navigate(`/qc/orders/${order.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <span className="text-xs font-mono text-gray-500">
                        {order.request_id}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mt-1">
                        {order.crop}
                      </h3>
                      {order.variety && (
                        <p className="text-sm text-gray-600 mt-0.5">
                          {order.variety}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                  <OrderStatusTimeline
                    currentStatus={effectiveStatus}
                    orderId={order.request_id}
                    createdAt={order.created_at}
                    updatedAt={order.updated_at}
                  />
                </div>

                {/* Details */}
                <div
                  className="p-5 space-y-3 cursor-pointer"
                  onClick={() => navigate(`/qc/orders/${order.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <Package className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Quantity</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {order.quantity.toFixed(2)} {order.unit}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Delivery Location</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {order.location}
                      </p>
                    </div>
                  </div>

                  {order.deadline && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Deadline</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(order.deadline).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.notes && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Notes</p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {order.notes}
                      </p>
                    </div>
                  )}

                  {/* Estimated delivery info */}
                  {order.estimated_delivery && (
                    <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">
                          Estimated Delivery
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(
                            order.estimated_delivery,
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          {effectiveStatus === "delivered" && (
                            <span className="ml-2 text-green-600 text-xs font-semibold">
                              ✓ Delivered
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Ordered{" "}
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </span>
                    <div className="flex items-center gap-3">
                      <MessageButton
                        allocationId={order.id}
                        allocationRequestId={order.request_id}
                        variant="button"
                      />
                      {/* Reorder button for completed orders */}
                      {(effectiveStatus === "delivered" ||
                        effectiveStatus === "completed") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/qc/requirements", {
                              state: {
                                reorderData: {
                                  crop: order.crop,
                                  variety: order.variety,
                                  quantity: order.quantity,
                                  unit: order.unit,
                                  location: order.location,
                                  notes: order.notes,
                                },
                                mode: "manual",
                              },
                            });
                          }}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border-2 transition-all hover:bg-green-50 flex items-center gap-1"
                          style={{ borderColor: "#48A111", color: "#48A111" }}
                          title="Reorder this item"
                        >
                          <PenLine className="w-3 h-3" />
                          Reorder
                        </button>
                      )}
                      <span className="text-green-600 font-medium hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Manual Order Modal ── */}
      {manualOrderOpen && (
        <QCManualOrderModal
          onClose={() => setManualOrderOpen(false)}
          onSuccess={fetchOrders}
          createRequest={createRequest}
        />
      )}
    </div>
  );
};

// ─── Manual Order Modal (local) ────────────────────────────────────────────

interface QCManualOrderModalProps {
  onClose: () => void;
  onSuccess: () => void;
  createRequest: (data: AllocationInsert) => Promise<{ error: string | null }>;
}

const CROP_LIST = [
  "Tomatoes",
  "Potatoes",
  "Onions",
  "Apples",
  "Bananas",
  "Cabbage",
  "Wheat",
  "Grapes",
  "Cauliflower",
  "Rice",
  "Maize",
  "Soybean",
  "Sugarcane",
  "Carrots",
  "Peas",
  "Other",
];
const UNIT_LIST = ["kg", "tonnes", "quintal", "boxes", "crates"];

const QCManualOrderModal: React.FC<QCManualOrderModalProps> = ({
  onClose,
  onSuccess,
  createRequest,
}) => {
  const [formData, setFormData] = useState<AllocationInsert>({
    crop: "",
    quantity: 0,
    location: "",
    unit: "kg",
  });
  const [useCustomCrop, setUseCustomCrop] = useState(false);
  const [customCrop, setCustomCrop] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const resolvedCrop =
        useCustomCrop || formData.crop === "Other" ? customCrop : formData.crop;
      if (!resolvedCrop) throw new Error("Please select or enter a crop");
      if (!formData.quantity || formData.quantity <= 0)
        throw new Error("Please enter a valid quantity");
      if (!formData.location)
        throw new Error("Please enter a delivery location");
      await createRequest({ ...formData, crop: resolvedCrop });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#F0FDF4" }}
              >
                <PenLine className="w-5 h-5" style={{ color: "#48A111" }} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Manual Order</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg p-3 text-sm bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crop *
              </label>
              {!useCustomCrop ? (
                <select
                  value={formData.crop}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, crop: e.target.value }));
                    if (e.target.value === "Other") setUseCustomCrop(true);
                  }}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a crop…</option>
                  {CROP_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCrop}
                    onChange={(e) => setCustomCrop(e.target.value)}
                    placeholder="Enter crop name"
                    required
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomCrop(false);
                      setCustomCrop("");
                      setFormData((p) => ({ ...p, crop: "" }));
                    }}
                    className="px-3 py-2 text-xs text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    List
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variety{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.variety ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    variety: e.target.value || undefined,
                  }))
                }
                placeholder="e.g. Roma, Kufri Jyoti…"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.quantity || ""}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      quantity: parseFloat(e.target.value) || 0,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, unit: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {UNIT_LIST.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="City or address"
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={formData.deadline ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    deadline: e.target.value || undefined,
                  }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={formData.notes ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    notes: e.target.value || undefined,
                  }))
                }
                rows={2}
                placeholder="Any special requirements…"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#48A111" }}
              >
                {submitting ? "Submitting…" : "Place Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
