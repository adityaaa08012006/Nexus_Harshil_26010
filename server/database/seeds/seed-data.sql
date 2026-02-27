-- ═══════════════════════════════════════════════════════════════════════════
-- Godam Solutions – Full Seed Data
-- Run this in Supabase SQL Editor AFTER:
--   1. Running schema.sql to create tables
--   2. Running extend-contacts-farmers.sql migration
--   3. Running the batch-farmer-fk migration (batch_farmer_fk_migration.sql)
--   4. Registering at least one owner account via the Auth page and copying
--      their UUID from: Supabase Dashboard → Authentication → Users
--
-- HOW TO USE:
--   a) Replace 3bbff0ae-ec02-46af-88c9-7025b5446211 with the owner's actual UID (all 3 occurrences)
--   b) Replace <MANAGER_UUID> with the manager's actual UID (if you have one)
--   c) Run the entire script in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── STEP 1: Seed Warehouses ─────────────────────────────────────────────────
-- Two demo warehouses in different cities.
INSERT INTO warehouses (id, name, location, capacity, owner_id)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Godam Warehouse – Pune',
    'Plot 42, MIDC Industrial Area, Pune, Maharashtra 411019',
    50000,
    '3bbff0ae-ec02-46af-88c9-7025b5446211'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Godam Warehouse – Nashik',
    'Survey No. 18, Satpur MIDC, Nashik, Maharashtra 422007',
    35000,
    '3bbff0ae-ec02-46af-88c9-7025b5446211'
  )
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 2: Link manager to warehouse (optional) ────────────────────────────
-- UPDATE user_profiles
--   SET warehouse_id = '00000000-0000-0000-0000-000000000001'
--   WHERE id = '<MANAGER_UUID>';

-- ─── STEP 3: Seed Farmer Contacts ────────────────────────────────────────────
-- 15 farmers across Maharashtra & Karnataka with varied crops.
-- These use temp UUIDs keyed as C-001 → C-015 for easy reference in batches below.
INSERT INTO contacts (
  id, type, name, phone, email, location,
  area_acres, growing_crop, crop_variety,
  expected_harvest_date, expected_quantity, quantity_unit,
  warehouse_id, notes
) VALUES
  (
    'c1000000-0000-0000-0000-000000000001', 'farmer',
    'Rajan Patil', '+91 98765 11001', 'rajan.patil@gmail.com',
    'Nashik, Maharashtra',
    8.5, 'Tomatoes', 'Roma',
    (NOW() + INTERVAL '45 days')::DATE, 4800, 'kg',
    '00000000-0000-0000-0000-000000000002',
    'Primarily grows Roma tomatoes; uses drip irrigation'
  ),
  (
    'c1000000-0000-0000-0000-000000000002', 'farmer',
    'Sunita Desai', '+91 98765 11002', 'sunita.desai@gmail.com',
    'Satara, Maharashtra',
    14.0, 'Potatoes', 'Kufri Jyoti',
    (NOW() + INTERVAL '60 days')::DATE, 12000, 'kg',
    '00000000-0000-0000-0000-000000000001',
    'Cold-storage compatible crop; large farm'
  ),
  (
    'c1000000-0000-0000-0000-000000000003', 'farmer',
    'Mohan Singh', '+91 98765 11003', 'mohan.singh@gmail.com',
    'Himachal Pradesh',
    6.0, 'Apples', 'Shimla',
    (NOW() + INTERVAL '30 days')::DATE, 6500, 'kg',
    '00000000-0000-0000-0000-000000000001',
    'High altitude apple orchards; premium grade'
  ),
  (
    'c1000000-0000-0000-0000-000000000004', 'farmer',
    'Kavita Joshi', '+91 98765 11004', 'kavita.joshi@gmail.com',
    'Nashik, Maharashtra',
    22.0, 'Onions', 'Nasik Red',
    (NOW() + INTERVAL '10 days')::DATE, 20000, 'kg',
    '00000000-0000-0000-0000-000000000002',
    'Major onion producer; bulk supply available'
  ),
  (
    'c1000000-0000-0000-0000-000000000005', 'farmer',
    'Amit Sharma', '+91 98765 11005', 'amit.sharma@gmail.com',
    'Ratnagiri, Maharashtra',
    5.5, 'Bananas', 'Cavendish',
    (NOW() + INTERVAL '15 days')::DATE, 3000, 'kg',
    '00000000-0000-0000-0000-000000000001',
    'Coastal banana plantation; organic farming'
  ),
  (
    'c1000000-0000-0000-0000-000000000006', 'farmer',
    'Priya Nair', '+91 98765 11006', 'priya.nair@gmail.com',
    'Pune, Maharashtra',
    3.5, 'Cabbage', 'Golden Acre',
    (NOW() + INTERVAL '20 days')::DATE, 4000, 'kg',
    '00000000-0000-0000-0000-000000000001',
    'Small farm near Pune; quick delivery possible'
  ),
  (
    'c1000000-0000-0000-0000-000000000007', 'farmer',
    'Vijay Kulkarni', '+91 98765 11007', 'vijay.kulkarni@gmail.com',
    'Solapur, Maharashtra',
    55.0, 'Wheat', 'HD-2967',
    (NOW() + INTERVAL '90 days')::DATE, 50000, 'kg',
    '00000000-0000-0000-0000-000000000001',
    'Large rabi crop; bulk wheat supplier'
  ),
  (
    'c1000000-0000-0000-0000-000000000008', 'farmer',
    'Rekha Mehta', '+91 98765 11008', 'rekha.mehta@gmail.com',
    'Sangli, Maharashtra',
    4.0, 'Grapes', 'Thompson Seedless',
    (NOW() + INTERVAL '25 days')::DATE, 2200, 'kg',
    '00000000-0000-0000-0000-000000000002',
    'Wine and table grape variety; export quality'
  ),
  (
    'c1000000-0000-0000-0000-000000000009', 'farmer',
    'Suresh Yadav', '+91 98765 11009', 'suresh.yadav@gmail.com',
    'Kolhapur, Maharashtra',
    7.0, 'Cauliflower', 'Snowball',
    (NOW() + INTERVAL '12 days')::DATE, 3500, 'kg',
    '00000000-0000-0000-0000-000000000001',
    'Fast-growing variety; multiple seasons per year'
  ),
  (
    'c1000000-0000-0000-0000-000000000010', 'farmer',
    'Anita Gupta', '+91 98765 11010', 'anita.gupta@gmail.com',
    'Aurangabad, Maharashtra',
    80.0, 'Rice', 'Basmati',
    (NOW() + INTERVAL '120 days')::DATE, 80000, 'kg',
    '00000000-0000-0000-0000-000000000001',
    'Premium Basmati variety; long-grain export grade'
  ),
  (
    'c1000000-0000-0000-0000-000000000011', 'farmer',
    'Ramesh Patil', '+91 98765 11011', 'ramesh.patil@gmail.com',
    'Dhule, Maharashtra',
    12.0, 'Maize', 'Hybrid 614',
    (NOW() + INTERVAL '70 days')::DATE, 15000, 'kg',
    '00000000-0000-0000-0000-000000000002',
    'Feed-grade and food-grade maize both available'
  ),
  (
    'c1000000-0000-0000-0000-000000000012', 'farmer',
    'Geeta Wani', '+91 98765 11012', 'geeta.wani@gmail.com',
    'Nanded, Maharashtra',
    9.0, 'Soybean', 'JS-335',
    (NOW() + INTERVAL '80 days')::DATE, 9000, 'kg',
    '00000000-0000-0000-0000-000000000002',
    'Oil-grade soybean; certified seed crop'
  ),
  (
    'c1000000-0000-0000-0000-000000000013', 'farmer',
    'Deepak Chavan', '+91 98765 11013', 'deepak.chavan@gmail.com',
    'Ahmednagar, Maharashtra',
    18.0, 'Sugarcane', 'CO-86032',
    (NOW() + INTERVAL '180 days')::DATE, 180000, 'kg',
    '00000000-0000-0000-0000-000000000001',
    'Sugar factory tie-up; consistent supply'
  ),
  (
    'c1000000-0000-0000-0000-000000000014', 'farmer',
    'Sanjay More', '+91 98765 11014', 'sanjay.more@gmail.com',
    'Pune, Maharashtra',
    6.5, 'Tomatoes', 'Cherry',
    (NOW() + INTERVAL '35 days')::DATE, 3500, 'kg',
    '00000000-0000-0000-0000-000000000001',
    'Specialty cherry tomatoes for restaurant supply'
  ),
  (
    'c1000000-0000-0000-0000-000000000015', 'farmer',
    'Lata Bhosle', '+91 98765 11015', 'lata.bhosle@gmail.com',
    'Kolhapur, Maharashtra',
    10.0, 'Grapes', 'Black Muscat',
    (NOW() + INTERVAL '40 days')::DATE, 5000, 'kg',
    '00000000-0000-0000-0000-000000000002',
    'Specialty dark grape variety; premium market'
  )
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 4: Seed Batches ────────────────────────────────────────────────────
-- 20 batches using the contacts above as farmer_id (UUID FK).
-- farmer_name and farmer_contact columns have been REMOVED per the migration.
-- Each batch has an explicit warehouse_id.
INSERT INTO batches (
  batch_id, farmer_id, crop, variety,
  quantity, unit, entry_date, shelf_life, risk_score,
  zone, warehouse_id, status, temperature, humidity
) VALUES
  -- Pune Warehouse (00...001) batches
  (
    'B-2026-001',
    'c1000000-0000-0000-0000-000000000002', -- Sunita Desai (Potatoes)
    'Potatoes', 'Kufri Jyoti',
    1200, 'kg', NOW() - INTERVAL '10 days', 60, 18,
    'B-1', '00000000-0000-0000-0000-000000000001', 'active', 12.0, 55
  ),
  (
    'B-2026-002',
    'c1000000-0000-0000-0000-000000000003', -- Mohan Singh (Apples)
    'Apples', 'Shimla',
    650, 'kg', NOW() - INTERVAL '3 days', 45, 24,
    'C-1', '00000000-0000-0000-0000-000000000001', 'active', 4.0, 62
  ),
  (
    'B-2026-003',
    'c1000000-0000-0000-0000-000000000005', -- Amit Sharma (Bananas)
    'Bananas', 'Cavendish',
    300, 'kg', NOW() - INTERVAL '4 days', 10, 81,
    'A-2', '00000000-0000-0000-0000-000000000001', 'active', 24.0, 82
  ),
  (
    'B-2026-004',
    'c1000000-0000-0000-0000-000000000006', -- Priya Nair (Cabbage)
    'Cabbage', 'Golden Acre',
    400, 'kg', NOW() - INTERVAL '7 days', 21, 58,
    'A-1', '00000000-0000-0000-0000-000000000001', 'active', 8.0, 70
  ),
  (
    'B-2026-005',
    'c1000000-0000-0000-0000-000000000007', -- Vijay Kulkarni (Wheat)
    'Wheat', 'HD-2967',
    5000, 'kg', NOW() - INTERVAL '15 days', 365, 8,
    'D-1', '00000000-0000-0000-0000-000000000001', 'active', 20.0, 45
  ),
  (
    'B-2026-006',
    'c1000000-0000-0000-0000-000000000009', -- Suresh Yadav (Cauliflower)
    'Cauliflower', 'Snowball',
    350, 'kg', NOW() - INTERVAL '9 days', 18, 76,
    'A-2', '00000000-0000-0000-0000-000000000001', 'active', 6.0, 68
  ),
  (
    'B-2026-007',
    'c1000000-0000-0000-0000-000000000010', -- Anita Gupta (Rice)
    'Rice', 'Basmati',
    8000, 'kg', NOW() - INTERVAL '30 days', 365, 12,
    'D-2', '00000000-0000-0000-0000-000000000001', 'active', 22.0, 48
  ),
  (
    'B-2026-008',
    'c1000000-0000-0000-0000-000000000013', -- Deepak Chavan (Sugarcane)
    'Sugarcane', 'CO-86032',
    2500, 'kg', NOW() - INTERVAL '2 days', 14, 15,
    'B-2', '00000000-0000-0000-0000-000000000001', 'active', 18.0, 65
  ),
  (
    'B-2026-009',
    'c1000000-0000-0000-0000-000000000014', -- Sanjay More (Cherry Tomatoes)
    'Tomatoes', 'Cherry',
    280, 'kg', NOW() - INTERVAL '1 days', 8, 35,
    'A-1', '00000000-0000-0000-0000-000000000001', 'active', 10.0, 75
  ),
  (
    'B-2026-010',
    'c1000000-0000-0000-0000-000000000003', -- Mohan Singh (second batch)
    'Apples', 'Shimla',
    900, 'kg', NOW() - INTERVAL '8 days', 45, 40,
    'C-2', '00000000-0000-0000-0000-000000000001', 'active', 5.0, 60
  ),
  -- Nashik Warehouse (00...002) batches
  (
    'B-2026-011',
    'c1000000-0000-0000-0000-000000000001', -- Rajan Patil (Tomatoes)
    'Tomatoes', 'Roma',
    480, 'kg', NOW() - INTERVAL '5 days', 12, 72,
    'A-1', '00000000-0000-0000-0000-000000000002', 'active', 26.5, 78
  ),
  (
    'B-2026-012',
    'c1000000-0000-0000-0000-000000000004', -- Kavita Joshi (Onions)
    'Onions', 'Nasik Red',
    2000, 'kg', NOW() - INTERVAL '20 days', 90, 45,
    'B-2', '00000000-0000-0000-0000-000000000002', 'active', 18.0, 60
  ),
  (
    'B-2026-013',
    'c1000000-0000-0000-0000-000000000008', -- Rekha Mehta (Grapes)
    'Grapes', 'Thompson Seedless',
    220, 'kg', NOW() - INTERVAL '6 days', 14, 63,
    'C-1', '00000000-0000-0000-0000-000000000002', 'active', 2.0, 85
  ),
  (
    'B-2026-014',
    'c1000000-0000-0000-0000-000000000011', -- Ramesh Patil (Maize)
    'Maize', 'Hybrid 614',
    3200, 'kg', NOW() - INTERVAL '12 days', 180, 10,
    'D-1', '00000000-0000-0000-0000-000000000002', 'active', 21.0, 50
  ),
  (
    'B-2026-015',
    'c1000000-0000-0000-0000-000000000012', -- Geeta Wani (Soybean)
    'Soybean', 'JS-335',
    1800, 'kg', NOW() - INTERVAL '18 days', 180, 14,
    'D-2', '00000000-0000-0000-0000-000000000002', 'active', 23.0, 47
  ),
  (
    'B-2026-016',
    'c1000000-0000-0000-0000-000000000015', -- Lata Bhosle (Black Muscat)
    'Grapes', 'Black Muscat',
    500, 'kg', NOW() - INTERVAL '3 days', 14, 28,
    'C-2', '00000000-0000-0000-0000-000000000002', 'active', 3.0, 80
  ),
  (
    'B-2026-017',
    'c1000000-0000-0000-0000-000000000001', -- Rajan Patil (second batch)
    'Tomatoes', 'Roma',
    600, 'kg', NOW() - INTERVAL '11 days', 12, 90,
    'A-2', '00000000-0000-0000-0000-000000000002', 'active', 28.0, 82
  ),
  (
    'B-2026-018',
    'c1000000-0000-0000-0000-000000000004', -- Kavita Joshi (second batch)
    'Onions', 'Nasik Red',
    1500, 'kg', NOW() - INTERVAL '5 days', 90, 22,
    'B-1', '00000000-0000-0000-0000-000000000002', 'active', 16.0, 58
  ),
  -- A couple of dispatched batches for history
  (
    'B-2026-019',
    'c1000000-0000-0000-0000-000000000002', -- Sunita Desai
    'Potatoes', 'Kufri Jyoti',
    800, 'kg', NOW() - INTERVAL '25 days', 60, 55,
    'B-3', '00000000-0000-0000-0000-000000000001', 'dispatched', 12.0, 55
  ),
  (
    'B-2026-020',
    'c1000000-0000-0000-0000-000000000005', -- Amit Sharma
    'Bananas', 'Cavendish',
    200, 'kg', NOW() - INTERVAL '12 days', 10, 95,
    'A-3', '00000000-0000-0000-0000-000000000001', 'dispatched', 25.0, 84
  )
ON CONFLICT (batch_id) DO NOTHING;
