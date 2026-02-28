-- ============================================================================
-- Multi-Warehouse Manager Support
-- Add zones and storage_type to warehouses
-- Create manager_warehouse_assignments junction table
-- Migrate existing warehouse_id data
-- ============================================================================

-- Add new columns to warehouses table
ALTER TABLE public.warehouses
  ADD COLUMN IF NOT EXISTS zones INTEGER NOT NULL DEFAULT 4 CHECK (zones >= 1 AND zones <= 4),
  ADD COLUMN IF NOT EXISTS storage_type VARCHAR(50) NOT NULL DEFAULT 'ambient';

COMMENT ON COLUMN public.warehouses.zones IS 'Number of zones (1-4). Determines which zones from ["Grain Storage", "Cold Storage", "Dry Storage", "Fresh Produce"] are available.';
COMMENT ON COLUMN public.warehouses.storage_type IS 'Type of storage: ambient, refrigerated, controlled_atmosphere, dry, mixed';

-- Create manager_warehouse_assignments junction table
CREATE TABLE IF NOT EXISTS public.manager_warehouse_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    UNIQUE(manager_id, warehouse_id)
);

COMMENT ON TABLE public.manager_warehouse_assignments IS 'Many-to-many relationship between managers and warehouses. Managers can be assigned to multiple warehouses.';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_manager_warehouse_assignments_manager 
  ON public.manager_warehouse_assignments(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_warehouse_assignments_warehouse 
  ON public.manager_warehouse_assignments(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_owner 
  ON public.warehouses(owner_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_zones 
  ON public.warehouses(zones);

-- Migrate existing warehouse assignments from user_profiles.warehouse_id to junction table
INSERT INTO public.manager_warehouse_assignments (manager_id, warehouse_id, assigned_at)
SELECT 
    id as manager_id,
    warehouse_id,
    NOW() as assigned_at
FROM public.user_profiles
WHERE warehouse_id IS NOT NULL 
  AND role IN ('manager', 'qc_rep')
ON CONFLICT (manager_id, warehouse_id) DO NOTHING;

-- ============================================================================
-- Row Level Security Policies
-- ============================================================================

-- Enable RLS on junction table
ALTER TABLE public.manager_warehouse_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view assignments
CREATE POLICY "Authenticated users can view manager assignments"
    ON public.manager_warehouse_assignments FOR SELECT
    USING (auth.role() = 'authenticated');

-- Policy: Owners can insert assignments for their warehouses
CREATE POLICY "Owners can assign managers to their warehouses"
    ON public.manager_warehouse_assignments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.warehouses w
            JOIN public.user_profiles up ON up.id = auth.uid()
            WHERE w.id = warehouse_id 
            AND w.owner_id = up.id
            AND up.role = 'owner'
        )
    );

-- Policy: Owners can delete assignments for their warehouses
CREATE POLICY "Owners can unassign managers from their warehouses"
    ON public.manager_warehouse_assignments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.warehouses w
            JOIN public.user_profiles up ON up.id = auth.uid()
            WHERE w.id = warehouse_id 
            AND w.owner_id = up.id
            AND up.role = 'owner'
        )
    );

-- ============================================================================
-- Update warehouse trigger for zones-based threshold creation
-- ============================================================================

-- Drop old trigger and recreate with zones-aware logic
DROP TRIGGER IF EXISTS trigger_create_default_thresholds ON public.warehouses;
DROP FUNCTION IF EXISTS public.create_default_thresholds();

-- Updated function to only create thresholds for warehouse's zone count
CREATE OR REPLACE FUNCTION public.create_default_thresholds()
RETURNS TRIGGER AS $$
DECLARE
  zone_name TEXT;
  all_zones TEXT[] := ARRAY['Grain Storage', 'Cold Storage', 'Dry Storage', 'Fresh Produce'];
  zone_count INTEGER;
BEGIN
  -- Use the warehouse's zones column to determine how many zones to create
  zone_count := COALESCE(NEW.zones, 4);
  
  -- Only create thresholds for the first N zones
  FOR i IN 1..LEAST(zone_count, 4) LOOP
    zone_name := all_zones[i];
    
    INSERT INTO public.sensor_thresholds (
      warehouse_id, 
      zone,
      temperature_min, 
      temperature_max,
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

-- Recreate trigger
CREATE TRIGGER trigger_create_default_thresholds
AFTER INSERT ON public.warehouses
FOR EACH ROW
EXECUTE FUNCTION public.create_default_thresholds();

-- ============================================================================
-- Note: user_profiles.warehouse_id column is kept for backward compatibility
-- but is no longer the primary source of truth for manager assignments.
-- The junction table (manager_warehouse_assignments) is now the authority.
-- ============================================================================

-- Add helpful comment
COMMENT ON COLUMN public.user_profiles.warehouse_id IS 'DEPRECATED: Use manager_warehouse_assignments junction table instead. Kept for backward compatibility only.';
