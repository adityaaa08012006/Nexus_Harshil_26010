/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ULTIMATE TEST SEED SCRIPT — Nexus Warehouse Management
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Wipes ALL data and repopulates with comprehensive test data covering
 * every feature: dashboards, inventory, sensors, alerts, allocations,
 * dispatches, messages, farmers/buyers, PDF parsing history, and analytics.
 *
 * Usage:  node scripts/seed-ultimate.js
 *
 * Test accounts (password: 123456):
 *   - owner@nexus.com   (Owner — full platform access)
 *   - manager@nexus.com (Manager — Mumbai warehouse)
 *   - manager2@nexus.com(Manager — Delhi warehouse)
 *   - qc@nexus.com      (QC Rep — allocation ordering)
 *   - qc2@nexus.com     (QC Rep — second QC user)
 *
 * ══════════════════════════════════════════════════════════════════════════════
 */

import { supabaseAdmin } from "../config/supabase.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "..", ".env") });

if (!supabaseAdmin) {
  console.error(
    "❌ SUPABASE_SERVICE_ROLE_KEY not set. Cannot run seed script.",
  );
  process.exit(1);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const d = (daysAgo) => new Date(Date.now() - daysAgo * 864e5).toISOString();
const dFuture = (daysAhead) =>
  new Date(Date.now() + daysAhead * 864e5).toISOString();
const rand = (min, max) => +(min + Math.random() * (max - min)).toFixed(2);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const uuid = () => crypto.randomUUID();

// ─── Test user definitions ──────────────────────────────────────────────────

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
    email: "manager2@nexus.com",
    password: "123456",
    role: "manager",
    name: "Vikram Singh",
  },
  {
    email: "qc@nexus.com",
    password: "123456",
    role: "qc_rep",
    name: "Amit Kumar",
  },
  {
    email: "qc2@nexus.com",
    password: "123456",
    role: "qc_rep",
    name: "Neha Verma",
  },
];

// ─── Warehouse definitions ──────────────────────────────────────────────────

const WAREHOUSES = [
  {
    name: "Mumbai Central Warehouse",
    location: "Andheri East, Mumbai, Maharashtra",
    capacity: 50000,
    zones: 4,
    storage_type: "cold",
  },
  {
    name: "Delhi Distribution Hub",
    location: "Rohini Sector 18, New Delhi, Delhi",
    capacity: 35000,
    zones: 4,
    storage_type: "ambient",
  },
  {
    name: "Pune Agri Storage",
    location: "MIDC Chakan, Pune, Maharashtra",
    capacity: 25000,
    zones: 3,
    storage_type: "cold",
  },
];

// ─── Zone definitions (must match sensorSimulator.js) ───────────────────────

const ZONES = ["Grain Storage", "Cold Storage", "Dry Storage", "Fresh Produce"];

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 0: NUKE EVERYTHING
// ═══════════════════════════════════════════════════════════════════════════════

async function nukeAllData() {
  console.log("💥 PHASE 0 — Clearing ALL existing data...\n");

  // Delete in FK order (children first)
  const tables = [
    "messages",
    "dispatches",
    "contact_logs",
    "contact_price_references",
    "parsed_requirements",
    "sensor_alerts",
    "sensor_readings",
    "sensor_thresholds",
    "alerts",
    "batches",
    "allocation_requests",
    "manager_warehouse_assignments",
    "contacts",
    "user_profiles",
    "warehouses",
  ];

  for (const table of tables) {
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      console.log(`   ⚠️  ${table}: ${error.message}`);
    } else {
      console.log(`   🗑️  Cleared: ${table}`);
    }
  }

  // Delete auth users
  console.log("\n   🔑 Clearing auth users...");
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
  if (authUsers?.users) {
    for (const u of authUsers.users) {
      await supabaseAdmin.auth.admin.deleteUser(u.id);
    }
    console.log(`   🗑️  Deleted ${authUsers.users.length} auth users`);
  }

  console.log("\n   ✅ Database is clean!\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 1: USERS
// ═══════════════════════════════════════════════════════════════════════════════

async function createUsers() {
  console.log("👥 PHASE 1 — Creating test users...\n");
  const users = {};

  for (const u of TEST_USERS) {
    const { data: authUser, error: authErr } =
      await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { name: u.name, role: u.role },
      });

    if (authErr) {
      console.error(`   ❌ Auth error for ${u.email}: ${authErr.message}`);
      continue;
    }

    // The DB trigger auto-creates a user_profile row on auth.users INSERT.
    // We just need to update it with the correct role and name.
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("user_profiles")
      .update({ name: u.name, role: u.role, email: u.email })
      .eq("id", authUser.user.id)
      .select()
      .single();

    if (profileErr) {
      console.error(
        `   ❌ Profile update error for ${u.email}: ${profileErr.message}`,
      );
      continue;
    }

    users[u.email] = profile;
    console.log(`   ✓ ${u.role.padEnd(8)} ${u.email} → ${profile.id}`);
  }

  console.log();
  return users;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 2: WAREHOUSES + ASSIGNMENTS
// ═══════════════════════════════════════════════════════════════════════════════

async function createWarehouses(users) {
  console.log("🏢 PHASE 2 — Creating warehouses & assigning managers...\n");
  const owner = users["owner@nexus.com"];
  const warehouses = [];

  for (const wh of WAREHOUSES) {
    const { data, error } = await supabaseAdmin
      .from("warehouses")
      .insert({ ...wh, owner_id: owner.id })
      .select()
      .single();

    if (error) {
      console.error(`   ❌ ${wh.name}: ${error.message}`);
      continue;
    }
    warehouses.push(data);
    console.log(
      `   ✓ ${data.name} (${data.zones} zones, ${data.capacity} cap)`,
    );
  }

  // Assign managers
  const mgr1 = users["manager@nexus.com"];
  const mgr2 = users["manager2@nexus.com"];

  if (mgr1 && warehouses[0]) {
    await supabaseAdmin
      .from("user_profiles")
      .update({ warehouse_id: warehouses[0].id })
      .eq("id", mgr1.id);

    await supabaseAdmin.from("manager_warehouse_assignments").insert({
      manager_id: mgr1.id,
      warehouse_id: warehouses[0].id,
      assigned_by: owner.id,
    });
    console.log(`   📌 ${mgr1.name} → ${warehouses[0].name}`);
  }

  if (mgr2 && warehouses[1]) {
    await supabaseAdmin
      .from("user_profiles")
      .update({ warehouse_id: warehouses[1].id })
      .eq("id", mgr2.id);

    await supabaseAdmin.from("manager_warehouse_assignments").insert({
      manager_id: mgr2.id,
      warehouse_id: warehouses[1].id,
      assigned_by: owner.id,
    });
    console.log(`   📌 ${mgr2.name} → ${warehouses[1].name}`);
  }

  console.log();
  return warehouses;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 3: CONTACTS (Farmers + Buyers)
// ═══════════════════════════════════════════════════════════════════════════════

async function createContacts(warehouses) {
  console.log("🌾 PHASE 3 — Creating farmers & buyers...\n");

  const farmers = [
    {
      type: "farmer",
      name: "Rajan Patil",
      phone: "+91 98765 11001",
      email: "rajan.patil@gmail.com",
      location: "Nashik, Maharashtra",
      area_acres: 8.5,
      growing_crop: "Tomato",
      crop_variety: "Roma",
      expected_harvest_date: dFuture(45).slice(0, 10),
      expected_quantity: 4800,
      quantity_unit: "kg",
      warehouse_id: warehouses[0].id,
      notes: "Primarily grows Roma tomatoes; drip irrigation",
    },
    {
      type: "farmer",
      name: "Sunita Desai",
      phone: "+91 98765 11002",
      email: "sunita.desai@gmail.com",
      location: "Satara, Maharashtra",
      area_acres: 14,
      growing_crop: "Potato",
      crop_variety: "Kufri Jyoti",
      expected_harvest_date: dFuture(60).slice(0, 10),
      expected_quantity: 12000,
      quantity_unit: "kg",
      warehouse_id: warehouses[0].id,
      notes: "Cold-storage compatible; large farm",
    },
    {
      type: "farmer",
      name: "Mohan Singh",
      phone: "+91 98765 11003",
      email: "mohan.singh@gmail.com",
      location: "Shimla, Himachal Pradesh",
      area_acres: 6,
      growing_crop: "Apple",
      crop_variety: "Shimla Red",
      expected_harvest_date: dFuture(30).slice(0, 10),
      expected_quantity: 6500,
      quantity_unit: "kg",
      warehouse_id: warehouses[0].id,
      notes: "Premium grade apple orchards; high altitude",
    },
    {
      type: "farmer",
      name: "Kavita Joshi",
      phone: "+91 98765 11004",
      email: "kavita.joshi@gmail.com",
      location: "Nashik, Maharashtra",
      area_acres: 22,
      growing_crop: "Onion",
      crop_variety: "Nashik Red",
      expected_harvest_date: dFuture(10).slice(0, 10),
      expected_quantity: 20000,
      quantity_unit: "kg",
      warehouse_id: warehouses[1].id,
      notes: "Major onion producer; bulk supply",
    },
    {
      type: "farmer",
      name: "Amit Sharma",
      phone: "+91 98765 11005",
      email: "amit.sharma@gmail.com",
      location: "Ratnagiri, Maharashtra",
      area_acres: 5.5,
      growing_crop: "Banana",
      crop_variety: "Cavendish",
      expected_harvest_date: dFuture(15).slice(0, 10),
      expected_quantity: 3000,
      quantity_unit: "kg",
      warehouse_id: warehouses[0].id,
      notes: "Organic coastal banana plantation",
    },
    {
      type: "farmer",
      name: "Priya Nair",
      phone: "+91 98765 11006",
      email: "priya.nair@gmail.com",
      location: "Pune, Maharashtra",
      area_acres: 3.5,
      growing_crop: "Cabbage",
      crop_variety: "Golden Acre",
      expected_harvest_date: dFuture(20).slice(0, 10),
      expected_quantity: 4000,
      quantity_unit: "kg",
      warehouse_id: warehouses[0].id,
      notes: "Quick delivery; near Pune cold storage",
    },
    {
      type: "farmer",
      name: "Vijay Kulkarni",
      phone: "+91 98765 11007",
      email: "vijay.kulkarni@gmail.com",
      location: "Solapur, Maharashtra",
      area_acres: 55,
      growing_crop: "Wheat",
      crop_variety: "HD-2967",
      expected_harvest_date: dFuture(90).slice(0, 10),
      expected_quantity: 50000,
      quantity_unit: "kg",
      warehouse_id: warehouses[1].id,
      notes: "Large rabi crop; bulk wheat supplier",
    },
    {
      type: "farmer",
      name: "Rekha Mehta",
      phone: "+91 98765 11008",
      email: "rekha.mehta@gmail.com",
      location: "Sangli, Maharashtra",
      area_acres: 4,
      growing_crop: "Grapes",
      crop_variety: "Thompson Seedless",
      expected_harvest_date: dFuture(25).slice(0, 10),
      expected_quantity: 2200,
      quantity_unit: "kg",
      warehouse_id: warehouses[1].id,
      notes: "Export quality wine and table grapes",
    },
    {
      type: "farmer",
      name: "Suresh Yadav",
      phone: "+91 98765 11009",
      email: "suresh.yadav@gmail.com",
      location: "Kolhapur, Maharashtra",
      area_acres: 7,
      growing_crop: "Cauliflower",
      crop_variety: "Snowball",
      expected_harvest_date: dFuture(12).slice(0, 10),
      expected_quantity: 3500,
      quantity_unit: "kg",
      warehouse_id: warehouses[0].id,
      notes: "Fast-growing; multiple seasons per year",
    },
    {
      type: "farmer",
      name: "Anita Gupta",
      phone: "+91 98765 11010",
      email: "anita.gupta@gmail.com",
      location: "Aurangabad, Maharashtra",
      area_acres: 80,
      growing_crop: "Rice",
      crop_variety: "Basmati",
      expected_harvest_date: dFuture(120).slice(0, 10),
      expected_quantity: 80000,
      quantity_unit: "kg",
      warehouse_id: warehouses[1].id,
      notes: "Premium Basmati; long-grain export grade",
    },
    {
      type: "farmer",
      name: "Deepak Chavan",
      phone: "+91 98765 11011",
      email: "deepak.chavan@gmail.com",
      location: "Ahmednagar, Maharashtra",
      area_acres: 18,
      growing_crop: "Sugarcane",
      crop_variety: "CO-86032",
      expected_harvest_date: dFuture(180).slice(0, 10),
      expected_quantity: 180000,
      quantity_unit: "kg",
      warehouse_id: warehouses[0].id,
      notes: "Sugar factory tie-up; consistent supply",
    },
    {
      type: "farmer",
      name: "Sanjay More",
      phone: "+91 98765 11012",
      email: "sanjay.more@gmail.com",
      location: "Pune, Maharashtra",
      area_acres: 6.5,
      growing_crop: "Tomato",
      crop_variety: "Cherry",
      expected_harvest_date: dFuture(35).slice(0, 10),
      expected_quantity: 3500,
      quantity_unit: "kg",
      warehouse_id: warehouses[0].id,
      notes: "Specialty cherry tomatoes for restaurants",
    },
  ];

  const buyers = [
    {
      type: "buyer",
      name: "FreshMart Retail Pvt Ltd",
      phone: "+91 22 4567 8901",
      email: "procurement@freshmart.in",
      location: "Mumbai, Maharashtra",
      company: "FreshMart Retail",
      purchase_volume: 15000,
      preferred_crops: ["Tomato", "Potato", "Onion", "Apple"],
      warehouse_id: warehouses[0].id,
      notes: "Monthly bulk orders; requires Grade A produce only",
    },
    {
      type: "buyer",
      name: "GreenBasket Exports",
      phone: "+91 20 5678 1234",
      email: "orders@greenbasket.co.in",
      location: "Pune, Maharashtra",
      company: "GreenBasket Exports Pvt Ltd",
      purchase_volume: 25000,
      preferred_crops: ["Grapes", "Banana", "Mango", "Rice"],
      warehouse_id: warehouses[0].id,
      notes: "Export focused; needs APEDA certified produce",
    },
    {
      type: "buyer",
      name: "Delhi Sabzi Mandi Corp",
      phone: "+91 11 9876 5432",
      email: "supply@delhisabzi.com",
      location: "Azadpur, New Delhi",
      company: "Delhi Sabzi Mandi Corp",
      purchase_volume: 50000,
      preferred_crops: ["Onion", "Potato", "Tomato", "Cauliflower", "Cabbage"],
      warehouse_id: warehouses[1].id,
      notes: "Largest mandi buyer; daily requirements; price sensitive",
    },
  ];

  const allContacts = [...farmers, ...buyers];
  const { data: inserted, error } = await supabaseAdmin
    .from("contacts")
    .insert(allContacts)
    .select();

  if (error) {
    console.error(`   ❌ Contacts error: ${error.message}`);
    return [];
  }

  const farmerRecords = inserted.filter((c) => c.type === "farmer");
  const buyerRecords = inserted.filter((c) => c.type === "buyer");
  console.log(`   ✓ Created ${farmerRecords.length} farmers`);
  console.log(`   ✓ Created ${buyerRecords.length} buyers\n`);
  return inserted;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 4: INVENTORY BATCHES
// ═══════════════════════════════════════════════════════════════════════════════

async function createBatches(warehouses, contacts) {
  console.log("📦 PHASE 4 — Creating inventory batches...\n");

  const farmerMap = {};
  contacts
    .filter((c) => c.type === "farmer")
    .forEach((c) => {
      farmerMap[c.name] = c.id;
    });

  const wh1 = warehouses[0].id; // Mumbai
  const wh2 = warehouses[1].id; // Delhi
  const wh3 = warehouses[2]?.id; // Pune (if exists)

  const batchesData = [
    // ── Mumbai warehouse — 10 batches ──
    {
      batch_id: "B-2026-001",
      crop: "Potato",
      variety: "Kufri Jyoti",
      quantity: 1200,
      unit: "kg",
      entry_date: d(10),
      shelf_life: 60,
      risk_score: 18,
      zone: "Grain Storage",
      warehouse_id: wh1,
      status: "active",
      temperature: 12,
      humidity: 55,
      farmer_id: farmerMap["Sunita Desai"],
    },
    {
      batch_id: "B-2026-002",
      crop: "Apple",
      variety: "Shimla Red",
      quantity: 650,
      unit: "kg",
      entry_date: d(3),
      shelf_life: 45,
      risk_score: 24,
      zone: "Cold Storage",
      warehouse_id: wh1,
      status: "active",
      temperature: 4,
      humidity: 62,
      farmer_id: farmerMap["Mohan Singh"],
    },
    {
      batch_id: "B-2026-003",
      crop: "Banana",
      variety: "Cavendish",
      quantity: 300,
      unit: "kg",
      entry_date: d(4),
      shelf_life: 10,
      risk_score: 81,
      zone: "Fresh Produce",
      warehouse_id: wh1,
      status: "active",
      temperature: 24,
      humidity: 82,
      farmer_id: farmerMap["Amit Sharma"],
    },
    {
      batch_id: "B-2026-004",
      crop: "Cabbage",
      variety: "Golden Acre",
      quantity: 400,
      unit: "kg",
      entry_date: d(7),
      shelf_life: 21,
      risk_score: 58,
      zone: "Fresh Produce",
      warehouse_id: wh1,
      status: "active",
      temperature: 8,
      humidity: 70,
      farmer_id: farmerMap["Priya Nair"],
    },
    {
      batch_id: "B-2026-005",
      crop: "Wheat",
      variety: "HD-2967",
      quantity: 5000,
      unit: "kg",
      entry_date: d(15),
      shelf_life: 365,
      risk_score: 8,
      zone: "Dry Storage",
      warehouse_id: wh1,
      status: "active",
      temperature: 20,
      humidity: 45,
      farmer_id: farmerMap["Vijay Kulkarni"],
    },
    {
      batch_id: "B-2026-006",
      crop: "Cauliflower",
      variety: "Snowball",
      quantity: 350,
      unit: "kg",
      entry_date: d(9),
      shelf_life: 18,
      risk_score: 76,
      zone: "Fresh Produce",
      warehouse_id: wh1,
      status: "active",
      temperature: 6,
      humidity: 68,
      farmer_id: farmerMap["Suresh Yadav"],
    },
    {
      batch_id: "B-2026-007",
      crop: "Rice",
      variety: "Basmati",
      quantity: 8000,
      unit: "kg",
      entry_date: d(30),
      shelf_life: 365,
      risk_score: 12,
      zone: "Dry Storage",
      warehouse_id: wh1,
      status: "active",
      temperature: 22,
      humidity: 48,
      farmer_id: farmerMap["Anita Gupta"],
    },
    {
      batch_id: "B-2026-008",
      crop: "Sugarcane",
      variety: "CO-86032",
      quantity: 2500,
      unit: "kg",
      entry_date: d(2),
      shelf_life: 14,
      risk_score: 15,
      zone: "Grain Storage",
      warehouse_id: wh1,
      status: "active",
      temperature: 18,
      humidity: 65,
      farmer_id: farmerMap["Deepak Chavan"],
    },
    {
      batch_id: "B-2026-009",
      crop: "Tomato",
      variety: "Cherry",
      quantity: 280,
      unit: "kg",
      entry_date: d(1),
      shelf_life: 8,
      risk_score: 35,
      zone: "Fresh Produce",
      warehouse_id: wh1,
      status: "active",
      temperature: 10,
      humidity: 75,
      farmer_id: farmerMap["Sanjay More"],
    },
    {
      batch_id: "B-2026-010",
      crop: "Apple",
      variety: "Shimla Red",
      quantity: 900,
      unit: "kg",
      entry_date: d(8),
      shelf_life: 45,
      risk_score: 40,
      zone: "Cold Storage",
      warehouse_id: wh1,
      status: "active",
      temperature: 5,
      humidity: 60,
      farmer_id: farmerMap["Mohan Singh"],
    },

    // ── Delhi warehouse — 8 batches ──
    {
      batch_id: "B-2026-011",
      crop: "Tomato",
      variety: "Roma",
      quantity: 480,
      unit: "kg",
      entry_date: d(5),
      shelf_life: 12,
      risk_score: 72,
      zone: "Fresh Produce",
      warehouse_id: wh2,
      status: "active",
      temperature: 26.5,
      humidity: 78,
      farmer_id: farmerMap["Rajan Patil"],
    },
    {
      batch_id: "B-2026-012",
      crop: "Onion",
      variety: "Nashik Red",
      quantity: 2000,
      unit: "kg",
      entry_date: d(20),
      shelf_life: 90,
      risk_score: 45,
      zone: "Grain Storage",
      warehouse_id: wh2,
      status: "active",
      temperature: 18,
      humidity: 60,
      farmer_id: farmerMap["Kavita Joshi"],
    },
    {
      batch_id: "B-2026-013",
      crop: "Grapes",
      variety: "Thompson Seedless",
      quantity: 220,
      unit: "kg",
      entry_date: d(6),
      shelf_life: 14,
      risk_score: 63,
      zone: "Cold Storage",
      warehouse_id: wh2,
      status: "active",
      temperature: 2,
      humidity: 85,
      farmer_id: farmerMap["Rekha Mehta"],
    },
    {
      batch_id: "B-2026-014",
      crop: "Wheat",
      variety: "HD-2967",
      quantity: 3200,
      unit: "kg",
      entry_date: d(12),
      shelf_life: 180,
      risk_score: 10,
      zone: "Dry Storage",
      warehouse_id: wh2,
      status: "active",
      temperature: 21,
      humidity: 50,
      farmer_id: farmerMap["Vijay Kulkarni"],
    },
    {
      batch_id: "B-2026-015",
      crop: "Rice",
      variety: "Basmati",
      quantity: 1800,
      unit: "kg",
      entry_date: d(18),
      shelf_life: 180,
      risk_score: 14,
      zone: "Dry Storage",
      warehouse_id: wh2,
      status: "active",
      temperature: 23,
      humidity: 47,
      farmer_id: farmerMap["Anita Gupta"],
    },
    {
      batch_id: "B-2026-016",
      crop: "Onion",
      variety: "Nashik Red",
      quantity: 1500,
      unit: "kg",
      entry_date: d(5),
      shelf_life: 90,
      risk_score: 22,
      zone: "Grain Storage",
      warehouse_id: wh2,
      status: "active",
      temperature: 16,
      humidity: 58,
      farmer_id: farmerMap["Kavita Joshi"],
    },
    {
      batch_id: "B-2026-017",
      crop: "Tomato",
      variety: "Roma",
      quantity: 600,
      unit: "kg",
      entry_date: d(11),
      shelf_life: 12,
      risk_score: 90,
      zone: "Fresh Produce",
      warehouse_id: wh2,
      status: "active",
      temperature: 28,
      humidity: 82,
      farmer_id: farmerMap["Rajan Patil"],
    },
    {
      batch_id: "B-2026-018",
      crop: "Cabbage",
      variety: "Golden Acre",
      quantity: 550,
      unit: "kg",
      entry_date: d(3),
      shelf_life: 21,
      risk_score: 30,
      zone: "Cold Storage",
      warehouse_id: wh2,
      status: "active",
      temperature: 5,
      humidity: 72,
      farmer_id: farmerMap["Priya Nair"],
    },

    // ── Pune warehouse — 4 batches (if created) ──
    ...(wh3
      ? [
          {
            batch_id: "B-2026-019",
            crop: "Potato",
            variety: "Kufri Jyoti",
            quantity: 800,
            unit: "kg",
            entry_date: d(25),
            shelf_life: 60,
            risk_score: 55,
            zone: "Grain Storage",
            warehouse_id: wh3,
            status: "active",
            temperature: 12,
            humidity: 55,
            farmer_id: farmerMap["Sunita Desai"],
          },
          {
            batch_id: "B-2026-020",
            crop: "Banana",
            variety: "Cavendish",
            quantity: 200,
            unit: "kg",
            entry_date: d(12),
            shelf_life: 10,
            risk_score: 95,
            zone: "Fresh Produce",
            warehouse_id: wh3,
            status: "active",
            temperature: 25,
            humidity: 84,
            farmer_id: farmerMap["Amit Sharma"],
          },
          {
            batch_id: "B-2026-021",
            crop: "Grapes",
            variety: "Thompson Seedless",
            quantity: 400,
            unit: "kg",
            entry_date: d(4),
            shelf_life: 14,
            risk_score: 32,
            zone: "Cold Storage",
            warehouse_id: wh3,
            status: "active",
            temperature: 3,
            humidity: 80,
            farmer_id: farmerMap["Rekha Mehta"],
          },
          {
            batch_id: "B-2026-022",
            crop: "Wheat",
            variety: "HD-2967",
            quantity: 6000,
            unit: "kg",
            entry_date: d(40),
            shelf_life: 365,
            risk_score: 5,
            zone: "Dry Storage",
            warehouse_id: wh3,
            status: "active",
            temperature: 20,
            humidity: 44,
            farmer_id: farmerMap["Vijay Kulkarni"],
          },
        ]
      : []),

    // ── Dispatched batches (for dispatch history) ──
    {
      batch_id: "B-2026-D01",
      crop: "Potato",
      variety: "Kufri Jyoti",
      quantity: 800,
      unit: "kg",
      entry_date: d(35),
      shelf_life: 60,
      risk_score: 55,
      zone: "Grain Storage",
      warehouse_id: wh1,
      status: "dispatched",
      temperature: 12,
      humidity: 55,
      destination: "FreshMart Retail, Mumbai",
      dispatch_date: d(5),
      farmer_id: farmerMap["Sunita Desai"],
    },
    {
      batch_id: "B-2026-D02",
      crop: "Banana",
      variety: "Cavendish",
      quantity: 200,
      unit: "kg",
      entry_date: d(20),
      shelf_life: 10,
      risk_score: 95,
      zone: "Fresh Produce",
      warehouse_id: wh1,
      status: "dispatched",
      temperature: 25,
      humidity: 84,
      destination: "GreenBasket Exports, Pune",
      dispatch_date: d(3),
      farmer_id: farmerMap["Amit Sharma"],
    },
    {
      batch_id: "B-2026-D03",
      crop: "Onion",
      variety: "Nashik Red",
      quantity: 3000,
      unit: "kg",
      entry_date: d(40),
      shelf_life: 90,
      risk_score: 32,
      zone: "Grain Storage",
      warehouse_id: wh2,
      status: "dispatched",
      temperature: 17,
      humidity: 58,
      destination: "Delhi Sabzi Mandi, Azadpur",
      dispatch_date: d(7),
      farmer_id: farmerMap["Kavita Joshi"],
    },
    {
      batch_id: "B-2026-D04",
      crop: "Rice",
      variety: "Basmati",
      quantity: 5000,
      unit: "kg",
      entry_date: d(60),
      shelf_life: 365,
      risk_score: 8,
      zone: "Dry Storage",
      warehouse_id: wh2,
      status: "dispatched",
      temperature: 22,
      humidity: 48,
      destination: "GreenBasket Exports, Pune",
      dispatch_date: d(10),
      farmer_id: farmerMap["Anita Gupta"],
    },

    // ── Expired batch ──
    {
      batch_id: "B-2026-E01",
      crop: "Tomato",
      variety: "Cherry",
      quantity: 150,
      unit: "kg",
      entry_date: d(20),
      shelf_life: 8,
      risk_score: 100,
      zone: "Fresh Produce",
      warehouse_id: wh1,
      status: "expired",
      temperature: 28,
      humidity: 90,
      farmer_id: farmerMap["Sanjay More"],
    },
  ];

  const { data: batches, error } = await supabaseAdmin
    .from("batches")
    .insert(batchesData)
    .select();

  if (error) {
    console.error(`   ❌ Batches error: ${error.message}`);
    return [];
  }

  const active = batches.filter((b) => b.status === "active").length;
  const dispatched = batches.filter((b) => b.status === "dispatched").length;
  const expired = batches.filter((b) => b.status === "expired").length;
  console.log(
    `   ✓ Created ${batches.length} batches (${active} active, ${dispatched} dispatched, ${expired} expired)\n`,
  );
  return batches;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 4b: HISTORICAL ANALYTICS DATA (10 months of rich history)
// ═══════════════════════════════════════════════════════════════════════════════

async function createHistoricalAnalyticsData(warehouses, users, contacts) {
  console.log(
    "📈 PHASE 4b — Creating 10 months of historical data for analytics...\n",
  );

  const farmerMap = {};
  contacts
    .filter((c) => c.type === "farmer")
    .forEach((c) => {
      farmerMap[c.name] = c.id;
    });

  const qc1 = users["qc@nexus.com"];
  const qc2 = users["qc2@nexus.com"];
  const wh1 = warehouses[0].id;
  const wh2 = warehouses[1].id;
  const wh3 = warehouses[2]?.id || wh1;
  const whIds = [wh1, wh2, wh3];

  const cropDefs = [
    {
      crop: "Potato",
      variety: "Kufri Jyoti",
      zone: "Grain Storage",
      farmer: "Sunita Desai",
      baseQty: 800,
    },
    {
      crop: "Tomato",
      variety: "Roma",
      zone: "Fresh Produce",
      farmer: "Rajan Patil",
      baseQty: 400,
    },
    {
      crop: "Apple",
      variety: "Shimla Red",
      zone: "Cold Storage",
      farmer: "Mohan Singh",
      baseQty: 600,
    },
    {
      crop: "Rice",
      variety: "Basmati",
      zone: "Dry Storage",
      farmer: "Anita Gupta",
      baseQty: 2000,
    },
    {
      crop: "Wheat",
      variety: "HD-2967",
      zone: "Dry Storage",
      farmer: "Vijay Kulkarni",
      baseQty: 3000,
    },
    {
      crop: "Onion",
      variety: "Nashik Red",
      zone: "Grain Storage",
      farmer: "Kavita Joshi",
      baseQty: 1500,
    },
    {
      crop: "Banana",
      variety: "Cavendish",
      zone: "Fresh Produce",
      farmer: "Amit Sharma",
      baseQty: 300,
    },
    {
      crop: "Grapes",
      variety: "Thompson Seedless",
      zone: "Cold Storage",
      farmer: "Rekha Mehta",
      baseQty: 220,
    },
    {
      crop: "Cabbage",
      variety: "Golden Acre",
      zone: "Fresh Produce",
      farmer: "Priya Nair",
      baseQty: 400,
    },
    {
      crop: "Cauliflower",
      variety: "Snowball",
      zone: "Fresh Produce",
      farmer: "Suresh Yadav",
      baseQty: 350,
    },
    {
      crop: "Sugarcane",
      variety: "CO-86032",
      zone: "Grain Storage",
      farmer: "Deepak Chavan",
      baseQty: 2500,
    },
  ];

  const destinations = [
    "FreshMart, Mumbai",
    "Azadpur Mandi, Delhi",
    "Crawford Market, Mumbai",
    "Dadar Market, Mumbai",
    "GreenBasket Exports, Pune",
    "Karol Bagh, Delhi",
    "Vashi Market, Navi Mumbai",
    "APMC Yard, Pune",
  ];

  // Monthly plan: declining spoilage rate → impressive Waste Reduction chart
  // spoilageRate = expired / total (batch count)
  // baseline is fixed at 15% — our rates should decline from ~12% to ~3%
  const monthlyPlan = [
    {
      monthsAgo: 10,
      total: 8,
      expired: 1,
      allocs: 3,
      dispatches: 2,
      ackAlerts: 2,
    }, // 12.5%
    {
      monthsAgo: 9,
      total: 9,
      expired: 1,
      allocs: 4,
      dispatches: 3,
      ackAlerts: 2,
    }, // 11.1%
    {
      monthsAgo: 8,
      total: 10,
      expired: 1,
      allocs: 5,
      dispatches: 3,
      ackAlerts: 3,
    }, // 10.0%
    {
      monthsAgo: 7,
      total: 12,
      expired: 1,
      allocs: 5,
      dispatches: 4,
      ackAlerts: 2,
    }, //  8.3%
    {
      monthsAgo: 6,
      total: 12,
      expired: 1,
      allocs: 6,
      dispatches: 4,
      ackAlerts: 3,
    }, //  8.3%
    {
      monthsAgo: 5,
      total: 14,
      expired: 1,
      allocs: 7,
      dispatches: 5,
      ackAlerts: 2,
    }, //  7.1%
    {
      monthsAgo: 4,
      total: 16,
      expired: 1,
      allocs: 8,
      dispatches: 6,
      ackAlerts: 3,
    }, //  6.3%
    {
      monthsAgo: 3,
      total: 18,
      expired: 1,
      allocs: 9,
      dispatches: 7,
      ackAlerts: 3,
    }, //  5.6%
    {
      monthsAgo: 2,
      total: 20,
      expired: 0,
      allocs: 10,
      dispatches: 8,
      ackAlerts: 2,
    }, //  0.0%
    {
      monthsAgo: 1,
      total: 22,
      expired: 1,
      allocs: 11,
      dispatches: 9,
      ackAlerts: 3,
    }, //  4.5%
  ];

  const allBatches = [];
  const allAllocations = [];
  const allAlerts = [];
  let batchNum = 100;
  let allocNum = 100;

  for (const plan of monthlyPlan) {
    const now = new Date();
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth() - plan.monthsAgo,
      1,
    );

    // ── Batches: expired ones have small qty, dispatched ones have normal/large qty ──
    for (let i = 0; i < plan.total; i++) {
      const ct = cropDefs[i % cropDefs.length];
      const whId = whIds[i % 3];
      const isExpired = i < plan.expired;
      const day = Math.min(28, i * 2 + 1 + Math.floor(Math.random() * 3));
      const entryDate = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth(),
        day,
      );

      // Expired batches: small qty (150-350 kg) → low actual loss vs baseline
      // Normal batches: larger qty → high baseline saving
      const qty = isExpired
        ? Math.floor(150 + Math.random() * 200)
        : Math.floor(ct.baseQty * 0.8 + Math.random() * ct.baseQty * 0.4);

      allBatches.push({
        batch_id: `H-${String(batchNum++).padStart(4, "0")}`,
        crop: ct.crop,
        variety: ct.variety,
        quantity: qty,
        unit: "kg",
        entry_date: entryDate.toISOString(),
        shelf_life: isExpired ? 10 : ct.baseQty > 1000 ? 365 : 30,
        risk_score: isExpired ? 100 : Math.floor(5 + Math.random() * 25),
        zone: ct.zone,
        warehouse_id: whId,
        status: isExpired ? "expired" : "dispatched",
        temperature: +(20 + (Math.random() - 0.5) * 6).toFixed(1),
        humidity: +(60 + (Math.random() - 0.5) * 20).toFixed(1),
        farmer_id: farmerMap[ct.farmer],
      });
    }

    // ── Completed Allocation Requests (spread across warehouses) ──
    for (let i = 0; i < plan.allocs; i++) {
      const ct = cropDefs[i % cropDefs.length];
      const whId = whIds[i % 3];
      const day = Math.min(28, i * 3 + 3);
      const createdAt = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth(),
        day,
      );

      allAllocations.push({
        request_id: `HA-${String(allocNum++).padStart(3, "0")}`,
        requester_id: i % 2 === 0 ? qc1.id : qc2.id,
        crop: ct.crop,
        variety: ct.variety,
        quantity: Math.floor(
          ct.baseQty * 0.4 + Math.random() * ct.baseQty * 0.6,
        ),
        unit: "kg",
        deadline: new Date(createdAt.getTime() + 14 * 864e5).toISOString(),
        location: destinations[i % destinations.length],
        price: Math.floor(20 + Math.random() * 80),
        status: "completed",
        warehouse_id: whId,
        created_at: createdAt.toISOString(),
      });
    }

    // ── Acknowledged Alerts ──
    for (let i = 0; i < plan.ackAlerts; i++) {
      const day = Math.min(28, i * 7 + 5);
      const alertDate = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth(),
        day,
      );

      allAlerts.push({
        warehouse_id: whIds[i % 3],
        zone: cropDefs[i % cropDefs.length].zone,
        type: ["temperature", "humidity", "risk", "system"][i % 4],
        severity: i % 3 === 0 ? "critical" : "warning",
        message: `Historical ${["temperature", "humidity", "risk", "system"][i % 4]} alert — resolved`,
        is_acknowledged: true,
        acknowledged_at: new Date(alertDate.getTime() + 3600000).toISOString(),
        created_at: alertDate.toISOString(),
      });
    }
  }

  // ═══ INSERT DATA ═══

  // 1. Batches (in chunks)
  const CHUNK = 100;
  let insertedBatches = 0;
  for (let i = 0; i < allBatches.length; i += CHUNK) {
    const chunk = allBatches.slice(i, i + CHUNK);
    const { error } = await supabaseAdmin.from("batches").insert(chunk);
    if (error) console.error(`   ⚠️  Batch chunk ${i}: ${error.message}`);
    else insertedBatches += chunk.length;
  }
  const expiredCount = allBatches.filter((b) => b.status === "expired").length;
  console.log(
    `   ✓ ${insertedBatches} historical batches (${expiredCount} expired, ${insertedBatches - expiredCount} dispatched)`,
  );

  // 2. Allocations → get IDs back for dispatches
  const { data: insertedAllocs, error: allocErr } = await supabaseAdmin
    .from("allocation_requests")
    .insert(allAllocations)
    .select("id, created_at");

  if (allocErr) console.error(`   ⚠️  Allocations: ${allocErr.message}`);
  else
    console.log(
      `   ✓ ${insertedAllocs.length} historical completed allocation requests`,
    );

  // 3. Dispatches — link to allocations for dispatch time calculation
  const allDispatches = [];
  let dispNum = 100;

  for (const plan of monthlyPlan) {
    const now = new Date();
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth() - plan.monthsAgo,
      1,
    );

    for (let i = 0; i < plan.dispatches; i++) {
      const day = Math.min(28, i * 3 + 8);
      const dispDate = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth(),
        day,
      );

      // Link to an allocation if we have one (for avg dispatch time calc)
      const allocIndex = dispNum - 100; // rough mapping
      const linkedAlloc =
        insertedAllocs && allocIndex < insertedAllocs.length
          ? insertedAllocs[allocIndex]
          : null;

      allDispatches.push({
        dispatch_id: `HD-${String(dispNum++).padStart(3, "0")}`,
        allocation_id: linkedAlloc?.id || null,
        destination: destinations[(i + plan.monthsAgo) % destinations.length],
        quantity: Math.floor(200 + Math.random() * 1500),
        unit: "kg",
        status: "delivered",
        dispatch_date: dispDate.toISOString(),
        notes: `Historical delivery — month ${plan.monthsAgo}`,
      });
    }
  }

  for (let i = 0; i < allDispatches.length; i += CHUNK) {
    const chunk = allDispatches.slice(i, i + CHUNK);
    const { error } = await supabaseAdmin.from("dispatches").insert(chunk);
    if (error) console.error(`   ⚠️  Dispatch chunk: ${error.message}`);
  }
  console.log(`   ✓ ${allDispatches.length} historical delivered dispatches`);

  // 4. Alerts
  const { error: alertErr } = await supabaseAdmin
    .from("alerts")
    .insert(allAlerts);
  if (alertErr) console.error(`   ⚠️  Alerts: ${alertErr.message}`);
  else console.log(`   ✓ ${allAlerts.length} historical acknowledged alerts`);

  console.log();
  return {
    batches: allBatches.length,
    allocations: allAllocations.length,
    dispatches: allDispatches.length,
    alerts: allAlerts.length,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 5: SENSOR DATA
// ═══════════════════════════════════════════════════════════════════════════════

async function createSensorData(warehouses) {
  console.log("🌡️  PHASE 5 — Generating sensor readings & thresholds...\n");

  // ── Thresholds per zone per warehouse ──
  const thresholds = [];
  for (const wh of warehouses) {
    const whZones = ZONES.slice(0, wh.zones);
    for (const zone of whZones) {
      const params = {
        "Grain Storage": {
          temperature_min: 15,
          temperature_max: 25,
          humidity_min: 40,
          humidity_max: 60,
          ethylene_max: 1.0,
          co2_max: 1000,
          ammonia_max: 25,
        },
        "Cold Storage": {
          temperature_min: 2,
          temperature_max: 8,
          humidity_min: 80,
          humidity_max: 95,
          ethylene_max: 1.0,
          co2_max: 1000,
          ammonia_max: 25,
        },
        "Dry Storage": {
          temperature_min: 18,
          temperature_max: 25,
          humidity_min: 35,
          humidity_max: 55,
          ethylene_max: 1.0,
          co2_max: 1000,
          ammonia_max: 25,
        },
        "Fresh Produce": {
          temperature_min: 8,
          temperature_max: 15,
          humidity_min: 80,
          humidity_max: 95,
          ethylene_max: 1.0,
          co2_max: 1000,
          ammonia_max: 25,
        },
      };

      thresholds.push({
        warehouse_id: wh.id,
        zone,
        ...params[zone],
      });
    }
  }

  const { error: thErr } = await supabaseAdmin
    .from("sensor_thresholds")
    .upsert(thresholds, { onConflict: "warehouse_id,zone" });
  if (thErr) console.error(`   ⚠️  Thresholds: ${thErr.message}`);
  else console.log(`   ✓ Created ${thresholds.length} zone thresholds`);

  // ── Historical readings (24 hours, every 15 minutes per zone per warehouse) ──
  const readings = [];
  const now = Date.now();

  for (const wh of warehouses) {
    const whZones = ZONES.slice(0, wh.zones);
    for (const zone of whZones) {
      const baseParams = {
        "Grain Storage": {
          temp: 20,
          humidity: 50,
          ethylene: 0.1,
          co2: 400,
          ammonia: 2,
        },
        "Cold Storage": {
          temp: 5,
          humidity: 85,
          ethylene: 0.05,
          co2: 400,
          ammonia: 1,
        },
        "Dry Storage": {
          temp: 22,
          humidity: 45,
          ethylene: 0.05,
          co2: 400,
          ammonia: 1,
        },
        "Fresh Produce": {
          temp: 12,
          humidity: 90,
          ethylene: 0.2,
          co2: 500,
          ammonia: 1,
        },
      };
      const base = baseParams[zone];

      // 96 readings per zone (24h × 4 per hour)
      for (let i = 95; i >= 0; i--) {
        const ts = new Date(now - i * 15 * 60 * 1000);
        // Add some drift through the day
        const hourFactor = Math.sin((ts.getHours() / 24) * Math.PI * 2) * 0.3;

        readings.push({
          warehouse_id: wh.id,
          zone,
          temperature: +(
            base.temp +
            (Math.random() - 0.5) * 3 +
            hourFactor * 2
          ).toFixed(2),
          humidity: +(
            base.humidity +
            (Math.random() - 0.5) * 8 +
            hourFactor * 3
          ).toFixed(2),
          ethylene: +Math.max(
            0,
            base.ethylene + (Math.random() - 0.5) * 0.15,
          ).toFixed(3),
          co2: +Math.max(0, base.co2 + (Math.random() - 0.5) * 80).toFixed(0),
          ammonia: +Math.max(
            0,
            base.ammonia + (Math.random() - 0.5) * 2,
          ).toFixed(2),
          reading_time: ts.toISOString(),
        });
      }
    }
  }

  // Insert in batches (Supabase has row limits)
  const CHUNK = 500;
  let inserted = 0;
  for (let i = 0; i < readings.length; i += CHUNK) {
    const chunk = readings.slice(i, i + CHUNK);
    const { error } = await supabaseAdmin.from("sensor_readings").insert(chunk);
    if (error) {
      console.error(`   ⚠️  Readings chunk ${i}: ${error.message}`);
    } else {
      inserted += chunk.length;
    }
  }
  console.log(`   ✓ Created ${inserted} sensor readings (24h history)\n`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 6: ALERTS
// ═══════════════════════════════════════════════════════════════════════════════

async function createAlerts(warehouses) {
  console.log("🚨 PHASE 6 — Creating alerts (sensor + system)...\n");

  const wh1 = warehouses[0];
  const wh2 = warehouses[1];

  // ── Sensor alerts ──
  const sensorAlerts = [
    {
      warehouse_id: wh1.id,
      zone: "Fresh Produce",
      alert_type: "temperature",
      severity: "warning",
      message:
        "Temperature approaching upper threshold in Fresh Produce: 14.5°C (max: 15°C)",
      current_value: 14.5,
      threshold_value: 15,
      triggered_at: d(0.02),
    },
    {
      warehouse_id: wh1.id,
      zone: "Cold Storage",
      alert_type: "humidity",
      severity: "critical",
      message: "Humidity exceeds maximum in Cold Storage: 97% (max: 95%)",
      current_value: 97,
      threshold_value: 95,
      triggered_at: d(0.01),
    },
    {
      warehouse_id: wh1.id,
      zone: "Fresh Produce",
      alert_type: "ethylene",
      severity: "warning",
      message:
        "Ethylene level rising in Fresh Produce: 0.85 ppm (max: 1.0 ppm)",
      current_value: 0.85,
      threshold_value: 1.0,
      triggered_at: d(0.5),
    },
    {
      warehouse_id: wh2.id,
      zone: "Fresh Produce",
      alert_type: "temperature",
      severity: "critical",
      message:
        "Temperature exceeded maximum in Fresh Produce: 28°C (max: 15°C)",
      current_value: 28,
      threshold_value: 15,
      triggered_at: d(0.03),
    },
    {
      warehouse_id: wh2.id,
      zone: "Grain Storage",
      alert_type: "humidity",
      severity: "warning",
      message:
        "Humidity approaching upper threshold in Grain Storage: 58% (max: 60%)",
      current_value: 58,
      threshold_value: 60,
      triggered_at: d(0.1),
    },
    // Acknowledged historical alerts
    {
      warehouse_id: wh1.id,
      zone: "Dry Storage",
      alert_type: "temperature",
      severity: "warning",
      message: "Temperature spike in Dry Storage: 26°C (max: 25°C)",
      current_value: 26,
      threshold_value: 25,
      triggered_at: d(2),
      acknowledged: true,
      acknowledged_at: d(1.9),
    },
    {
      warehouse_id: wh2.id,
      zone: "Cold Storage",
      alert_type: "temperature",
      severity: "critical",
      message: "Cold Storage compressor failure detected: 12°C (max: 8°C)",
      current_value: 12,
      threshold_value: 8,
      triggered_at: d(5),
      acknowledged: true,
      acknowledged_at: d(4.8),
    },
  ];

  const { error: saErr } = await supabaseAdmin
    .from("sensor_alerts")
    .insert(sensorAlerts);
  if (saErr) console.error(`   ⚠️  Sensor alerts: ${saErr.message}`);
  else console.log(`   ✓ Created ${sensorAlerts.length} sensor alerts`);

  // ── General alerts ──
  const generalAlerts = [
    {
      warehouse_id: wh1.id,
      zone: "Fresh Produce",
      type: "temperature",
      severity: "warning",
      message: "Temperature approaching upper threshold",
      is_acknowledged: false,
      created_at: d(0.02),
    },
    {
      warehouse_id: wh1.id,
      zone: "Cold Storage",
      type: "humidity",
      severity: "critical",
      message: "Humidity exceeds maximum threshold",
      is_acknowledged: false,
      created_at: d(0.01),
    },
    {
      warehouse_id: wh1.id,
      type: "risk",
      severity: "warning",
      message: "Batch B-2026-003 (Banana) risk score 81% — nearing expiry",
      is_acknowledged: false,
      created_at: d(0.5),
    },
    {
      warehouse_id: wh1.id,
      type: "risk",
      severity: "critical",
      message: "Batch B-2026-E01 (Tomato Cherry) EXPIRED — risk 100%",
      is_acknowledged: false,
      created_at: d(0.1),
    },
    {
      warehouse_id: wh2.id,
      zone: "Fresh Produce",
      type: "temperature",
      severity: "critical",
      message: "Temperature exceeded maximum in Fresh Produce",
      is_acknowledged: false,
      created_at: d(0.03),
    },
    {
      warehouse_id: wh2.id,
      type: "order",
      severity: "info",
      message: "New allocation request AR-001 received from Amit Kumar",
      is_acknowledged: false,
      created_at: d(1),
    },
    {
      warehouse_id: wh1.id,
      type: "system",
      severity: "info",
      message: "Sensor calibration scheduled for tomorrow 6 AM",
      is_acknowledged: true,
      acknowledged_at: d(0.5),
      created_at: d(2),
    },
  ];

  const { error: gaErr } = await supabaseAdmin
    .from("alerts")
    .insert(generalAlerts);
  if (gaErr) console.error(`   ⚠️  General alerts: ${gaErr.message}`);
  else console.log(`   ✓ Created ${generalAlerts.length} general alerts\n`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 7: ALLOCATION REQUESTS + MESSAGES + DISPATCHES
// ═══════════════════════════════════════════════════════════════════════════════

async function createAllocationsAndDispatches(warehouses, users, batches) {
  console.log("📋 PHASE 7 — Creating allocations, dispatches & messages...\n");

  const qc1 = users["qc@nexus.com"];
  const qc2 = users["qc2@nexus.com"];
  const mgr1 = users["manager@nexus.com"];
  const owner = users["owner@nexus.com"];
  const wh1 = warehouses[0];
  const wh2 = warehouses[1];

  const allocations = [
    // Pending — shows in QC's order list and manager's allocation queue
    {
      request_id: "AR-001",
      requester_id: qc1.id,
      crop: "Tomato",
      variety: "Roma",
      quantity: 200,
      unit: "kg",
      deadline: dFuture(7),
      location: "Vashi Market, Navi Mumbai",
      price: 45,
      status: "pending",
      notes: "Need fresh Roma tomatoes for restaurant chain",
      warehouse_id: wh1.id,
      created_at: d(1),
    },
    // Reviewing — manager is looking at it
    {
      request_id: "AR-002",
      requester_id: qc1.id,
      crop: "Apple",
      variety: "Shimla Red",
      quantity: 300,
      unit: "kg",
      deadline: dFuture(14),
      location: "Crawford Market, Mumbai",
      price: 120,
      status: "reviewing",
      notes: "Premium apples for export shipment",
      warehouse_id: wh1.id,
      created_at: d(3),
    },
    // Allocated — approved by manager, ready for dispatch
    {
      request_id: "AR-003",
      requester_id: qc2.id,
      crop: "Rice",
      variety: "Basmati",
      quantity: 1000,
      unit: "kg",
      deadline: dFuture(10),
      location: "Karol Bagh, New Delhi",
      price: 85,
      status: "allocated",
      notes: "Bulk rice order for hotel chain",
      warehouse_id: wh2.id,
      created_at: d(5),
    },
    // Dispatched — already sent out
    {
      request_id: "AR-004",
      requester_id: qc1.id,
      crop: "Onion",
      variety: "Nashik Red",
      quantity: 500,
      unit: "kg",
      deadline: dFuture(3),
      location: "Azadpur Mandi, Delhi",
      price: 30,
      status: "dispatched",
      notes: "Urgent daily supply for wholesale market",
      warehouse_id: wh2.id,
      created_at: d(8),
    },
    // Completed — full cycle done
    {
      request_id: "AR-005",
      requester_id: qc2.id,
      crop: "Potato",
      variety: "Kufri Jyoti",
      quantity: 800,
      unit: "kg",
      deadline: d(-2),
      location: "Dadar Market, Mumbai",
      price: 25,
      status: "completed",
      notes: "Regular monthly potato supply",
      warehouse_id: wh1.id,
      created_at: d(15),
    },
    // Cancelled — for history
    {
      request_id: "AR-006",
      requester_id: qc1.id,
      crop: "Grapes",
      variety: "Thompson Seedless",
      quantity: 150,
      unit: "kg",
      deadline: d(-1),
      location: "Export Terminal, JNPT",
      price: 200,
      status: "cancelled",
      notes: "Cancelled due to export license delay",
      warehouse_id: wh1.id,
      created_at: d(12),
    },
    // More pending for a living dashboard
    {
      request_id: "AR-007",
      requester_id: qc2.id,
      crop: "Wheat",
      variety: "HD-2967",
      quantity: 2000,
      unit: "kg",
      deadline: dFuture(21),
      location: "Chandni Chowk, Delhi",
      price: 28,
      status: "pending",
      notes: "Bulk wheat order for flour mill",
      warehouse_id: wh2.id,
      created_at: d(0.5),
    },
    {
      request_id: "AR-008",
      requester_id: qc1.id,
      crop: "Banana",
      variety: "Cavendish",
      quantity: 100,
      unit: "kg",
      deadline: dFuture(5),
      location: "Bandra West, Mumbai",
      price: 55,
      status: "pending",
      notes: "Organic bananas for health store chain",
      warehouse_id: wh1.id,
      created_at: d(0.2),
    },
  ];

  const { data: insertedAllocations, error: allocErr } = await supabaseAdmin
    .from("allocation_requests")
    .insert(allocations)
    .select();

  if (allocErr) {
    console.error(`   ❌ Allocations: ${allocErr.message}`);
    return;
  }
  console.log(`   ✓ Created ${insertedAllocations.length} allocation requests`);

  // ── Dispatches for dispatched/completed allocations ──
  const dispatchedAlloc = insertedAllocations.find(
    (a) => a.request_id === "AR-004",
  );
  const completedAlloc = insertedAllocations.find(
    (a) => a.request_id === "AR-005",
  );
  const dispatchedBatch1 = batches.find((b) => b.batch_id === "B-2026-D03");
  const dispatchedBatch2 = batches.find((b) => b.batch_id === "B-2026-D01");

  const dispatches = [
    {
      dispatch_id: "DSP-001",
      batch_id: dispatchedBatch1?.id,
      allocation_id: dispatchedAlloc?.id,
      destination: "Azadpur Mandi, Delhi",
      quantity: 500,
      unit: "kg",
      status: "in-transit",
      dispatch_date: d(2),
      estimated_delivery: dFuture(1),
      notes: "Truck #MH-12-AB-1234; Driver: Ramesh (9876543210)",
    },
    {
      dispatch_id: "DSP-002",
      batch_id: dispatchedBatch2?.id,
      allocation_id: completedAlloc?.id,
      destination: "Dadar Market, Mumbai",
      quantity: 800,
      unit: "kg",
      status: "delivered",
      dispatch_date: d(10),
      estimated_delivery: d(8),
      notes: "Delivered and confirmed by buyer",
    },
    {
      dispatch_id: "DSP-003",
      batch_id: batches.find((b) => b.batch_id === "B-2026-D02")?.id,
      destination: "GreenBasket Exports, Pune",
      quantity: 200,
      unit: "kg",
      status: "delivered",
      dispatch_date: d(3),
      estimated_delivery: d(2),
      notes: "Export packaging done at warehouse",
    },
    {
      dispatch_id: "DSP-004",
      batch_id: batches.find((b) => b.batch_id === "B-2026-D04")?.id,
      destination: "GreenBasket Exports, Pune",
      quantity: 5000,
      unit: "kg",
      status: "in-transit",
      dispatch_date: d(1),
      estimated_delivery: dFuture(2),
      notes: "Container truck; 3 pallets",
    },
  ];

  const { error: dispErr } = await supabaseAdmin
    .from("dispatches")
    .insert(dispatches);
  if (dispErr) console.error(`   ⚠️  Dispatches: ${dispErr.message}`);
  else console.log(`   ✓ Created ${dispatches.length} dispatches`);

  // ── Messages on allocation requests ──
  const ar002 = insertedAllocations.find((a) => a.request_id === "AR-002");
  const ar003 = insertedAllocations.find((a) => a.request_id === "AR-003");
  const ar004 = insertedAllocations.find((a) => a.request_id === "AR-004");

  const messages = [
    // AR-002 thread (QC and Manager discussing)
    {
      allocation_id: ar002.id,
      sender_id: qc1.id,
      content:
        "Hi, I need 300 kg Shimla Red apples for an export shipment. Can you check availability?",
      created_at: d(2.9),
    },
    {
      allocation_id: ar002.id,
      sender_id: mgr1.id,
      content:
        "We have about 1550 kg in cold storage (B-2026-002 and B-2026-010). 300 kg is doable.",
      created_at: d(2.8),
    },
    {
      allocation_id: ar002.id,
      sender_id: qc1.id,
      content:
        "Great! Please ensure they are Grade A — this is for UAE export. Need APEDA certification.",
      created_at: d(2.7),
    },
    {
      allocation_id: ar002.id,
      sender_id: mgr1.id,
      content:
        "Noted. I'll pick from Batch B-2026-002 — freshest stock (3 days old). Moving to review.",
      created_at: d(2.6),
    },

    // AR-003 thread (QC2 and Owner discussing)
    {
      allocation_id: ar003.id,
      sender_id: qc2.id,
      content:
        "Need 1000 kg Basmati for New Delhi hotel chain. Premium quality only.",
      created_at: d(4.5),
    },
    {
      allocation_id: ar003.id,
      sender_id: owner.id,
      content:
        "Allocated from Delhi warehouse stock B-2026-015. Long shelf life rice, should be perfect.",
      created_at: d(4.2),
    },
    {
      allocation_id: ar003.id,
      sender_id: qc2.id,
      content: "Thanks! Can you arrange dispatch by Friday?",
      created_at: d(4.0),
    },

    // AR-004 thread
    {
      allocation_id: ar004.id,
      sender_id: qc1.id,
      content:
        "Urgent: 500 kg Nashik Red onions for Azadpur Mandi. Today if possible.",
      created_at: d(7.5),
    },
    {
      allocation_id: ar004.id,
      sender_id: mgr1.id,
      content:
        "Dispatching from Delhi Hub now. Truck leaves in 2 hours. Tracking: DSP-001",
      created_at: d(7.2),
    },
    {
      allocation_id: ar004.id,
      sender_id: qc1.id,
      content:
        "Received confirmation. Mandi says delivery expected by tomorrow morning.",
      created_at: d(6.8),
    },
  ];

  const { error: msgErr } = await supabaseAdmin
    .from("messages")
    .insert(messages);
  if (msgErr) console.error(`   ⚠️  Messages: ${msgErr.message}`);
  else
    console.log(`   ✓ Created ${messages.length} messages across 3 threads\n`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 8: PARSED REQUIREMENTS (QC PDF History)
// ═══════════════════════════════════════════════════════════════════════════════

async function createParsedRequirements(users) {
  console.log("📄 PHASE 8 — Creating parsed requirement history...\n");

  const qc1 = users["qc@nexus.com"];
  const qc2 = users["qc2@nexus.com"];

  const requirements = [
    {
      user_id: qc1.id,
      filename: "FreshMart_Order_Feb2026.pdf",
      extracted_text:
        "Order #FM-2026-089\nFreshMart Retail Pvt Ltd\nDate: Feb 15, 2026\n\n1. Tomato Roma - 500 kg @ ₹45/kg\n2. Potato Kufri Jyoti - 1000 kg @ ₹25/kg\n3. Onion Nashik Red - 800 kg @ ₹30/kg\n4. Apple Shimla - 300 kg @ ₹120/kg",
      parsed_items: JSON.stringify([
        {
          crop: "Tomato",
          variety: "Roma",
          quantity: 500,
          unit: "kg",
          grade: "Grade A",
          price: 45,
        },
        {
          crop: "Potato",
          variety: "Kufri Jyoti",
          quantity: 1000,
          unit: "kg",
          grade: "Standard",
          price: 25,
        },
        {
          crop: "Onion",
          variety: "Nashik Red",
          quantity: 800,
          unit: "kg",
          grade: "Grade A",
          price: 30,
        },
        {
          crop: "Apple",
          variety: "Shimla",
          quantity: 300,
          unit: "kg",
          grade: "Premium",
          price: 120,
        },
      ]),
      status: "published",
      created_at: d(5),
      published_at: d(4),
    },
    {
      user_id: qc1.id,
      filename: "GreenBasket_Export_Requirements.pdf",
      extracted_text:
        "Export Order #GB-EXP-2026-012\nGreenBasket Exports\n\n1. Grapes Thompson Seedless - 2000 kg\n2. Banana Cavendish - 500 kg\n3. Rice Basmati Premium - 5000 kg",
      parsed_items: JSON.stringify([
        {
          crop: "Grapes",
          variety: "Thompson Seedless",
          quantity: 2000,
          unit: "kg",
          grade: "Premium",
          price: 200,
        },
        {
          crop: "Banana",
          variety: "Cavendish",
          quantity: 500,
          unit: "kg",
          grade: "Organic",
          price: 55,
        },
        {
          crop: "Rice",
          variety: "Basmati",
          quantity: 5000,
          unit: "kg",
          grade: "Premium",
          price: 85,
        },
      ]),
      status: "draft",
      created_at: d(1),
    },
    {
      user_id: qc2.id,
      filename: "Delhi_Mandi_Weekly_Order.docx",
      extracted_text:
        "Weekly Supply Order\nDelhi Sabzi Mandi Corp\nWeek 9, 2026\n\n- Onion: 5000 kg\n- Potato: 3000 kg\n- Tomato: 2000 kg\n- Cauliflower: 1000 kg\n- Cabbage: 800 kg",
      parsed_items: JSON.stringify([
        {
          crop: "Onion",
          variety: "Nashik Red",
          quantity: 5000,
          unit: "kg",
          grade: "Standard",
          price: 30,
        },
        {
          crop: "Potato",
          variety: "Any",
          quantity: 3000,
          unit: "kg",
          grade: "Standard",
          price: 22,
        },
        {
          crop: "Tomato",
          variety: "Any",
          quantity: 2000,
          unit: "kg",
          grade: "Grade B",
          price: 40,
        },
        {
          crop: "Cauliflower",
          variety: "Snowball",
          quantity: 1000,
          unit: "kg",
          grade: "Grade A",
          price: 35,
        },
        {
          crop: "Cabbage",
          variety: "Golden Acre",
          quantity: 800,
          unit: "kg",
          grade: "Standard",
          price: 20,
        },
      ]),
      status: "published",
      created_at: d(3),
      published_at: d(2.5),
    },
    {
      user_id: qc1.id,
      filename: "Hotel_Chain_Quarterly.pdf",
      extracted_text:
        "Quarterly Procurement\nTaj Group Hotels\nQ1 2026\n\n1. Rice Basmati - 10000 kg\n2. Wheat HD-2967 - 8000 kg\n3. Potato - 5000 kg\n4. Onion - 4000 kg",
      parsed_items: JSON.stringify([
        {
          crop: "Rice",
          variety: "Basmati",
          quantity: 10000,
          unit: "kg",
          grade: "Premium",
          price: 90,
        },
        {
          crop: "Wheat",
          variety: "HD-2967",
          quantity: 8000,
          unit: "kg",
          grade: "Grade A",
          price: 30,
        },
        {
          crop: "Potato",
          variety: "Kufri Jyoti",
          quantity: 5000,
          unit: "kg",
          grade: "Grade A",
          price: 28,
        },
        {
          crop: "Onion",
          variety: "Nashik Red",
          quantity: 4000,
          unit: "kg",
          grade: "Standard",
          price: 32,
        },
      ]),
      status: "archived",
      created_at: d(30),
      published_at: d(28),
    },
  ];

  const { error } = await supabaseAdmin
    .from("parsed_requirements")
    .insert(requirements);
  if (error) console.error(`   ❌ Parsed requirements: ${error.message}`);
  else
    console.log(`   ✓ Created ${requirements.length} parsed PDF documents\n`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 9: CONTACT LOGS + PRICE REFERENCES
// ═══════════════════════════════════════════════════════════════════════════════

async function createContactActivity(contacts, users) {
  console.log("📞 PHASE 9 — Creating contact activity logs & price refs...\n");

  const mgr1 = users["manager@nexus.com"];
  const owner = users["owner@nexus.com"];

  const farmers = contacts.filter((c) => c.type === "farmer");
  if (farmers.length === 0) {
    console.log("   ⚠️  No farmers found\n");
    return;
  }

  // Contact logs
  const logs = [
    {
      contact_id: farmers[0].id,
      type: "call",
      summary:
        "Discussed Roma tomato pricing for bulk order. Agreed on ₹42/kg for 500+ kg.",
      logged_by: mgr1.id,
      logged_at: d(3),
    },
    {
      contact_id: farmers[0].id,
      type: "visit",
      summary:
        "Farm visit to verify crop quality. Tomatoes look excellent, ready for harvest in 2 weeks.",
      logged_by: mgr1.id,
      logged_at: d(10),
    },
    {
      contact_id: farmers[1].id,
      type: "negotiation",
      summary:
        "Negotiated potato price: ₹22/kg for 1200 kg. Farmer requested advance payment of 30%.",
      logged_by: owner.id,
      logged_at: d(12),
    },
    {
      contact_id: farmers[2].id,
      type: "order",
      summary:
        "Placed order for 650 kg Shimla apples. Expected delivery in 5 days.",
      logged_by: mgr1.id,
      logged_at: d(5),
    },
    {
      contact_id: farmers[3].id,
      type: "call",
      summary:
        "Kavita confirmed 20,000 kg onion harvest on schedule. Will deliver in 3 batches.",
      logged_by: mgr1.id,
      logged_at: d(2),
    },
    {
      contact_id: farmers[4].id,
      type: "meeting",
      summary:
        "Met at Ratnagiri farm. Discussed organic certification process. Good banana crop this season.",
      logged_by: owner.id,
      logged_at: d(7),
    },
    {
      contact_id: farmers[5].id,
      type: "email",
      summary:
        "Sent quality requirements document for cabbage. Priya acknowledged and will comply.",
      logged_by: mgr1.id,
      logged_at: d(8),
    },
    {
      contact_id: farmers[6].id,
      type: "negotiation",
      summary:
        "Wheat price locked at ₹26/kg for 5000 kg. Long-term contract discussed for 2026-27 season.",
      logged_by: owner.id,
      logged_at: d(20),
    },
    {
      contact_id: farmers[7].id,
      type: "call",
      summary:
        "Rekha confirmed Thompson Seedless grapes ready. Export quality verified by third-party lab.",
      logged_by: mgr1.id,
      logged_at: d(4),
    },
    {
      contact_id: farmers[8].id,
      type: "note",
      summary:
        "Suresh's cauliflower had minor pest issue last season. Extra inspection needed on next delivery.",
      logged_by: mgr1.id,
      logged_at: d(15),
    },
    {
      contact_id: farmers[9].id,
      type: "order",
      summary:
        "Placed order for 8000 kg Basmati rice. Premium grade, long-grain variety confirmed.",
      logged_by: owner.id,
      logged_at: d(32),
    },
    {
      contact_id: farmers[10].id,
      type: "visit",
      summary:
        "Sugarcane field inspection. CO-86032 variety growing well. Estimated yield: 180 tonnes/acre.",
      logged_by: mgr1.id,
      logged_at: d(25),
    },
  ];

  const { error: logErr } = await supabaseAdmin
    .from("contact_logs")
    .insert(logs);
  if (logErr) console.error(`   ⚠️  Contact logs: ${logErr.message}`);
  else console.log(`   ✓ Created ${logs.length} contact activity logs`);

  // Price references
  const priceRefs = [
    {
      contact_id: farmers[0].id,
      crop: "Tomato",
      offered_price: 42,
      market_price: 45,
      unit: "kg",
      notes: "Bulk discount for 500+ kg",
      recorded_at: d(3),
    },
    {
      contact_id: farmers[0].id,
      crop: "Tomato",
      offered_price: 48,
      market_price: 50,
      unit: "kg",
      notes: "Cherry tomato premium",
      recorded_at: d(30),
    },
    {
      contact_id: farmers[1].id,
      crop: "Potato",
      offered_price: 22,
      market_price: 25,
      unit: "kg",
      notes: "Cold storage variety",
      recorded_at: d(12),
    },
    {
      contact_id: farmers[2].id,
      crop: "Apple",
      offered_price: 110,
      market_price: 120,
      unit: "kg",
      notes: "Shimla premium grade",
      recorded_at: d(5),
    },
    {
      contact_id: farmers[3].id,
      crop: "Onion",
      offered_price: 28,
      market_price: 32,
      unit: "kg",
      notes: "Bulk Nashik Red",
      recorded_at: d(2),
    },
    {
      contact_id: farmers[4].id,
      crop: "Banana",
      offered_price: 50,
      market_price: 55,
      unit: "kg",
      notes: "Organic certified",
      recorded_at: d(7),
    },
    {
      contact_id: farmers[6].id,
      crop: "Wheat",
      offered_price: 26,
      market_price: 28,
      unit: "kg",
      notes: "Long-term contract pricing",
      recorded_at: d(20),
    },
    {
      contact_id: farmers[7].id,
      crop: "Grapes",
      offered_price: 180,
      market_price: 200,
      unit: "kg",
      notes: "Export quality Thompson",
      recorded_at: d(4),
    },
    {
      contact_id: farmers[9].id,
      crop: "Rice",
      offered_price: 78,
      market_price: 85,
      unit: "kg",
      notes: "Premium Basmati bulk",
      recorded_at: d(32),
    },
    {
      contact_id: farmers[10].id,
      crop: "Sugarcane",
      offered_price: 3.5,
      market_price: 4,
      unit: "kg",
      notes: "Factory gate price",
      recorded_at: d(25),
    },
  ];

  const { error: priceErr } = await supabaseAdmin
    .from("contact_price_references")
    .insert(priceRefs);
  if (priceErr) console.error(`   ⚠️  Price refs: ${priceErr.message}`);
  else console.log(`   ✓ Created ${priceRefs.length} price references\n`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log(
    "\n╔══════════════════════════════════════════════════════════════╗",
  );
  console.log("║       🌾 NEXUS WAREHOUSE — ULTIMATE TEST SEED SCRIPT       ║");
  console.log(
    "╚══════════════════════════════════════════════════════════════╝\n",
  );

  try {
    // Phase 0: Nuke
    await nukeAllData();

    // Phase 1: Users
    const users = await createUsers();
    if (Object.keys(users).length < 3) {
      console.error("❌ Not enough users created. Aborting.");
      process.exit(1);
    }

    // Phase 2: Warehouses
    const warehouses = await createWarehouses(users);
    if (warehouses.length === 0) {
      console.error("❌ No warehouses created. Aborting.");
      process.exit(1);
    }

    // Phase 3: Contacts
    const contacts = await createContacts(warehouses);

    // Phase 4: Batches
    const batches = await createBatches(warehouses, contacts);

    // Phase 4b: Historical analytics data (10 months)
    const histStats = await createHistoricalAnalyticsData(
      warehouses,
      users,
      contacts,
    );

    // Phase 5: Sensor data
    await createSensorData(warehouses);

    // Phase 6: Alerts
    await createAlerts(warehouses);

    // Phase 7: Allocations + Dispatches + Messages
    await createAllocationsAndDispatches(warehouses, users, batches);

    // Phase 8: Parsed requirements
    await createParsedRequirements(users);

    // Phase 9: Contact activity
    await createContactActivity(contacts, users);

    // ── Final Summary ──
    console.log(
      "╔══════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║                    ✅ SEEDING COMPLETE!                     ║",
    );
    console.log(
      "╠══════════════════════════════════════════════════════════════╣",
    );
    console.log(
      "║                                                            ║",
    );
    console.log(
      "║  👥 TEST ACCOUNTS (password: 123456)                       ║",
    );
    console.log(
      "║  ┌─────────────────────┬──────────┬──────────────────────┐  ║",
    );
    console.log(
      "║  │ Email               │ Role     │ Access               │  ║",
    );
    console.log(
      "║  ├─────────────────────┼──────────┼──────────────────────┤  ║",
    );
    console.log(
      "║  │ owner@nexus.com     │ Owner    │ All 3 warehouses     │  ║",
    );
    console.log(
      "║  │ manager@nexus.com   │ Manager  │ Mumbai warehouse     │  ║",
    );
    console.log(
      "║  │ manager2@nexus.com  │ Manager  │ Delhi warehouse      │  ║",
    );
    console.log(
      "║  │ qc@nexus.com        │ QC Rep   │ Orders & uploads     │  ║",
    );
    console.log(
      "║  │ qc2@nexus.com       │ QC Rep   │ Orders & uploads     │  ║",
    );
    console.log(
      "║  └─────────────────────┴──────────┴──────────────────────┘  ║",
    );
    console.log(
      "║                                                            ║",
    );
    console.log(
      "║  🏢 WAREHOUSES                                             ║",
    );
    warehouses.forEach((wh) => {
      console.log(`║     • ${wh.name.padEnd(40)} (${wh.zones} zones)  ║`);
    });
    console.log(
      "║                                                            ║",
    );
    console.log(
      "║  📊 DATA CREATED                                           ║",
    );
    console.log(
      `║     • ${contacts.length} contacts (farmers + buyers)                    ║`,
    );
    console.log(
      `║     • ${batches.length} inventory batches (active/dispatched/expired)  ║`,
    );
    console.log(
      `║     • ${histStats.batches} historical batches (10-month analytics)       ║`,
    );
    console.log(
      `║     • ${histStats.allocations} historical completed allocations              ║`,
    );
    console.log(
      `║     • ${histStats.dispatches} historical delivered dispatches                ║`,
    );
    console.log(
      `║     • ${histStats.alerts} historical acknowledged alerts                 ║`,
    );
    console.log(
      "║     • 24h sensor readings (every 15 min per zone)          ║",
    );
    console.log(
      "║     • Sensor thresholds for all zones                      ║",
    );
    console.log(
      "║     • 7+ sensor alerts (warning + critical)                ║",
    );
    console.log(
      "║     • 7+ general alerts (risk, order, system)              ║",
    );
    console.log(
      "║     • 8 allocation requests (all statuses)                 ║",
    );
    console.log(
      "║     • 4 dispatches (in-transit + delivered)                ║",
    );
    console.log(
      "║     • 10 messages across 3 conversation threads            ║",
    );
    console.log(
      "║     • 4 parsed PDF documents                              ║",
    );
    console.log(
      "║     • 12 contact activity logs                             ║",
    );
    console.log(
      "║     • 10 price reference records                           ║",
    );
    console.log(
      "║                                                            ║",
    );
    console.log(
      "║  🧪 FEATURES YOU CAN TEST                                  ║",
    );
    console.log(
      "║     ✓ Owner Dashboard — all warehouses overview            ║",
    );
    console.log(
      "║     ✓ Manager Dashboard — assigned warehouse focus         ║",
    );
    console.log(
      "║     ✓ QC Dashboard — orders & upload history               ║",
    );
    console.log(
      "║     ✓ Inventory — batches across zones & warehouses        ║",
    );
    console.log(
      "║     ✓ Sensor Monitoring — live data + historical charts    ║",
    );
    console.log(
      "║     ✓ Risk Alerts — critical/warning/acknowledged          ║",
    );
    console.log(
      "║     ✓ Allocations — full lifecycle (pending→complete)      ║",
    );
    console.log(
      "║     ✓ Dispatch History — in-transit & delivered            ║",
    );
    console.log(
      "║     ✓ Messages — threaded conversations on orders          ║",
    );
    console.log(
      "║     ✓ Farmer Management — farmers w/ contact logs          ║",
    );
    console.log(
      "║     ✓ PDF Parsing — uploaded documents with parsed items   ║",
    );
    console.log(
      "║     ✓ Analytics — data across all tables                   ║",
    );
    console.log(
      "║     ✓ Settings — profile editing (name, logout)            ║",
    );
    console.log(
      "║                                                            ║",
    );
    console.log(
      "╚══════════════════════════════════════════════════════════════╝",
    );
    console.log();
  } catch (err) {
    console.error("\n❌ FATAL:", err);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
