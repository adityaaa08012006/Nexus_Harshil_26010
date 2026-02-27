import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/auth.js";
import "dotenv/config";

const router = Router();

// Supabase admin client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

// ── POST /api/auth/register ───────────────────────────────────────────────────
// Body: { name, email, password, role }
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ error: "name, email, password and role are required." });
  }

  const validRoles = ["owner", "manager", "qc_rep"];
  if (!validRoles.includes(role)) {
    return res
      .status(400)
      .json({ error: `role must be one of: ${validRoles.join(", ")}` });
  }

  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // skip email confirmation for demo
        user_metadata: { name, role },
      });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    // Insert profile row
    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .insert({ id: userId, name, email, role });

    if (profileError) {
      // Roll back auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return res
        .status(500)
        .json({ error: "Profile creation failed: " + profileError.message });
    }

    return res.status(201).json({
      message: "User registered successfully.",
      user: { id: userId, name, email, role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// Note: The frontend calls Supabase Auth directly; this endpoint is for
// server-to-server flows or backend-initiated logins only.
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required." });
  }

  try {
    const supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
    );
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return res.status(401).json({ error: error.message });

    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("id, name, email, role, warehouse_id")
      .eq("id", data.user.id)
      .single();

    return res.json({
      session: data.session,
      user: profile ?? { id: data.user.id, email: data.user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post("/logout", requireAuth, async (req, res) => {
  try {
    const authHeader = req.headers.authorization ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token) {
      await supabaseAdmin.auth.admin.signOut(token);
    }
    res.json({ message: "Logged out successfully." });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Server error during logout" });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get("/me", requireAuth, async (req, res) => {
  const profile = req.user?.profile;
  if (!profile) return res.status(404).json({ error: "Profile not found." });
  res.json({ user: profile });
});

export default router;
