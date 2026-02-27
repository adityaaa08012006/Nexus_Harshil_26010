-- Fix user roles
-- Run this in Supabase SQL Editor

-- ============================================================================
-- STEP 1: Drop the problematic trigger (user_profiles has no updated_at column)
-- ============================================================================
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;

-- ============================================================================
-- STEP 2: Update user roles
-- ============================================================================

-- Update owner@nexus.com to 'owner' role
UPDATE public.user_profiles
SET role = 'owner'
WHERE email = 'owner@nexus.com';

-- Update qc@nexus.com to 'qc_rep' role
UPDATE public.user_profiles
SET role = 'qc_rep'
WHERE email = 'qc@nexus.com';

-- Assign Mumbai warehouse to manager@nexus.com
UPDATE public.user_profiles
SET warehouse_id = (
  SELECT id FROM public.warehouses 
  WHERE name = 'Mumbai Central Warehouse'
  LIMIT 1
)
WHERE email = 'manager@nexus.com';

-- ============================================================================
-- STEP 3: Verify the changes
-- ============================================================================
SELECT 
  email, 
  role, 
  warehouse_id,
  (SELECT name FROM public.warehouses w WHERE w.id = user_profiles.warehouse_id) as warehouse_name
FROM public.user_profiles
WHERE email IN ('owner@nexus.com', 'manager@nexus.com', 'qc@nexus.com')
ORDER BY email;
