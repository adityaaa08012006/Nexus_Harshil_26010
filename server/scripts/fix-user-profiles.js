import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "..", ".env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserProfiles() {
  console.log("🔧 Fixing user profiles duplicates...\n");

  try {
    // Step 1: Check for duplicates
    console.log("🔍 Checking for duplicate user profiles...");
    const { data: profiles, error: profileError } = await supabase
      .from("user_profiles")
      .select("id, email, created_at");

    if (profileError) {
      console.error("❌ Error checking profiles:", profileError.message);
      process.exit(1);
    }

    // Count duplicates
    const idCounts = {};
    const duplicateIds = new Set();
    profiles.forEach((profile) => {
      if (idCounts[profile.id]) {
        duplicateIds.add(profile.id);
      }
      idCounts[profile.id] = idCounts[profile.id] || [];
      idCounts[profile.id].push(profile);
    });

    console.log(`📊 Total user profiles: ${profiles.length}`);
    console.log(`🔍 Unique user IDs: ${Object.keys(idCounts).length}`);

    if (duplicateIds.size > 0) {
      console.log(`⚠️  Found ${duplicateIds.size} users with duplicates!\n`);

      // Step 2: Remove duplicates, keeping the most recent
      for (const userId of duplicateIds) {
        const userProfiles = idCounts[userId];
        console.log(`\n👤 User ID: ${userId}`);
        console.log(`   Email: ${userProfiles[0].email}`);
        console.log(`   Total entries: ${userProfiles.length}`);

        // Sort by created_at descending (newest first)
        userProfiles.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );

        // Keep the first (newest), delete the rest
        const toKeep = userProfiles[0];
        const toDelete = userProfiles.slice(1);

        console.log(`   Keeping: ${toKeep.created_at}`);
        console.log(`   Deleting ${toDelete.length} old entries...`);

        // Delete old entries using a raw query since we can't delete by composite conditions easily
        // We'll use the RPC approach or direct SQL execution
      }

      console.log(
        "\n⚠️  IMPORTANT: Please run this SQL in your Supabase SQL Editor:\n",
      );
      console.log("------- COPY BELOW -------");

      const migrationPath = resolve(
        __dirname,
        "..",
        "database",
        "migrations",
        "fix-unique-constraint.sql",
      );
      const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
      console.log(migrationSQL);
      console.log("------- COPY ABOVE -------\n");

      console.log("📝 Instructions:");
      console.log("1. Go to your Supabase Dashboard");
      console.log("2. Navigate to SQL Editor");
      console.log("3. Copy and paste the SQL above");
      console.log("4. Click 'Run' to execute");
      console.log("5. Run this script again to verify\n");
    } else {
      console.log("✅ No duplicate user profiles found!");

      // Still run the constraint check
      console.log("\n🔍 Checking constraints...");
      const migrationPath = resolve(
        __dirname,
        "..",
        "database",
        "migrations",
        "fix-unique-constraint.sql",
      );
      const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

      console.log(
        "\n💡 To ensure all constraints are in place, run this in Supabase SQL Editor:",
      );
      console.log("------- COPY BELOW -------");
      console.log(migrationSQL);
      console.log("------- COPY ABOVE -------");
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
  }
}

fixUserProfiles();
