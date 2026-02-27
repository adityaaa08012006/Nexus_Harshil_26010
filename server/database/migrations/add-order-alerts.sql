-- Migration: Add 'order' type to alerts table for allocation request notifications
-- This allows managers to receive notifications when new orders are received

-- Drop the existing check constraint
ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_type_check;

-- Add the new check constraint with 'order' included
ALTER TABLE alerts ADD CONSTRAINT alerts_type_check 
    CHECK (type IN ('temperature', 'humidity', 'gas', 'risk', 'system', 'order'));

-- Add index for better query performance on type
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);

-- Add comments for documentation
COMMENT ON TABLE alerts IS 'System and order alerts for warehouse managers and operators';
COMMENT ON COLUMN alerts.type IS 'Alert type: temperature, humidity, gas, risk, system, or order';
