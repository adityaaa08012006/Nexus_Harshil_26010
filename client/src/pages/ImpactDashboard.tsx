import React, { useEffect, useState, useCallback } from "react";
import { useAuthContext } from "../context/AuthContext";
import { API_URL } from "../config/api";
import { useAuth } from "../hooks/useAuth";
import {
  Leaf,
  DollarSign,
  Gauge,
  ShieldCheck,
  Download,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Factory,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OverviewData {
  activeBatches: number;
  expiredBatches: number;
  dispatchedBatches: number;
  freshCount: number;
  moderateCount: number;
  highRiskCount: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  fulfillmentRate: number;
  totalDispatches: number;
  deliveredDispatches: number;
  totalAlerts: number;
  acknowledgedAlerts: number;
}

interface WasteData {
  totalBatches: number;
  expiredBatches: number;
  totalQuantity: number;
  expiredQuantity: number;
  currentSpoilageRate: number;
  baselineSpoilageRate: number;
  wasteReductionPct: number;
  quantitySaved: number;
  timeline: {
    month: string;
    spoilageRate: number;
    baselineRate: number;
    total: number;
    expired: number;
  }[];
}

interface EfficiencyData {
  totalRequests: number;
  completedRequests: number;
  cancelledRequests: number;
  pendingRequests: number;
  fulfillmentRate: number;
  avgDispatchTimeDays: number;
  totalDispatches: number;
  perWarehouse: {
    warehouse_id: string;
    warehouse_name: string;
    total: number;
    completed: number;
    cancelled: number;
    fulfillmentRate: number;
    totalQty: number;
  }[];
}

interface ROIData {
  totalQuantity: number;
  expiredQuantity: number;
  quantitySaved: number;
  baselineCost: number;
  actualCost: number;
  costSaved: number;
  roiPercentage: number;
  avgPricePerKg: number;
  timeline: {
    month: string;
    baselineLoss: number;
    actualLoss: number;
    savings: number;
    cumulativeSavings: number;
  }[];
}

interface ComparisonWarehouse {
  warehouse_id: string;
  warehouse_name: string;
  location: string;
  capacity: number;
  totalBatches: number;
  activeBatches: number;
  expiredBatches: number;
  totalQuantity: number;
  avgRiskScore: number;
  freshCount: number;
  moderateCount: number;
  highRiskCount: number;
  totalOrders: number;
  completedOrders: number;
  fulfillmentRate: number;
}

type Period = "7d" | "30d" | "90d" | "ytd" | "all";

const API_BASE = `${API_URL}/api/analytics`;

const BRAND = {
  green: "#48A111",
  greenDark: "#25671E",
  greenLight: "#E8F5E0",
  yellow: "#F2B50B",
  yellowLight: "#FEF9E7",
  red: "#DC2626",
  redLight: "#FEF2F2",
  blue: "#2563EB",
  blueLight: "#EFF6FF",
};

// ─── Component ────────────────────────────────────────────────────────────────

export const ImpactDashboard: React.FC = () => {
  const { session } = useAuthContext();
  const { isOwner } = useAuth();

  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [waste, setWaste] = useState<WasteData | null>(null);
  const [efficiency, setEfficiency] = useState<EfficiencyData | null>(null);
  const [roi, setROI] = useState<ROIData | null>(null);
  const [comparison, setComparison] = useState<ComparisonWarehouse[]>([]);

  const headers = useCallback(() => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) {
      h["Authorization"] = `Bearer ${session.access_token}`;
    }
    return h;
  }, [session]);

  const fetchData = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setError(null);

    try {
      const qs = `?period=${period}`;
      const opts = { headers: headers() };

      const [overviewRes, wasteRes, efficiencyRes, roiRes] = await Promise.all([
        fetch(`${API_BASE}/overview${qs}`, opts),
        fetch(`${API_BASE}/waste-reduction${qs}`, opts),
        fetch(`${API_BASE}/efficiency${qs}`, opts),
        fetch(`${API_BASE}/roi${qs}`, opts),
      ]);

      const [overviewJson, wasteJson, effJson, roiJson] = await Promise.all([
        overviewRes.json(),
        wasteRes.json(),
        efficiencyRes.json(),
        roiRes.json(),
      ]);

      setOverview(overviewJson.data || null);
      setWaste(wasteJson.data || null);
      setEfficiency(effJson.data || null);
      setROI(roiJson.data || null);

      // Owner-only: warehouse comparison
      if (isOwner()) {
        const compRes = await fetch(`${API_BASE}/comparison${qs}`, opts);
        const compJson = await compRes.json();
        setComparison(compJson.data?.warehouses || []);
      }
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [session, period, headers, isOwner]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async (format: "csv" | "json") => {
    if (!session?.access_token) return;
    try {
      const res = await fetch(
        `${API_BASE}/export?period=${period}&format=${format}`,
        {
          headers: headers(),
        },
      );
      if (format === "csv") {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-report-${period}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-report-${period}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: BRAND.green, borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl p-6 border text-sm"
        style={{
          backgroundColor: BRAND.redLight,
          borderColor: BRAND.red,
          color: BRAND.red,
        }}
      >
        Failed to load analytics: {error}
        <button onClick={fetchData} className="ml-4 underline">
          Retry
        </button>
      </div>
    );
  }

  const periodLabel: Record<Period, string> = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
    ytd: "Year to Date",
    all: "All Time",
  };

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" style={{ color: BRAND.green }} />
              Impact Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Analytics & performance metrics across your operations
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Date range selector */}
            <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
              {(["7d", "30d", "90d", "ytd", "all"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    period === p
                      ? "text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  style={period === p ? { backgroundColor: BRAND.green } : {}}
                >
                  {p === "ytd" ? "YTD" : p === "all" ? "All" : p.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Actions */}
            <button
              onClick={fetchData}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="relative group">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                style={{ backgroundColor: BRAND.green }}
                onClick={() => handleExport("csv")}
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Key Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Leaf className="w-5 h-5" />}
          iconBg={BRAND.greenLight}
          iconColor={BRAND.green}
          label="Waste Reduced"
          value={`${waste?.wasteReductionPct ?? 0}%`}
          subtitle={`${waste?.quantitySaved?.toLocaleString("en-IN") ?? 0} kg saved`}
          trend={
            waste?.wasteReductionPct && waste.wasteReductionPct > 0
              ? "up"
              : "neutral"
          }
        />
        <MetricCard
          icon={<DollarSign className="w-5 h-5" />}
          iconBg={BRAND.blueLight}
          iconColor={BRAND.blue}
          label="Cost Savings"
          value={`₹${roi?.costSaved?.toLocaleString("en-IN") ?? 0}`}
          subtitle={`${roi?.roiPercentage ?? 0}% ROI improvement`}
          trend={roi?.costSaved && roi.costSaved > 0 ? "up" : "neutral"}
        />
        <MetricCard
          icon={<Gauge className="w-5 h-5" />}
          iconBg={BRAND.yellowLight}
          iconColor={BRAND.yellow}
          label="Fulfillment Rate"
          value={`${efficiency?.fulfillmentRate ?? 0}%`}
          subtitle={`${efficiency?.avgDispatchTimeDays ?? 0} days avg dispatch`}
          trend={
            efficiency?.fulfillmentRate && efficiency.fulfillmentRate >= 70
              ? "up"
              : "down"
          }
        />
        <MetricCard
          icon={<ShieldCheck className="w-5 h-5" />}
          iconBg={BRAND.redLight}
          iconColor={BRAND.red}
          label="Interventions"
          value={`${overview?.acknowledgedAlerts ?? 0}/${overview?.totalAlerts ?? 0}`}
          subtitle={
            overview && overview.totalAlerts > 0
              ? `${Math.round((overview.acknowledgedAlerts / overview.totalAlerts) * 100)}% resolved`
              : "No alerts in period"
          }
          trend={
            overview &&
            overview.totalAlerts > 0 &&
            overview.acknowledgedAlerts / overview.totalAlerts >= 0.7
              ? "up"
              : "neutral"
          }
        />
      </div>

      {/* ── Charts Row 1: Waste Reduction + ROI ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Reduction Trend */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Waste Reduction Trend
          </h3>
          {waste?.timeline && waste.timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={waste.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  stroke="#9CA3AF"
                />
                <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" unit="%" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    fontSize: "12px",
                  }}
                  formatter={(value: any, name?: string) => [
                    `${value}%`,
                    name === "spoilageRate" ? "Current" : "Baseline",
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    value === "spoilageRate"
                      ? "Current Spoilage"
                      : "Industry Baseline"
                  }
                  wrapperStyle={{ fontSize: "11px" }}
                />
                <Line
                  type="monotone"
                  dataKey="baselineRate"
                  stroke={BRAND.red}
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="spoilageRate"
                  stroke={BRAND.green}
                  strokeWidth={2}
                  dot={{ r: 3, fill: BRAND.green }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No spoilage data for this period" />
          )}
        </div>

        {/* ROI Growth */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            ROI & Savings Growth
          </h3>
          {roi?.timeline && roi.timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={roi.timeline}>
                <defs>
                  <linearGradient
                    id="greenGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={BRAND.green}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={BRAND.green}
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  stroke="#9CA3AF"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#9CA3AF"
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [
                    `₹${Number(value).toLocaleString("en-IN")}`,
                    "",
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area
                  type="monotone"
                  dataKey="cumulativeSavings"
                  name="Cumulative Savings"
                  stroke={BRAND.green}
                  fill="url(#greenGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  name="Monthly Savings"
                  stroke={BRAND.greenDark}
                  fill="transparent"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No ROI data for this period" />
          )}
        </div>
      </div>

      {/* ── Charts Row 2: Before/After + Efficiency Gauge ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Before/After Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Before vs After Comparison
          </h3>
          <BeforeAfterChart waste={waste} roi={roi} />
        </div>

        {/* Efficiency Gauges */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Efficiency Metrics
          </h3>
          <div className="grid grid-cols-2 gap-6 py-2">
            <GaugeChart
              label="Fulfillment Rate"
              value={efficiency?.fulfillmentRate ?? 0}
              color={BRAND.green}
            />
            <GaugeChart
              label="Alert Resolution"
              value={
                overview && overview.totalAlerts > 0
                  ? Math.round(
                      (overview.acknowledgedAlerts / overview.totalAlerts) *
                        100,
                    )
                  : 0
              }
              color={BRAND.blue}
            />
            <GaugeChart
              label="Dispatch Efficiency"
              value={
                efficiency && efficiency.totalRequests > 0
                  ? Math.round(
                      ((efficiency.totalRequests -
                        efficiency.cancelledRequests) /
                        efficiency.totalRequests) *
                        100,
                    )
                  : 0
              }
              color={BRAND.yellow}
            />
            <GaugeChart
              label="Inventory Health"
              value={
                overview && overview.activeBatches > 0
                  ? Math.round(
                      (overview.freshCount / overview.activeBatches) * 100,
                    )
                  : 0
              }
              color={BRAND.greenDark}
            />
          </div>
        </div>
      </div>

      {/* ── Warehouse Performance Comparison (Owner only) ── */}
      {isOwner() && comparison.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Factory className="w-4 h-4" style={{ color: BRAND.green }} />
            Warehouse Performance Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 pr-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Warehouse
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">
                    Batches
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">
                    Quantity
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">
                    Avg Risk
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Risk Distribution
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">
                    Orders
                  </th>
                  <th className="py-3 pl-4 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">
                    Fulfillment
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((wh) => (
                  <tr
                    key={wh.warehouse_id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <div className="font-medium text-gray-900">
                        {wh.warehouse_name}
                      </div>
                      <div className="text-xs text-gray-500">{wh.location}</div>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {wh.activeBatches}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {wh.totalQuantity.toLocaleString("en-IN")} kg
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor:
                            wh.avgRiskScore <= 30
                              ? BRAND.greenLight
                              : wh.avgRiskScore <= 70
                                ? BRAND.yellowLight
                                : BRAND.redLight,
                          color:
                            wh.avgRiskScore <= 30
                              ? BRAND.green
                              : wh.avgRiskScore <= 70
                                ? "#92400E"
                                : BRAND.red,
                        }}
                      >
                        {wh.avgRiskScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <RiskBar
                        fresh={wh.freshCount}
                        moderate={wh.moderateCount}
                        high={wh.highRiskCount}
                      />
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {wh.totalOrders}
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${wh.fulfillmentRate}%`,
                              backgroundColor:
                                wh.fulfillmentRate >= 70
                                  ? BRAND.green
                                  : wh.fulfillmentRate >= 40
                                    ? BRAND.yellow
                                    : BRAND.red,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {wh.fulfillmentRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Per-Warehouse Efficiency Table ── */}
      {efficiency?.perWarehouse && efficiency.perWarehouse.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Allocation Efficiency by Warehouse
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 pr-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Warehouse
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">
                    Total Orders
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">
                    Completed
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">
                    Cancelled
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">
                    Total Qty (kg)
                  </th>
                  <th className="py-3 pl-4 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">
                    Fulfillment Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {efficiency.perWarehouse.map((wh) => (
                  <tr
                    key={wh.warehouse_id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 pr-4 font-medium text-gray-900">
                      {wh.warehouse_name}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {wh.total}
                    </td>
                    <td
                      className="py-3 px-4 text-right"
                      style={{ color: BRAND.green }}
                    >
                      {wh.completed}
                    </td>
                    <td
                      className="py-3 px-4 text-right"
                      style={{ color: BRAND.red }}
                    >
                      {wh.cancelled}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {wh.totalQty.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${wh.fulfillmentRate}%`,
                              backgroundColor:
                                wh.fulfillmentRate >= 70
                                  ? BRAND.green
                                  : wh.fulfillmentRate >= 40
                                    ? BRAND.yellow
                                    : BRAND.red,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {wh.fulfillmentRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Summary Stats Footer ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Period Summary
          </h3>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {periodLabel[period]}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <SummaryItem
            label="Active Batches"
            value={overview?.activeBatches ?? 0}
          />
          <SummaryItem
            label="Total Orders"
            value={overview?.totalOrders ?? 0}
          />
          <SummaryItem
            label="Completed"
            value={overview?.completedOrders ?? 0}
            color={BRAND.green}
          />
          <SummaryItem
            label="Cancelled"
            value={overview?.cancelledOrders ?? 0}
            color={BRAND.red}
          />
          <SummaryItem
            label="Dispatches"
            value={overview?.totalDispatches ?? 0}
          />
          <SummaryItem
            label="Delivered"
            value={overview?.deliveredDispatches ?? 0}
            color={BRAND.green}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  subtitle: string;
  trend: "up" | "down" | "neutral";
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  subtitle,
  trend,
}) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      {trend === "up" && (
        <ArrowUpRight className="w-4 h-4" style={{ color: BRAND.green }} />
      )}
      {trend === "down" && (
        <ArrowDownRight className="w-4 h-4" style={{ color: BRAND.red }} />
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    <p
      className="text-xs mt-1"
      style={{
        color:
          trend === "up"
            ? BRAND.green
            : trend === "down"
              ? BRAND.red
              : "#6B7280",
      }}
    >
      {subtitle}
    </p>
  </div>
);

const EmptyChart: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center justify-center h-[280px] text-sm text-gray-400">
    {message}
  </div>
);

interface GaugeChartProps {
  label: string;
  value: number;
  color: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ label, value, color }) => {
  const circumference = 2 * Math.PI * 40;
  const progress = (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        className="transform -rotate-90"
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#F3F4F6"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="text-lg font-bold text-gray-900 -mt-[62px] mb-8">
        {value}%
      </span>
      <p className="text-xs text-gray-500 mt-1 text-center">{label}</p>
    </div>
  );
};

interface BeforeAfterChartProps {
  waste: WasteData | null;
  roi: ROIData | null;
}

const BeforeAfterChart: React.FC<BeforeAfterChartProps> = ({ waste, roi }) => {
  const data = [
    {
      metric: "Spoilage Rate",
      before: waste?.baselineSpoilageRate ?? 15,
      after: waste?.currentSpoilageRate ?? 0,
    },
    {
      metric: "Waste Cost",
      before: roi
        ? Math.round((roi.baselineCost / Math.max(roi.baselineCost, 1)) * 100)
        : 100,
      after: roi
        ? Math.round((roi.actualCost / Math.max(roi.baselineCost, 1)) * 100)
        : 0,
    },
  ];

  if (!waste && !roi)
    return <EmptyChart message="No comparison data available" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" barGap={4}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f0f0f0"
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fontSize: 11 }}
          stroke="#9CA3AF"
          unit="%"
          domain={[0, 100]}
        />
        <YAxis
          type="category"
          dataKey="metric"
          tick={{ fontSize: 11 }}
          stroke="#9CA3AF"
          width={90}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            fontSize: "12px",
          }}
          formatter={(value: any, name?: string) => [
            `${value}%`,
            name === "before" ? "Before (Baseline)" : "After (Current)",
          ]}
        />
        <Legend
          formatter={(value) =>
            value === "before" ? "Before (Baseline)" : "After (Current)"
          }
          wrapperStyle={{ fontSize: "11px" }}
        />
        <Bar
          dataKey="before"
          fill={BRAND.red}
          radius={[0, 4, 4, 0]}
          barSize={20}
          name="before"
        />
        <Bar
          dataKey="after"
          fill={BRAND.green}
          radius={[0, 4, 4, 0]}
          barSize={20}
          name="after"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

interface RiskBarProps {
  fresh: number;
  moderate: number;
  high: number;
}

const RiskBar: React.FC<RiskBarProps> = ({ fresh, moderate, high }) => {
  const total = fresh + moderate + high;
  if (total === 0) return <span className="text-xs text-gray-400">—</span>;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex h-1.5 w-24 rounded-full overflow-hidden bg-gray-100">
        <div
          style={{
            width: `${(fresh / total) * 100}%`,
            backgroundColor: BRAND.green,
          }}
        />
        <div
          style={{
            width: `${(moderate / total) * 100}%`,
            backgroundColor: BRAND.yellow,
          }}
        />
        <div
          style={{
            width: `${(high / total) * 100}%`,
            backgroundColor: BRAND.red,
          }}
        />
      </div>
      <span className="text-[10px] text-gray-400">
        {fresh}/{moderate}/{high}
      </span>
    </div>
  );
};

interface SummaryItemProps {
  label: string;
  value: number;
  color?: string;
}

const SummaryItem: React.FC<SummaryItemProps> = ({ label, value, color }) => (
  <div>
    <p className="text-lg font-bold" style={{ color: color || "#111827" }}>
      {value.toLocaleString("en-IN")}
    </p>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
);

export default ImpactDashboard;
