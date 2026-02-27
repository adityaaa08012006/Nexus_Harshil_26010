import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

// Admin client bypasses RLS — only use server-side
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // service role key, NOT anon key
);

/**
 * Verifies the Bearer JWT sent by the frontend and attaches user + profile to req.
 * Usage: router.get('/protected', requireAuth, handler)
 */
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Fetch profile for role info
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("id, name, email, role, warehouse_id")
      .eq("id", user.id)
      .single();

    req.user = { ...user, profile };
    next();
  } catch (err) {
    console.error("requireAuth error:", err);
    res.status(500).json({ error: "Authentication error" });
  }
};

/**
 * Factory that restricts access to specific roles.
 * Must be used after requireAuth.
 * Usage: router.get('/owner-only', requireAuth, requireRole(['owner']), handler)
 *
 * @param {string[]} allowedRoles
 */
export const requireRole = (allowedRoles) => (req, res, next) => {
  const role = req.user?.profile?.role;
  if (!role || !allowedRoles.includes(role)) {
    return res.status(403).json({
      error: `Access denied. Required role(s): ${allowedRoles.join(", ")}.`,
    });
  }
  next();
};
