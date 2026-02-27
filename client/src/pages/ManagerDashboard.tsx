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

      // Fetch pending and reviewing orders (orders that need to be fulfilled)
      const { data, error: ordersError } = await supabase
        .from("allocation_requests")
        .select(
          `
          *,
          requester:user_profiles!requester_id (
            name,
            email
          )
        `,
        )
        .in("status", ["pending", "reviewing"])
        .order("created_at", { ascending: false })
        .limit(10);

      if (ordersError) throw ordersError;
      setIncomingOrders(data || []);
    } catch (error) {
      console.error("Error fetching incoming orders:", error);
    } finally {
      setOrdersLoading(false);
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
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm overflow-hidden">
        <div className="p-5 bg-white/80 backdrop-blur-sm border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  📋 Incoming Orders - Need to Fulfill
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Orders placed by QC Representatives that require allocation
                  from your warehouse
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
              {incomingOrders.length} New
            </span>
          </div>
        </div>

        {ordersLoading ? (
          <div className="flex items-center justify-center h-32 bg-white">
            <div
              className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#2563EB", borderTopColor: "transparent" }}
            />
          </div>
        ) : incomingOrders.length === 0 ? (
          <div className="p-12 text-center bg-white">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="text-sm text-gray-600 font-medium">
              All caught up! No pending orders at the moment.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              New orders from QC will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white">
            <table className="w-full">
              <thead className="bg-blue-50 border-b border-blue-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">
                    Product Required
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">
                    Quantity Needed
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">
                    Delivery Location
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">
                    Ordered By
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {incomingOrders.map((order) => {
                  const colors = getStatusColor(order.status);
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/manager/orders/${order.id}`)}
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono text-blue-700 font-semibold">
                          {order.request_id}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {order.crop}
                        </div>
                        {order.variety && (
                          <div className="text-xs text-gray-500">
                            Variety: {order.variety}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
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
                          <div className="flex items-center gap-1.5 text-xs text-gray-900 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            {new Date(order.deadline).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No deadline
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-900">
                          {order.requester?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.requester?.email || "-"}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
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
