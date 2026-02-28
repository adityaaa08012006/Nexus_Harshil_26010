/**
 * Messaging Routes
 * In-app message threads between QC Reps and Managers per allocation request.
 */

import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";

const router = Router();

// ─── GET /api/messages/:allocationId  –  List messages for an allocation ────
router.get("/:allocationId", requireAuth, async (req, res) => {
  try {
    const { allocationId } = req.params;

    const { data: messages, error } = await supabaseAdmin
      .from("messages")
      .select("*")
      .eq("allocation_id", allocationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Fetch sender profiles separately since messages.sender_id -> auth.users, not user_profiles
    if (messages && messages.length > 0) {
      const senderIds = [...new Set(messages.map(m => m.sender_id))];
      const { data: profiles } = await supabaseAdmin
        .from("user_profiles")
        .select("id, name, email, role")
        .in("id", senderIds);

      // Attach sender info to each message
      const messagesWithSenders = messages.map(msg => ({
        ...msg,
        sender: profiles?.find(p => p.id === msg.sender_id) || null
      }));

      return res.json(messagesWithSenders);
    }

    res.json(messages ?? []);
  } catch (err) {
    console.error("[messages] GET /:allocationId:", err.message);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

// ─── POST /api/messages/:allocationId  –  Send a message ───────────────────
router.post("/:allocationId", requireAuth, async (req, res) => {
  try {
    const { allocationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Message content is required." });
    }

    // Verify the allocation exists
    const { data: alloc, error: allocErr } = await supabaseAdmin
      .from("allocation_requests")
      .select("id")
      .eq("id", allocationId)
      .single();

    if (allocErr || !alloc) {
      return res.status(404).json({ error: "Allocation request not found." });
    }

    const { data: message, error } = await supabaseAdmin
      .from("messages")
      .insert({
        allocation_id: allocationId,
        sender_id: req.user.id,
        content: content.trim(),
      })
      .select("*")
      .single();

    if (error) throw error;

    // Fetch sender profile separately
    const { data: sender } = await supabaseAdmin
      .from("user_profiles")
      .select("id, name, email, role")
      .eq("id", req.user.id)
      .single();

    res.status(201).json({ ...message, sender });
  } catch (err) {
    console.error("[messages] POST /:allocationId:", err.message);
    res.status(500).json({ error: "Failed to send message." });
  }
});

// ─── PUT /api/messages/:allocationId/read  –  Mark messages as read ────────
router.put("/:allocationId/read", requireAuth, async (req, res) => {
  try {
    const { allocationId } = req.params;

    const { error } = await supabaseAdmin
      .from("messages")
      .update({ is_read: true })
      .eq("allocation_id", allocationId)
      .neq("sender_id", req.user.id);

    if (error) throw error;

    res.json({ message: "Messages marked as read." });
  } catch (err) {
    console.error("[messages] PUT /:allocationId/read:", err.message);
    res.status(500).json({ error: "Failed to mark messages as read." });
  }
});

// ─── GET /api/messages/unread/count  –  Unread message count ────────────────
router.get("/unread/count", requireAuth, async (req, res) => {
  try {
    const { count, error } = await supabaseAdmin
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false)
      .neq("sender_id", req.user.id);

    if (error) throw error;

    res.json({ count: count ?? 0 });
  } catch (err) {
    console.error("[messages] GET /unread/count:", err.message);
    res.status(500).json({ error: "Failed to fetch unread count." });
  }
});

export default router;
