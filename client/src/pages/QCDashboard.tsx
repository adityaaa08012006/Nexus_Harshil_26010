import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  Upload,
  FileText,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
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
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    allocated: 0,
    completed: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
};
