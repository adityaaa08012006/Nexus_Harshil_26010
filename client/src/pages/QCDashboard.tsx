import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useAllocations } from "../hooks/useAllocations";
import type { AllocationInsert } from "../lib/supabase";
import {
  Upload,
  FileText,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  PenLine,
} from "lucide-react";

interface OrderStats {
  total: number;
  pending: number;
  allocated: number;
  completed: number;
}

interface RecentOrder {
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
}

export const QCDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { createRequest } = useAllocations();
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    allocated: 0,
    completed: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [manualOrderOpen, setManualOrderOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch order statistics
      const { data: orders, error: ordersError } = await supabase
        .from("allocation_requests")
        .select("status")
        .eq("requester_id", user?.id);

      if (ordersError) throw ordersError;

      const statsData: OrderStats = {
        total: orders.length,
        pending: orders.filter(
          (o) => o.status === "pending" || o.status === "reviewing",
        ).length,
        allocated: orders.filter(
          (o) => o.status === "allocated" || o.status === "dispatched",
        ).length,
        completed: orders.filter((o) => o.status === "completed").length,
      };
      setStats(statsData);

      // Fetch recent orders
      const { data: recent, error: recentError } = await supabase
        .from("allocation_requests")
        .select("*")
        .eq("requester_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (recentError) throw recentError;
      setRecentOrders(recent || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
      case "reviewing":
        return { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" };
      case "allocated":
      case "dispatched":
        return { bg: "#DBEAFE", text: "#1E40AF", border: "#93C5FD" };
      case "completed":
        return { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7" };
      case "cancelled":
        return { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" };
      default:
        return { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "reviewing":
        return <Clock className="w-4 h-4" />;
      case "allocated":
      case "dispatched":
        return <Package className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
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

  return (
    <div className="space-y-6 pb-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">QC Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {user?.name} ·{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Upload PDF Card */}
        <button
          onClick={() => navigate("/qc/upload")}
          className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl p-6 border border-green-800 shadow-lg transition-all hover:scale-105 hover:shadow-xl text-left"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Upload PDF Order</h3>
              </div>
              <p className="text-sm text-green-100 leading-relaxed">
                Upload PDF documents to extract and place new agricultural
                product orders using AI
              </p>
            </div>
          </div>
        </button>

        {/* Manual Order Card */}
        <button
          onClick={() => setManualOrderOpen(true)}
          className="bg-white hover:bg-gray-50 rounded-xl p-6 border-2 border-dashed transition-all hover:shadow-md text-left"
          style={{ borderColor: "#48A111" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#F0FDF4" }}
                >
                  <PenLine className="w-6 h-6" style={{ color: "#48A111" }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Manual Order
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Enter crop, quantity and location directly without uploading a
                document
              </p>
            </div>
          </div>
        </button>

        {/* View Orders Card */}
        <button
          onClick={() => navigate("/qc/orders")}
          className="bg-white hover:bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm transition-all hover:shadow-md text-left"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#F0F9FF" }}
                >
                  <FileText className="w-6 h-6" style={{ color: "#0284C7" }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  View All Orders
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Track and manage all your placed orders and their fulfillment
                status
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* ── Statistics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#F3F4F6" }}
            >
              <FileText className="w-5 h-5 text-gray-700" />
            </div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Total Orders</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#FEF3C7" }}
            >
              <Clock className="w-5 h-5" style={{ color: "#92400E" }} />
            </div>
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
            >
              Pending
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting Allocation</p>
        </div>

        {/* Allocated Orders */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#DBEAFE" }}
            >
              <Package className="w-5 h-5" style={{ color: "#1E40AF" }} />
            </div>
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ backgroundColor: "#DBEAFE", color: "#1E40AF" }}
            >
              In Progress
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.allocated}</p>
          <p className="text-xs text-gray-500 mt-1">Being Fulfilled</p>
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#D1FAE5" }}
            >
              <CheckCircle className="w-5 h-5" style={{ color: "#065F46" }} />
            </div>
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
            >
              Done
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          <p className="text-xs text-gray-500 mt-1">Successfully Delivered</p>
        </div>
      </div>

      {/* ── Recent Orders Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Recent Orders
            </h2>
            <button
              onClick={() => navigate("/qc/orders")}
              className="text-xs font-medium hover:underline"
              style={{ color: "#48A111" }}
            >
              View all →
            </button>
          </div>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500 mb-4">No orders placed yet</p>
            <button
              onClick={() => navigate("/qc/upload")}
              className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#48A111" }}
            >
              Place Your First Order
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => {
                  const colors = getStatusColor(order.status);
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/qc/orders/${order.id}`)}
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono text-gray-900">
                          {order.request_id}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {order.crop}
                        </div>
                        {order.variety && (
                          <div className="text-xs text-gray-500">
                            {order.variety}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {order.quantity.toFixed(2)} {order.unit}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600 truncate max-w-xs block">
                          {order.location}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {order.deadline ? (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.deadline).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                              },
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No deadline
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                            borderColor: colors.border,
                          }}
                        >
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Manual Order Modal ── */}
      {manualOrderOpen && (
        <ManualOrderModal
          onClose={() => setManualOrderOpen(false)}
          onSuccess={fetchDashboardData}
          createRequest={createRequest}
        />
      )}
    </div>
  );
};

// ─── Manual Order Modal ────────────────────────────────────────────────────

interface ManualOrderModalProps {
  onClose: () => void;
  onSuccess: () => void;
  createRequest: (data: AllocationInsert) => Promise<void>;
}

const CROP_OPTIONS_LIST = [
  "Tomatoes", "Potatoes", "Onions", "Apples", "Bananas",
  "Cabbage", "Wheat", "Grapes", "Cauliflower", "Rice",
  "Maize", "Soybean", "Sugarcane", "Carrots", "Peas", "Other",
];

const UNIT_OPTIONS_LIST = ["kg", "tonnes", "quintal", "boxes", "crates"];

const ManualOrderModal: React.FC<ManualOrderModalProps> = ({
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
      if (!resolvedCrop) throw new Error("Please enter a crop name");
      if (!formData.quantity || formData.quantity <= 0)
        throw new Error("Please enter a valid quantity");
      if (!formData.location) throw new Error("Please enter a delivery location");
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
              className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
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
            {/* Crop */}
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
                  {CROP_OPTIONS_LIST.map((c) => (
                    <option key={c} value={c}>{c}</option>
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
                    onClick={() => { setUseCustomCrop(false); setCustomCrop(""); setFormData((p) => ({ ...p, crop: "" })); }}
                    className="px-3 py-2 text-xs text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    List
                  </button>
                </div>
              )}
            </div>

            {/* Variety (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variety <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.variety ?? ""}
                onChange={(e) => setFormData((p) => ({ ...p, variety: e.target.value || undefined }))}
                placeholder="e.g. Roma, Kufri Jyoti…"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Quantity + Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.quantity || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, quantity: parseFloat(e.target.value) || 0 }))}
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
                  onChange={(e) => setFormData((p) => ({ ...p, unit: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {UNIT_OPTIONS_LIST.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                placeholder="City or address"
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Deadline (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={formData.deadline ?? ""}
                onChange={(e) => setFormData((p) => ({ ...p, deadline: e.target.value || undefined }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Notes (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={formData.notes ?? ""}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value || undefined }))}
                rows={2}
                placeholder="Any special requirements…"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            {/* Actions */}
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
