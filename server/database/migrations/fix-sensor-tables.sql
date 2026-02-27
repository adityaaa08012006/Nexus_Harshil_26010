-- ============================================================================
-- FIX SCRIPT: Drop and recreate sensor tables
-- ============================================================================
-- Run this in Supabase SQL Editor if you get "column does not exist" errors
-- ============================================================================

-- Drop all sensor-related tables and recreate them fresh
DROP TABLE IF EXISTS public.sensor_alerts CASCADE;
DROP TABLE IF EXISTS public.sensor_readings CASCADE;
DROP TABLE IF EXISTS public.sensor_thresholds CASCADE;
DROP TABLE IF EXISTS public.warehouses CASCADE;

-- Drop triggers and functions
DROP TRIGGER IF EXISTS trigger_create_default_thresholds ON public.warehouses;
DROP TRIGGER IF EXISTS trigger_warehouses_updated_at ON public.warehouses;
DROP TRIGGER IF EXISTS trigger_thresholds_updated_at ON public.sensor_thresholds;
DROP FUNCTION IF EXISTS public.create_default_thresholds();
DROP FUNCTION IF EXISTS public.get_warehouse_zones();

-- Now run the full phase3-sensors-schema.sql file
-- This will recreate everything with the correct schema
