-- Simple LinkedIn Migration
-- Extends existing leads and messages tables for LinkedIn functionality

-- 1. Update status constraint to include LinkedIn statuses
-- 1. Update status constraint to include LinkedIn statuses (including 'ACTIVE')
ALTER TABLE public.leads 
DROP CONSTRAINT IF EXISTS leads_status_check;

ALTER TABLE public.leads 
ADD CONSTRAINT leads_status_check 
CHECK (status IN ('SENT', 'REPLIED', 'PENDING', 'CONNECTED', 'RESPONDED', 'BOOKED', 'CLOSED', 'ACTIVE'));

-- 2. Add LinkedIn-specific timestamp fields to leads
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS connection_request_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS first_message_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_contact_at timestamp with time zone;

-- 3. Add message_type to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'general' 
CHECK (message_type IN ('general', 'connection_request', 'first_message', 'response'));

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_linkedin_status ON public.leads(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_linkedin_url ON public.leads(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_messages_linkedin_urls ON public.messages(sender_linkedin_url, recipient_linkedin_url);
CREATE INDEX IF NOT EXISTS idx_messages_type ON public.messages(message_type);

-- 5. Create function to update lead status based on messages
CREATE OR REPLACE FUNCTION update_lead_status_from_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update lead status when we send a message to them
  IF NEW.recipient_linkedin_url IS NOT NULL THEN
    UPDATE public.leads 
    SET 
      status = CASE 
        WHEN NEW.message_type = 'connection_request' THEN 'SENT'
        WHEN NEW.message_type = 'first_message' THEN 'CONNECTED'
        ELSE status
      END,
      connection_request_sent_at = CASE 
        WHEN NEW.message_type = 'connection_request' THEN NEW.message_date 
        ELSE connection_request_sent_at 
      END,
      first_message_sent_at = CASE 
        WHEN NEW.message_type = 'first_message' THEN NEW.message_date 
        ELSE first_message_sent_at 
      END,
      last_contact_at = NEW.message_date,
      updated_at = NOW()
    WHERE linkedin_url = NEW.recipient_linkedin_url;
  END IF;
  
  -- Update lead status when they send us a message
  IF NEW.sender_linkedin_url IS NOT NULL THEN
    UPDATE public.leads 
    SET 
      status = 'RESPONDED',
      last_contact_at = NEW.message_date,
      updated_at = NOW()
    WHERE linkedin_url = NEW.sender_linkedin_url;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for automatic status updates
DROP TRIGGER IF EXISTS trigger_update_lead_status ON public.messages;
CREATE TRIGGER trigger_update_lead_status
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_status_from_message();

-- 7. Create function to get LinkedIn analytics
CREATE OR REPLACE FUNCTION get_linkedin_analytics(org_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_leads', COUNT(*),
    'pending_leads', COUNT(CASE WHEN status = 'PENDING' THEN 1 END),
    'sent_leads', COUNT(CASE WHEN status = 'SENT' THEN 1 END),
    'connected_leads', COUNT(CASE WHEN status = 'CONNECTED' THEN 1 END),
    'responded_leads', COUNT(CASE WHEN status = 'RESPONDED' THEN 1 END),
    'booked_leads', COUNT(CASE WHEN status = 'BOOKED' THEN 1 END),
    'closed_leads', COUNT(CASE WHEN status = 'CLOSED' THEN 1 END),
    'total_messages', (
      SELECT COUNT(*) 
      FROM public.messages 
      WHERE organization_id = org_id 
      AND (sender_linkedin_url IS NOT NULL OR recipient_linkedin_url IS NOT NULL)
    ),
    'connection_requests_sent', (
      SELECT COUNT(*) 
      FROM public.messages 
      WHERE organization_id = org_id 
      AND message_type = 'connection_request'
    ),
    'first_messages_sent', (
      SELECT COUNT(*) 
      FROM public.messages 
      WHERE organization_id = org_id 
      AND message_type = 'first_message'
    ),
    'responses_received', (
      SELECT COUNT(*) 
      FROM public.messages 
      WHERE organization_id = org_id 
      AND message_type = 'response'
    )
  ) INTO result
  FROM public.leads
  WHERE organization_id = org_id 
  AND linkedin_url IS NOT NULL;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 8. Set default status for existing LinkedIn leads
UPDATE public.leads 
SET status = 'PENDING' 
WHERE linkedin_url IS NOT NULL AND status IS NULL;

-- 9. Verify migration
SELECT 
  'LinkedIn migration completed successfully!' as status,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN linkedin_url IS NOT NULL THEN 1 END) as linkedin_leads,
  COUNT(CASE WHEN status IN ('SENT', 'CONNECTED', 'RESPONDED', 'BOOKED', 'CLOSED') THEN 1 END) as active_linkedin_leads
FROM public.leads; 