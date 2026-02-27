import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import cron from "node-cron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, ".env") });
import authRoutes from "./routes/auth.js";
import sensorRoutes from "./routes/sensors.js";
import warehouseRoutes from "./routes/warehouses.js";
import pdfParseRoutes from "./routes/pdf-parse.js";
import allocationRoutes from "./routes/allocation.js";
import messageRoutes from "./routes/messages.js";
import { createClient } from "@supabase/supabase-js";
import { calculateRiskScore } from "./utils/riskCalculation.js";

// dotenv already loaded above with absolute path

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
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.CLIENT_URL,
    ].filter(Boolean),
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

console.log("\n🚀 Registering API routes...");
app.use("/api/auth", authRoutes);
console.log("  ✅ /api/auth");
app.use("/api/sensors", sensorRoutes);
console.log("  ✅ /api/sensors");
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/pdf-parse", pdfParseRoutes);
console.log("  ✅ /api/pdf-parse");
app.use("/api/allocation", allocationRoutes);
console.log("  ✅ /api/allocation");
app.use("/api/messages", messageRoutes);
console.log("  ✅ /api/messages");
// app.use('/api/inventory', inventoryRoutes)
// app.use('/api/contacts', contactutes)
// app.use('/api/pdf-parse', pdfParseRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("\n[ERROR HANDLER] Unhandled error:");
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
  console.log("\n" + "=".repeat(60));
  console.log("🚀 Nexus Warehouse Management - Server Started");
  console.log("=".repeat(60));
  console.log(`🔗 Port: ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log("\n🔑 Available API Endpoints:");
  console.log("  - POST /api/auth/signup");
  console.log("  - POST /api/auth/signin");
  console.log("  - GET  /api/warehouses (requires auth)");
  console.log("  - GET  /api/warehouses/:id (requires auth)");
  console.log("  - GET  /api/sensors/* (requires auth)");
  console.log("\n⏰  Risk recalculation cron: every hour at :00");
  console.log("=".repeat(60) + "\n");
});

export default app;
