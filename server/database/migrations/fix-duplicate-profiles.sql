-- ============================================================================
-- Fix duplicate user profiles
-- ============================================================================

-- Step 1: Check for duplicates
SELECT id, COUNT(*) as count
FROM public.user_profiles
GROUP BY id
HAVING COUNT(*) > 1;

-- Step 2: View the duplicates with details
SELECT *
FROM public.user_profiles
WHERE id IN (
  SELECT id
  FROM public.user_profiles
  GROUP BY id
  HAVING COUNT(*) > 1
)
ORDER BY id, created_at;

-- Step 3: Delete duplicates, keeping only the oldest record per user
DELETE FROM public.user_profiles a
USING (
  SELECT id, MIN(created_at) as min_created_at
  FROM public.user_profiles
  GROUP BY id
) b
WHERE a.id = b.id
AND a.created_at > b.min_created_at;

-- Step 4: Verify no duplicates remain
SELECT id, COUNT(*) as count
FROM public.user_profiles
GROUP BY id
HAVING COUNT(*) > 1;
