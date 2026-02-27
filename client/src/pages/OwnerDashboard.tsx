import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../hooks/useInventory";
import { supabase } from "../lib/supabase";
import type { Warehouse } from "../lib/supabase";
import { MetricCards } from "../components/dashboard/MetricCards";
import { RiskChart } from "../components/dashboard/RiskChart";
import { InventoryTable } from "../components/dashboard/InventoryTable";
import { TrendingUp, Package, CheckCircle, Calendar } from "lucide-react";

interface WarehouseAnalytics {
  warehouse_id: string;
  warehouse_name: string;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_quantity: number;
  total_revenue: number;
  fulfillment_rate: number;
}

interface OrderTrend {
  date: string;
  count: number;
}

export const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<"overview" | "analytics">(
    "overview",
  );
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<
    string | undefined
  >(undefined);
  const [warehousesLoading, setWarehousesLoading] = useState(true);

  // Analytics state
  const [timePeriod, setTimePeriod] = useState<"7d" | "30d" | "90d" | "all">(
    "30d",
  );
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [warehouseAnalytics, setWarehouseAnalytics] = useState<
    WarehouseAnalytics[]
  >([]);
  const [orderTrends, setOrderTrends] = useState<OrderTrend[]>([]);
  const [totalMetrics, setTotalMetrics] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    avgFulfillmentRate: 0,
  });

  const { batches, stats, isLoading, error } =
    useInventory(selectedWarehouseId);

  // ── Load all warehouses ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchWarehouses = async () => {
      setWarehousesLoading(true);
      const { data } = await supabase
        .from("warehouses")
        .select("*")
        .order("name", { ascending: true });
      setWarehouses(data ?? []);
      setWarehousesLoading(false);
    };
    fetchWarehouses();
  }, []);

  // ── Fetch analytics data ───────────────────────────────────────────────────
  useEffect(() => {
    if (activeView !== "analytics") return;

    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        // Calculate date range
        let dateFilter = "";
        const now = new Date();
        if (timePeriod !== "all") {
          const daysAgo =
            timePeriod === "7d" ? 7 : timePeriod === "30d" ? 30 : 90;
          const startDate = new Date(now);
          startDate.setDate(startDate.getDate() - daysAgo);
          dateFilter = startDate.toISOString();
        }

        // Fetch all allocation requests with warehouse info
        let query = supabase.from("allocation_requests").select(`
            *,
            batches!inner(
              warehouse_id,
              warehouses(name)
            )
          `);

        if (dateFilter) {
          query = query.gte("created_at", dateFilter);
        }

        const { data: requests, error } = await query;

        if (error) throw error;

        // Group by warehouse
        const warehouseMap = new Map<string, WarehouseAnalytics>();
        const trendMap = new Map<string, number>();

        requests?.forEach((req: any) => {
          const warehouseId = req.batches.warehouse_id;
          const warehouseName = req.batches.warehouses?.name || "Unknown";
          const status = req.status;
          const quantity = parseFloat(req.quantity) || 0;
          const date = new Date(req.created_at).toISOString().split("T")[0];

          // Update warehouse analytics
          if (!warehouseMap.has(warehouseId)) {
            warehouseMap.set(warehouseId, {
              warehouse_id: warehouseId,
              warehouse_name: warehouseName,
              total_orders: 0,
              completed_orders: 0,
              cancelled_orders: 0,
              total_quantity: 0,
              total_revenue: 0,
              fulfillment_rate: 0,
            });
          }

          const analytics = warehouseMap.get(warehouseId)!;
          analytics.total_orders++;
          analytics.total_quantity += quantity;

          if (status === "completed") {
            analytics.completed_orders++;
          } else if (status === "cancelled") {
            analytics.cancelled_orders++;
          }

          // Update trend data
          trendMap.set(date, (trendMap.get(date) || 0) + 1);
        });

        // Calculate fulfillment rates
        const analyticsArray = Array.from(warehouseMap.values());
        analyticsArray.forEach((a) => {
          a.fulfillment_rate =
            a.total_orders > 0
              ? Math.round((a.completed_orders / a.total_orders) * 100)
              : 0;
        });

        // Sort by total orders descending
        analyticsArray.sort((a, b) => b.total_orders - a.total_orders);

        // Calculate total metrics
        const totals = {
          totalOrders: analyticsArray.reduce(
            (sum, a) => sum + a.total_orders,
            0,
          ),
          completedOrders: analyticsArray.reduce(
            (sum, a) => sum + a.completed_orders,
            0,
          ),
          totalRevenue: 0, // Can be calculated if price data is available
          avgFulfillmentRate:
            analyticsArray.length > 0
              ? Math.round(
                  analyticsArray.reduce(
                    (sum, a) => sum + a.fulfillment_rate,
                    0,
                  ) / analyticsArray.length,
                )
              : 0,
        };

        // Convert trend map to array, sorted by date
        const trendsArray = Array.from(trendMap.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setWarehouseAnalytics(analyticsArray);
        setOrderTrends(trendsArray);
        setTotalMetrics(totals);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [activeView, timePeriod]);

  const selectedWarehouse = warehouses.find(
    (w) => w.id === selectedWarehouseId,
  );

  // ── Loading / error states ───────────────────────────────────────────────────
  if (warehousesLoading) {
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
      {/* ── Page header with tabs ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Organization Overview
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Multi-warehouse inventory and performance monitoring
            </p>
          </div>

          {/* Warehouse selector - only show in overview */}
          {activeView === "overview" && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">
                Warehouse:
              </label>
              <select
                value={selectedWarehouseId ?? "all"}
                onChange={(e) =>
                  setSelectedWarehouseId(
                    e.target.value === "all" ? undefined : e.target.value,
                  )
                }
                className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 bg-white"
                style={
                  {
                    borderColor: "#E5E7EB",
                    "--tw-ring-color": "#48A111",
                  } as React.CSSProperties
                }
              >
                <option value="all">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Time period selector - only show in analytics */}
          {activeView === "analytics" && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">
                Period:
              </label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as any)}
                className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 bg-white"
                style={
                  {
                    borderColor: "#E5E7EB",
                    "--tw-ring-color": "#48A111",
                  } as React.CSSProperties
                }
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          )}
        </div>

        {/* View tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveView("overview")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeView === "overview"
                ? "border-[#48A111] text-[#48A111]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView("analytics")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeView === "analytics"
                ? "border-[#48A111] text-[#48A111]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* ── OVERVIEW VIEW ── */}
      {activeView === "overview" && (
        <>
          {/* ── Summary cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Warehouse count with link */}
            <div
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/owner/warehouses")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Total Warehouses
                  </p>
                  <p
                    className="text-2xl font-bold mt-1"
                    style={{ color: "#25671E" }}
                  >
                    {warehouses.length}
                  </p>
                  <button
                    className="text-xs font-medium mt-2 hover:underline"
                    style={{ color: "#48A111" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/owner/warehouses");
                    }}
                  >
                    View all →
                  </button>
                </div>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#48A11120" }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: "#48A111" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Batch count (filtered by warehouse if selected) */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Active Batches
                  </p>
                  <p
                    className="text-2xl font-bold mt-1"
                    style={{ color: "#25671E" }}
                  >
                    {stats.total}
                  </p>
                  {selectedWarehouse && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {selectedWarehouse.name}
                    </p>
                  )}
                </div>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#48A11120" }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: "#48A111" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* High-risk count */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">High Risk</p>
                  <p
                    className="text-2xl font-bold mt-1"
                    style={{ color: "#DC2626" }}
                  >
                    {stats.highRisk}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#DC262610" }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: "#DC2626" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total inventory weight */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Total Stock
                  </p>
                  <p
                    className="text-2xl font-bold mt-1"
                    style={{ color: "#25671E" }}
                  >
                    {(stats.totalQuantity / 1000).toFixed(1)}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      tons
                    </span>
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#F2B50B20" }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: "#F2B50B" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ── Metric cards ── */}
          <MetricCards
            totalBatches={stats.total}
            freshCount={stats.fresh}
            moderateCount={stats.moderate}
            highRiskCount={stats.highRisk}
            totalQuantity={stats.totalQuantity}
            warehouseName={selectedWarehouse?.name}
          />

          {/* ── Risk chart ── */}
          <RiskChart batches={batches} />

          {/* ── Read-only inventory table ── */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">
                {selectedWarehouse
                  ? `${selectedWarehouse.name} Inventory`
                  : "All Inventory"}
              </h2>
              <button
                onClick={() => navigate("/owner/inventory")}
                className="text-xs font-medium hover:underline"
                style={{ color: "#48A111" }}
              >
                View all →
              </button>
            </div>
            {isLoading ? (
              <div className="p-12 text-center">
                <div
                  className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto"
                  style={{
                    borderColor: "#48A111",
                    borderTopColor: "transparent",
                  }}
                />
              </div>
            ) : (
              <InventoryTable
                batches={batches}
                maxRows={10}
                readOnly
                onView={(id) => navigate(`/owner/batch/${id}`)}
              />
            )}
          </div>
        </>
      )}

      {/* ── ANALYTICS VIEW ── */}
      {activeView === "analytics" && (
        <>
          {analyticsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div
                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                style={{
                  borderColor: "#48A111",
                  borderTopColor: "transparent",
                }}
              />
            </div>
          ) : (
            <>
              {/* Summary metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Orders */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Total Orders
                      </p>
                      <p
                        className="text-2xl font-bold mt-1"
                        style={{ color: "#25671E" }}
                      >
                        {totalMetrics.totalOrders}
                      </p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#48A11120" }}
                    >
                      <Package
                        className="w-6 h-6"
                        style={{ color: "#48A111" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Completed Orders */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Completed
                      </p>
                      <p
                        className="text-2xl font-bold mt-1"
                        style={{ color: "#48A111" }}
                      >
                        {totalMetrics.completedOrders}
                      </p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#48A11120" }}
                    >
                      <CheckCircle
                        className="w-6 h-6"
                        style={{ color: "#48A111" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Average Fulfillment Rate */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Avg Fulfillment
                      </p>
                      <p
                        className="text-2xl font-bold mt-1"
                        style={{ color: "#F2B50B" }}
                      >
                        {totalMetrics.avgFulfillmentRate}%
                      </p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#F2B50B20" }}
                    >
                      <TrendingUp
                        className="w-6 h-6"
                        style={{ color: "#F2B50B" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Timeframe */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Time Period
                      </p>
                      <p
                        className="text-2xl font-bold mt-1"
                        style={{ color: "#25671E" }}
                      >
                        {timePeriod === "7d"
                          ? "7 Days"
                          : timePeriod === "30d"
                            ? "30 Days"
                            : timePeriod === "90d"
                              ? "90 Days"
                              : "All Time"}
                      </p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#48A11120" }}
                    >
                      <Calendar
                        className="w-6 h-6"
                        style={{ color: "#48A111" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Warehouse Performance Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Warehouse Performance
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Order fulfillment metrics by location
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Warehouse
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Orders
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completed
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cancelled
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fulfillment Rate
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Quantity (kg)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {warehouseAnalytics.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-12 text-center text-sm text-gray-500"
                          >
                            No order data available for the selected time period
                          </td>
                        </tr>
                      ) : (
                        warehouseAnalytics.map((warehouse) => (
                          <tr
                            key={warehouse.warehouse_id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {warehouse.warehouse_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="text-sm text-gray-900 font-medium">
                                {warehouse.total_orders}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span
                                className="text-sm font-medium"
                                style={{ color: "#48A111" }}
                              >
                                {warehouse.completed_orders}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span
                                className="text-sm font-medium"
                                style={{ color: "#DC2626" }}
                              >
                                {warehouse.cancelled_orders}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full transition-all"
                                    style={{
                                      width: `${warehouse.fulfillment_rate}%`,
                                      backgroundColor:
                                        warehouse.fulfillment_rate >= 80
                                          ? "#48A111"
                                          : warehouse.fulfillment_rate >= 50
                                            ? "#F2B50B"
                                            : "#DC2626",
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {warehouse.fulfillment_rate}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="text-sm text-gray-900">
                                {warehouse.total_quantity.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Trend Chart */}
              {orderTrends.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Order Trends
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Daily order volume over time
                    </p>
                  </div>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {orderTrends.map((trend, idx) => {
                      const maxCount = Math.max(
                        ...orderTrends.map((t) => t.count),
                      );
                      const heightPercent = (trend.count / maxCount) * 100;
                      return (
                        <div
                          key={idx}
                          className="flex-1 flex flex-col items-center gap-2"
                        >
                          <div className="text-xs font-medium text-gray-900">
                            {trend.count}
                          </div>
                          <div
                            className="w-full rounded-t transition-all hover:opacity-80"
                            style={{
                              height: `${heightPercent}%`,
                              backgroundColor: "#48A111",
                              minHeight: trend.count > 0 ? "8px" : "0",
                            }}
                          />
                          <div className="text-xs text-gray-500">
                            {new Date(trend.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
