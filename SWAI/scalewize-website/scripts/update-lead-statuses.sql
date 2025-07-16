-- Update lead statuses based on message history
-- This script analyzes message history and updates lead statuses accordingly

-- First, let's see what we're working with
SELECT 
  'Current Status Distribution' as info,
  status,
  COUNT(*) as count
FROM leads 
WHERE linkedin_url IS NOT NULL
GROUP BY status;

-- Update statuses based on message history logic:

-- 1. Update to CONNECTED if there's a first_message sent to this lead
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

-- 2. Update to RESPONDED if there's a response message from this lead
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

-- 3. Update to BOOKED if there are multiple response messages (indicating conversation)
UPDATE leads 
SET 
  status = 'BOOKED',
  updated_at = NOW()
WHERE 
  linkedin_url IS NOT NULL
  AND status = 'RESPONDED'
  AND (
    SELECT COUNT(*) FROM messages 
    WHERE sender_linkedin_url = leads.linkedin_url 
    AND message_type = 'response'
  ) > 1;

-- 4. Update connection_request_sent_at for SENT leads
UPDATE leads 
SET 
  connection_request_sent_at = (
    SELECT MIN(message_date) 
    FROM messages 
    WHERE recipient_linkedin_url = leads.linkedin_url 
    AND message_type = 'connection_request'
  )
WHERE 
  linkedin_url IS NOT NULL
  AND status = 'SENT'
  AND connection_request_sent_at IS NULL;

-- 5. Update first_message_sent_at for CONNECTED leads
UPDATE leads 
SET 
  first_message_sent_at = (
    SELECT MIN(message_date) 
    FROM messages 
    WHERE recipient_linkedin_url = leads.linkedin_url 
    AND message_type = 'first_message'
  )
WHERE 
  linkedin_url IS NOT NULL
  AND status = 'CONNECTED'
  AND first_message_sent_at IS NULL;

-- 6. Update last_contact_at for all leads based on their latest message
UPDATE leads 
SET 
  last_contact_at = (
    SELECT MAX(message_date) 
    FROM messages 
    WHERE (
      (recipient_linkedin_url = leads.linkedin_url) OR 
      (sender_linkedin_url = leads.linkedin_url)
    )
  )
WHERE 
  linkedin_url IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM messages 
    WHERE (
      (recipient_linkedin_url = leads.linkedin_url) OR 
      (sender_linkedin_url = leads.linkedin_url)
    )
  );

-- Show the updated status distribution
SELECT 
  'Updated Status Distribution' as info,
  status,
  COUNT(*) as count
FROM leads 
WHERE linkedin_url IS NOT NULL
GROUP BY status
ORDER BY count DESC;

-- Show sample of updated leads with their message history
SELECT 
  l.full_name,
  l.company,
  l.status,
  l.connection_request_sent_at,
  l.first_message_sent_at,
  l.last_contact_at,
  COUNT(m.id) as total_messages,
  COUNT(CASE WHEN m.message_type = 'connection_request' THEN 1 END) as connection_requests,
  COUNT(CASE WHEN m.message_type = 'first_message' THEN 1 END) as first_messages,
  COUNT(CASE WHEN m.message_type = 'response' THEN 1 END) as responses
FROM leads l
LEFT JOIN messages m ON (
  m.recipient_linkedin_url = l.linkedin_url OR 
  m.sender_linkedin_url = l.linkedin_url
)
WHERE l.linkedin_url IS NOT NULL
GROUP BY l.id, l.full_name, l.company, l.status, l.connection_request_sent_at, l.first_message_sent_at, l.last_contact_at
ORDER BY l.status, l.full_name
LIMIT 10; 