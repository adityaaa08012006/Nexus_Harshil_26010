import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../hooks/useInventory";
import { useAuthContext } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { MetricCards } from "../components/dashboard/MetricCards";
import { RiskChart } from "../components/dashboard/RiskChart";
import { InventoryTable } from "../components/dashboard/InventoryTable";
import {
  ShoppingCart,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Check,
  X as XIcon,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";

interface IncomingOrder {
  id: string;
  request_id: string;
  crop: string;
  variety: string | null;
  quantity: number;
  unit: string;
  location: string;
  status: string;
  deadline: string | null;
  created_at: string;
  requester: {
    name: string;
    email: string;
  } | null;
}

export const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { batches, stats, isLoading, error } = useInventory();
  const [incomingOrders, setIncomingOrders] = useState<IncomingOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(
    new Set(),
  );

  // Top 5 high-risk batches for the spotlight table
  const highRiskBatches = [...batches]
    .sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0))
    .slice(0, 5);

  useEffect(() => {
    fetchIncomingOrders();
  }, []);

  const fetchIncomingOrders = async () => {
    try {
      setOrdersLoading(true);

      // Fetch pending and reviewing orders for this manager's warehouse only
      let query = supabase
        .from("allocation_requests")
        .select("*")
        .in("status", ["pending", "reviewing"])
        .order("created_at", { ascending: false });

      // Filter by manager's warehouse_id
      if (user?.warehouse_id) {
        query = query.eq("warehouse_id", user.warehouse_id);
      }

      const { data: orders, error: ordersError } = await query;

      if (ordersError) throw ordersError;

      // Fetch requester details separately and manually join
      if (orders && orders.length > 0) {
        const requesterIds = [
          ...new Set(orders.map((o) => o.requester_id).filter(Boolean)),
        ];

        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("id, name, email")
          .in("id", requesterIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

        const ordersWithRequester = orders.map((order) => ({
          ...order,
          requester: order.requester_id
            ? profileMap.get(order.requester_id)
            : null,
        }));

        setIncomingOrders(ordersWithRequester);
      } else {
        setIncomingOrders([]);
      }
    } catch (error) {
      console.error("Error fetching incoming orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Filter and search orders
  const filteredOrders = incomingOrders.filter((order) => {
    const matchesSearch =
      order.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.request_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.requester?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get urgent orders (deadline within 3 days)
  const getDeadlineUrgency = (deadline: string | null) => {
    if (!deadline) return "none";
    const daysUntil = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    if (daysUntil < 0) return "overdue";
    if (daysUntil <= 3) return "urgent";
    if (daysUntil <= 7) return "soon";
    return "normal";
  };

  // Select/deselect orders
  const toggleOrderSelection = (orderId: string) => {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedOrders(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  // Approve/reject orders
  const handleOrderAction = async (
    orderIds: string[],
    action: "approve" | "reject",
  ) => {
    const newStatus = action === "approve" ? "reviewing" : "cancelled";
    const processing = new Set(processingOrders);
    orderIds.forEach((id) => processing.add(id));
    setProcessingOrders(processing);

    try {
      const { error } = await supabase
        .from("allocation_requests")
        .update({ status: newStatus })
        .in("id", orderIds);

      if (error) throw error;

      // Refresh orders
      await fetchIncomingOrders();

      // Clear selection
      setSelectedOrders(new Set());
    } catch (error) {
      console.error(`Failed to ${action} orders:`, error);
      alert(`Failed to ${action} orders. Please try again.`);
    } finally {
      const processing = new Set(processingOrders);
      orderIds.forEach((id) => processing.delete(id));
      setProcessingOrders(processing);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" };
      case "reviewing":
        return { bg: "#DBEAFE", text: "#1E40AF", border: "#93C5FD" };
      default:
        return { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "reviewing":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  // ── Loading / error states ───────────────────────────────────────────────────
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
        Failed to load inventory: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Warehouse Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {user?.name} ·{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/manager/inventory")}
            className="px-4 py-2 text-sm font-medium rounded-lg border transition-all hover:bg-gray-50"
            style={{ borderColor: "#E5E7EB", color: "#374151" }}
          >
            View Inventory
          </button>
          <button
            onClick={() => navigate("/manager/inventory?action=add")}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: "#48A111" }}
          >
            Add Batch
          </button>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <MetricCards
        totalBatches={stats.total}
        freshCount={stats.fresh}
        moderateCount={stats.moderate}
        highRiskCount={stats.highRisk}
        totalQuantity={stats.totalQuantity}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: INCOMING ORDERS - Orders from QC that need fulfillment  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Incoming Orders
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Review and approve allocation requests
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm">
                {filteredOrders.length}{" "}
                {filteredOrders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>
          </div>
        </div>

        {ordersLoading ? (
          <div className="flex items-center justify-center h-32">
            <div
              className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#2563EB", borderTopColor: "transparent" }}
            />
          </div>
        ) : incomingOrders.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="text-sm text-gray-600 font-medium">
              All caught up! No pending orders.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              New orders will appear here
            </p>
          </div>
        ) : (
          <>
            {/* Search and Filter Bar */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by crop, order ID, requester, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-white transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    Status:{" "}
                    {statusFilter === "all"
                      ? "All"
                      : statusFilter.charAt(0).toUpperCase() +
                        statusFilter.slice(1)}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showFilters && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        {["all", "pending", "reviewing"].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setStatusFilter(status);
                              setShowFilters(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                              statusFilter === status
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            {status === "all"
                              ? "All Orders"
                              : status.charAt(0).toUpperCase() +
                                status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bulk Actions Bar (shown when items selected) */}
            {selectedOrders.size > 0 && (
              <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedOrders.size} order
                    {selectedOrders.size !== 1 ? "s" : ""} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleOrderAction(Array.from(selectedOrders), "approve")
                      }
                      disabled={processingOrders.size > 0}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      Approve Selected
                    </button>
                    <button
                      onClick={() =>
                        handleOrderAction(Array.from(selectedOrders), "reject")
                      }
                      disabled={processingOrders.size > 0}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <XIcon className="w-4 h-4" />
                      Reject Selected
                    </button>
                    <button
                      onClick={() => setSelectedOrders(new Set())}
                      className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-white transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedOrders.size === filteredOrders.length &&
                          filteredOrders.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Requester
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const urgency = getDeadlineUrgency(order.deadline);
                    const isProcessing = processingOrders.has(order.id);
                    const isSelected = selectedOrders.has(order.id);

                    return (
                      <tr
                        key={order.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOrderSelection(order.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                        </td>

                        {/* Order Details */}
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            {urgency === "urgent" || urgency === "overdue" ? (
                              <AlertTriangle
                                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${urgency === "overdue" ? "text-red-600" : "text-orange-500"}`}
                              />
                            ) : null}
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {order.crop}
                              </div>
                              {order.variety && (
                                <div className="text-xs text-gray-500">
                                  {order.variety}
                                </div>
                              )}
                              <div className="text-xs font-mono text-blue-600 mt-0.5">
                                {order.request_id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Quantity */}
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-gray-900">
                            {order.quantity.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            {order.unit}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700 truncate max-w-[150px] block">
                            {order.location}
                          </span>
                        </td>

                        {/* Deadline */}
                        <td className="px-4 py-3">
                          {order.deadline ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar
                                className={`w-3.5 h-3.5 ${
                                  urgency === "overdue"
                                    ? "text-red-600"
                                    : urgency === "urgent"
                                      ? "text-orange-500"
                                      : urgency === "soon"
                                        ? "text-yellow-600"
                                        : "text-gray-400"
                                }`}
                              />
                              <span
                                className={`text-xs font-medium ${
                                  urgency === "overdue"
                                    ? "text-red-600"
                                    : urgency === "urgent"
                                      ? "text-orange-600"
                                      : urgency === "soon"
                                        ? "text-yellow-700"
                                        : "text-gray-700"
                                }`}
                              >
                                {new Date(order.deadline).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                  },
                                )}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>

                        {/* Requester */}
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            {order.requester?.name || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[150px]">
                            {order.requester?.email || "-"}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: getStatusColor(order.status).bg,
                              color: getStatusColor(order.status).text,
                            }}
                          >
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() =>
                                handleOrderAction([order.id], "approve")
                              }
                              disabled={isProcessing}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleOrderAction([order.id], "reject")
                              }
                              disabled={isProcessing}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Reject"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/manager/orders/${order.id}`)
                              }
                              className="px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty state for filtered results */}
            {filteredOrders.length === 0 && incomingOrders.length > 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-600">
                  No orders match your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: CURRENT INVENTORY - What's physically in the warehouse  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: CURRENT INVENTORY - What's physically in the warehouse  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              📦 Current Inventory - What's in Stock
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Products physically stored in your warehouse right now
            </p>
          </div>
        </div>

        {/* ── Risk Chart ── */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <RiskChart batches={batches} />
        </div>

        {/* ── High-risk spotlight table ── */}
        {highRiskBatches.length > 0 && (
          <div className="bg-white rounded-lg p-5 mb-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-gray-900">
                  ⚠️ High-Risk Batches - Urgent Attention Needed
                </h3>
              </div>
              <button
                onClick={() => navigate("/manager/inventory?filter=high")}
                className="text-xs font-medium hover:underline"
                style={{ color: "#48A111" }}
              >
                View all →
              </button>
            </div>
            <InventoryTable
              batches={highRiskBatches}
              readOnly={false}
              title=""
              maxRows={5}
              showSearch={false}
              onView={(id) => navigate(`/manager/batch/${id}`)}
              onEdit={(batch) =>
                navigate(`/manager/inventory?edit=${batch.id}`)
              }
            />
          </div>
        )}

        {/* ── Full inventory preview ── */}
        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              All Batches in Warehouse
            </h3>
            <button
              onClick={() => navigate("/manager/inventory")}
              className="text-xs font-medium hover:underline"
              style={{ color: "#48A111" }}
            >
              View full inventory →
            </button>
          </div>
          <InventoryTable
            batches={batches}
            maxRows={10}
            showSearch={false}
            readOnly={false}
            onView={(id) => navigate(`/manager/batch/${id}`)}
            onEdit={(batch) => navigate(`/manager/inventory?edit=${batch.id}`)}
          />
        </div>
      </div>
    </div>
  );
};
