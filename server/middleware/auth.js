import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "..", ".env") });

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
  console.log("[AUTH MIDDLEWARE] Checking request to:", req.method, req.path);
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    console.log("[AUTH MIDDLEWARE] ❌ No token provided");
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    console.log("[AUTH MIDDLEWARE] Validating token with Supabase...");
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      console.log("[AUTH MIDDLEWARE] ❌ Invalid token:", error?.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    console.log("[AUTH MIDDLEWARE] ✅ User authenticated:", user.email);

    // Fetch profile for role info
    console.log("[AUTH MIDDLEWARE] Fetching user profile...");
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("id, name, email, role, warehouse_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.log(
        "[AUTH MIDDLEWARE] ❌ Profile fetch error:",
        profileError.message,
      );
      return res.status(500).json({ error: "Failed to load user profile" });
    }

    if (!profile) {
      console.log("[AUTH MIDDLEWARE] ❌ No profile found for user");
      return res.status(404).json({ error: "User profile not found" });
    }

    console.log(
      "[AUTH MIDDLEWARE] ✅ Profile loaded - Role:",
      profile.role,
      "Warehouse:",
      profile.warehouse_id || "none",
    );

    req.user = user;
    req.profile = profile;
    next();
  } catch (err) {
    console.error("[AUTH MIDDLEWARE] ❌ Exception:", err);
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
