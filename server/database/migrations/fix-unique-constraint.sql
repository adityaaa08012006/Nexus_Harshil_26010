-- Fix duplicate user profiles and add unique constraint

-- First, identify and remove duplicate user profiles, keeping only the most recent one
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at DESC) as rn
  FROM user_profiles
)
DELETE FROM user_profiles
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Add unique constraint to user_profiles.id (should already be PRIMARY KEY, but ensuring)
-- Note: id should already be the PRIMARY KEY, but if duplicates existed, the constraint may be missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_pkey' 
    AND conrelid = 'user_profiles'::regclass
  ) THEN
    ALTER TABLE user_profiles ADD PRIMARY KEY (id);
  END IF;
END $$;

-- Add missing UNIQUE constraint to manager_warehouse_assignments
-- This constraint was in the original migration but may not have been applied

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'manager_warehouse_assignments_unique_manager_warehouse'
    AND conrelid = 'manager_warehouse_assignments'::regclass
  ) THEN
    ALTER TABLE public.manager_warehouse_assignments
    ADD CONSTRAINT manager_warehouse_assignments_unique_manager_warehouse 
    UNIQUE (manager_id, warehouse_id);
  END IF;
END $$;

-- Verify data exists in junction table
-- Run this to check if your existing manager data was migrated:
-- SELECT 
--   mwa.id,
--   up.name as manager_name,
--   up.email,
--   w.name as warehouse_name,
--   mwa.assigned_at
-- FROM manager_warehouse_assignments mwa
-- JOIN user_profiles up ON up.id = mwa.manager_id
-- JOIN warehouses w ON w.id = mwa.warehouse_id;
