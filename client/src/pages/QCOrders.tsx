import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  FileText,
  Clock,
  Package,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  ArrowLeft,
  Search,
  Filter,
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
}

export const QCOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" };
      case "reviewing":
        return { bg: "#E0E7FF", text: "#3730A3", border: "#C7D2FE" };
      case "allocated":
        return { bg: "#DBEAFE", text: "#1E40AF", border: "#93C5FD" };
      case "dispatched":
        return { bg: "#DDD6FE", text: "#5B21B6", border: "#C4B5FD" };
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

  const getStatusCounts = () => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      reviewing: orders.filter((o) => o.status === "reviewing").length,
      allocated: orders.filter((o) => o.status === "allocated").length,
      dispatched: orders.filter((o) => o.status === "dispatched").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
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
          <button
            onClick={() => navigate("/qc/upload")}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: "#48A111" }}
          >
            + New Order
          </button>
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
            const colors = getStatusColor(order.status);
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                onClick={() => navigate(`/qc/orders/${order.id}`)}
              >
                {/* Header */}
                <div className="p-5 border-b border-gray-100">
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
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
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
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
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

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Ordered{" "}
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </span>
                    <span className="text-green-600 font-medium hover:underline">
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
