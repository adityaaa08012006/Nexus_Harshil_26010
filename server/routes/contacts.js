/**
 * Contacts Routes — Phase 7
 * Handles farmers, buyers, interaction logs, and price references.
 */

import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sanitiseContact = (body, type) => {
  const base = {
    name: body.name,
    phone: body.phone || null,
    email: body.email || null,
    location: body.location || null,
    notes: body.notes || null,
    type,
  };
  if (type === "farmer" || type === "both") {
    base.growing_crop = body.growing_crop || null;
    base.crop_variety = body.crop_variety || null;
    base.area_acres = body.area_acres != null ? parseFloat(body.area_acres) : null;
    base.expected_harvest_date = body.expected_harvest_date || null;
    base.expected_quantity = body.expected_quantity != null ? parseFloat(body.expected_quantity) : null;
    base.quantity_unit = body.quantity_unit || "kg";
  }
  if (type === "buyer" || type === "both") {
    base.company = body.company || null;
    base.purchase_volume = body.purchase_volume != null ? parseFloat(body.purchase_volume) : null;
    base.preferred_crops = Array.isArray(body.preferred_crops) ? body.preferred_crops : [];
  }
  return base;
};

// ─── GET /api/contacts/farmers ────────────────────────────────────────────────

router.get("/farmers", requireAuth, async (req, res) => {
  try {
    const { warehouse_id, crop } = req.query;
    let query = supabaseAdmin
      .from("contacts")
      .select("*")
      .in("type", ["farmer", "both"])
      .order("created_at", { ascending: false });

    if (warehouse_id) query = query.eq("warehouse_id", warehouse_id);
    if (crop) query = query.eq("growing_crop", crop);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data ?? []);
  } catch (err) {
    console.error("[contacts] GET /farmers:", err.message);
    res.status(500).json({ error: "Failed to fetch farmers." });
  }
});

// ─── GET /api/contacts/buyers ─────────────────────────────────────────────────

router.get("/buyers", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .select("*")
      .in("type", ["buyer", "both"])
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data ?? []);
  } catch (err) {
    console.error("[contacts] GET /buyers:", err.message);
    res.status(500).json({ error: "Failed to fetch buyers." });
  }
});

// ─── GET /api/contacts/search ─────────────────────────────────────────────────

router.get("/search", requireAuth, async (req, res) => {
  try {
    const { q, type } = req.query;
    if (!q) return res.json([]);

    let query = supabaseAdmin
      .from("contacts")
      .select("*")
      .order("name", { ascending: true });

    if (type && type !== "all") {
      query = query.in("type", [type, "both"]);
    }

    query = query.or(
      `name.ilike.%${q}%,location.ilike.%${q}%,growing_crop.ilike.%${q}%,company.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`
    );

    const { data, error } = await query;
    if (error) throw error;
    res.json(data ?? []);
  } catch (err) {
    console.error("[contacts] GET /search:", err.message);
    res.status(500).json({ error: "Failed to search contacts." });
  }
});

// ─── GET /api/contacts/managers — QC-facing: list managers/owners ─────────────

router.get("/managers", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select("id, name, email, role, warehouse_id, warehouse:warehouse_id(name, location)")
      .in("role", ["manager", "owner"])
      .order("role", { ascending: true });
    if (error) throw error;
    res.json(data ?? []);
  } catch (err) {
    console.error("[contacts] GET /managers:", err.message);
    res.status(500).json({ error: "Failed to fetch managers." });
  }
});

// ─── GET /api/contacts/:id ────────────────────────────────────────────────────

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .select("*")
      .eq("id", req.params.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Contact not found." });
    res.json(data);
  } catch (err) {
    console.error("[contacts] GET /:id:", err.message);
    res.status(500).json({ error: "Failed to fetch contact." });
  }
});

// ─── POST /api/contacts — Create contact (Owner only) ────────────────────────

router.post("/", requireAuth, requireRole(["owner"]), async (req, res) => {
  try {
    const { type } = req.body;
    if (!type || !["farmer", "buyer", "both"].includes(type)) {
      return res.status(400).json({ error: "type must be farmer, buyer, or both." });
    }
    if (!req.body.name?.trim()) {
      return res.status(400).json({ error: "name is required." });
    }
    const payload = sanitiseContact(req.body, type);
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error("[contacts] POST /:", err.message);
    res.status(500).json({ error: "Failed to create contact." });
  }
});

// ─── PUT /api/contacts/:id — Update contact (Owner only) ─────────────────────

router.put("/:id", requireAuth, requireRole(["owner"]), async (req, res) => {
  try {
    const existing = await supabaseAdmin
      .from("contacts")
      .select("type")
      .eq("id", req.params.id)
      .single();
    if (existing.error || !existing.data)
      return res.status(404).json({ error: "Contact not found." });

    const type = req.body.type || existing.data.type;
    const payload = { ...sanitiseContact(req.body, type), updated_at: new Date().toISOString() };

    const { data, error } = await supabaseAdmin
      .from("contacts")
      .update(payload)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("[contacts] PUT /:id:", err.message);
    res.status(500).json({ error: "Failed to update contact." });
  }
});

// ─── DELETE /api/contacts/:id — Delete contact (Owner only) ──────────────────

router.delete("/:id", requireAuth, requireRole(["owner"]), async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from("contacts")
      .delete()
      .eq("id", req.params.id);
    if (error) throw error;
    res.json({ message: "Contact deleted." });
  } catch (err) {
    console.error("[contacts] DELETE /:id:", err.message);
    res.status(500).json({ error: "Failed to delete contact." });
  }
});

// ─── GET /api/contacts/:id/logs ───────────────────────────────────────────────

router.get("/:id/logs", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("contact_logs")
      .select("*, logged_by_profile:user_profiles!logged_by(name, email, role)")
      .eq("contact_id", req.params.id)
      .order("logged_at", { ascending: false });
    if (error) throw error;
    res.json(data ?? []);
  } catch (err) {
    console.error("[contacts] GET /:id/logs:", err.message);
    res.status(500).json({ error: "Failed to fetch logs." });
  }
});

// ─── POST /api/contacts/:id/logs — Add interaction log (Owner/Manager) ────────

router.post("/:id/logs", requireAuth, requireRole(["owner", "manager"]), async (req, res) => {
  try {
    const { type, summary, logged_at } = req.body;
    const validTypes = ["call", "email", "meeting", "order", "negotiation", "note", "visit"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${validTypes.join(", ")}` });
    }
    if (!summary?.trim()) {
      return res.status(400).json({ error: "summary is required." });
    }
    const { data, error } = await supabaseAdmin
      .from("contact_logs")
      .insert({
        contact_id: req.params.id,
        type,
        summary,
        logged_by: req.user.id,
        logged_at: logged_at || new Date().toISOString(),
      })
      .select("*, logged_by_profile:user_profiles!logged_by(name, email, role)")
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error("[contacts] POST /:id/logs:", err.message);
    res.status(500).json({ error: "Failed to add log." });
  }
});

// ─── DELETE /api/contacts/:id/logs/:logId (Owner only) ───────────────────────

router.delete("/:id/logs/:logId", requireAuth, requireRole(["owner"]), async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from("contact_logs")
      .delete()
      .eq("id", req.params.logId)
      .eq("contact_id", req.params.id);
    if (error) throw error;
    res.json({ message: "Log deleted." });
  } catch (err) {
    console.error("[contacts] DELETE /:id/logs/:logId:", err.message);
    res.status(500).json({ error: "Failed to delete log." });
  }
});

// ─── GET /api/contacts/:id/prices ─────────────────────────────────────────────

router.get("/:id/prices", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("contact_price_references")
      .select("*")
      .eq("contact_id", req.params.id)
      .order("recorded_at", { ascending: false });
    if (error) throw error;
    res.json(data ?? []);
  } catch (err) {
    console.error("[contacts] GET /:id/prices:", err.message);
    res.status(500).json({ error: "Failed to fetch prices." });
  }
});

// ─── POST /api/contacts/:id/prices — Add price record (Owner only) ────────────

router.post("/:id/prices", requireAuth, requireRole(["owner"]), async (req, res) => {
  try {
    const { crop, offered_price, market_price, unit, notes, recorded_at } = req.body;
    if (!crop?.trim()) return res.status(400).json({ error: "crop is required." });
    const { data, error } = await supabaseAdmin
      .from("contact_price_references")
      .insert({
        contact_id: req.params.id,
        crop,
        offered_price: offered_price != null ? parseFloat(offered_price) : null,
        market_price: market_price != null ? parseFloat(market_price) : null,
        unit: unit || "kg",
        notes: notes || null,
        recorded_at: recorded_at || new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error("[contacts] POST /:id/prices:", err.message);
    res.status(500).json({ error: "Failed to add price record." });
  }
});

// ─── DELETE /api/contacts/:id/prices/:priceId (Owner only) ───────────────────

router.delete("/:id/prices/:priceId", requireAuth, requireRole(["owner"]), async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from("contact_price_references")
      .delete()
      .eq("id", req.params.priceId)
      .eq("contact_id", req.params.id);
    if (error) throw error;
    res.json({ message: "Price record deleted." });
  } catch (err) {
    console.error("[contacts] DELETE /:id/prices/:priceId:", err.message);
    res.status(500).json({ error: "Failed to delete price record." });
  }
});

export default router;
