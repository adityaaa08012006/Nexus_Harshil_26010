-- Migration: Extend contacts table with farmer-specific fields
-- Run this in Supabase SQL Editor

-- Add new columns for farmer details
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS area_acres NUMERIC(10, 2);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS growing_crop VARCHAR(100);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS crop_variety VARCHAR(100);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS expected_harvest_date DATE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS expected_quantity NUMERIC(10, 2);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS quantity_unit VARCHAR(20) DEFAULT 'kg';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL;

-- Add index for faster farmer lookups
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_warehouse ON contacts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_contacts_growing_crop ON contacts(growing_crop);
