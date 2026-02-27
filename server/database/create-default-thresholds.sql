-- ============================================================================
-- Create default thresholds for warehouses
-- ============================================================================
-- Run this to create default thresholds for all zones if they don't exist

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
SELECT 
  w.id,
  zones.zone_name,
  CASE zones.zone_name
    WHEN 'Cold Storage' THEN 2
    WHEN 'Fresh Produce' THEN 10
    WHEN 'Grain Storage' THEN 15
    ELSE 18
  END,
  CASE zones.zone_name
    WHEN 'Cold Storage' THEN 8
    WHEN 'Fresh Produce' THEN 15
    WHEN 'Grain Storage' THEN 25
    ELSE 25
  END,
  40, -- humidity_min
  CASE zones.zone_name
    WHEN 'Dry Storage' THEN 50
    WHEN 'Grain Storage' THEN 60
    ELSE 70
  END,
  1.0,  -- ethylene_max
  1000, -- co2_max
  25    -- ammonia_max
FROM 
  public.warehouses w
CROSS JOIN (
  VALUES 
    ('Grain Storage'),
    ('Cold Storage'),
    ('Dry Storage'),
    ('Fresh Produce')
) AS zones(zone_name)
WHERE NOT EXISTS (
  SELECT 1 FROM public.sensor_thresholds st
  WHERE st.warehouse_id = w.id AND st.zone = zones.zone_name
);
