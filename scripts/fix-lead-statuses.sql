-- Fix incorrect lead statuses
-- This script will correct the statuses that were incorrectly set to BOOKED

-- First, let's see what happened
SELECT 
  'Current Status Distribution' as info,
  status,
  COUNT(*) as count
FROM leads 
WHERE linkedin_url IS NOT NULL
GROUP BY status
ORDER BY count DESC;

-- The issue is that leads with multiple responses but no proper first_messages 
-- were incorrectly marked as BOOKED. Let's fix this:

-- 1. Reset all leads back to SENT status
UPDATE leads 
SET 
  status = 'SENT',
  updated_at = NOW()
WHERE 
  linkedin_url IS NOT NULL
  AND status IN ('CONNECTED', 'RESPONDED', 'BOOKED');

-- 2. Update to CONNECTED only if they have proper first_messages
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

-- 3. Update to RESPONDED if they have responses (regardless of first_messages)
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

-- 4. Update to BOOKED only if they have both first_messages AND multiple responses
UPDATE leads 
SET 
  status = 'BOOKED',
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

-- Show the corrected status distribution
SELECT 
  'Corrected Status Distribution' as info,
  status,
  COUNT(*) as count
FROM leads 
WHERE linkedin_url IS NOT NULL
GROUP BY status
ORDER BY count DESC;

-- Show sample of corrected leads
SELECT 
  l.full_name,
  l.company,
  l.status,
  COUNT(m.id) as total_messages,
  COUNT(CASE WHEN m.message_type = 'first_message' THEN 1 END) as first_messages,
  COUNT(CASE WHEN m.message_type = 'response' THEN 1 END) as responses
FROM leads l
LEFT JOIN messages m ON (
  m.recipient_linkedin_url = l.linkedin_url OR 
  m.sender_linkedin_url = l.linkedin_url
)
WHERE l.linkedin_url IS NOT NULL
GROUP BY l.id, l.full_name, l.company, l.status
ORDER BY l.status, l.full_name
LIMIT 10; 