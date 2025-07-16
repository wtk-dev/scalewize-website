-- Fix the status check constraint to include ACTIVE status
-- This script updates the constraint that's preventing ACTIVE status

-- First, let's see what the current constraint is
SELECT 
  'Current Constraint' as info,
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'leads'::regclass 
AND contype = 'c';

-- Drop the existing constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Add the new constraint with ACTIVE status
ALTER TABLE leads ADD CONSTRAINT leads_status_check 
CHECK (status IN ('SENT', 'REPLIED', 'PENDING', 'CONNECTED', 'RESPONDED', 'ACTIVE', 'BOOKED', 'CLOSED'));

-- Verify the constraint was added
SELECT 
  'Updated Constraint' as info,
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'leads'::regclass 
AND contype = 'c';

-- Now try the status update again
-- Reset all leads back to SENT status
UPDATE leads 
SET 
  status = 'SENT',
  updated_at = NOW()
WHERE 
  linkedin_url IS NOT NULL
  AND status IN ('CONNECTED', 'RESPONDED', 'BOOKED');

-- Update to CONNECTED if they have first_messages
UPDATE leads 
SET 
  status = 'CONNECTED',
  updated_at = NOW()
WHERE 
  linkedin_url IS NOT NULL
  AND status = 'SENT'
  AND EXISTS (
    SELECT 1 FROM messages 
    WHERE recipient_linkedin_url = leads.linkedin_url 
    AND message_type = 'first_message'
  );

-- Update to RESPONDED if they have responses
UPDATE leads 
SET 
  status = 'RESPONDED',
  updated_at = NOW()
WHERE 
  linkedin_url IS NOT NULL
  AND status IN ('SENT', 'CONNECTED')
  AND EXISTS (
    SELECT 1 FROM messages 
    WHERE sender_linkedin_url = leads.linkedin_url 
    AND message_type = 'response'
  );

-- Update to ACTIVE if they have both first_messages AND multiple responses
UPDATE leads 
SET 
  status = 'ACTIVE',
  updated_at = NOW()
WHERE 
  linkedin_url IS NOT NULL
  AND status = 'RESPONDED'
  AND EXISTS (
    SELECT 1 FROM messages 
    WHERE recipient_linkedin_url = leads.linkedin_url 
    AND message_type = 'first_message'
  )
  AND (
    SELECT COUNT(*) FROM messages 
    WHERE sender_linkedin_url = leads.linkedin_url 
    AND message_type = 'response'
  ) > 1;

-- Show the final status distribution
SELECT 
  'Final Status Distribution' as info,
  status,
  COUNT(*) as count
FROM leads 
WHERE linkedin_url IS NOT NULL
GROUP BY status
ORDER BY count DESC; 