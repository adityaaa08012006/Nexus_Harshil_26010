-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Link batches.farmer_id to contacts table
-- Drops redundant farmer_name and farmer_contact columns from batches and
-- changes farmer_id from VARCHAR to UUID FK → contacts(id).
--
-- Run this in Supabase SQL Editor BEFORE inserting the new seed data.
-- ═══════════════════════════════════════════════════════════════════════════

-- Step 1: Drop the redundant denormalized columns
ALTER TABLE batches DROP COLUMN IF EXISTS farmer_name;
ALTER TABLE batches DROP COLUMN IF EXISTS farmer_contact;

-- Step 2: Change farmer_id from VARCHAR to UUID
-- (existing rows will be NULL after the change — safe for fresh dev DBs)
ALTER TABLE batches DROP COLUMN IF EXISTS farmer_id;
ALTER TABLE batches
  ADD COLUMN farmer_id UUID REFERENCES contacts(id) ON DELETE SET NULL;

-- Step 3: Add an index for fast farmer→batch lookups
CREATE INDEX IF NOT EXISTS idx_batches_farmer_id ON batches(farmer_id);

-- Step 4: Confirm warehouse_id FK exists (added in phase3-sensors-schema.sql)
-- Safe to re-run; ADD COLUMN IF NOT EXISTS is idempotent
ALTER TABLE batches
  ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_batches_warehouse_id ON batches(warehouse_id);
