import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import authRoutes from "./routes/auth.js";
import { createClient } from "@supabase/supabase-js";
import { calculateRiskScore } from "./utils/riskCalculation.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase service-role client (bypasses RLS for server jobs)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Godam Solutions API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
// app.use('/api/inventory', inventoryRoutes)
// app.use('/api/sensors', sensorRoutes)
// app.use('/api/allocation', allocationRoutes)
// app.use('/api/contacts', contactRoutes)
// app.use('/api/pdf-parse', pdfParseRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// ─── Hourly Risk Recalculation Cron Job ──────────────────────────────────────
// Runs every hour at minute 0. Recalculates risk_score for all active batches
// and triggers DB alerts for newly high-risk items.
cron.schedule("0 * * * *", async () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      "[cron] Skipping risk recalculation — Supabase env vars missing.",
    );
    return;
  }
  try {
    console.log("[cron] Starting hourly risk recalculation...");

    const { data: batches, error } = await supabaseAdmin
      .from("batches")
      .select("*")
      .eq("status", "active");

    if (error) throw error;
    if (!batches?.length) {
      console.log("[cron] No active batches.");
      return;
    }

    const updates = batches.map((b) => ({
      id: b.id,
      risk_score: calculateRiskScore(b),
      updated_at: new Date().toISOString(),
    }));

    // Upsert in one round-trip
    const { error: upsertErr } = await supabaseAdmin
      .from("batches")
      .upsert(updates, { onConflict: "id" });

    if (upsertErr) throw upsertErr;

    // Insert alerts for batches that crossed into high risk (>70)
    const highRisk = updates.filter((u) => u.risk_score > 70);
    if (highRisk.length) {
      const batchMap = Object.fromEntries(batches.map((b) => [b.id, b]));
      const alerts = highRisk.map((u) => ({
        warehouse_id: batchMap[u.id]?.warehouse_id,
        zone: batchMap[u.id]?.zone,
        type: "risk",
        severity: "critical",
        message: `Batch ${batchMap[u.id]?.batch_id} risk score reached ${u.risk_score}% — immediate attention required.`,
      }));
      await supabaseAdmin.from("alerts").insert(alerts);
    }

    console.log(
      `[cron] Updated ${updates.length} batches. High-risk alerts: ${highRisk.length}`,
    );
  } catch (err) {
    console.error("[cron] Risk recalculation failed:", err.message);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
  console.log(`⏰  Risk recalculation cron: every hour at :00`);
});

export default app;
