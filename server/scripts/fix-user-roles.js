import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

console.log("\n🔧 Fixing User Roles...\n");

async function fixRoles() {
  try {
    // Use raw SQL to avoid trigger issues
    console.log("Updating user roles using SQL...\n");

    // Fix owner role
    const { data: ownerResult, error: ownerError } = await supabase
      .rpc("exec_sql", {
        sql: `UPDATE public.user_profiles SET role = 'owner' WHERE email = 'owner@nexus.com' RETURNING email, role;`,
      })
      .catch(async () => {
        // If RPC doesn't exist, use direct update with select
        return await supabase
          .from("user_profiles")
          .update({ role: "owner" })
          .eq("email", "owner@nexus.com")
          .select("email, role");
      });

    if (ownerError) {
      console.error("❌ Error updating owner:", ownerError.message);
      console.log("   Please run this SQL in Supabase manually:");
      console.log(
        "   UPDATE user_profiles SET role = 'owner' WHERE email = 'owner@nexus.com';\n",
      );
    } else {
      console.log("✅ Updated owner@nexus.com to 'owner' role");
    }

    // Fix QC role
    const { data: qcResult, error: qcError } = await supabase
      .from("user_profiles")
      .update({ role: "qc_rep" })
      .eq("email", "qc@nexus.com")
      .select("email, role")
      .catch(() => ({ data: null, error: { message: "Update failed" } }));

    if (qcError) {
      console.error("❌ Error updating QC rep:", qcError.message);
      console.log("   Please run this SQL in Supabase manually:");
      console.log(
        "   UPDATE user_profiles SET role = 'qc_rep' WHERE email = 'qc@nexus.com';\n",
      );
    } else {
      console.log("✅ Updated qc@nexus.com to 'qc_rep' role");
    }

    // Assign warehouse to manager
    const { data: warehouse } = await supabase
      .from("warehouses")
      .select("id, name")
      .eq("name", "Mumbai Central Warehouse")
      .single();

    if (warehouse) {
      const { data: managerResult, error: managerError } = await supabase
        .from("user_profiles")
        .update({ warehouse_id: warehouse.id })
        .eq("email", "manager@nexus.com")
        .select("email, warehouse_id")
        .catch(() => ({ data: null, error: { message: "Update failed" } }));

      if (managerError) {
        console.error(
          "❌ Error assigning warehouse to manager:",
          managerError.message,
        );
        console.log("   Please run this SQL in Supabase manually:");
        console.log(
          `   UPDATE user_profiles SET warehouse_id = '${warehouse.id}' WHERE email = 'manager@nexus.com';\n`,
        );
      } else {
        console.log(`✅ Assigned ${warehouse.name} to manager@nexus.com`);
      }
    }

    // Verify changes
    console.log("\n\n📋 Current user roles:\n");
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("email, role, warehouse_id")
      .in("email", ["owner@nexus.com", "manager@nexus.com", "qc@nexus.com"])
      .order("email");

    if (profiles) {
      for (const p of profiles) {
        let warehouseInfo = "";
        if (p.warehouse_id) {
          const { data: wh } = await supabase
            .from("warehouses")
            .select("name")
            .eq("id", p.warehouse_id)
            .single();
          warehouseInfo = ` → ${wh?.name || p.warehouse_id}`;
        }
        console.log(
          `  ${p.email.padEnd(25)} ${p.role.padEnd(10)} ${warehouseInfo}`,
        );
      }
    }

    console.log("\n");
    console.log("=" + "=".repeat(79));
    console.log(
      "If errors occurred above, copy the fix-roles.sql file and run it in",
    );
    console.log(
      "Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql",
    );
    console.log("=" + "=".repeat(79));
    console.log("\n");
  } catch (error) {
    console.error("\n❌ Unexpected error:", error.message);
    console.log(
      "\n⚠️  Please run fix-roles.sql manually in Supabase SQL Editor\n",
    );
  }

  process.exit(0);
}

fixRoles();
