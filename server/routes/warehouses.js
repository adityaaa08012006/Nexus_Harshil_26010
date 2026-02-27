import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

// Middleware to verify JWT token
const requireAuth = async (req, res, next) => {
  try {
    console.log("[WAREHOUSE AUTH] Checking authorization header...");
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[WAREHOUSE AUTH] ❌ No Bearer token found");
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("[WAREHOUSE AUTH] Token found, validating with Supabase...");
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log("[WAREHOUSE AUTH] ❌ Invalid token:", error?.message);
      return res.status(401).json({ error: "Invalid token" });
    }

    console.log(
      "[WAREHOUSE AUTH] ✅ User authenticated:",
      user.email,
      "(ID:",
      user.id + ")",
    );
    req.user = user;
    next();
  } catch (error) {
    console.error("[WAREHOUSE AUTH] ❌ Exception:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};

// ============================================================================
// GET /api/warehouses
// Get all warehouses for the authenticated user
// - Owners: Get all warehouses they own
// - Managers: Get the warehouse they're assigned to
// - QC Reps: No access
// ============================================================================
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(
      "\n[GET WAREHOUSES] Request from user:",
      req.user.email,
      "(ID:",
      userId + ")",
    );

    // Get user profile to check role
    console.log("[GET WAREHOUSES] Fetching user profile...");
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role, warehouse_id")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.log(
        "[GET WAREHOUSES] ❌ Profile fetch error:",
        profileError.message,
      );
      return res.status(500).json({ error: "Failed to fetch user profile" });
    }

    console.log(
      "[GET WAREHOUSES] User profile:",
      JSON.stringify(profile, null, 2),
    );

    let warehouses = [];

    if (profile.role === "owner") {
      // Owner: Get all warehouses they own
      console.log(
        "[GET WAREHOUSES] User is OWNER - fetching warehouses with owner_id =",
        userId,
      );
      const { data, error } = await supabase
        .from("warehouses")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "[GET WAREHOUSES] ❌ Error fetching owner warehouses:",
          error.message,
        );
        console.error(
          "[GET WAREHOUSES] Error details:",
          JSON.stringify(error, null, 2),
        );
        return res.status(500).json({ error: "Failed to fetch warehouses" });
      }

      warehouses = data || [];
      console.log(
        "[GET WAREHOUSES] Found",
        warehouses.length,
        "warehouse(s) for owner:",
      );
      warehouses.forEach((w) => console.log("  -", w.name, "(ID:", w.id + ")"));
    } else if (profile.role === "manager") {
      // Manager: Get their assigned warehouse
      console.log(
        "[GET WAREHOUSES] User is MANAGER - assigned warehouse_id:",
        profile.warehouse_id,
      );
      if (!profile.warehouse_id) {
        console.log("[GET WAREHOUSES] ⚠️ Manager has no warehouse assigned");
        return res.json({ warehouses: [] });
      }

      const { data, error } = await supabase
        .from("warehouses")
        .select("*")
        .eq("id", profile.warehouse_id)
        .single();

      if (error) {
        console.error(
          "[GET WAREHOUSES] ❌ Error fetching manager warehouse:",
          error.message,
        );
        console.error(
          "[GET WAREHOUSES] Error details:",
          JSON.stringify(error, null, 2),
        );
        return res.status(500).json({ error: "Failed to fetch warehouse" });
      }

      warehouses = data ? [data] : [];
      console.log("[GET WAREHOUSES] Found warehouse for manager:", data?.name);
    } else {
      // QC Rep: No warehouse access
      console.log("[GET WAREHOUSES] User is QC_REP - denying access");
      return res
        .status(403)
        .json({ error: "QC Reps cannot access warehouses" });
    }

    console.log(
      "[GET WAREHOUSES] ✅ Returning",
      warehouses.length,
      "warehouse(s)",
    );
    res.json({ warehouses });
  } catch (error) {
    console.error("[GET WAREHOUSES] ❌ Unexpected error:", error);
    res.status(500).json({ error: "Failed to fetch warehouses" });
  }
});

// ============================================================================
// GET /api/warehouses/:id
// Get a specific warehouse by ID
// ============================================================================
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const warehouseId = req.params.id;
    console.log(
      "\n[GET WAREHOUSE BY ID] Request for warehouse:",
      warehouseId,
      "by user:",
      req.user.email,
    );

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, warehouse_id")
      .eq("id", userId)
      .single();

    console.log("[GET WAREHOUSE BY ID] User role:", profile?.role);

    // Fetch warehouse
    const { data: warehouse, error } = await supabase
      .from("warehouses")
      .select("*")
      .eq("id", warehouseId)
      .single();

    if (error) {
      console.log(
        "[GET WAREHOUSE BY ID] ❌ Warehouse not found:",
        error.message,
      );
      return res.status(404).json({ error: "Warehouse not found" });
    }

    console.log("[GET WAREHOUSE BY ID] Found warehouse:", warehouse.name);

    // Check access
    if (profile.role === "owner") {
      if (warehouse.owner_id !== userId) {
        console.log(
          "[GET WAREHOUSE BY ID] ❌ Owner access denied - warehouse owner_id:",
          warehouse.owner_id,
          "!== user_id:",
          userId,
        );
        return res.status(403).json({ error: "Access denied" });
      }
      console.log("[GET WAREHOUSE BY ID] ✅ Owner access granted");
    } else if (profile.role === "manager") {
      if (profile.warehouse_id !== warehouseId) {
        console.log(
          "[GET WAREHOUSE BY ID] ❌ Manager access denied - assigned to:",
          profile.warehouse_id,
          "not",
          warehouseId,
        );
        return res.status(403).json({ error: "Access denied" });
      }
      console.log("[GET WAREHOUSE BY ID] ✅ Manager access granted");
    } else {
      console.log("[GET WAREHOUSE BY ID] ❌ QC Rep - no access");
      return res.status(403).json({ error: "Access denied" });
    }

    console.log("[GET WAREHOUSE BY ID] ✅ Returning warehouse data");
    res.json({ warehouse });
  } catch (error) {
    console.error("[GET WAREHOUSE BY ID] ❌ Unexpected error:", error);
    res.status(500).json({ error: "Failed to fetch warehouse" });
  }
});

export default router;
