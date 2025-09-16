-- Email Outreach Migration - Fixed
-- Extends existing leads and campaigns tables for email outreach workflow
-- Includes proper RLS policies and compatibility checks

-- 1. Add email outreach fields to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS followup_trigger boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS followup_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS followup_2_trigger boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS followup_2_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS or1_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS or2_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS or3_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS thread_id text,
ADD COLUMN IF NOT EXISTS email_thread_id text,
ADD COLUMN IF NOT EXISTS or1_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS or2_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS or3_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS outreach_stage text CHECK (outreach_stage IN ('OR1', 'OR2', 'OR3', 'COMPLETE')),
ADD COLUMN IF NOT EXISTS campaign_name text,
ADD COLUMN IF NOT EXISTS campaign_id uuid;

-- 2. Create outreach_campaigns table for managing email campaigns
CREATE TABLE IF NOT EXISTS public.outreach_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  user_id uuid NOT NULL,
  campaign_name text NOT NULL,
  campaign_type text DEFAULT 'email' CHECK (campaign_type IN ('email', 'linkedin', 'mixed')),
  status text DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')),
  daily_cap_or1 integer DEFAULT 20,
  daily_cap_or2 integer DEFAULT 20,
  daily_cap_or3 integer DEFAULT 20,
  message_order jsonb DEFAULT '[]'::jsonb,
  message_content jsonb DEFAULT '{}'::jsonb,
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT outreach_campaigns_pkey PRIMARY KEY (id),
  CONSTRAINT outreach_campaigns_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT outreach_campaigns_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- 3. Create outreach_daily_stats table for tracking daily send counts
CREATE TABLE IF NOT EXISTS public.outreach_daily_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  campaign_id uuid NOT NULL,
  date_et date NOT NULL,
  or1_count integer DEFAULT 0,
  or2_count integer DEFAULT 0,
  or3_count integer DEFAULT 0,
  total_sent integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT outreach_daily_stats_pkey PRIMARY KEY (id),
  CONSTRAINT outreach_daily_stats_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT outreach_daily_stats_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.outreach_campaigns(id),
  CONSTRAINT outreach_daily_stats_unique UNIQUE (organization_id, campaign_id, date_et)
);

-- 4. Create outreach_messages table for tracking sent emails
CREATE TABLE IF NOT EXISTS public.outreach_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  lead_id uuid NOT NULL,
  campaign_id uuid NOT NULL,
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
  CONSTRAINT outreach_messages_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.outreach_campaigns(id),
  CONSTRAINT outreach_messages_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_outreach_fields ON public.leads(organization_id, followup_trigger, followup_date, followup_2_trigger, followup_2_date, or1_sent, or2_sent, or3_sent);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_name ON public.leads(campaign_name);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON public.leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_campaigns_org_user ON public.outreach_campaigns(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_daily_stats_lookup ON public.outreach_daily_stats(organization_id, campaign_id, date_et);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_lead ON public.outreach_messages(lead_id, stage);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_campaign ON public.outreach_messages(campaign_id, stage);

-- 6. Create function to update daily stats
CREATE OR REPLACE FUNCTION update_daily_outreach_stats(
  org_id uuid,
  campaign_id_param uuid,
  stage_param text
) RETURNS void AS $$
BEGIN
  INSERT INTO public.outreach_daily_stats (organization_id, campaign_id, date_et, or1_count, or2_count, or3_count, total_sent)
  VALUES (
    org_id,
    campaign_id_param,
    CURRENT_DATE,
    CASE WHEN stage_param = 'OR1' THEN 1 ELSE 0 END,
    CASE WHEN stage_param = 'OR2' THEN 1 ELSE 0 END,
    CASE WHEN stage_param = 'OR3' THEN 1 ELSE 0 END,
    1
  )
  ON CONFLICT (organization_id, campaign_id, date_et)
  DO UPDATE SET
    or1_count = outreach_daily_stats.or1_count + CASE WHEN stage_param = 'OR1' THEN 1 ELSE 0 END,
    or2_count = outreach_daily_stats.or2_count + CASE WHEN stage_param = 'OR2' THEN 1 ELSE 0 END,
    or3_count = outreach_daily_stats.or3_count + CASE WHEN stage_param = 'OR3' THEN 1 ELSE 0 END,
    total_sent = outreach_daily_stats.total_sent + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to get available leads for outreach
CREATE OR REPLACE FUNCTION get_available_outreach_leads(org_id uuid, campaign_name text DEFAULT NULL, max_results integer DEFAULT 100)
RETURNS TABLE (
  id uuid,
  email text,
  first_name text,
  last_name text,
  company text,
  followup_trigger boolean,
  followup_date date,
  followup_2_trigger boolean,
  followup_2_date date,
  or1_sent boolean,
  or2_sent boolean,
  or3_sent boolean
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
    l.followup_date::date,
    l.followup_2_trigger,
    l.followup_2_date::date,
    l.or1_sent,
    l.or2_sent,
    l.or3_sent
  FROM public.leads l
  WHERE l.organization_id = org_id
    AND l.email IS NOT NULL
    AND l.email != ''
    AND (campaign_name IS NULL OR l.campaign_name = campaign_name)
    AND (
      -- OR1 candidates: no triggers, no OR1/OR2/OR3 sent
      (NOT l.followup_trigger AND NOT l.followup_2_trigger AND NOT l.or1_sent AND NOT l.or2_sent AND NOT l.or3_sent) OR
      -- OR2 candidates: followup trigger set, followup date reached, no OR2/OR3 sent
      (l.followup_trigger AND l.followup_date <= CURRENT_DATE AND NOT l.or2_sent AND NOT l.or3_sent) OR
      -- OR3 candidates: followup 2 trigger set, followup 2 date reached, no OR3 sent
      (l.followup_2_trigger AND l.followup_2_date <= CURRENT_DATE AND NOT l.or3_sent)
    )
  ORDER BY
    CASE
      WHEN NOT l.followup_trigger AND NOT l.followup_2_trigger AND NOT l.or1_sent THEN 1 -- OR1 priority
      WHEN l.followup_trigger AND l.followup_date <= CURRENT_DATE AND NOT l.or2_sent THEN 2 -- OR2 priority
      WHEN l.followup_2_trigger AND l.followup_2_date <= CURRENT_DATE AND NOT l.or3_sent THEN 3 -- OR3 priority
      ELSE 4
    END,
    l.created_at ASC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- 8. Enable Row Level Security on new tables
ALTER TABLE public.outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_messages ENABLE ROW LEVEL SECURITY;

-- 9. Enable RLS on leads table if not already enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies for leads table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view organization leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert organization leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update organization leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete organization leads" ON public.leads;

-- Create new policies for leads
CREATE POLICY "Users can view organization leads" ON public.leads
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert organization leads" ON public.leads
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update organization leads" ON public.leads
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete organization leads" ON public.leads
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- 11. Create RLS policies for outreach tables
CREATE POLICY "Users can view their organization's outreach campaigns" ON public.outreach_campaigns
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage their organization's outreach campaigns" ON public.outreach_campaigns
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can view their organization's outreach daily stats" ON public.outreach_daily_stats
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage their organization's outreach daily stats" ON public.outreach_daily_stats
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can view their organization's outreach messages" ON public.outreach_messages
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage their organization's outreach messages" ON public.outreach_messages
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- 12. Create default campaign for existing organizations
INSERT INTO public.outreach_campaigns (organization_id, user_id, campaign_name, campaign_type, daily_cap_or1, daily_cap_or2, daily_cap_or3)
SELECT
  o.id as organization_id,
  o.creator_id as user_id,
  'Default Email Outreach' as campaign_name,
  'email' as campaign_type,
  20 as daily_cap_or1,
  20 as daily_cap_or2,
  20 as daily_cap_or3
FROM public.organizations o
WHERE o.creator_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 13. Update existing leads to have proper outreach stage
UPDATE public.leads
SET outreach_stage = CASE
  WHEN or3_sent THEN 'COMPLETE'
  WHEN or2_sent THEN 'OR2'
  WHEN or1_sent THEN 'OR1'
  ELSE NULL
END
WHERE outreach_stage IS NULL;

-- 14. Verify migration
SELECT
  'Email outreach migration completed successfully!' as status,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN followup_trigger THEN 1 END) as followup_triggers,
  COUNT(CASE WHEN or1_sent THEN 1 END) as or1_sent_count,
  COUNT(CASE WHEN or2_sent THEN 1 END) as or2_sent_count,
  COUNT(CASE WHEN or3_sent THEN 1 END) as or3_sent_count,
  (SELECT COUNT(*) FROM public.outreach_campaigns) as total_campaigns,
  (SELECT COUNT(*) FROM public.outreach_daily_stats) as daily_stats_records,
  (SELECT COUNT(*) FROM public.outreach_messages) as total_messages
FROM public.leads;
