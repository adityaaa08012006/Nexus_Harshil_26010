-- ============================================================================
-- DROP OLD TRIGGER (if it exists with wrong column names)
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_create_default_thresholds ON public.warehouses;
DROP FUNCTION IF EXISTS public.create_default_thresholds();
DROP FUNCTION IF EXISTS public.get_warehouse_zones();

-- ============================================================================
-- CREATE FIXED FUNCTIONS WITH CORRECT COLUMN NAMES
-- ============================================================================

-- Helper function to get all warehouse zones
CREATE OR REPLACE FUNCTION public.get_warehouse_zones()
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY['Grain Storage', 'Cold Storage', 'Dry Storage', 'Fresh Produce'];
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to create default thresholds (with correct column names)
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

-- Recreate trigger with fixed function
DROP TRIGGER IF EXISTS trigger_create_default_thresholds ON public.warehouses;
CREATE TRIGGER trigger_create_default_thresholds
AFTER INSERT ON public.warehouses
FOR EACH ROW
EXECUTE FUNCTION public.create_default_thresholds();
