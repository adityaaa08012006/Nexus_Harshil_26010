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

    // Verify user has access to this warehouse
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, warehouse_id")
      .eq("id", userId)
      .single();

    if (!profile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // Check access permissions
    if (profile.role === "manager" && profile.warehouse_id !== warehouseId) {
      return res.status(403).json({ error: "Access denied to this warehouse" });
    }

    if (profile.role === "owner") {
      // Verify owner owns this warehouse
      const { data: warehouse } = await supabase
        .from("warehouses")
        .select("owner_id")
        .eq("id", warehouseId)
        .single();

      if (!warehouse || warehouse.owner_id !== userId) {
        return res
          .status(403)
          .json({ error: "Access denied to this warehouse" });
      }
    }

    if (profile.role === "qc") {
      return res
        .status(403)
        .json({ error: "QC representatives cannot access sensor data" });
    }

    // Get latest reading for each zone
    const zones = getAllZones();
    const readings = [];

    for (const zone of zones) {
      const { data, error } = await supabase
        .from("sensor_readings")
        .select("*")
        .eq("warehouse_id", warehouseId)
        .eq("zone", zone)
        .order("reading_time", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        readings.push(data);
      }
    }

    // If no readings exist, generate and store simulated data
    if (readings.length === 0) {
      const simulatedReadings = generateWarehouseReadings(warehouseId, 0.02);

      // Insert readings using service role (bypasses RLS)
      const { data: insertedReadings, error: insertError } = await supabaseAdmin
        .from("sensor_readings")
        .insert(simulatedReadings)
        .select();

      if (insertError) {
        console.error("Error inserting simulated readings:", insertError);
        return res
          .status(500)
          .json({ error: "Failed to generate sensor data" });
      }

      return res.json({ readings: insertedReadings });
    }

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

    // Verify access (same as above)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, warehouse_id")
      .eq("id", userId)
      .single();

    if (!profile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    if (profile.role === "manager" && profile.warehouse_id !== warehouseId) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (profile.role === "owner") {
      const { data: warehouse } = await supabase
        .from("warehouses")
        .select("owner_id")
        .eq("id", warehouseId)
        .single();

      if (!warehouse || warehouse.owner_id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    // Build query
    let query = supabase
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

      // Verify access (reuse logic)
      const userId = req.user.id;
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role, warehouse_id")
        .eq("id", userId)
        .single();

      if (!profile) {
        return res.status(404).json({ error: "User profile not found" });
      }

      if (profile.role === "manager" && profile.warehouse_id !== warehouseId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Fetch zone readings
      const { data: readings, error } = await supabase
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

    const { data: thresholds, error } = await supabase
      .from("sensor_thresholds")
      .select("*")
      .eq("warehouse_id", warehouseId);

    if (error) {
      console.error("Error fetching thresholds:", error);
      return res.status(500).json({ error: "Failed to fetch thresholds" });
    }

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

    // Verify user has permission to update thresholds
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, warehouse_id")
      .eq("id", userId)
      .single();

    if (!profile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    if (profile.role === "qc") {
      return res
        .status(403)
        .json({ error: "QC representatives cannot modify thresholds" });
    }

    if (profile.role === "manager" && profile.warehouse_id !== warehouse_id) {
      return res.status(403).json({ error: "Access denied to this warehouse" });
    }

    if (profile.role === "owner") {
      const { data: warehouse } = await supabase
        .from("warehouses")
        .select("owner_id")
        .eq("id", warehouse_id)
        .single();

      if (!warehouse || warehouse.owner_id !== userId) {
        return res
          .status(403)
          .json({ error: "Access denied to this warehouse" });
      }
    }

    // Upsert threshold (update if exists, insert if not)
    const { data: threshold, error } = await supabase
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

    const showAll = acknowledged === "all";
    const showAcknowledged = acknowledged === "true";

    let query = supabase
      .from("sensor_alerts")
      .select("*")
      .eq("warehouse_id", warehouseId)
      .order("triggered_at", { ascending: false });

    if (!showAll) {
      query = query.eq("acknowledged", showAcknowledged);
    }

    const { data: alerts, error } = await query;

    if (error) {
      console.error("Error fetching alerts:", error);
      return res.status(500).json({ error: "Failed to fetch alerts" });
    }

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

    const { data: alert, error } = await supabase
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
      console.error("Error acknowledging alert:", error);
      return res.status(500).json({ error: "Failed to acknowledge alert" });
    }

    res.json({ alert, message: "Alert acknowledged" });
  } catch (error) {
    console.error("Error acknowledging alert:", error);
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

    // Generate new readings
    const readings = generateWarehouseReadings(
      warehouseId,
      parseFloat(criticalChance),
    );

    // Insert readings using service role
    const { data: insertedReadings, error: insertError } = await supabaseAdmin
      .from("sensor_readings")
      .insert(readings)
      .select();

    if (insertError) {
      console.error("Error inserting readings:", insertError);
      return res.status(500).json({ error: "Failed to simulate sensor data" });
    }

    // Check for threshold breaches and create alerts
    const { data: thresholds } = await supabaseAdmin
      .from("sensor_thresholds")
      .select("*")
      .eq("warehouse_id", warehouseId);

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
        await supabaseAdmin.from("sensor_alerts").insert(allAlerts);
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
    console.error("Error simulating sensor data:", error);
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
