-- Simple Email Outreach Migration
-- Adds minimal fields to existing leads table for email outreach workflow
-- No daily caps, no extra tables - just the essentials

-- 1. Add email outreach fields to existing leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS followup_trigger boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS followup_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS followup_2_trigger boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS followup_2_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS or1_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS or2_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS or3_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS thread_id text,
ADD COLUMN IF NOT EXISTS or1_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS or2_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS or3_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS outreach_stage text CHECK (outreach_stage IN ('OR1', 'OR2', 'OR3', 'COMPLETE'));

-- 2. Create a simple outreach_messages table to track sent emails
-- This is the only additional table we need
CREATE TABLE IF NOT EXISTS public.outreach_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  lead_id uuid NOT NULL,
  stage text NOT NULL CHECK (stage IN ('OR1', 'OR2', 'OR3')),
  subject text,
  message_content text,
  thread_id text,
  gmail_message_id text,
  status text DEFAULT 'SENT' CHECK (status IN ('SENT', 'DELIVERED', 'BOUNCED', 'COMPLAINED')),
  sent_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT outreach_messages_pkey PRIMARY KEY (id),
  CONSTRAINT outreach_messages_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id),
  CONSTRAINT outreach_messages_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);

-- 3. Create minimal indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email_outreach ON public.leads(organization_id, email, followup_trigger, followup_2_trigger, or1_sent, or2_sent, or3_sent);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_lead ON public.outreach_messages(lead_id, stage);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_org ON public.outreach_messages(organization_id, sent_at);

-- 4. Enable RLS on the new table
ALTER TABLE public.outreach_messages ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policy for outreach_messages
CREATE POLICY "Users can view their organization's outreach messages" ON public.outreach_messages
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage their organization's outreach messages" ON public.outreach_messages
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- 6. Create a simple function to get available leads for outreach
CREATE OR REPLACE FUNCTION get_available_outreach_leads(org_id uuid, max_results integer DEFAULT 100)
RETURNS TABLE (
  id uuid,
  email text,
  first_name text,
  last_name text,
  company text,
  followup_trigger boolean,
  followup_date timestamp with time zone,
  followup_2_trigger boolean,
  followup_2_date timestamp with time zone,
  or1_sent boolean,
  or2_sent boolean,
  or3_sent boolean,
  outreach_stage text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.email,
    l.first_name,
    l.last_name,
    l.company,
    l.followup_trigger,
    l.followup_date,
    l.followup_2_trigger,
    l.followup_2_date,
    l.or1_sent,
    l.or2_sent,
    l.or3_sent,
    l.outreach_stage
  FROM public.leads l
  WHERE l.organization_id = org_id
    AND l.email IS NOT NULL
    AND l.email != ''
    AND (
      -- OR1 candidates: no triggers, no OR1/OR2/OR3 sent
      (NOT l.followup_trigger AND NOT l.followup_2_trigger AND NOT l.or1_sent AND NOT l.or2_sent AND NOT l.or3_sent) OR
      -- OR2 candidates: followup trigger set, followup date reached, no OR2/OR3 sent
      (l.followup_trigger AND l.followup_date <= CURRENT_TIMESTAMP AND NOT l.or2_sent AND NOT l.or3_sent) OR
      -- OR3 candidates: followup 2 trigger set, followup 2 date reached, no OR3 sent
      (l.followup_2_trigger AND l.followup_2_date <= CURRENT_TIMESTAMP AND NOT l.or3_sent)
    )
  ORDER BY
    CASE
      WHEN NOT l.followup_trigger AND NOT l.followup_2_trigger AND NOT l.or1_sent THEN 1 -- OR1 priority
      WHEN l.followup_trigger AND l.followup_date <= CURRENT_TIMESTAMP AND NOT l.or2_sent THEN 2 -- OR2 priority
      WHEN l.followup_2_trigger AND l.followup_2_date <= CURRENT_TIMESTAMP AND NOT l.or3_sent THEN 3 -- OR3 priority
      ELSE 4
    END,
    l.created_at ASC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- 7. Update existing leads to have proper outreach stage
UPDATE public.leads
SET outreach_stage = CASE
  WHEN or3_sent THEN 'COMPLETE'
  WHEN or2_sent THEN 'OR2'
  WHEN or1_sent THEN 'OR1'
  ELSE NULL
END
WHERE outreach_stage IS NULL;

-- 8. Verify migration
SELECT
  'Simple email outreach migration completed successfully!' as status,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN followup_trigger THEN 1 END) as followup_triggers,
  COUNT(CASE WHEN or1_sent THEN 1 END) as or1_sent_count,
  COUNT(CASE WHEN or2_sent THEN 1 END) as or2_sent_count,
  COUNT(CASE WHEN or3_sent THEN 1 END) as or3_sent_count,
  (SELECT COUNT(*) FROM public.outreach_messages) as total_messages
FROM public.leads;
