import { supabaseAdmin } from "../config/supabase.js";
import dotenv from "dotenv";

dotenv.config();

// Test users with password 123456
const TEST_USERS = [
  {
    email: "owner@nexus.com",
    password: "123456",
    role: "owner",
    name: "Raj Sharma",
  },
  {
    email: "manager@nexus.com",
    password: "123456",
    role: "manager",
    name: "Priya Patel",
  },
  {
    email: "qc@nexus.com",
    password: "123456",
    role: "qc_rep",
    name: "Amit Kumar",
  },
];

async function createTestUsers() {
  console.log("👥 Creating test users...");
  const createdUsers = [];

  for (const user of TEST_USERS) {
    // Check if user profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("email", user.email)
      .single();

    if (existingProfile) {
      // Check if role matches, update if needed
      if (existingProfile.role !== user.role) {
        console.log(
          `   ⚠️  Updating role for ${user.email}: ${existingProfile.role} → ${user.role}`,
        );
        const { data: updated } = await supabaseAdmin
          .from("user_profiles")
          .update({ role: user.role, name: user.name })
          .eq("id", existingProfile.id)
          .select()
          .single();

        createdUsers.push(
          updated || { ...existingProfile, role: user.role, name: user.name },
        );
      } else {
        console.log(`   ✓ User exists: ${user.email} (${user.role})`);
        createdUsers.push(existingProfile);
      }
      continue;
    }

    // Check if auth user exists
    const { data: authUsersList } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = authUsersList.users.find(
      (u) => u.email === user.email,
    );

    let authUserId;

    if (existingAuthUser) {
      console.log(`   ⚠️  Auth user exists: ${user.email}`);
      authUserId = existingAuthUser.id;
    } else {
      // Create auth user
      const { data: authUser, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
        });

      if (authError) {
        console.error(
          `   ❌ Error creating auth user ${user.email}:`,
          authError.message,
        );
        continue;
      }

      console.log(`   ✓ Created auth user: ${user.email}`);
      authUserId = authUser.user.id;
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .insert({
        id: authUserId,
        email: user.email,
        name: user.name,
        role: user.role,
      })
      .select()
      .single();

    if (profileError) {
      console.error(
        `   ❌ Error creating profile ${user.email}:`,
        profileError.message,
      );
      continue;
    }

    console.log(`   ✓ Created ${user.role}: ${user.email}`);
    createdUsers.push(profile);
  }

  console.log();
  return createdUsers;
}

async function seedPhase3Data() {
  console.log("🌱 Starting comprehensive database seeding...\n");

  try {
    // Step 1: Create test users
    console.log("1️⃣  Setting up test users...");
    const users = await createTestUsers();

    console.log(`   DEBUG: Found ${users.length} users`);
    users.forEach((u) => console.log(`      - ${u.email}: ${u.role}`));

    const owner = users.find((u) => u.role === "owner");
    const manager = users.find((u) => u.role === "manager");
    const qcRep = users.find((u) => u.role === "qc_rep");

    if (!owner) {
      console.error("❌ Failed to find owner user");
      console.error(
        "   Available users:",
        users.map((u) => `${u.email} (${u.role})`),
      );
      return;
    }

    console.log(`   ✓ Owner: ${owner.email} (ID: ${owner.id})`);
    if (manager)
      console.log(`   ✓ Manager: ${manager.email} (ID: ${manager.id})`);
    if (qcRep) console.log(`   ✓ QC Rep: ${qcRep.email} (ID: ${qcRep.id})`);
    console.log();

    // Step 2: Create warehouses
    console.log("2️⃣  Creating warehouses...");
    const warehousesData = [
      {
        name: "Mumbai Central Warehouse",
        location: "Andheri East, Mumbai, Maharashtra",
        capacity: 2000,
        owner_id: owner.id,
      },
      {
        name: "Delhi Distribution Hub",
        location: "Rohini, New Delhi, Delhi",
        capacity: 1500,
        owner_id: owner.id,
      },
    ];

    const warehouses = [];
    for (const whData of warehousesData) {
      const { data: existing } = await supabaseAdmin
        .from("warehouses")
        .select("*")
        .eq("name", whData.name)
        .single();

      if (existing) {
        console.log(`   ⚠️  Warehouse exists: ${existing.name}`);
        warehouses.push(existing);
      } else {
        const { data: wh, error } = await supabaseAdmin
          .from("warehouses")
          .insert(whData)
          .select()
          .single();

        if (error) {
          console.error(`   ❌ Error creating warehouse:`, error.message);
        } else {
          console.log(`   ✓ Created: ${wh.name}`);
          warehouses.push(wh);
        }
      }
    }
    console.log();

    if (warehouses.length === 0) {
      console.error("❌ No warehouses available");
      return;
    }

    const mainWarehouse = warehouses[0];

    // Step 3: Assign manager to warehouse
    if (manager) {
      console.log("3️⃣  Assigning manager to warehouse...");
      const { error: assignError } = await supabaseAdmin
        .from("user_profiles")
        .update({ warehouse_id: mainWarehouse.id })
        .eq("id", manager.id);

      if (assignError) {
        console.log(`   ⚠️  Error: ${assignError.message}`);
      } else {
        console.log(
          `   ✓ Assigned ${manager.email} to ${mainWarehouse.name}\n`,
        );
      }
    }

    // Step 4: Verify sensor thresholds
    console.log("4️⃣  Verifying sensor thresholds...");
    const { data: thresholds } = await supabaseAdmin
      .from("sensor_thresholds")
      .select("*")
      .eq("warehouse_id", mainWarehouse.id);

    console.log(`   ✓ Found ${thresholds?.length || 0} zone thresholds`);
    console.log();

    // Step 5: Create inventory batches
    console.log("5️⃣  Creating inventory batches...");
    const batchesData = [
      {
        batch_id: "BATCH-2026-001",
        product: "Basmati Rice",
        quantity: 500,
        unit: "kg",
        supplier: "Agri Farms Ltd",
        warehouse_id: mainWarehouse.id,
        storage_location: "Grain Storage",
        received_date: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        expiry_date: new Date(
          Date.now() + 180 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        temperature: 20,
        humidity: 55,
        ethylene_level: 0.2,
        co2_level: 400,
        ammonia_level: 3,
      },
      {
        batch_id: "BATCH-2026-002",
        product: "Fresh Tomatoes",
        quantity: 200,
        unit: "kg",
        supplier: "Green Valley Produce",
        warehouse_id: mainWarehouse.id,
        storage_location: "Fresh Produce",
        received_date: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        expiry_date: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        temperature: 12,
        humidity: 65,
        ethylene_level: 0.8,
        co2_level: 500,
        ammonia_level: 2,
      },
      {
        batch_id: "BATCH-2026-003",
        product: "Frozen Peas",
        quantity: 300,
        unit: "kg",
        supplier: "Cold Chain Foods",
        warehouse_id: mainWarehouse.id,
        storage_location: "Cold Storage",
        received_date: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        expiry_date: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        temperature: 5,
        humidity: 60,
        ethylene_level: 0.1,
        co2_level: 350,
        ammonia_level: 1,
      },
      {
        batch_id: "BATCH-2026-004",
        product: "Wheat Flour",
        quantity: 750,
        unit: "kg",
        supplier: "Mill Masters",
        warehouse_id: mainWarehouse.id,
        storage_location: "Dry Storage",
        received_date: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        expiry_date: new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        temperature: 22,
        humidity: 45,
        ethylene_level: 0.1,
        co2_level: 420,
        ammonia_level: 2,
      },
    ];

    for (const batch of batchesData) {
      const { data: existing } = await supabaseAdmin
        .from("batches")
        .select("*")
        .eq("batch_id", batch.batch_id)
        .single();

      if (existing) {
        console.log(`   ⚠️  Batch exists: ${batch.batch_id}`);
      } else {
        const { error } = await supabaseAdmin.from("batches").insert(batch);

        if (error) {
          console.error(
            `   ❌ Error creating batch ${batch.batch_id}:`,
            error.message,
          );
        } else {
          console.log(`   ✓ Created: ${batch.batch_id} - ${batch.product}`);
        }
      }
    }
    console.log();

    // Step 6: Generate sensor readings for all zones
    console.log("6️⃣  Generating sensor readings...");
    const zones = [
      "Grain Storage",
      "Cold Storage",
      "Dry Storage",
      "Fresh Produce",
    ];
    const zoneParams = {
      "Grain Storage": {
        temp: [18, 22],
        humidity: [50, 60],
        ethylene: 0.2,
        co2: 420,
        ammonia: 3,
      },
      "Cold Storage": {
        temp: [4, 6],
        humidity: [55, 65],
        ethylene: 0.1,
        co2: 380,
        ammonia: 1,
      },
      "Dry Storage": {
        temp: [20, 23],
        humidity: [40, 48],
        ethylene: 0.15,
        co2: 410,
        ammonia: 2,
      },
      "Fresh Produce": {
        temp: [11, 13],
        humidity: [60, 68],
        ethylene: 0.7,
        co2: 480,
        ammonia: 2,
      },
    };

    const readings = [];
    const now = new Date();

    // Create 10 readings per zone (historical + current)
    for (const zone of zones) {
      const params = zoneParams[zone];

      for (let i = 9; i >= 0; i--) {
        const readingTime = new Date(now.getTime() - i * 10 * 60 * 1000); // Every 10 minutes
        const tempVariance = (Math.random() - 0.5) * 2;
        const humidityVariance = (Math.random() - 0.5) * 6;

        readings.push({
          warehouse_id: mainWarehouse.id,
          zone,
          temperature:
            params.temp[0] +
            (params.temp[1] - params.temp[0]) / 2 +
            tempVariance,
          humidity:
            params.humidity[0] +
            (params.humidity[1] - params.humidity[0]) / 2 +
            humidityVariance,
          ethylene: params.ethylene + (Math.random() - 0.5) * 0.1,
          co2: params.co2 + (Math.random() - 0.5) * 50,
          ammonia: params.ammonia + (Math.random() - 0.5) * 1,
          reading_time: readingTime.toISOString(),
        });
      }
    }

    const { error: readingsError } = await supabaseAdmin
      .from("sensor_readings")
      .insert(readings);

    if (readingsError) {
      console.error("   ❌ Error inserting readings:", readingsError.message);
    } else {
      console.log(
        `   ✓ Created ${readings.length} sensor readings (${readings.length / zones.length} per zone)`,
      );
    }
    console.log();

    // Step 7: Create some critical alerts
    console.log("7️⃣  Creating sample alerts...");
    const alerts = [
      {
        warehouse_id: mainWarehouse.id,
        zone: "Fresh Produce",
        alert_type: "temperature",
        severity: "warning",
        message: "Temperature approaching upper threshold",
        current_value: 14.5,
        threshold_value: 15,
        triggered_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      },
      {
        warehouse_id: mainWarehouse.id,
        zone: "Cold Storage",
        alert_type: "humidity",
        severity: "critical",
        message: "Humidity exceeds maximum threshold",
        current_value: 75,
        threshold_value: 70,
        triggered_at: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      },
    ];

    for (const alert of alerts) {
      const { error } = await supabaseAdmin.from("sensor_alerts").insert(alert);

      if (error) {
        console.error(`   ⚠️  Error creating alert:`, error.message);
      } else {
        console.log(`   ✓ Created ${alert.severity} alert for ${alert.zone}`);
      }
    }
    console.log();

    // Success summary
    console.log("✅ Database seeding completed successfully!\n");
    console.log("📊 SUMMARY:");
    console.log("═══════════════════════════════════════════════════");
    console.log("\n👥 TEST USERS (password: 123456):");
    console.log(`   Owner:    owner@nexus.com`);
    console.log(`   Manager:  manager@nexus.com`);
    console.log(`   QC Rep:   qc@nexus.com`);
    console.log("\n🏢 WAREHOUSES:");
    warehouses.forEach((wh) => {
      console.log(`   - ${wh.name} (${wh.location})`);
    });
    console.log("\n📦 BATCHES:");
    console.log(`   - ${batchesData.length} inventory batches created`);
    batchesData.forEach((b) => {
      console.log(`   - ${b.batch_id}: ${b.product} (${b.storage_location})`);
    });
    console.log("\n🌡️  SENSOR DATA:");
    console.log(`   - ${zones.length} zones configured`);
    console.log(`   - ${readings.length} sensor readings generated`);
    console.log(`   - ${alerts.length} active alerts`);
    console.log("\n═══════════════════════════════════════════════════");
    console.log("\n🚀 READY TO TEST!");
    console.log("\n📍 Next steps:");
    console.log("   1. Start server: npm start");
    console.log("   2. Start client: cd ../client && npm run dev");
    console.log("   3. Login with any test account above");
    console.log("   4. Navigate to Dashboard or Sensors page");
    console.log("\n💡 TIP: Each role sees different features!");
    console.log("   - Owner: All warehouses + full access");
    console.log("   - Manager: Assigned warehouse only");
    console.log("   - QC Rep: Allocation requests");
    console.log();
    console.log("🚀 You can now start testing!");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Run the seed function
seedPhase3Data().then(() => process.exit(0));
