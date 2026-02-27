// Quick test to verify Supabase connection
// Run this in browser console: import('./test-supabase-connection.ts')

import { supabase } from "./lib/supabase";

console.log("[Supabase Test] Starting connection test...");
console.log("[Supabase Test] URL:", import.meta.env.VITE_SUPABASE_URL);
console.log(
  "[Supabase Test] Anon Key (first 20 chars):",
  import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20),
);

// Test 1: Simple query
console.log("[Supabase Test] Test 1: Fetching user_profiles...");
supabase
  .from("user_profiles")
  .select("id, email, role")
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error("[Supabase Test] Query error:", error);
    } else {
      console.log("[Supabase Test] Query successful:", data);
    }
  })
  .catch((err) => {
    console.error("[Supabase Test] Query exception:", err);
  });

// Test 2: Check session
console.log("[Supabase Test] Test 2: Getting current session...");
supabase.auth
  .getSession()
  .then(({ data, error }) => {
    if (error) {
      console.error("[Supabase Test] Session error:", error);
    } else {
      console.log(
        "[Supabase Test] Session:",
        data.session ? "Active" : "No session",
      );
    }
  })
  .catch((err) => {
    console.error("[Supabase Test] Session exception:", err);
  });

console.log("[Supabase Test] Tests initiated. Check results above.");
