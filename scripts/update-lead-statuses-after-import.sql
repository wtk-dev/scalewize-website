-- Script to update lead statuses after importing new LinkedIn messages
-- Now supports PENDING status for queued leads
-- Run this script every time you import new messages from LinkedIn

-- 1. First, ensure all required columns exist
DO $$ 
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'connection_request_sent_at') THEN
        ALTER TABLE leads ADD COLUMN connection_request_sent_at timestamp with time zone;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'first_message_sent_at') THEN
        ALTER TABLE leads ADD COLUMN first_message_sent_at timestamp with time zone;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'last_contact_at') THEN
        ALTER TABLE leads ADD COLUMN last_contact_at timestamp with time zone;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'updated_at') THEN
        ALTER TABLE leads ADD COLUMN updated_at timestamp with time zone DEFAULT now();
    END IF;
END $$;

-- 2. Update the status check constraint to include PENDING
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'leads_status_check') THEN
        ALTER TABLE leads DROP CONSTRAINT leads_status_check;
    END IF;
    
    -- Add new constraint with PENDING status
    ALTER TABLE leads ADD CONSTRAINT leads_status_check 
    CHECK (status IN ('PENDING', 'SENT', 'CONNECTED', 'RESPONDED', 'ACTIVE', 'BOOKED', 'CLOSED'));
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraint already exists, do nothing
        NULL;
END $$;

-- 3. Reset all non-PENDING lead statuses to start fresh
UPDATE leads 
SET status = 'SENT',
    connection_request_sent_at = NULL,
    first_message_sent_at = NULL,
    last_contact_at = NULL,
    updated_at = NOW()
WHERE organization_id IS NOT NULL
  AND status IS DISTINCT FROM 'PENDING';

-- 4. Update connection_request_sent_at for non-PENDING leads with connection requests
UPDATE leads 
SET connection_request_sent_at = (
    SELECT MIN(message_date) 
    FROM messages 
    WHERE messages.recipient_linkedin_url = leads.linkedin_url 
    AND messages.message_type = 'connection_request'
    AND messages.organization_id = leads.organization_id
),
updated_at = NOW()
WHERE linkedin_url IS NOT NULL 
AND organization_id IS NOT NULL
AND status IS DISTINCT FROM 'PENDING';

-- 5. Update first_message_sent_at and status to CONNECTED for non-PENDING leads with first messages
UPDATE leads 
SET first_message_sent_at = (
    SELECT MIN(message_date) 
    FROM messages 
    WHERE messages.recipient_linkedin_url = leads.linkedin_url 
    AND messages.message_type = 'first_message'
    AND messages.organization_id = leads.organization_id
),
status = 'CONNECTED',
updated_at = NOW()
WHERE linkedin_url IS NOT NULL 
AND organization_id IS NOT NULL
AND status IS DISTINCT FROM 'PENDING'
AND EXISTS (
    SELECT 1 FROM messages 
    WHERE messages.recipient_linkedin_url = leads.linkedin_url 
    AND messages.message_type = 'first_message'
    AND messages.organization_id = leads.organization_id
);

-- 6. Update status to RESPONDED for non-PENDING leads with responses
UPDATE leads 
SET status = 'RESPONDED',
updated_at = NOW()
WHERE linkedin_url IS NOT NULL 
AND organization_id IS NOT NULL
AND status IS DISTINCT FROM 'PENDING'
AND EXISTS (
    SELECT 1 FROM messages 
    WHERE messages.sender_linkedin_url = leads.linkedin_url 
    AND messages.message_type = 'response'
    AND messages.organization_id = leads.organization_id
);

-- 7. Update status to ACTIVE for non-PENDING leads with multiple responses
UPDATE leads 
SET status = 'ACTIVE',
updated_at = NOW()
WHERE linkedin_url IS NOT NULL 
AND organization_id IS NOT NULL
AND status IS DISTINCT FROM 'PENDING'
AND (
    SELECT COUNT(*) 
    FROM messages 
    WHERE messages.sender_linkedin_url = leads.linkedin_url 
    AND messages.message_type = 'response'
    AND messages.organization_id = leads.organization_id
) > 1;

-- 8. Update last_contact_at for all leads based on their latest message
UPDATE leads 
SET last_contact_at = (
    SELECT MAX(message_date) 
    FROM messages 
    WHERE (messages.sender_linkedin_url = leads.linkedin_url OR messages.recipient_linkedin_url = leads.linkedin_url)
    AND messages.organization_id = leads.organization_id
),
updated_at = NOW()
WHERE linkedin_url IS NOT NULL 
AND organization_id IS NOT NULL;

-- 9. Show final status distribution
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM leads 
WHERE organization_id IS NOT NULL
GROUP BY status 
ORDER BY 
    CASE status 
        WHEN 'PENDING' THEN 0
        WHEN 'SENT' THEN 1
        WHEN 'CONNECTED' THEN 2
        WHEN 'RESPONDED' THEN 3
        WHEN 'ACTIVE' THEN 4
        WHEN 'BOOKED' THEN 5
        WHEN 'CLOSED' THEN 6
        ELSE 7
    END;

-- 10. Show summary statistics
SELECT 
    'Total Leads' as metric,
    COUNT(*) as value,
    1 as sort_order
FROM leads 
WHERE organization_id IS NOT NULL

UNION ALL

SELECT 
    'Connection Requests Sent' as metric,
    COUNT(*) as value,
    2 as sort_order
FROM leads 
WHERE organization_id IS NOT NULL 
AND connection_request_sent_at IS NOT NULL

UNION ALL

SELECT 
    'Connections Made' as metric,
    COUNT(*) as value,
    3 as sort_order
FROM leads 
WHERE organization_id IS NOT NULL 
AND first_message_sent_at IS NOT NULL

UNION ALL

SELECT 
    'Responses Received' as metric,
    COUNT(*) as value,
    4 as sort_order
FROM leads 
WHERE organization_id IS NOT NULL 
AND status IN ('RESPONDED', 'ACTIVE', 'BOOKED', 'CLOSED')

UNION ALL

SELECT 
    'Active Conversations' as metric,
    COUNT(*) as value,
    5 as sort_order
FROM leads 
WHERE organization_id IS NOT NULL 
AND status IN ('RESPONDED', 'ACTIVE', 'BOOKED', 'CLOSED')

ORDER BY sort_order; 