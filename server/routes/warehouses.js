import express from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";

const router = express.Router();

// Middleware to verify JWT token and load user profile
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
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.log("[WAREHOUSE AUTH] ❌ Invalid token:", error?.message);
      return res.status(401).json({ error: "Invalid token" });
    }

    // Load user profile using admin client to bypass RLS
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.log(
        "[WAREHOUSE AUTH] ❌ Profile load error:",
        profileError.message,
      );
      return res.status(500).json({ error: "Failed to load profile" });
    }

    console.log(
      "[WAREHOUSE AUTH] ✅ User authenticated:",
      user.email,
      "Role:",
      profile.role,
    );
    req.user = user;
    req.profile = profile;
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
// - Managers: Get all warehouses they're assigned to (via junction table)
// - QC Reps: Get all warehouses they're assigned to
// ============================================================================
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = req.profile;
    console.log(
      "\n[GET WAREHOUSES] Request from:",
      req.user.email,
      "Role:",
      profile.role,
    );

    let warehouses = [];

    if (profile.role === "owner") {
      // Owner: Get all warehouses they own
      console.log(
        "[GET WAREHOUSES] Fetching warehouses with owner_id =",
        userId,
      );
      const { data, error } = await supabaseAdmin
        .from("warehouses")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[GET WAREHOUSES] ❌ Error:", error.message);
        return res.status(500).json({ error: "Failed to fetch warehouses" });
      }

      warehouses = data || [];
      console.log(
        "[GET WAREHOUSES] Found",
        warehouses.length,
        "warehouse(s) for owner",
      );
    } else if (profile.role === "manager" || profile.role === "qc_rep") {
      // Manager/QC: Get all warehouses they're assigned to via junction table
      console.log(
        "[GET WAREHOUSES] Fetching assigned warehouses for",
        profile.role,
      );

      // First get warehouse IDs from junction table
      const { data: assignments, error: assignError } = await supabaseAdmin
        .from("manager_warehouse_assignments")
        .select("warehouse_id")
        .eq("manager_id", userId);

      if (assignError) {
        console.error(
          "[GET WAREHOUSES] ❌ Assignment fetch error:",
          assignError.message,
        );
        return res.status(500).json({ error: "Failed to fetch assignments" });
      }

      if (!assignments || assignments.length === 0) {
        console.log(
          "[GET WAREHOUSES] ⚠️ No warehouses assigned to this",
          profile.role,
        );
        return res.json({ warehouses: [] });
      }

      const warehouseIds = assignments.map((a) => a.warehouse_id);
      console.log(
        "[GET WAREHOUSES] Assigned to",
        warehouseIds.length,
        "warehouse(s):",
        warehouseIds,
      );

      // Fetch the actual warehouse data
      const { data, error } = await supabaseAdmin
        .from("warehouses")
        .select("*")
        .in("id", warehouseIds)
        .order("name", { ascending: true });

      if (error) {
        console.error(
          "[GET WAREHOUSES] ❌ Error fetching warehouses:",
          error.message,
        );
        return res.status(500).json({ error: "Failed to fetch warehouses" });
      }

      warehouses = data || [];
      console.log(
        "[GET WAREHOUSES] Found",
        warehouses.length,
        "warehouse(s) for",
        profile.role,
      );
    } else {
      console.log("[GET WAREHOUSES] ❌ Unknown role:", profile.role);
      return res.status(403).json({ error: "Access denied" });
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
// GET /api/warehouses/users/managers
// Get list of all managers and QC reps for assignment dropdown
// (Owners only)
// NOTE: This route MUST come before /:id routes to avoid matching "users" as an ID
// ============================================================================
router.get("/users/managers", requireAuth, async (req, res) => {
  try {
    const profile = req.profile;
    console.log("\n[GET ALL MANAGERS] Request from:", req.user.email);

    // Only owners can view all managers
    if (profile.role !== "owner") {
      console.log("[GET ALL MANAGERS] ❌ Access denied - not an owner");
      return res
        .status(403)
        .json({ error: "Only owners can view all managers" });
    }

    // Fetch all users with manager or qc_rep role
    const { data: managers, error } = await supabaseAdmin
      .from("user_profiles")
      .select("id, name, email, role")
      .in("role", ["manager", "qc_rep"])
      .order("name", { ascending: true });

    if (error) {
      console.error("[GET ALL MANAGERS] ❌ Query error:", error.message);
      return res.status(500).json({ error: "Failed to fetch managers" });
    }

    console.log(
      "[GET ALL MANAGERS] ✅ Found",
      managers?.length || 0,
      "managers",
    );
    res.json({ managers: managers || [] });
  } catch (error) {
    console.error("[GET ALL MANAGERS] ❌ Unexpected error:", error);
    res.status(500).json({ error: "Failed to fetch managers" });
  }
});

// ============================================================================
// GET /api/warehouses/:id/managers
// Get all managers assigned to a warehouse
// NOTE: This route MUST come before /:id route to avoid ambiguity
// ============================================================================
router.get("/:id/managers", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = req.profile;
    const warehouseId = req.params.id;
    console.log("\n[GET WAREHOUSE MANAGERS] Request for:", warehouseId);

    // Only owners can view manager assignments
    if (profile.role !== "owner") {
      console.log("[GET WAREHOUSE MANAGERS] ❌ Access denied - not an owner");
      return res
        .status(403)
        .json({ error: "Only owners can view manager assignments" });
    }

    // Check ownership
    const { data: warehouse } = await supabaseAdmin
      .from("warehouses")
      .select("owner_id")
      .eq("id", warehouseId)
      .single();

    if (!warehouse || warehouse.owner_id !== userId) {
      console.log("[GET WAREHOUSE MANAGERS] ❌ Not the owner");
      return res.status(403).json({ error: "Access denied" });
    }

    // Get assignments with manager details
    const { data: assignments, error } = await supabaseAdmin
      .from("manager_warehouse_assignments")
      .select(
        `
        id,
        manager_id,
        warehouse_id,
        assigned_at,
        assigned_by
      `,
      )
      .eq("warehouse_id", warehouseId);

    if (error) {
      console.error("[GET WAREHOUSE MANAGERS] ❌ Query error:", error.message);
      return res.status(500).json({ error: "Failed to fetch managers" });
    }

    // Fetch manager profiles
    if (assignments && assignments.length > 0) {
      const managerIds = assignments.map((a) => a.manager_id);
      const { data: managers } = await supabaseAdmin
        .from("user_profiles")
        .select("id, name, email, role")
        .in("id", managerIds);

      // Join the data
      const managersWithDetails = assignments.map((assignment) => {
        const manager = managers?.find((m) => m.id === assignment.manager_id);
        return {
          ...assignment,
          full_name: manager?.name || "Unknown",
          manager_email: manager?.email || "",
        };
      });

      console.log(
        "[GET WAREHOUSE MANAGERS] ✅ Found",
        managersWithDetails.length,
        "managers",
      );
      res.json({ managers: managersWithDetails });
    } else {
      console.log("[GET WAREHOUSE MANAGERS] No managers assigned");
      res.json({ managers: [] });
    }
  } catch (error) {
    console.error("[GET WAREHOUSE MANAGERS] ❌ Unexpected error:", error);
    res.status(500).json({ error: "Failed to fetch managers" });
  }
});

// ============================================================================
// POST /api/warehouses/:id/managers
// Assign a manager to a warehouse (Owners only)
// Body: { manager_id }
// ============================================================================
router.post("/:id/managers", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = req.profile;
    const warehouseId = req.params.id;
    const { manager_id } = req.body;
    console.log(
      "\n[ASSIGN MANAGER] Assigning manager:",
      manager_id,
      "to warehouse:",
      warehouseId,
    );

    // Only owners can assign managers
    if (profile.role !== "owner") {
      console.log("[ASSIGN MANAGER] ❌ Access denied - not an owner");
      return res.status(403).json({ error: "Only owners can assign managers" });
    }

    if (!manager_id) {
      console.log("[ASSIGN MANAGER] ❌ Missing manager_id");
      return res.status(400).json({ error: "manager_id is required" });
    }

    // Check ownership
    const { data: warehouse } = await supabaseAdmin
      .from("warehouses")
      .select("owner_id")
      .eq("id", warehouseId)
      .single();

    if (!warehouse || warehouse.owner_id !== userId) {
      console.log("[ASSIGN MANAGER] ❌ Not the owner");
      return res.status(403).json({ error: "Access denied" });
    }

    // Verify the manager exists and has manager/qc_rep role
    const { data: managerProfile } = await supabaseAdmin
      .from("user_profiles")
      .select("id, role")
      .eq("id", manager_id)
      .single();

    if (!managerProfile) {
      console.log("[ASSIGN MANAGER] ❌ Manager not found");
      return res.status(404).json({ error: "Manager not found" });
    }

    if (managerProfile.role !== "manager" && managerProfile.role !== "qc_rep") {
      console.log("[ASSIGN MANAGER] ❌ User is not a manager or QC rep");
      return res
        .status(400)
        .json({ error: "User must be a manager or QC rep" });
    }

    // Insert assignment (unique constraint prevents duplicates)
    const { data: assignment, error } = await supabaseAdmin
      .from("manager_warehouse_assignments")
      .insert([
        {
          manager_id,
          warehouse_id: warehouseId,
          assigned_by: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        console.log("[ASSIGN MANAGER] ⚠️ Already assigned");
        return res
          .status(409)
          .json({ error: "Manager is already assigned to this warehouse" });
      }
      console.error("[ASSIGN MANAGER] ❌ Insert error:", error.message);
      return res.status(500).json({ error: "Failed to assign manager" });
    }

    console.log("[ASSIGN MANAGER] ✅ Manager assigned");
    res.status(201).json({ assignment });
  } catch (error) {
    console.error("[ASSIGN MANAGER] ❌ Unexpected error:", error);
    res.status(500).json({ error: "Failed to assign manager" });
  }
});

// ============================================================================
// DELETE /api/warehouses/:id/managers/:managerId
// Unassign a manager from a warehouse (Owners only)
// ============================================================================
router.delete("/:id/managers/:managerId", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = req.profile;
    const warehouseId = req.params.id;
    const managerId = req.params.managerId;
    console.log(
      "\n[UNASSIGN MANAGER] Unassigning manager:",
      managerId,
      "from warehouse:",
      warehouseId,
    );

    // Only owners can unassign managers
    if (profile.role !== "owner") {
      console.log("[UNASSIGN MANAGER] ❌ Access denied - not an owner");
      return res
        .status(403)
        .json({ error: "Only owners can unassign managers" });
    }

    // Check ownership
    const { data: warehouse } = await supabaseAdmin
      .from("warehouses")
      .select("owner_id")
      .eq("id", warehouseId)
      .single();

    if (!warehouse || warehouse.owner_id !== userId) {
      console.log("[UNASSIGN MANAGER] ❌ Not the owner");
      return res.status(403).json({ error: "Access denied" });
    }

    // Delete assignment
    const { error } = await supabaseAdmin
      .from("manager_warehouse_assignments")
      .delete()
      .eq("manager_id", managerId)
      .eq("warehouse_id", warehouseId);

    if (error) {
      console.error("[UNASSIGN MANAGER] ❌ Delete error:", error.message);
      return res.status(500).json({ error: "Failed to unassign manager" });
    }

    console.log("[UNASSIGN MANAGER] ✅ Manager unassigned");
    res.json({ success: true });
  } catch (error) {
    console.error("[UNASSIGN MANAGER] ❌ Unexpected error:", error);
    res.status(500).json({ error: "Failed to unassign manager" });
  }
});

// ============================================================================
// GET /api/warehouses/:id
// Get a specific warehouse by ID
// ============================================================================
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = req.profile;
    const warehouseId = req.params.id;
    console.log(
      "\n[GET WAREHOUSE BY ID] Request for warehouse:",
      warehouseId,
      "by:",
      req.user.email,
      "Role:",
      profile.role,
    );

    // Fetch warehouse
    const { data: warehouse, error } = await supabaseAdmin
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

    // Check access based on role
    if (profile.role === "owner") {
      if (warehouse.owner_id !== userId) {
        console.log(
          "[GET WAREHOUSE BY ID] ❌ Owner access denied - not the owner",
        );
        return res.status(403).json({ error: "Access denied" });
      }
      console.log("[GET WAREHOUSE BY ID] ✅ Owner access granted");
    } else if (profile.role === "manager" || profile.role === "qc_rep") {
      // Check if manager is assigned to this warehouse
      const { data: assignment } = await supabaseAdmin
        .from("manager_warehouse_assignments")
        .select("id")
        .eq("manager_id", userId)
        .eq("warehouse_id", warehouseId)
        .single();

      if (!assignment) {
        console.log(
          "[GET WAREHOUSE BY ID] ❌ Manager/QC access denied - not assigned to this warehouse",
        );
        return res.status(403).json({ error: "Access denied" });
      }
      console.log("[GET WAREHOUSE BY ID] ✅ Manager/QC access granted");
    } else {
      console.log("[GET WAREHOUSE BY ID] ❌ Unknown role - no access");
      return res.status(403).json({ error: "Access denied" });
    }

    console.log("[GET WAREHOUSE BY ID] ✅ Returning warehouse data");
    res.json({ warehouse });
  } catch (error) {
    console.error("[GET WAREHOUSE BY ID] ❌ Unexpected error:", error);
    res.status(500).json({ error: "Failed to fetch warehouse" });
  }
});

// ============================================================================
// POST /api/warehouses
// Create a new warehouse (Owners only)
// ============================================================================
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = req.profile;
    console.log("\n[CREATE WAREHOUSE] Request from:", req.user.email);

    // Only owners can create warehouses
    if (profile.role !== "owner") {
      console.log("[CREATE WAREHOUSE] ❌ Access denied - not an owner");
      return res
        .status(403)
        .json({ error: "Only owners can create warehouses" });
    }

    const { name, location, capacity, zones, storage_type } = req.body;

    // Validation
    if (!name || !location || !capacity || !zones || !storage_type) {
      console.log("[CREATE WAREHOUSE] ❌ Missing required fields");
      return res.status(400).json({
        error:
          "Missing required fields: name, location, capacity, zones, storage_type",
      });
    }

    if (zones < 1 || zones > 4) {
      console.log("[CREATE WAREHOUSE] ❌ Invalid zones count:", zones);
      return res.status(400).json({ error: "Zones must be between 1 and 4" });
    }

    const validStorageTypes = [
      "ambient",
      "refrigerated",
      "controlled_atmosphere",
      "dry",
      "mixed",
    ];
    if (!validStorageTypes.includes(storage_type)) {
      console.log("[CREATE WAREHOUSE] ❌ Invalid storage_type:", storage_type);
      return res.status(400).json({ error: "Invalid storage_type" });
    }

    console.log(
      "[CREATE WAREHOUSE] Creating warehouse:",
      name,
      "with",
      zones,
      "zones",
    );

    // Insert warehouse
    const { data: warehouse, error } = await supabaseAdmin
      .from("warehouses")
      .insert([
        {
          name,
          location,
          capacity: parseInt(capacity),
          zones: parseInt(zones),
          storage_type,
          owner_id: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[CREATE WAREHOUSE] ❌ Insert error:", error.message);
      return res.status(500).json({ error: "Failed to create warehouse" });
    }

    console.log("[CREATE WAREHOUSE] ✅ Warehouse created:", warehouse.id);
    res.status(201).json({ warehouse });
  } catch (error) {
    console.error("[CREATE WAREHOUSE] ❌ Unexpected error:", error);
    res.status(500).json({ error: "Failed to create warehouse" });
  }
});

// ============================================================================
// PUT /api/warehouses/:id
// Update a warehouse (Owners only, must own the warehouse)
// ============================================================================
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = req.profile;
    const warehouseId = req.params.id;
    console.log(
      "\n[UPDATE WAREHOUSE] Request for:",
      warehouseId,
      "by:",
      req.user.email,
    );

    // Only owners can update warehouses
    if (profile.role !== "owner") {
      console.log("[UPDATE WAREHOUSE] ❌ Access denied - not an owner");
      return res
        .status(403)
        .json({ error: "Only owners can update warehouses" });
    }

    // Check ownership
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("warehouses")
      .select("owner_id")
      .eq("id", warehouseId)
      .single();

    if (fetchError || !existing) {
      console.log("[UPDATE WAREHOUSE] ❌ Warehouse not found");
      return res.status(404).json({ error: "Warehouse not found" });
    }

    if (existing.owner_id !== userId) {
      console.log("[UPDATE WAREHOUSE] ❌ Not the owner of this warehouse");
      return res.status(403).json({ error: "Access denied" });
    }

    const { name, location, capacity, zones, storage_type } = req.body;

    // Build update object (only include provided fields)
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (location !== undefined) updates.location = location;
    if (capacity !== undefined) updates.capacity = parseInt(capacity);
    if (zones !== undefined) {
      if (zones < 1 || zones > 4) {
        return res.status(400).json({ error: "Zones must be between 1 and 4" });
      }
      updates.zones = parseInt(zones);
    }
    if (storage_type !== undefined) {
      const validTypes = [
        "ambient",
        "refrigerated",
        "controlled_atmosphere",
        "dry",
        "mixed",
      ];
      if (!validTypes.includes(storage_type)) {
        return res.status(400).json({ error: "Invalid storage_type" });
      }
      updates.storage_type = storage_type;
    }

    if (Object.keys(updates).length === 0) {
      console.log("[UPDATE WAREHOUSE] ⚠️ No fields to update");
      return res.status(400).json({ error: "No fields to update" });
    }

    console.log("[UPDATE WAREHOUSE] Updating with:", updates);

    // Update warehouse
    const { data: warehouse, error } = await supabaseAdmin
      .from("warehouses")
      .update(updates)
      .eq("id", warehouseId)
      .select()
      .single();

    if (error) {
      console.error("[UPDATE WAREHOUSE] ❌ Update error:", error.message);
      return res.status(500).json({ error: "Failed to update warehouse" });
    }

    console.log("[UPDATE WAREHOUSE] ✅ Warehouse updated");
    res.json({ warehouse });
  } catch (error) {
    console.error("[UPDATE WAREHOUSE] ❌ Unexpected error:", error);
    res.status(500).json({ error: "Failed to update warehouse" });
  }
});

// ============================================================================
// DELETE /api/warehouses/:id
// Delete a warehouse (Owners only, must own the warehouse)
// ============================================================================
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = req.profile;
    const warehouseId = req.params.id;
    console.log(
      "\n[DELETE WAREHOUSE] Request for:",
      warehouseId,
      "by:",
      req.user.email,
    );

    // Only owners can delete warehouses
    if (profile.role !== "owner") {
      console.log("[DELETE WAREHOUSE] ❌ Access denied - not an owner");
      return res
        .status(403)
        .json({ error: "Only owners can delete warehouses" });
    }

    // Check ownership
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("warehouses")
      .select("owner_id")
      .eq("id", warehouseId)
      .single();

    if (fetchError || !existing) {
      console.log("[DELETE WAREHOUSE] ❌ Warehouse not found");
      return res.status(404).json({ error: "Warehouse not found" });
    }

    if (existing.owner_id !== userId) {
      console.log("[DELETE WAREHOUSE] ❌ Not the owner of this warehouse");
      return res.status(403).json({ error: "Access denied" });
    }

    console.log("[DELETE WAREHOUSE] Deleting warehouse:", warehouseId);

    // Delete warehouse (CASCADE will handle junction table, batches, sensors, etc.)
    const { error } = await supabaseAdmin
      .from("warehouses")
      .delete()
      .eq("id", warehouseId);

    if (error) {
      console.error("[DELETE WAREHOUSE] ❌ Delete error:", error.message);
      return res.status(500).json({ error: "Failed to delete warehouse" });
    }

    console.log("[DELETE WAREHOUSE] ✅ Warehouse deleted");
    res.json({ success: true });
  } catch (error) {
    console.error("[DELETE WAREHOUSE] ❌ Unexpected error:", error);
    res.status(500).json({ error: "Failed to delete warehouse" });
  }
});

export default router;
