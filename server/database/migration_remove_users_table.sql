-- Migration: Remove redundant users table and fix references
-- Run this in Supabase SQL Editor if you already ran the old schema

-- This script safely removes the old users table that conflicts with Supabase Auth

-- Step 1: Drop the redundant users table
-- Note: If you have data in warehouses or allocation_requests referencing the old users table,
-- you'll need to migrate that data first or this will fail due to foreign key constraints

DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Verify that user_profiles is the only user table
-- Run this query to confirm:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name LIKE '%user%';
-- You should only see 'user_profiles'

-- Step 3: If you have existing warehouses/allocation_requests with owner_id/requester_id
-- pointing to the old users table, you'll need to manually map those IDs to user_profiles IDs
-- Example:
-- UPDATE warehouses SET owner_id = (SELECT id FROM user_profiles WHERE email = 'owner@example.com') WHERE owner_id = 'old-uuid';

-- Step 4: Verify foreign key constraints are correct
-- SELECT
--   tc.table_name, 
--   kcu.column_name, 
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name 
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND (ccu.table_name = 'user_profiles' OR tc.table_name IN ('warehouses', 'allocation_requests'));

COMMENT ON TABLE user_profiles IS 'Primary user table - extends Supabase auth.users with app-specific profile data';
