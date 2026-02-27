-- Fix allocation_requests foreign key constraint for PostgREST joins
-- This ensures the requester_id properly references user_profiles

-- Step 1: Check for orphaned records (requester_id not in user_profiles)
SELECT 
    ar.id,
    ar.request_id,
    ar.requester_id
FROM allocation_requests ar
LEFT JOIN user_profiles up ON ar.requester_id = up.id
WHERE ar.requester_id IS NOT NULL 
  AND up.id IS NULL;

-- If the above query returns rows, you need to either:
-- 1. Delete those orphaned records, or
-- 2. Update requester_id to NULL or a valid user_id

-- Step 2: Drop the foreign key constraint if it exists (in case it needs to be recreated)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'allocation_requests_requester_id_fkey' 
        AND table_name = 'allocation_requests'
    ) THEN
        ALTER TABLE allocation_requests DROP CONSTRAINT allocation_requests_requester_id_fkey;
    END IF;
END $$;

-- Step 3: Add the foreign key constraint
ALTER TABLE allocation_requests
ADD CONSTRAINT allocation_requests_requester_id_fkey 
FOREIGN KEY (requester_id) 
REFERENCES user_profiles(id) 
ON DELETE CASCADE;

-- Step 4: Verify the constraint was added
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'allocation_requests'
    AND kcu.column_name = 'requester_id';
