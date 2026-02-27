import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const anon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

console.log("\n=== Godam Auth Test ===\n");

// 1. user_profiles table reachable?
const { data: rows, error: tableErr } = await supabase
  .from("user_profiles")
  .select("id, name, role")
  .limit(5);
if (tableErr) {
  console.log("❌ user_profiles table:", tableErr.message);
  console.log("   → Run the SQL snippet in Supabase SQL Editor first.\n");
} else {
  console.log("✅ user_profiles table OK — existing rows:", rows.length);
  if (rows.length > 0) console.log("   Sample:", rows);
}

// 2. Try registering a test user
const testEmail = `test_owner_${Date.now()}@godam.dev`;
const testPassword = "Test@12345";
const testName = "Test Owner";
const testRole = "owner";

console.log(`\n--- Register test user: ${testEmail} ---`);
const { data: signUpData, error: signUpErr } = await anon.auth.signUp({
  email: testEmail,
  password: testPassword,
  options: { data: { name: testName, role: testRole } },
});

if (signUpErr) {
  console.log("❌ signUp failed:", signUpErr.message);
} else {
  const uid = signUpData.user?.id;
  console.log("✅ Auth user created — id:", uid);

  // Insert profile using SERVICE key (bypasses RLS, simulates server-side register)
  const { error: profileErr } = await supabase.from("user_profiles").insert({
    id: uid,
    name: testName,
    email: testEmail,
    role: testRole,
  });
  if (profileErr) console.log("❌ Profile insert failed:", profileErr.message);
  else console.log("✅ Profile row inserted");
}

// 3. Try logging in with existing user (only works if email confirm is disabled in Supabase)
console.log(`\n--- Login test ---`);
const { data: loginData, error: loginErr } = await anon.auth.signInWithPassword(
  {
    email: testEmail,
    password: testPassword,
  },
);

if (loginErr) {
  console.log("❌ Login failed:", loginErr.message);
  if (loginErr.message.includes("Email not confirmed")) {
    console.log(
      '   → Go to Supabase Dashboard → Auth → Settings → disable "Enable email confirmations"',
    );
  }
} else {
  console.log("✅ Login succeeded — user:", loginData.user?.email);
  console.log(
    "   Access token (first 40 chars):",
    loginData.session?.access_token?.slice(0, 40) + "...",
  );

  // 4. Fetch own profile
  const { data: profile, error: profErr } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", loginData.user.id)
    .single();

  if (profErr) console.log("❌ Profile fetch failed:", profErr.message);
  else console.log("✅ Profile fetch OK:", profile);

  // Clean up - sign out
  await anon.auth.signOut();
  console.log("\n✅ Signed out");
}

console.log("\n=== Done ===\n");
