/**
 * Analytics Service — Godam Solutions Phase 8
 *
 * Provides computed metrics for the Impact Dashboard:
 *   - Waste reduction (baseline vs current spoilage)
 *   - Inventory turnover rate
 *   - Allocation efficiency (fulfillment rate, avg dispatch time)
 *   - Cost savings / ROI calculation
 *   - Risk intervention success rate
 *
 * All functions accept a supabaseAdmin client and optional filters.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns an ISO date string for N days ago from now.
 */
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

/**
 * Resolves the day-count for a period string.
 * @param {"7d"|"30d"|"90d"|"ytd"|"all"|string} period
 * @returns {number|null} null = all time
 */
const periodToDays = (period) => {
  if (period === "7d") return 7;
  if (period === "30d") return 30;
  if (period === "90d") return 90;
  if (period === "ytd") {
    const now = new Date();
    const jan1 = new Date(now.getFullYear(), 0, 1);
    return Math.ceil((now - jan1) / 86_400_000);
  }
  return null; // "all"
};

/**
 * Apply a date range filter to a Supabase query builder.
 */
const applyDateRange = (query, column, period, customStart, customEnd) => {
  if (customStart) {
    query = query.gte(column, new Date(customStart).toISOString());
  }
  if (customEnd) {
    query = query.lte(column, new Date(customEnd).toISOString());
  }
  if (!customStart && !customEnd) {
    const days = periodToDays(period || "30d");
    if (days !== null) {
      query = query.gte(column, daysAgo(days));
    }
  }
  return query;
};

// ─── Overview summary ─────────────────────────────────────────────────────────

/**
 * Returns high-level stats visible to the current user's role.
 */
export async function getOverview(supabase, { period, customStart, customEnd, warehouseId }) {
  // Total active batches
  let batchQuery = supabase.from("batches").select("*", { count: "exact" }).eq("status", "active");
  if (warehouseId) batchQuery = batchQuery.eq("warehouse_id", warehouseId);
  const { count: activeBatches } = await batchQuery;

  // All batches (for risk breakdown)
  let allBatchQuery = supabase.from("batches").select("risk_score, status, quantity, warehouse_id");
  if (warehouseId) allBatchQuery = allBatchQuery.eq("warehouse_id", warehouseId);
  const { data: batches } = await allBatchQuery;

  const active = (batches || []).filter((b) => b.status === "active");
  const expired = (batches || []).filter((b) => b.status === "expired");
  const dispatched = (batches || []).filter((b) => b.status === "dispatched");

  const freshCount = active.filter((b) => (b.risk_score ?? 0) <= 30).length;
  const moderateCount = active.filter((b) => (b.risk_score ?? 0) > 30 && (b.risk_score ?? 0) <= 70).length;
  const highRiskCount = active.filter((b) => (b.risk_score ?? 0) > 70).length;

  // Allocation requests
  let allocQuery = supabase.from("allocation_requests").select("*");
  allocQuery = applyDateRange(allocQuery, "created_at", period, customStart, customEnd);
  const { data: allocations } = await allocQuery;

  const allocs = allocations || [];
  const totalOrders = allocs.length;
  const completedOrders = allocs.filter((a) => a.status === "completed").length;
  const cancelledOrders = allocs.filter((a) => a.status === "cancelled").length;
  const fulfillmentRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  // Dispatches
  let dispatchQuery = supabase.from("dispatches").select("*");
  dispatchQuery = applyDateRange(dispatchQuery, "dispatch_date", period, customStart, customEnd);
  const { data: dispatches } = await dispatchQuery;

  const totalDispatches = (dispatches || []).length;
  const deliveredDispatches = (dispatches || []).filter((d) => d.status === "delivered").length;

  // Alerts in period
  let alertQuery = supabase.from("alerts").select("*", { count: "exact" });
  alertQuery = applyDateRange(alertQuery, "created_at", period, customStart, customEnd);
  if (warehouseId) alertQuery = alertQuery.eq("warehouse_id", warehouseId);
  const { count: totalAlerts } = await alertQuery;

  let ackAlertQuery = supabase.from("alerts").select("*", { count: "exact" }).eq("is_acknowledged", true);
  ackAlertQuery = applyDateRange(ackAlertQuery, "created_at", period, customStart, customEnd);
  if (warehouseId) ackAlertQuery = ackAlertQuery.eq("warehouse_id", warehouseId);
  const { count: acknowledgedAlerts } = await ackAlertQuery;

  return {
    activeBatches: activeBatches || 0,
    expiredBatches: expired.length,
    dispatchedBatches: dispatched.length,
    freshCount,
    moderateCount,
    highRiskCount,
    totalOrders,
    completedOrders,
    cancelledOrders,
    fulfillmentRate,
    totalDispatches,
    deliveredDispatches,
    totalAlerts: totalAlerts || 0,
    acknowledgedAlerts: acknowledgedAlerts || 0,
  };
}

// ─── Waste Reduction ──────────────────────────────────────────────────────────

/**
 * Waste reduction metrics:
 *   - Spoilage rate (expired / total batches)
 *   - Baseline spoilage rate (assumed 15% industry standard before system)
 *   - Waste reduction percentage
 *   - Quantity saved (kg)
 *   - Time-series: monthly spoilage rates
 */
export async function getWasteReduction(supabase, { period, customStart, customEnd, warehouseId }) {
  const BASELINE_SPOILAGE_RATE = 0.15; // 15% industry avg pre-system

  let batchQuery = supabase.from("batches").select("id, status, quantity, entry_date, warehouse_id, risk_score");
  if (warehouseId) batchQuery = batchQuery.eq("warehouse_id", warehouseId);
  batchQuery = applyDateRange(batchQuery, "entry_date", period, customStart, customEnd);
  const { data: batches } = await batchQuery;

  const all = batches || [];
  const totalBatches = all.length;
  const expiredBatches = all.filter((b) => b.status === "expired").length;
  const totalQuantity = all.reduce((s, b) => s + (parseFloat(b.quantity) || 0), 0);
  const expiredQuantity = all.filter((b) => b.status === "expired").reduce((s, b) => s + (parseFloat(b.quantity) || 0), 0);

  const currentSpoilageRate = totalBatches > 0 ? expiredBatches / totalBatches : 0;
  const wasteReductionPct = Math.max(0, Math.round((BASELINE_SPOILAGE_RATE - currentSpoilageRate) * 100));
  const quantitySaved = Math.round(totalQuantity * BASELINE_SPOILAGE_RATE - expiredQuantity);

  // Monthly spoilage time-series
  const monthMap = new Map();
  all.forEach((b) => {
    const month = b.entry_date?.slice(0, 7); // "YYYY-MM"
    if (!month) return;
    if (!monthMap.has(month)) monthMap.set(month, { total: 0, expired: 0 });
    const m = monthMap.get(month);
    m.total++;
    if (b.status === "expired") m.expired++;
  });

  const timeline = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { total, expired }]) => ({
      month,
      spoilageRate: total > 0 ? Math.round((expired / total) * 100) : 0,
      baselineRate: Math.round(BASELINE_SPOILAGE_RATE * 100),
      total,
      expired,
    }));

  return {
    totalBatches,
    expiredBatches,
    totalQuantity: Math.round(totalQuantity),
    expiredQuantity: Math.round(expiredQuantity),
    currentSpoilageRate: Math.round(currentSpoilageRate * 100),
    baselineSpoilageRate: Math.round(BASELINE_SPOILAGE_RATE * 100),
    wasteReductionPct,
    quantitySaved: Math.max(0, quantitySaved),
    timeline,
  };
}

// ─── Allocation Efficiency ────────────────────────────────────────────────────

/**
 * Efficiency metrics:
 *   - Fulfillment rate
 *   - Average dispatch time (request → dispatch in days)
 *   - Per-warehouse breakdown
 */
export async function getEfficiency(supabase, { period, customStart, customEnd, warehouseId }) {
  // Allocation requests with joins
  let allocQuery = supabase.from("allocation_requests").select("*");
  allocQuery = applyDateRange(allocQuery, "created_at", period, customStart, customEnd);
  const { data: allocs } = await allocQuery;

  // Dispatches with timing
  let dispatchQuery = supabase.from("dispatches").select("*, allocation_requests(created_at, warehouse_id, crop)");
  dispatchQuery = applyDateRange(dispatchQuery, "dispatch_date", period, customStart, customEnd);
  const { data: dispatches } = await dispatchQuery;

  const requests = allocs || [];
  const disps = dispatches || [];

  const totalRequests = requests.length;
  const completed = requests.filter((r) => r.status === "completed").length;
  const fulfillmentRate = totalRequests > 0 ? Math.round((completed / totalRequests) * 100) : 0;

  // Average dispatch time (days between request creation and dispatch date)
  const dispatchTimes = disps
    .filter((d) => d.allocation_requests?.created_at)
    .map((d) => {
      const created = new Date(d.allocation_requests.created_at);
      const dispatched = new Date(d.dispatch_date);
      return Math.max(0, (dispatched - created) / 86_400_000);
    });

  const avgDispatchTime =
    dispatchTimes.length > 0
      ? Math.round((dispatchTimes.reduce((s, t) => s + t, 0) / dispatchTimes.length) * 10) / 10
      : 0;

  // Per-warehouse efficiency
  const warehouseMap = new Map();
  requests.forEach((r) => {
    const wid = r.warehouse_id || "unknown";
    if (!warehouseMap.has(wid)) {
      warehouseMap.set(wid, { warehouse_id: wid, total: 0, completed: 0, cancelled: 0, totalQty: 0 });
    }
    const w = warehouseMap.get(wid);
    w.total++;
    w.totalQty += parseFloat(r.quantity) || 0;
    if (r.status === "completed") w.completed++;
    if (r.status === "cancelled") w.cancelled++;
  });

  // Fetch warehouse names
  const warehouseIds = Array.from(warehouseMap.keys()).filter((id) => id !== "unknown");
  let warehouseNames = {};
  if (warehouseIds.length) {
    const { data: whs } = await supabase.from("warehouses").select("id, name").in("id", warehouseIds);
    if (whs) warehouseNames = Object.fromEntries(whs.map((w) => [w.id, w.name]));
  }

  const perWarehouse = Array.from(warehouseMap.values()).map((w) => ({
    ...w,
    warehouse_name: warehouseNames[w.warehouse_id] || "Unknown",
    fulfillmentRate: w.total > 0 ? Math.round((w.completed / w.total) * 100) : 0,
    totalQty: Math.round(w.totalQty),
  }));

  return {
    totalRequests,
    completedRequests: completed,
    cancelledRequests: requests.filter((r) => r.status === "cancelled").length,
    pendingRequests: requests.filter((r) => ["pending", "reviewing"].includes(r.status)).length,
    fulfillmentRate,
    avgDispatchTimeDays: avgDispatchTime,
    totalDispatches: disps.length,
    perWarehouse: perWarehouse.sort((a, b) => b.total - a.total),
  };
}

// ─── ROI Calculation ──────────────────────────────────────────────────────────

/**
 * ROI estimate:
 *   - Cost of spoiled goods at avg market price
 *   - Estimated savings from waste reduction
 *   - Efficiency gains from faster dispatch
 *   - Monthly ROI trend
 */
export async function getROI(supabase, { period, customStart, customEnd, warehouseId }) {
  const AVG_PRICE_PER_KG = 25; // ₹25/kg average across crops
  const BASELINE_SPOILAGE = 0.15;

  let batchQuery = supabase.from("batches").select("id, status, quantity, entry_date, risk_score, warehouse_id");
  if (warehouseId) batchQuery = batchQuery.eq("warehouse_id", warehouseId);
  batchQuery = applyDateRange(batchQuery, "entry_date", period, customStart, customEnd);
  const { data: batches } = await batchQuery;

  const all = batches || [];
  const totalQty = all.reduce((s, b) => s + (parseFloat(b.quantity) || 0), 0);
  const expiredQty = all.filter((b) => b.status === "expired").reduce((s, b) => s + (parseFloat(b.quantity) || 0), 0);

  const baselineLoss = totalQty * BASELINE_SPOILAGE;
  const actualLoss = expiredQty;
  const quantitySaved = Math.max(0, Math.round(baselineLoss - actualLoss));
  const costSaved = quantitySaved * AVG_PRICE_PER_KG;
  const baselineCost = Math.round(baselineLoss * AVG_PRICE_PER_KG);
  const actualCost = Math.round(actualLoss * AVG_PRICE_PER_KG);

  // Monthly ROI trend
  const monthMap = new Map();
  all.forEach((b) => {
    const month = b.entry_date?.slice(0, 7);
    if (!month) return;
    if (!monthMap.has(month)) monthMap.set(month, { totalQty: 0, expiredQty: 0 });
    const m = monthMap.get(month);
    m.totalQty += parseFloat(b.quantity) || 0;
    if (b.status === "expired") m.expiredQty += parseFloat(b.quantity) || 0;
  });

  const timeline = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { totalQty: tq, expiredQty: eq }]) => {
      const bl = tq * BASELINE_SPOILAGE;
      const saved = Math.max(0, bl - eq);
      return {
        month,
        baselineLoss: Math.round(bl * AVG_PRICE_PER_KG),
        actualLoss: Math.round(eq * AVG_PRICE_PER_KG),
        savings: Math.round(saved * AVG_PRICE_PER_KG),
        cumulativeSavings: 0, // filled below
      };
    });

  // Cumulative sum
  let cumulative = 0;
  timeline.forEach((t) => {
    cumulative += t.savings;
    t.cumulativeSavings = cumulative;
  });

  return {
    totalQuantity: Math.round(totalQty),
    expiredQuantity: Math.round(expiredQty),
    quantitySaved,
    baselineCost,
    actualCost,
    costSaved: Math.round(costSaved),
    roiPercentage: baselineCost > 0 ? Math.round(((baselineCost - actualCost) / baselineCost) * 100) : 0,
    avgPricePerKg: AVG_PRICE_PER_KG,
    timeline,
  };
}

// ─── Trends (time-series) ─────────────────────────────────────────────────────

/**
 * Time-series data for charts:
 *   - Daily order counts
 *   - Daily batch additions
 *   - Daily risk score distribution
 */
export async function getTrends(supabase, { period, customStart, customEnd, warehouseId }) {
  // Orders over time
  let allocQuery = supabase.from("allocation_requests").select("created_at, status, quantity");
  allocQuery = applyDateRange(allocQuery, "created_at", period, customStart, customEnd);
  const { data: allocs } = await allocQuery;

  const ordersByDate = new Map();
  (allocs || []).forEach((a) => {
    const date = a.created_at?.slice(0, 10);
    if (!date) return;
    if (!ordersByDate.has(date)) ordersByDate.set(date, { date, total: 0, completed: 0, cancelled: 0 });
    const d = ordersByDate.get(date);
    d.total++;
    if (a.status === "completed") d.completed++;
    if (a.status === "cancelled") d.cancelled++;
  });

  // Batches added over time
  let batchQuery = supabase.from("batches").select("entry_date, risk_score, status, quantity, warehouse_id");
  if (warehouseId) batchQuery = batchQuery.eq("warehouse_id", warehouseId);
  batchQuery = applyDateRange(batchQuery, "entry_date", period, customStart, customEnd);
  const { data: batches } = await batchQuery;

  const batchesByDate = new Map();
  (batches || []).forEach((b) => {
    const date = b.entry_date?.slice(0, 10);
    if (!date) return;
    if (!batchesByDate.has(date)) batchesByDate.set(date, { date, count: 0, quantity: 0, avgRisk: 0, risks: [] });
    const d = batchesByDate.get(date);
    d.count++;
    d.quantity += parseFloat(b.quantity) || 0;
    d.risks.push(b.risk_score ?? 0);
  });

  // Calculate average risk per day
  const batchTrends = Array.from(batchesByDate.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(({ date, count, quantity, risks }) => ({
      date,
      count,
      quantity: Math.round(quantity),
      avgRisk: risks.length > 0 ? Math.round(risks.reduce((s, r) => s + r, 0) / risks.length) : 0,
    }));

  return {
    orderTrends: Array.from(ordersByDate.values()).sort((a, b) => a.date.localeCompare(b.date)),
    batchTrends,
  };
}

// ─── Warehouse Comparison (Owner only) ────────────────────────────────────────

/**
 * Per-warehouse comparison combining inventory, orders, risk distribution.
 */
export async function getComparison(supabase, { period, customStart, customEnd }) {
  // All warehouses
  const { data: warehouses } = await supabase.from("warehouses").select("id, name, location, capacity");

  if (!warehouses?.length) return { warehouses: [] };

  // All batches
  let batchQuery = supabase.from("batches").select("warehouse_id, status, quantity, risk_score, entry_date");
  batchQuery = applyDateRange(batchQuery, "entry_date", period, customStart, customEnd);
  const { data: batches } = await batchQuery;

  // All allocations
  let allocQuery = supabase.from("allocation_requests").select("warehouse_id, status, quantity, created_at");
  allocQuery = applyDateRange(allocQuery, "created_at", period, customStart, customEnd);
  const { data: allocs } = await allocQuery;

  const result = warehouses.map((wh) => {
    const whBatches = (batches || []).filter((b) => b.warehouse_id === wh.id);
    const whAllocs = (allocs || []).filter((a) => a.warehouse_id === wh.id);
    const active = whBatches.filter((b) => b.status === "active");

    return {
      warehouse_id: wh.id,
      warehouse_name: wh.name,
      location: wh.location,
      capacity: wh.capacity,
      totalBatches: whBatches.length,
      activeBatches: active.length,
      expiredBatches: whBatches.filter((b) => b.status === "expired").length,
      totalQuantity: Math.round(whBatches.reduce((s, b) => s + (parseFloat(b.quantity) || 0), 0)),
      avgRiskScore: active.length > 0
        ? Math.round(active.reduce((s, b) => s + (b.risk_score ?? 0), 0) / active.length)
        : 0,
      freshCount: active.filter((b) => (b.risk_score ?? 0) <= 30).length,
      moderateCount: active.filter((b) => (b.risk_score ?? 0) > 30 && (b.risk_score ?? 0) <= 70).length,
      highRiskCount: active.filter((b) => (b.risk_score ?? 0) > 70).length,
      totalOrders: whAllocs.length,
      completedOrders: whAllocs.filter((a) => a.status === "completed").length,
      fulfillmentRate: whAllocs.length > 0
        ? Math.round((whAllocs.filter((a) => a.status === "completed").length / whAllocs.length) * 100)
        : 0,
    };
  });

  return {
    warehouses: result.sort((a, b) => b.totalBatches - a.totalBatches),
  };
}
