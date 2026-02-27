import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

console.log("\n🔍 Verifying Database Contents...\n");
console.log("=" + "=".repeat(79));

async function verifyDatabase() {
  try {
    // Check warehouses
    console.log("\n📦 WAREHOUSES:");
    console.log("-".repeat(80));
    const { data: warehouses, error: whError } = await supabase
      .from("warehouses")
      .select("*")
      .order("created_at", { ascending: false });

    if (whError) {
      console.error("❌ Error fetching warehouses:", whError.message);
    } else if (warehouses.length === 0) {
      console.log("⚠️  No warehouses found in database!");
    } else {
      console.log(`✅ Found ${warehouses.length} warehouse(s):\n`);
      warehouses.forEach((w, i) => {
        console.log(`${i + 1}. ${w.name}`);
        console.log(`   ID: ${w.id}`);
        console.log(`   Location: ${w.location}`);
        console.log(`   Capacity: ${w.capacity}`);
        console.log(`   Owner ID: ${w.owner_id}`);
        console.log(`   Created: ${new Date(w.created_at).toLocaleString()}\n`);
      });
    }

    // Check user profiles
    console.log("\n👥 USER PROFILES:");
    console.log("-".repeat(80));
    const { data: profiles, error: profError } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profError) {
      console.error("❌ Error fetching user profiles:", profError.message);
    } else if (profiles.length === 0) {
      console.log("⚠️  No user profiles found!");
    } else {
      console.log(`✅ Found ${profiles.length} user profile(s):\n`);
      profiles.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} (${p.email})`);
        console.log(`   User ID: ${p.id}`);
        console.log(`   Role: ${p.role}`);
        console.log(`   Warehouse ID: ${p.warehouse_id || "none"}`);
        console.log(`   Created: ${new Date(p.created_at).toLocaleString()}\n`);
      });
    }

    // Cross-reference: Check which users can access which warehouses
    console.log("\n🔐 ACCESS MAPPING:");
    console.log("-".repeat(80));

    if (warehouses.length > 0 && profiles.length > 0) {
      profiles.forEach((profile) => {
        console.log(`\n${profile.email} (${profile.role}):`);

        if (profile.role === "owner") {
          const ownedWarehouses = warehouses.filter(
            (w) => w.owner_id === profile.id,
          );
          if (ownedWarehouses.length > 0) {
            console.log(`  ✅ Owns ${ownedWarehouses.length} warehouse(s):`);
            ownedWarehouses.forEach((w) => console.log(`     - ${w.name}`));
          } else {
            console.log(
              `  ⚠️  Owns no warehouses (owner_id does not match any warehouse)`,
            );
          }
        } else if (profile.role === "manager") {
          if (profile.warehouse_id) {
            const assignedWarehouse = warehouses.find(
              (w) => w.id === profile.warehouse_id,
            );
            if (assignedWarehouse) {
              console.log(`  ✅ Assigned to: ${assignedWarehouse.name}`);
            } else {
              console.log(
                `  ⚠️  Assigned to warehouse ID ${profile.warehouse_id} (NOT FOUND)`,
              );
            }
          } else {
            console.log(`  ⚠️  No warehouse assigned`);
          }
        } else if (profile.role === "qc_rep") {
          console.log(`  ℹ️  QC Reps have no warehouse access`);
        }
      });
    }

    // Check sensor data
    console.log("\n\n📊 SENSOR DATA:");
    console.log("-".repeat(80));
    const { data: readings, error: readError } = await supabase
      .from("sensor_readings")
      .select("warehouse_id, zone, count")
      .order("warehouse_id");

    if (readError) {
      console.error("❌ Error fetching sensor readings:", readError.message);
    } else {
      const { count } = await supabase
        .from("sensor_readings")
        .select("*", { count: "exact", head: true });

      console.log(`✅ Total sensor readings: ${count || 0}`);

      if (count > 0) {
        const byWarehouse = {};
        for (const wh of warehouses) {
          const { count: whCount } = await supabase
            .from("sensor_readings")
            .select("*", { count: "exact", head: true })
            .eq("warehouse_id", wh.id);

          if (whCount > 0) {
            byWarehouse[wh.name] = whCount;
          }
        }

        console.log("\nReadings by warehouse:");
        Object.entries(byWarehouse).forEach(([name, count]) => {
          console.log(`  - ${name}: ${count} reading(s)`);
        });
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("✅ Verification complete!\n");
  } catch (error) {
    console.error("\n❌ Unexpected error:", error);
  }

  process.exit(0);
}

verifyDatabase();
