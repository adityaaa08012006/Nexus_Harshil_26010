/**
 * Allocation Routes
 * Handles creation, listing, approval (partial deduction), and rejection of
 * allocation requests.  Approval deducts the requested quantity from the matched
 * batch and creates a dispatch record.
 */

import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";
import { getGeminiModel } from "../config/gemini.js";

const router = Router();

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Generate a human-readable request ID */
const generateRequestId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AR-${ts}-${rand}`;
};

const generateDispatchId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `D-${ts}-${rand}`;
};

// ─── POST /api/allocation  –  Create an allocation request ──────────────────

router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      crop,
      variety,
      quantity,
      unit = "kg",
      deadline,
      location,
      price,
      notes,
      warehouse_id,
    } = req.body;

    if (!crop || !quantity || !location) {
      return res
        .status(400)
        .json({ error: "crop, quantity, and location are required." });
    }

    const { data, error } = await supabaseAdmin
      .from("allocation_requests")
      .insert({
        request_id: generateRequestId(),
        requester_id: req.user.id,
        crop,
        variety: variety || null,
        quantity: Number(quantity),
        unit,
        deadline: deadline || null,
        location,
        warehouse_id: warehouse_id || null,
        price: price ? Number(price) : null,
        notes: notes || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("[allocation] Insert error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    // Create an alert for managers about the new order
    try {
      await supabaseAdmin.from("alerts").insert({
        warehouse_id: warehouse_id || null, // Alert for specific warehouse manager
        zone: location,
        type: "order",
        severity: "info",
        message: `New order request for ${quantity}${unit} of ${crop}${variety ? ` (${variety})` : ""} - ${data.request_id}`,
        is_acknowledged: false,
      });
    } catch (alertErr) {
      // Log but don't fail the request if alert creation fails
      console.error("[allocation] Alert creation error:", alertErr.message);
    }

    res.status(201).json(data);
  } catch (err) {
    console.error("[allocation] POST /:", err.message);
    res.status(500).json({ error: "Failed to create allocation request." });
  }
});

// ─── GET /api/allocation  –  List allocation requests ───────────────────────

router.get("/", requireAuth, async (req, res) => {
  try {
    const role = req.user.profile?.role;
    let query = supabaseAdmin
      .from("allocation_requests")
      .select("*, requester:user_profiles!requester_id(name, email, role)")
      .order("created_at", { ascending: false });

    // QC reps only see their own requests
    if (role === "qc_rep") {
      query = query.eq("requester_id", req.user.id);
    }

    // Optionally filter by status
    const { status } = req.query;
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data ?? []);
  } catch (err) {
    console.error("[allocation] GET /:", err.message);
    res.status(500).json({ error: "Failed to fetch allocation requests." });
  }
});

// ─── GET /api/allocation/suggest-farmers  ──────────────────────────────────
// Returns AI-generated sourcing suggestion when no batch fully matches an order.
// Query params: crop (required), quantity (required), unit (optional)
router.get("/suggest-farmers", requireAuth, async (req, res) => {
  try {
    const { crop, quantity, unit = "kg" } = req.query;
    if (!crop || !quantity) {
      return res
        .status(400)
        .json({ error: "crop and quantity are required query parameters." });
    }

    // 1. Find farmers that grow this crop (case-insensitive fuzzy match)
    const { data: farmers, error: farmersError } = await supabaseAdmin
      .from("contacts")
      .select(
        "id, name, phone, email, location, growing_crop, crop_variety, expected_quantity, warehouse_id",
      )
      .ilike("growing_crop", `%${crop}%`);

    if (farmersError) throw farmersError;

    if (!farmers || farmers.length === 0) {
      return res.json({
        suggestion:
          `No registered farmers found who grow ${crop}. ` +
          `Consider reaching out to nearby agricultural cooperatives or mandi boards.`,
        farmers: [],
      });
    }

    // 2. Ask Gemini (same model as PDF parsing)
    const model = getGeminiModel();

    const farmerList = farmers
      .map(
        (f, i) =>
          `${i + 1}. ${f.name} | Location: ${f.location} | Crop: ${f.growing_crop}${f.crop_variety ? ` (${f.crop_variety})` : ""} | Expected quantity: ${f.expected_quantity ? f.expected_quantity + " kg" : "unknown"}`,
      )
      .join("\n");

    const prompt = `
You are a procurement assistant for an agricultural warehouse management system.
A buyer needs ${quantity} ${unit} of ${crop}, but no stock batch is available in the warehouse.

The following registered farmers grow ${crop}:
${farmerList}

Based on this information:
1. Recommend which farmer(s) can most likely fulfil this order and why.
2. Suggest a procurement strategy (e.g. combine multiple farmers, partial sourcing timeline).
3. Keep your response concise and actionable (3-5 sentences max).
Do NOT repeat the farmer list — just reference them by name.
`.trim();

    const result = await model.generateContent(prompt);
    const suggestion = result.response.text();

    return res.json({ suggestion, farmers });
  } catch (err) {
    console.error("[allocation] GET /suggest-farmers:", err.message);
    res.status(500).json({ error: "Failed to generate sourcing suggestion." });
  }
});

// ─── GET /api/allocation/:id  –  Single request detail ──────────────────────

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("allocation_requests")
      .select("*, requester:user_profiles!requester_id(name, email, role)")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found" });

    res.json(data);
  } catch (err) {
    console.error("[allocation] GET /:id:", err.message);
    res.status(500).json({ error: "Failed to fetch allocation request." });
  }
});

// ─── PUT /api/allocation/:id/approve  –  Approve & deduct from batch ───────

router.put(
  "/:id/approve",
  requireAuth,
  requireRole(["manager", "owner"]),
  async (req, res) => {
    try {
      const { batch_id } = req.body; // the batch UUID to deduct from

      if (!batch_id) {
        return res.status(400).json({ error: "batch_id is required." });
      }

      // 1. Fetch the allocation request
      const { data: request, error: reqErr } = await supabaseAdmin
        .from("allocation_requests")
        .select("*")
        .eq("id", req.params.id)
        .single();

      if (reqErr || !request) {
        return res.status(404).json({ error: "Allocation request not found." });
      }

      if (request.status !== "pending" && request.status !== "reviewing") {
        return res.status(400).json({
          error: `Cannot approve a request with status "${request.status}".`,
        });
      }

      // 2. Fetch the batch
      const { data: batch, error: batchErr } = await supabaseAdmin
        .from("batches")
        .select("*")
        .eq("id", batch_id)
        .single();

      if (batchErr || !batch) {
        return res.status(404).json({ error: "Batch not found." });
      }

      if (batch.status !== "active") {
        return res
          .status(400)
          .json({ error: "Batch is not active — cannot allocate." });
      }

      const requestedQty = Number(request.quantity);
      const availableQty = Number(batch.quantity);

      if (requestedQty > availableQty) {
        return res.status(400).json({
          error: `Insufficient quantity. Requested ${requestedQty} ${request.unit}, available ${availableQty} ${batch.unit}.`,
        });
      }

      // 3. Deduct quantity (partial allocation)
      const remainingQty = availableQty - requestedQty;
      const batchUpdate = {
        quantity: remainingQty,
        ...(remainingQty === 0
          ? { status: "dispatched", dispatch_date: new Date().toISOString() }
          : {}),
        updated_at: new Date().toISOString(),
      };

      const { error: updateBatchErr } = await supabaseAdmin
        .from("batches")
        .update(batchUpdate)
        .eq("id", batch_id);

      if (updateBatchErr) throw updateBatchErr;

      // 4. Create a dispatch record
      const { error: dispatchErr } = await supabaseAdmin
        .from("dispatches")
        .insert({
          dispatch_id: generateDispatchId(),
          batch_id: batch_id,
          allocation_id: request.id,
          destination: request.location,
          quantity: requestedQty,
          unit: request.unit,
          status: "pending",
        });

      if (dispatchErr) {
        console.error(
          "[allocation] Dispatch insert error:",
          dispatchErr.message,
        );
        // Non-fatal — the batch deduction already succeeded
      }

      // 5. Update the allocation request status
      const { data: updated, error: updateReqErr } = await supabaseAdmin
        .from("allocation_requests")
        .update({
          status: "allocated",
          updated_at: new Date().toISOString(),
        })
        .eq("id", req.params.id)
        .select()
        .single();

      if (updateReqErr) throw updateReqErr;

      res.json({
        message: "Allocation approved successfully.",
        allocation: updated,
        batch: { ...batch, ...batchUpdate },
        dispatch: {
          batch_id,
          quantity: requestedQty,
          destination: request.location,
        },
      });
    } catch (err) {
      console.error("[allocation] PUT /:id/approve:", err.message);
      res.status(500).json({ error: "Failed to approve allocation." });
    }
  },
);

// ─── PUT /api/allocation/:id/reject  –  Reject request ─────────────────────

router.put(
  "/:id/reject",
  requireAuth,
  requireRole(["manager", "owner"]),
  async (req, res) => {
    try {
      const { reason } = req.body;

      const { data, error } = await supabaseAdmin
        .from("allocation_requests")
        .update({
          status: "cancelled",
          notes: reason
            ? `Rejected: ${reason}`
            : "Rejected by warehouse manager.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", req.params.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Request not found." });

      res.json({ message: "Allocation request rejected.", allocation: data });
    } catch (err) {
      console.error("[allocation] PUT /:id/reject:", err.message);
      res.status(500).json({ error: "Failed to reject allocation." });
    }
  },
);

export default router;
