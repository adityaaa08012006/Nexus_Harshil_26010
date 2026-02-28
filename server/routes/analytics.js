import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getOverview,
  getWasteReduction,
  getEfficiency,
  getROI,
  getTrends,
  getComparison,
} from "../services/analyticsService.js";
import { createClient } from "@supabase/supabase-js";

const router = Router();

// Admin client — bypasses RLS for aggregated queries
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

/**
 * Helper: extract common query params for date filtering.
 */
const parseFilters = (req) => ({
  period: req.query.period || "30d", // 7d | 30d | 90d | ytd | all
  customStart: req.query.start || null,
  customEnd: req.query.end || null,
  warehouseId: req.query.warehouse_id || null,
});

// ─── GET /api/analytics/overview ──────────────────────────────────────────────
// Summary stats (role-filtered: managers see their warehouse only)
router.get("/overview", requireAuth, async (req, res) => {
  try {
    const filters = parseFilters(req);

    // If manager, restrict to their warehouse
    if (req.profile.role === "manager") {
      filters.warehouseId = req.profile.warehouse_id;
    }

    const data = await getOverview(supabaseAdmin, filters);
    res.json({ success: true, data });
  } catch (err) {
    console.error("[analytics/overview] Error:", err.message);
    res.status(500).json({ error: "Failed to fetch analytics overview" });
  }
});

// ─── GET /api/analytics/waste-reduction ───────────────────────────────────────
// Waste metrics over time
router.get("/waste-reduction", requireAuth, async (req, res) => {
  try {
    const filters = parseFilters(req);
    if (req.profile.role === "manager") {
      filters.warehouseId = req.profile.warehouse_id;
    }

    const data = await getWasteReduction(supabaseAdmin, filters);
    res.json({ success: true, data });
  } catch (err) {
    console.error("[analytics/waste-reduction] Error:", err.message);
    res.status(500).json({ error: "Failed to fetch waste reduction metrics" });
  }
});

// ─── GET /api/analytics/efficiency ────────────────────────────────────────────
// Per-warehouse efficiency
router.get("/efficiency", requireAuth, async (req, res) => {
  try {
    const filters = parseFilters(req);
    if (req.profile.role === "manager") {
      filters.warehouseId = req.profile.warehouse_id;
    }

    const data = await getEfficiency(supabaseAdmin, filters);
    res.json({ success: true, data });
  } catch (err) {
    console.error("[analytics/efficiency] Error:", err.message);
    res.status(500).json({ error: "Failed to fetch efficiency metrics" });
  }
});

// ─── GET /api/analytics/roi ──────────────────────────────────────────────────
// ROI calculations
router.get("/roi", requireAuth, async (req, res) => {
  try {
    const filters = parseFilters(req);
    if (req.profile.role === "manager") {
      filters.warehouseId = req.profile.warehouse_id;
    }

    const data = await getROI(supabaseAdmin, filters);
    res.json({ success: true, data });
  } catch (err) {
    console.error("[analytics/roi] Error:", err.message);
    res.status(500).json({ error: "Failed to fetch ROI data" });
  }
});

// ─── GET /api/analytics/trends ────────────────────────────────────────────────
// Time-series data
router.get("/trends", requireAuth, async (req, res) => {
  try {
    const filters = parseFilters(req);
    if (req.profile.role === "manager") {
      filters.warehouseId = req.profile.warehouse_id;
    }

    const data = await getTrends(supabaseAdmin, filters);
    res.json({ success: true, data });
  } catch (err) {
    console.error("[analytics/trends] Error:", err.message);
    res.status(500).json({ error: "Failed to fetch trend data" });
  }
});

// ─── GET /api/analytics/comparison ────────────────────────────────────────────
// Warehouse comparison (Owner only)
router.get(
  "/comparison",
  requireAuth,
  requireRole(["owner"]),
  async (req, res) => {
    try {
      const filters = parseFilters(req);
      const data = await getComparison(supabaseAdmin, filters);
      res.json({ success: true, data });
    } catch (err) {
      console.error("[analytics/comparison] Error:", err.message);
      res.status(500).json({ error: "Failed to fetch comparison data" });
    }
  },
);

// ─── GET /api/analytics/export ────────────────────────────────────────────────
// Data export (CSV)
router.get("/export", requireAuth, async (req, res) => {
  try {
    const filters = parseFilters(req);
    const format = req.query.format || "csv"; // csv | json

    if (req.profile.role === "manager") {
      filters.warehouseId = req.profile.warehouse_id;
    }

    // Gather all data
    const [overview, waste, efficiency, roi] = await Promise.all([
      getOverview(supabaseAdmin, filters),
      getWasteReduction(supabaseAdmin, filters),
      getEfficiency(supabaseAdmin, filters),
      getROI(supabaseAdmin, filters),
    ]);

    if (format === "json") {
      return res.json({
        success: true,
        data: { overview, waste, efficiency, roi },
      });
    }

    // Build CSV
    const lines = [];
    lines.push("Godam Solutions — Analytics Report");
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push(`Period: ${filters.period}`);
    lines.push("");

    // Overview section
    lines.push("=== OVERVIEW ===");
    lines.push(`Active Batches,${overview.activeBatches}`);
    lines.push(`Expired Batches,${overview.expiredBatches}`);
    lines.push(`Dispatched Batches,${overview.dispatchedBatches}`);
    lines.push(`Fresh Batches,${overview.freshCount}`);
    lines.push(`Moderate Risk,${overview.moderateCount}`);
    lines.push(`High Risk,${overview.highRiskCount}`);
    lines.push(`Total Orders,${overview.totalOrders}`);
    lines.push(`Completed Orders,${overview.completedOrders}`);
    lines.push(`Fulfillment Rate,${overview.fulfillmentRate}%`);
    lines.push("");

    // Waste reduction section
    lines.push("=== WASTE REDUCTION ===");
    lines.push(`Current Spoilage Rate,${waste.currentSpoilageRate}%`);
    lines.push(`Baseline Spoilage Rate,${waste.baselineSpoilageRate}%`);
    lines.push(`Waste Reduction,${waste.wasteReductionPct}%`);
    lines.push(`Quantity Saved (kg),${waste.quantitySaved}`);
    lines.push("");

    // Efficiency section
    lines.push("=== EFFICIENCY ===");
    lines.push(`Total Requests,${efficiency.totalRequests}`);
    lines.push(`Fulfillment Rate,${efficiency.fulfillmentRate}%`);
    lines.push(`Avg Dispatch Time (days),${efficiency.avgDispatchTimeDays}`);
    lines.push("");

    // ROI section
    lines.push("=== ROI ===");
    lines.push(`Cost Saved (₹),${roi.costSaved}`);
    lines.push(`ROI %,${roi.roiPercentage}%`);
    lines.push(`Baseline Loss (₹),${roi.baselineCost}`);
    lines.push(`Actual Loss (₹),${roi.actualCost}`);
    lines.push("");

    // Per-warehouse efficiency
    if (efficiency.perWarehouse?.length) {
      lines.push("=== PER-WAREHOUSE EFFICIENCY ===");
      lines.push(
        "Warehouse,Total Orders,Completed,Cancelled,Fulfillment Rate,Total Qty (kg)",
      );
      efficiency.perWarehouse.forEach((w) => {
        lines.push(
          `${w.warehouse_name},${w.total},${w.completed},${w.cancelled},${w.fulfillmentRate}%,${w.totalQty}`,
        );
      });
      lines.push("");
    }

    // Waste timeline
    if (waste.timeline?.length) {
      lines.push("=== MONTHLY SPOILAGE TREND ===");
      lines.push(
        "Month,Spoilage Rate,Baseline Rate,Total Batches,Expired Batches",
      );
      waste.timeline.forEach((t) => {
        lines.push(
          `${t.month},${t.spoilageRate}%,${t.baselineRate}%,${t.total},${t.expired}`,
        );
      });
      lines.push("");
    }

    // ROI timeline
    if (roi.timeline?.length) {
      lines.push("=== MONTHLY ROI TREND ===");
      lines.push(
        "Month,Baseline Loss (₹),Actual Loss (₹),Savings (₹),Cumulative Savings (₹)",
      );
      roi.timeline.forEach((t) => {
        lines.push(
          `${t.month},${t.baselineLoss},${t.actualLoss},${t.savings},${t.cumulativeSavings}`,
        );
      });
    }

    const csv = lines.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=analytics-report-${filters.period}.csv`,
    );
    res.send(csv);
  } catch (err) {
    console.error("[analytics/export] Error:", err.message);
    res.status(500).json({ error: "Failed to export analytics data" });
  }
});

export default router;
