-- Simple fix for invitations status constraint
-- Run this in Supabase SQL editor

-- Drop the existing constraint (it might have a different name)
ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_status_check;

-- Add the new constraint with 'cancelled' included
ALTER TABLE invitations ADD CONSTRAINT invitations_status_check 
CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'));
