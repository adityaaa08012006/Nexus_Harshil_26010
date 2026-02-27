-- Migration: Add warehouse_id to allocation_requests table
-- This allows filtering orders by warehouse so managers only see orders for their warehouse

-- Add warehouse_id column to allocation_requests
ALTER TABLE allocation_requests ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_allocation_requests_warehouse ON allocation_requests(warehouse_id);

-- Add comments for documentation
COMMENT ON COLUMN allocation_requests.warehouse_id IS 'The warehouse that will fulfill this allocation request';
