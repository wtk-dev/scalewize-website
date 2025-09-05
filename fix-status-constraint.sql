-- Fix invitations status check constraint to include 'cancelled'
-- This script updates the existing check constraint to allow 'cancelled' status

-- First, find and drop any existing status check constraints
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the constraint name for status check
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'invitations'::regclass 
    AND contype = 'c'
    AND consrc LIKE '%status%';
    
    -- Drop the constraint if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE invitations DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END IF;
END $$;

-- Add the new check constraint that includes 'cancelled'
ALTER TABLE invitations ADD CONSTRAINT invitations_status_check 
CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'));

-- Verify the constraint was added correctly
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'invitations'::regclass 
AND conname = 'invitations_status_check';

-- Test the constraint by trying to insert a cancelled invitation (this will be rolled back)
BEGIN;
    -- This should work now
    INSERT INTO invitations (id, email, organization_id, invited_by, token, expires_at, status) 
    VALUES (gen_random_uuid(), 'test@example.com', (SELECT id FROM organizations LIMIT 1), (SELECT id FROM profiles LIMIT 1), 'test-token', NOW() + INTERVAL '1 day', 'cancelled');
    ROLLBACK; -- Rollback the test insert

-- Show current constraint details
SELECT 
    conname as constraint_name,
    consrc as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'invitations'::regclass 
AND contype = 'c';
