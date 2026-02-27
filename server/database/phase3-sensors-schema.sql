-- ============================================================================
-- PHASE 3: Sensor Monitoring & Environmental Data - Database Schema
-- ============================================================================
-- Run this in your Supabase SQL Editor to set up Phase 3 tables
-- ============================================================================

-- ============================================================================
-- CLEANUP: Drop existing tables if you want a fresh install (OPTIONAL)
-- ============================================================================
-- Uncomment the lines below if you want to start fresh
-- WARNING: This will delete all sensor data!
/*
DROP TABLE IF EXISTS public.sensor_alerts CASCADE;
DROP TABLE IF EXISTS public.sensor_readings CASCADE;
DROP TABLE IF EXISTS public.sensor_thresholds CASCADE;
DROP TABLE IF EXISTS public.warehouses CASCADE;
*/

-- ============================================================================
-- 1. WAREHOUSES TABLE
-- ============================================================================
-- Store warehouse information
CREATE TABLE IF NOT EXISTS public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity NUMERIC NOT NULL DEFAULT 1000, -- Storage capacity in metric tons
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key to auth.users (owner must exist)
  CONSTRAINT fk_warehouses_owner 
    FOREIGN KEY (owner_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE
);

-- Index for faster owner lookups
CREATE INDEX IF NOT EXISTS idx_warehouses_owner ON public.warehouses(owner_id);

-- ============================================================================
-- 2. UPDATE USER_PROFILES TABLE
-- ============================================================================
-- Add warehouse_id to user_profiles for manager assignment
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS warehouse_id UUID;

-- Add foreign key constraint (skip if already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_user_profiles_warehouse'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD CONSTRAINT fk_user_profiles_warehouse 
      FOREIGN KEY (warehouse_id) 
      REFERENCES public.warehouses(id) 
      ON DELETE SET NULL;
  END IF;
END $$;

-- Index for faster warehouse lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_warehouse 
ON public.user_profiles(warehouse_id);

-- ============================================================================
-- 3. UPDATE BATCHES TABLE
-- ============================================================================
-- Add warehouse_id to batches table if not exists
ALTER TABLE public.batches 
ADD COLUMN IF NOT EXISTS warehouse_id UUID;

-- Add foreign key constraint (skip if already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_batches_warehouse'
  ) THEN
    ALTER TABLE public.batches 
    ADD CONSTRAINT fk_batches_warehouse 
      FOREIGN KEY (warehouse_id) 
      REFERENCES public.warehouses(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- Index for faster warehouse-batch lookups
CREATE INDEX IF NOT EXISTS idx_batches_warehouse 
ON public.batches(warehouse_id);

-- ============================================================================
-- 4. SENSOR_THRESHOLDS TABLE
-- ============================================================================
-- Store threshold configurations per warehouse and zone
CREATE TABLE IF NOT EXISTS public.sensor_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL,
  zone TEXT NOT NULL, -- 'Grain Storage', 'Cold Storage', 'Dry Storage', 'Fresh Produce'
  
  -- Temperature thresholds (°C)
  temp_min NUMERIC NOT NULL DEFAULT 18,
  temp_max NUMERIC NOT NULL DEFAULT 25,
  
  -- Humidity thresholds (%)
  humidity_min NUMERIC NOT NULL DEFAULT 40,
  humidity_max NUMERIC NOT NULL DEFAULT 70,
  
  -- Gas level thresholds (ppm)
  ethylene_max NUMERIC NOT NULL DEFAULT 1.0,
  co2_max NUMERIC NOT NULL DEFAULT 1000,
  ammonia_max NUMERIC NOT NULL DEFAULT 25,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key to warehouses
  CONSTRAINT fk_thresholds_warehouse 
    FOREIGN KEY (warehouse_id) 
    REFERENCES public.warehouses(id) 
    ON DELETE CASCADE,
    
  -- Unique constraint: one threshold config per warehouse-zone combination
  CONSTRAINT unique_warehouse_zone 
    UNIQUE (warehouse_id, zone)
);

-- Index for faster threshold lookups
CREATE INDEX IF NOT EXISTS idx_thresholds_warehouse_zone 
ON public.sensor_thresholds(warehouse_id, zone);

-- ============================================================================
-- 5. SENSOR_READINGS TABLE
-- ============================================================================
-- Store real-time sensor data
CREATE TABLE IF NOT EXISTS public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL,
  zone TEXT NOT NULL,
  
  -- Environmental readings
  temperature NUMERIC NOT NULL, -- °C
  humidity NUMERIC NOT NULL, -- %
  ethylene NUMERIC NOT NULL DEFAULT 0, -- ppm
  co2 NUMERIC NOT NULL DEFAULT 400, -- ppm
  ammonia NUMERIC NOT NULL DEFAULT 0, -- ppm
  
  -- Metadata
  reading_time TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key to warehouses
  CONSTRAINT fk_readings_warehouse 
    FOREIGN KEY (warehouse_id) 
    REFERENCES public.warehouses(id) 
    ON DELETE CASCADE
);

-- Add reading_time column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'sensor_readings' 
    AND column_name = 'reading_time'
  ) THEN
    ALTER TABLE public.sensor_readings 
    ADD COLUMN reading_time TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_readings_warehouse ON public.sensor_readings(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_readings_zone ON public.sensor_readings(zone);
CREATE INDEX IF NOT EXISTS idx_readings_time ON public.sensor_readings(reading_time DESC);
CREATE INDEX IF NOT EXISTS idx_readings_warehouse_zone_time 
ON public.sensor_readings(warehouse_id, zone, reading_time DESC);

-- ============================================================================
-- 6. SENSOR_ALERTS TABLE
-- ============================================================================
-- Store sensor threshold breach alerts
CREATE TABLE IF NOT EXISTS public.sensor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL,
  zone TEXT NOT NULL,
  
  -- Alert details
  alert_type TEXT NOT NULL, -- 'temperature', 'humidity', 'ethylene', 'co2', 'ammonia'
  severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical')),
  message TEXT NOT NULL,
  current_value NUMERIC NOT NULL,
  threshold_value NUMERIC NOT NULL,
  
  -- Status
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID, -- user who acknowledged
  acknowledged_at TIMESTAMPTZ,
  
  -- Timestamps
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT fk_alerts_warehouse 
    FOREIGN KEY (warehouse_id) 
    REFERENCES public.warehouses(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_alerts_acknowledged_by 
    FOREIGN KEY (acknowledged_by) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL
);

-- Indexes for faster alert queries
CREATE INDEX IF NOT EXISTS idx_alerts_warehouse ON public.sensor_alerts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON public.sensor_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered_at ON public.sensor_alerts(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_warehouse_unacked 
ON public.sensor_alerts(warehouse_id, acknowledged) 
WHERE acknowledged = FALSE;

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_alerts ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- WAREHOUSES POLICIES
-- ----------------------------------------------------------------------------

-- Owners can view all warehouses they own
DROP POLICY IF EXISTS "Owners can view their warehouses" ON public.warehouses;
CREATE POLICY "Owners can view their warehouses"
ON public.warehouses FOR SELECT
USING (
  owner_id = auth.uid()
);

-- Owners can insert their own warehouses
DROP POLICY IF EXISTS "Owners can create warehouses" ON public.warehouses;
CREATE POLICY "Owners can create warehouses"
ON public.warehouses FOR INSERT
WITH CHECK (
  owner_id = auth.uid()
);

-- Owners can update their own warehouses
DROP POLICY IF EXISTS "Owners can update their warehouses" ON public.warehouses;
CREATE POLICY "Owners can update their warehouses"
ON public.warehouses FOR UPDATE
USING (owner_id = auth.uid());

-- Owners can delete their own warehouses
DROP POLICY IF EXISTS "Owners can delete their warehouses" ON public.warehouses;
CREATE POLICY "Owners can delete their warehouses"
ON public.warehouses FOR DELETE
USING (owner_id = auth.uid());

-- Managers can view warehouses they're assigned to
DROP POLICY IF EXISTS "Managers can view their assigned warehouse" ON public.warehouses;
CREATE POLICY "Managers can view their assigned warehouse"
ON public.warehouses FOR SELECT
USING (
  id IN (
    SELECT warehouse_id 
    FROM public.user_profiles 
    WHERE id = auth.uid() AND warehouse_id IS NOT NULL
  )
);

-- ----------------------------------------------------------------------------
-- SENSOR_THRESHOLDS POLICIES
-- ----------------------------------------------------------------------------

-- Owners can manage thresholds for their warehouses
DROP POLICY IF EXISTS "Owners can manage thresholds for their warehouses" ON public.sensor_thresholds;
CREATE POLICY "Owners can manage thresholds for their warehouses"
ON public.sensor_thresholds FOR ALL
USING (
  warehouse_id IN (
    SELECT id FROM public.warehouses WHERE owner_id = auth.uid()
  )
);

-- Managers can view and update thresholds for their assigned warehouse
DROP POLICY IF EXISTS "Managers can view thresholds for their warehouse" ON public.sensor_thresholds;
CREATE POLICY "Managers can view thresholds for their warehouse"
ON public.sensor_thresholds FOR SELECT
USING (
  warehouse_id IN (
    SELECT warehouse_id 
    FROM public.user_profiles 
    WHERE id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Managers can update thresholds for their warehouse" ON public.sensor_thresholds;
CREATE POLICY "Managers can update thresholds for their warehouse"
ON public.sensor_thresholds FOR UPDATE
USING (
  warehouse_id IN (
    SELECT warehouse_id 
    FROM public.user_profiles 
    WHERE id = auth.uid()
  )
);

-- ----------------------------------------------------------------------------
-- SENSOR_READINGS POLICIES
-- ----------------------------------------------------------------------------

-- Service role can insert sensor readings (for simulator)
DROP POLICY IF EXISTS "Service role can insert sensor readings" ON public.sensor_readings;
CREATE POLICY "Service role can insert sensor readings"
ON public.sensor_readings FOR INSERT
WITH CHECK (true); -- Allow service role to insert

-- Owners can view readings from their warehouses
DROP POLICY IF EXISTS "Owners can view readings from their warehouses" ON public.sensor_readings;
CREATE POLICY "Owners can view readings from their warehouses"
ON public.sensor_readings FOR SELECT
USING (
  warehouse_id IN (
    SELECT id FROM public.warehouses WHERE owner_id = auth.uid()
  )
);

-- Managers can view readings from their assigned warehouse
DROP POLICY IF EXISTS "Managers can view readings from their warehouse" ON public.sensor_readings;
CREATE POLICY "Managers can view readings from their warehouse"
ON public.sensor_readings FOR SELECT
USING (
  warehouse_id IN (
    SELECT warehouse_id 
    FROM public.user_profiles 
    WHERE id = auth.uid()
  )
);

-- ----------------------------------------------------------------------------
-- SENSOR_ALERTS POLICIES
-- ----------------------------------------------------------------------------

-- Owners can view and acknowledge alerts from their warehouses
DROP POLICY IF EXISTS "Owners can view alerts from their warehouses" ON public.sensor_alerts;
CREATE POLICY "Owners can view alerts from their warehouses"
ON public.sensor_alerts FOR SELECT
USING (
  warehouse_id IN (
    SELECT id FROM public.warehouses WHERE owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Owners can acknowledge alerts from their warehouses" ON public.sensor_alerts;
CREATE POLICY "Owners can acknowledge alerts from their warehouses"
ON public.sensor_alerts FOR UPDATE
USING (
  warehouse_id IN (
    SELECT id FROM public.warehouses WHERE owner_id = auth.uid()
  )
);

-- Managers can view and acknowledge alerts from their warehouse
DROP POLICY IF EXISTS "Managers can view alerts from their warehouse" ON public.sensor_alerts;
CREATE POLICY "Managers can view alerts from their warehouse"
ON public.sensor_alerts FOR SELECT
USING (
  warehouse_id IN (
    SELECT warehouse_id 
    FROM public.user_profiles 
    WHERE id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Managers can acknowledge alerts from their warehouse" ON public.sensor_alerts;
CREATE POLICY "Managers can acknowledge alerts from their warehouse"
ON public.sensor_alerts FOR UPDATE
USING (
  warehouse_id IN (
    SELECT warehouse_id 
    FROM public.user_profiles 
    WHERE id = auth.uid()
  )
);

-- Service role can insert alerts (for threshold breach detection)
DROP POLICY IF EXISTS "Service role can insert alerts" ON public.sensor_alerts;
CREATE POLICY "Service role can insert alerts"
ON public.sensor_alerts FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- 8. DEFAULT WAREHOUSE ZONES
-- ============================================================================
-- Helper function to get all warehouse zones
CREATE OR REPLACE FUNCTION public.get_warehouse_zones()
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY['Grain Storage', 'Cold Storage', 'Dry Storage', 'Fresh Produce'];
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 9. FUNCTION TO CREATE DEFAULT THRESHOLDS FOR NEW WAREHOUSES
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_default_thresholds()
RETURNS TRIGGER AS $$
DECLARE
  zone_name TEXT;
BEGIN
  -- Create default thresholds for each zone
  FOREACH zone_name IN ARRAY get_warehouse_zones()
  LOOP
    INSERT INTO public.sensor_thresholds (
      warehouse_id, 
      zone,
      temp_min, 
      temp_max,
      humidity_min,
      humidity_max,
      ethylene_max,
      co2_max,
      ammonia_max
    )
    VALUES (
      NEW.id,
      zone_name,
      CASE zone_name
        WHEN 'Cold Storage' THEN 2
        WHEN 'Fresh Produce' THEN 10
        WHEN 'Grain Storage' THEN 15
        ELSE 18
      END,
      CASE zone_name
        WHEN 'Cold Storage' THEN 8
        WHEN 'Fresh Produce' THEN 15
        WHEN 'Grain Storage' THEN 25
        ELSE 25
      END,
      40, -- humidity_min
      CASE zone_name
        WHEN 'Dry Storage' THEN 50
        WHEN 'Grain Storage' THEN 60
        ELSE 70
      END,
      1.0,  -- ethylene_max (ppm)
      1000, -- co2_max (ppm)
      25    -- ammonia_max (ppm)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create thresholds when warehouse is created
DROP TRIGGER IF EXISTS trigger_create_default_thresholds ON public.warehouses;
CREATE TRIGGER trigger_create_default_thresholds
AFTER INSERT ON public.warehouses
FOR EACH ROW
EXECUTE FUNCTION public.create_default_thresholds();

-- ============================================================================
-- 10. UPDATED_AT TRIGGERS
-- ============================================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to warehouses
DROP TRIGGER IF EXISTS trigger_warehouses_updated_at ON public.warehouses;
CREATE TRIGGER trigger_warehouses_updated_at
BEFORE UPDATE ON public.warehouses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Apply to thresholds
DROP TRIGGER IF EXISTS trigger_thresholds_updated_at ON public.sensor_thresholds;
CREATE TRIGGER trigger_thresholds_updated_at
BEFORE UPDATE ON public.sensor_thresholds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 11. SEED DATA (OPTIONAL - For Development/Testing)
-- ============================================================================
-- Uncomment to insert sample warehouses
-- NOTE: Replace '00000000-0000-0000-0000-000000000000' with actual owner user ID

/*
-- Insert sample warehouses
INSERT INTO public.warehouses (name, location, capacity, owner_id) VALUES
  ('Delhi Central Warehouse', 'New Delhi, Delhi', 2000, '00000000-0000-0000-0000-000000000000'),
  ('Mumbai Port Warehouse', 'Mumbai, Maharashtra', 1500, '00000000-0000-0000-0000-000000000000'),
  ('Bangalore Tech Warehouse', 'Bangalore, Karnataka', 1000, '00000000-0000-0000-0000-000000000000');
*/

-- ============================================================================
-- PHASE 3 SCHEMA SETUP COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Run this entire SQL in your Supabase SQL Editor
-- 2. Verify tables were created: warehouses, sensor_thresholds, sensor_readings, sensor_alerts
-- 3. Check that RLS policies are enabled (Settings > Policies in Supabase dashboard)
-- 4. Optionally, uncomment and update the seed data section to create test warehouses
-- ============================================================================
