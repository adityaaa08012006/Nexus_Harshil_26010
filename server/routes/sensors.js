/**
 * Sensor Routes - Environmental Monitoring APIs
 * Handles sensor data retrieval, threshold management, and alerts
 */

import express from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import {
  generateWarehouseReadings,
  detectAlerts,
  getAllZones,
} from "../utils/sensorSimulator.js";

const router = express.Router();

// ============================================================================
// GET /api/sensors/readings/:warehouseId
// Get current sensor readings for a warehouse (last reading per zone)
// ============================================================================
router.get("/readings/:warehouseId", requireAuth, async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const userId = req.user.id;
    const profile = req.profile; // Profile already fetched by auth middleware

    console.log(
      `[SENSOR READINGS] Request for warehouse ${warehouseId} by user ${req.user.email}`,
    );
    console.log(
      `[SENSOR READINGS] User role: ${profile?.role}, warehouse_id: ${profile?.warehouse_id}`,
    );

    if (!profile) {
      console.log("[SENSOR READINGS] ❌ No profile found for user");
      return res.status(404).json({ error: "User profile not found" });
    }

    // Check access permissions
    if (profile.role === "manager" && profile.warehouse_id !== warehouseId) {
      console.log(
        `[SENSOR READINGS] ❌ Manager access denied - assigned to ${profile.warehouse_id}, requested ${warehouseId}`,
      );
      return res.status(403).json({ error: "Access denied to this warehouse" });
    }

    if (profile.role === "owner") {
      // Verify owner owns this warehouse
      const { data: warehouse } = await supabaseAdmin
        .from("warehouses")
        .select("owner_id")
        .eq("id", warehouseId)
        .single();

      if (!warehouse || warehouse.owner_id !== userId) {
        console.log(
          `[SENSOR READINGS] ❌ Owner access denied - doesn't own warehouse ${warehouseId}`,
        );
        return res
          .status(403)
          .json({ error: "Access denied to this warehouse" });
      }
      console.log(`[SENSOR READINGS] ✅ Owner access granted`);
    }

    if (profile.role === "qc_rep") {
      console.log(`[SENSOR READINGS] ❌ QC rep cannot access sensor data`);
      return res
        .status(403)
        .json({ error: "QC representatives cannot access sensor data" });
    }

    // Get latest reading for each zone
    const zones = getAllZones();
    console.log(
      `[SENSOR READINGS] Fetching latest reading for ${zones.length} zones:`,
      zones,
    );
    const readings = [];

    for (const zone of zones) {
      const { data, error } = await supabaseAdmin
        .from("sensor_readings")
        .select("*")
        .eq("warehouse_id", warehouseId)
        .eq("zone", zone)
        .order("reading_time", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log(
          `[SENSOR READINGS] No reading found for zone "${zone}":`,
          error.message,
        );
      } else if (data) {
        console.log(`[SENSOR READINGS] ✅ Found reading for zone "${zone}"`);
        readings.push(data);
      }
    }

    console.log(
      `[SENSOR READINGS] Total readings collected: ${readings.length} out of ${zones.length} zones`,
    );

    // If no readings exist, generate and store simulated data
    if (readings.length === 0) {
      console.log(
        `[SENSOR READINGS] No existing readings for warehouse ${warehouseId}, generating simulated data`,
      );
      const simulatedReadings = generateWarehouseReadings(warehouseId, 0.02);

      // Insert readings using service role (bypasses RLS)
      const { data: insertedReadings, error: insertError } = await supabaseAdmin
        .from("sensor_readings")
        .insert(simulatedReadings)
        .select();

      if (insertError) {
        console.error(
          "[SENSOR READINGS] Error inserting simulated readings:",
          insertError,
        );
        return res
          .status(500)
          .json({ error: "Failed to generate sensor data" });
      }

      console.log(
        `[SENSOR READINGS] Generated and inserted ${insertedReadings.length} simulated readings`,
      );
      return res.json({ readings: insertedReadings });
    }

    console.log(
      `[SENSOR READINGS] Returning ${readings.length} existing readings for warehouse ${warehouseId}`,
    );
    res.json({ readings });
  } catch (error) {
    console.error("Error fetching sensor readings:", error);
    res.status(500).json({ error: "Failed to fetch sensor readings" });
  }
});

// ============================================================================
// GET /api/sensors/readings/:warehouseId/history
// Get historical sensor data with optional time range and zone filter
// ============================================================================
router.get("/readings/:warehouseId/history", requireAuth, async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const { zone, startTime, endTime, limit = 100 } = req.query;
    const userId = req.user.id;
    const profile = req.profile; // Use profile from auth middleware

    console.log(
      `[SENSOR HISTORY] Request for warehouse ${warehouseId} by user ${req.user.email}`,
    );

    if (!profile) {
      console.log("[SENSOR HISTORY] ❌ No profile found");
      return res.status(404).json({ error: "User profile not found" });
    }

    if (profile.role === "manager" && profile.warehouse_id !== warehouseId) {
      console.log(`[SENSOR HISTORY] ❌ Manager access denied`);
      return res.status(403).json({ error: "Access denied" });
    }

    if (profile.role === "owner") {
      const { data: warehouse } = await supabaseAdmin
        .from("warehouses")
        .select("owner_id")
        .eq("id", warehouseId)
        .single();

      if (!warehouse || warehouse.owner_id !== userId) {
        console.log(`[SENSOR HISTORY] ❌ Owner access denied`);
        return res.status(403).json({ error: "Access denied" });
      }
      console.log(`[SENSOR HISTORY] ✅ Owner access granted`);
    }

    // Build query
    let query = supabaseAdmin
      .from("sensor_readings")
      .select("*")
      .eq("warehouse_id", warehouseId)
      .order("reading_time", { ascending: false })
      .limit(parseInt(limit));

    if (zone) {
      query = query.eq("zone", zone);
    }

    if (startTime) {
      query = query.gte("reading_time", startTime);
    }

    if (endTime) {
      query = query.lte("reading_time", endTime);
    }

    const { data: readings, error } = await query;

    if (error) {
      console.error("Error fetching historical readings:", error);
      return res.status(500).json({ error: "Failed to fetch historical data" });
    }

    res.json({ readings });
  } catch (error) {
    console.error("Error fetching sensor history:", error);
    res.status(500).json({ error: "Failed to fetch sensor history" });
  }
});

// ============================================================================
// GET /api/sensors/readings/:warehouseId/zone/:zone
// Get readings for a specific zone
// ============================================================================
router.get(
  "/readings/:warehouseId/zone/:zone",
  requireAuth,
  async (req, res) => {
    try {
      const { warehouseId, zone } = req.params;
      const { limit = 50 } = req.query;
      const userId = req.user.id;
      const profile = req.profile; // Use profile from auth middleware

      console.log(
        `[SENSOR ZONE] Request for zone ${zone} in warehouse ${warehouseId} by user ${req.user.email}`,
      );

      if (!profile) {
        console.log("[SENSOR ZONE] ❌ No profile found");
        return res.status(404).json({ error: "User profile not found" });
      }

      if (profile.role === "manager" && profile.warehouse_id !== warehouseId) {
        console.log(`[SENSOR ZONE] ❌ Manager access denied`);
        return res.status(403).json({ error: "Access denied" });
      }

      if (profile.role === "owner") {
        const { data: warehouse } = await supabaseAdmin
          .from("warehouses")
          .select("owner_id")
          .eq("id", warehouseId)
          .single();

        if (!warehouse || warehouse.owner_id !== userId) {
          console.log(`[SENSOR ZONE] ❌ Owner access denied`);
          return res.status(403).json({ error: "Access denied" });
        }
        console.log(`[SENSOR ZONE] ✅ Owner access granted`);
      }

      // Fetch zone readings
      const { data: readings, error } = await supabaseAdmin
        .from("sensor_readings")
        .select("*")
        .eq("warehouse_id", warehouseId)
        .eq("zone", zone)
        .order("reading_time", { ascending: false })
        .limit(parseInt(limit));

      if (error) {
        console.error("Error fetching zone readings:", error);
        return res.status(500).json({ error: "Failed to fetch zone readings" });
      }

      res.json({ readings });
    } catch (error) {
      console.error("Error fetching zone data:", error);
      res.status(500).json({ error: "Failed to fetch zone data" });
    }
  },
);

// ============================================================================
// GET /api/sensors/thresholds/:warehouseId
// Get threshold configurations for a warehouse
// ============================================================================
router.get("/thresholds/:warehouseId", requireAuth, async (req, res) => {
  try {
    const { warehouseId } = req.params;
    console.log(
      `[SENSOR THRESHOLDS] Request for warehouse ${warehouseId} by user ${req.user.email}`,
    );

    const { data: thresholds, error } = await supabaseAdmin
      .from("sensor_thresholds")
      .select("*")
      .eq("warehouse_id", warehouseId);

    if (error) {
      console.error("[SENSOR THRESHOLDS] ❌ Error:", error.message);
      return res.status(500).json({ error: "Failed to fetch thresholds" });
    }

    console.log(
      `[SENSOR THRESHOLDS] ✅ Found ${thresholds?.length || 0} threshold(s)`,
    );
    res.json({ thresholds });
  } catch (error) {
    console.error("Error fetching thresholds:", error);
    res.status(500).json({ error: "Failed to fetch thresholds" });
  }
});

// ============================================================================
// POST /api/sensors/thresholds
// Update threshold configuration (Manager/Owner only)
// ============================================================================
router.post("/thresholds", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = req.profile; // Use profile from auth middleware
    const {
      warehouse_id,
      zone,
      temperature_min,
      temperature_max,
      humidity_min,
      humidity_max,
      ethylene_max,
      co2_max,
      ammonia_max,
    } = req.body;

    console.log(
      `[UPDATE THRESHOLD] Request for zone ${zone} in warehouse ${warehouse_id} by user ${req.user.email}`,
    );

    if (!profile) {
      console.log("[UPDATE THRESHOLD] ❌ No profile found");
      return res.status(404).json({ error: "User profile not found" });
    }

    if (profile.role === "qc_rep") {
      console.log("[UPDATE THRESHOLD] ❌ QC rep cannot modify thresholds");
      return res
        .status(403)
        .json({ error: "QC representatives cannot modify thresholds" });
    }

    if (profile.role === "manager" && profile.warehouse_id !== warehouse_id) {
      console.log(
        `[UPDATE THRESHOLD] ❌ Manager access denied - assigned to ${profile.warehouse_id}`,
      );
      return res.status(403).json({ error: "Access denied to this warehouse" });
    }

    if (profile.role === "owner") {
      const { data: warehouse } = await supabaseAdmin
        .from("warehouses")
        .select("owner_id")
        .eq("id", warehouse_id)
        .single();

      if (!warehouse || warehouse.owner_id !== userId) {
        console.log(
          `[UPDATE THRESHOLD] ❌ Owner access denied - doesn't own warehouse`,
        );
        return res
          .status(403)
          .json({ error: "Access denied to this warehouse" });
      }
      console.log(`[UPDATE THRESHOLD] ✅ Owner access granted`);
    }

    // Upsert threshold (update if exists, insert if not)
    const { data: threshold, error } = await supabaseAdmin
      .from("sensor_thresholds")
      .upsert(
        {
          warehouse_id,
          zone,
          temperature_min,
          temperature_max,
          humidity_min,
          humidity_max,
          ethylene_max,
          co2_max,
          ammonia_max,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "warehouse_id,zone" },
      )
      .select()
      .single();

    if (error) {
      console.error("Error updating threshold:", error);
      return res.status(500).json({ error: "Failed to update threshold" });
    }

    res.json({ threshold, message: "Threshold updated successfully" });
  } catch (error) {
    console.error("Error updating threshold:", error);
    res.status(500).json({ error: "Failed to update threshold" });
  }
});

// ============================================================================
// GET /api/sensors/alerts/:warehouseId
// Get active alerts for a warehouse
// ============================================================================
router.get("/alerts/:warehouseId", requireAuth, async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const { acknowledged = "false" } = req.query;
    console.log(
      `[SENSOR ALERTS] Request for warehouse ${warehouseId} by user ${req.user.email}, acknowledged=${acknowledged}`,
    );

    const showAll = acknowledged === "all";
    const showAcknowledged = acknowledged === "true";

    let query = supabaseAdmin
      .from("sensor_alerts")
      .select("*")
      .eq("warehouse_id", warehouseId)
      .order("triggered_at", { ascending: false });

    if (!showAll) {
      query = query.eq("acknowledged", showAcknowledged);
    }

    const { data: alerts, error } = await query;

    if (error) {
      console.error("[SENSOR ALERTS] ❌ Error:", error.message);
      console.error(
        "[SENSOR ALERTS] Error details:",
        JSON.stringify(error, null, 2),
      );
      return res.status(500).json({ error: "Failed to fetch alerts" });
    }

    console.log(`[SENSOR ALERTS] ✅ Found ${alerts?.length || 0} alert(s)`);
    res.json({ alerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

// ============================================================================
// POST /api/sensors/alerts/:alertId/acknowledge
// Acknowledge an alert
// ============================================================================
router.post("/alerts/:alertId/acknowledge", requireAuth, async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.id;
    console.log(
      `[ACKNOWLEDGE ALERT] User ${req.user.email} acknowledging alert ${alertId}`,
    );

    const { data: alert, error } = await supabaseAdmin
      .from("sensor_alerts")
      .update({
        acknowledged: true,
        acknowledged_by: userId,
        acknowledged_at: new Date().toISOString(),
      })
      .eq("id", alertId)
      .select()
      .single();

    if (error) {
      console.error("[ACKNOWLEDGE ALERT] ❌ Error:", error.message);
      return res.status(500).json({ error: "Failed to acknowledge alert" });
    }

    console.log(
      `[ACKNOWLEDGE ALERT] ✅ Alert ${alertId} acknowledged successfully`,
    );
    res.json({ alert, message: "Alert acknowledged" });
  } catch (error) {
    console.error("[ACKNOWLEDGE ALERT] Exception:", error);
    res.status(500).json({ error: "Failed to acknowledge alert" });
  }
});

// ============================================================================
// POST /api/sensors/simulate/:warehouseId
// Manually trigger sensor data generation (for testing/development)
// ============================================================================
router.post("/simulate/:warehouseId", requireAuth, async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const { criticalChance = 0.1 } = req.body; // Higher chance for testing
    console.log(
      `[SIMULATE DATA] User ${req.user.email} simulating data for warehouse ${warehouseId}, criticalChance=${criticalChance}`,
    );

    // Generate new readings
    const readings = generateWarehouseReadings(
      warehouseId,
      parseFloat(criticalChance),
    );
    console.log(`[SIMULATE DATA] Generated ${readings.length} readings`);

    // Insert readings using service role
    const { data: insertedReadings, error: insertError } = await supabaseAdmin
      .from("sensor_readings")
      .insert(readings)
      .select();

    if (insertError) {
      console.error(
        "[SIMULATE DATA] ❌ Error inserting readings:",
        insertError.message,
      );
      return res.status(500).json({ error: "Failed to simulate sensor data" });
    }
    console.log(
      `[SIMULATE DATA] ✅ Inserted ${insertedReadings.length} readings`,
    );

    // Check for threshold breaches and create alerts
    const { data: thresholds } = await supabaseAdmin
      .from("sensor_thresholds")
      .select("*")
      .eq("warehouse_id", warehouseId);

    console.log(
      `[SIMULATE DATA] Found ${thresholds?.length || 0} thresholds to check`,
    );

    if (thresholds && thresholds.length > 0) {
      const allAlerts = [];

      for (const reading of insertedReadings) {
        const threshold = thresholds.find((t) => t.zone === reading.zone);
        if (threshold) {
          const alerts = detectAlerts(reading, threshold);
          allAlerts.push(...alerts);
        }
      }

      // Insert alerts if any
      if (allAlerts.length > 0) {
        console.log(`[SIMULATE DATA] Inserting ${allAlerts.length} alerts`);
        await supabaseAdmin.from("sensor_alerts").insert(allAlerts);
        console.log(`[SIMULATE DATA] ✅ Alerts created successfully`);
      } else {
        console.log(`[SIMULATE DATA] No threshold breaches detected`);
      }

      return res.json({
        readings: insertedReadings,
        alertsTriggered: allAlerts.length,
        message: "Sensor data simulated successfully",
      });
    }

    res.json({
      readings: insertedReadings,
      message: "Sensor data simulated successfully",
    });
  } catch (error) {
    console.error("[SIMULATE DATA] Exception:", error);
    res.status(500).json({ error: "Failed to simulate sensor data" });
  }
});

// ============================================================================
// GET /api/sensors/zones
// Get list of all available zones
// ============================================================================
router.get("/zones", requireAuth, (req, res) => {
  try {
    const zones = getAllZones();
    res.json({ zones });
  } catch (error) {
    console.error("Error fetching zones:", error);
    res.status(500).json({ error: "Failed to fetch zones" });
  }
});

export default router;
