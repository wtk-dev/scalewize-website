-- Migration script for existing ScaleWize AI schema
-- This adds multi-tenant LibreChat features to your existing database

-- 1. Add MCP Servers Table (if not exists)
CREATE TABLE IF NOT EXISTS public.mcp_servers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  endpoint text NOT NULL,
  capabilities text[] DEFAULT '{}',
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mcp_servers_pkey PRIMARY KEY (id)
);

-- 2. Add Knowledge Bases Table (if not exists)
CREATE TABLE IF NOT EXISTS public.knowledge_bases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text DEFAULT 'custom' CHECK (type IN ('documentation', 'sales_data', 'company_knowledge', 'custom')),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  is_active boolean DEFAULT true,
  document_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT knowledge_bases_pkey PRIMARY KEY (id)
);

-- 3. Add Knowledge Base Documents Table (if not exists)
CREATE TABLE IF NOT EXISTS public.knowledge_base_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  knowledge_base_id uuid REFERENCES public.knowledge_bases(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text,
  file_path text,
  file_type text,
  file_size integer,
  embedding_vector vector(1536), -- Requires pgvector extension
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT knowledge_base_documents_pkey PRIMARY KEY (id)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mcp_servers_organization_id ON public.mcp_servers(organization_id);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_active ON public.mcp_servers(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_organization_id ON public.knowledge_bases(organization_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_active ON public.knowledge_bases(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_type ON public.knowledge_bases(type);
CREATE INDEX IF NOT EXISTS idx_kb_documents_kb_id ON public.knowledge_base_documents(knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_kb_documents_file_type ON public.knowledge_base_documents(file_type);

-- 5. Enable Row Level Security
ALTER TABLE public.mcp_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_documents ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for MCP Servers
CREATE POLICY "Users can view organization MCP servers" ON public.mcp_servers
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage organization MCP servers" ON public.mcp_servers
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- 7. Create RLS Policies for Knowledge Bases
CREATE POLICY "Users can view organization knowledge bases" ON public.knowledge_bases
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage organization knowledge bases" ON public.knowledge_bases
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- 8. Create RLS Policies for Knowledge Base Documents
CREATE POLICY "Users can view organization knowledge base documents" ON public.knowledge_base_documents
  FOR SELECT USING (
    knowledge_base_id IN (
      SELECT id FROM public.knowledge_bases 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage organization knowledge base documents" ON public.knowledge_base_documents
  FOR ALL USING (
    knowledge_base_id IN (
      SELECT id FROM public.knowledge_bases 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
      )
    )
  );

-- 9. Update existing organizations with default LibreChat config
UPDATE public.organizations 
SET librechat_config = CASE 
  WHEN plan_type = 'starter' THEN '{
    "enabled_models": ["gpt-3.5-turbo"],
    "max_tokens": 10000,
    "knowledge_bases": [],
    "mcp_servers": [],
    "custom_instructions": "You are a helpful AI assistant for this organization.",
    "allowed_endpoints": ["/api/chat"],
    "features": {
      "file_upload": true,
      "image_generation": false,
      "voice_chat": false,
      "code_interpreter": false
    }
  }'::jsonb
  WHEN plan_type = 'professional' THEN '{
    "enabled_models": ["gpt-3.5-turbo", "gpt-4", "claude-3-sonnet"],
    "max_tokens": 100000,
    "knowledge_bases": [],
    "mcp_servers": [],
    "custom_instructions": "You are a helpful AI assistant for this organization.",
    "allowed_endpoints": ["/api/chat"],
    "features": {
      "file_upload": true,
      "image_generation": true,
      "voice_chat": false,
      "code_interpreter": true
    }
  }'::jsonb
  WHEN plan_type = 'enterprise' THEN '{
    "enabled_models": ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo", "claude-3-sonnet", "claude-3-opus"],
    "max_tokens": 1000000,
    "knowledge_bases": [],
    "mcp_servers": [],
    "custom_instructions": "You are a helpful AI assistant for this organization.",
    "allowed_endpoints": ["/api/chat"],
    "features": {
      "file_upload": true,
      "image_generation": true,
      "voice_chat": true,
      "code_interpreter": true
    }
  }'::jsonb
  ELSE '{
    "enabled_models": ["gpt-3.5-turbo"],
    "max_tokens": 10000,
    "knowledge_bases": [],
    "mcp_servers": [],
    "custom_instructions": "You are a helpful AI assistant for this organization.",
    "allowed_endpoints": ["/api/chat"],
    "features": {
      "file_upload": false,
      "image_generation": false,
      "voice_chat": false,
      "code_interpreter": false
    }
  }'::jsonb
END
WHERE librechat_config = '{}'::jsonb OR librechat_config IS NULL;

-- 10. Add sample MCP servers for existing organizations
INSERT INTO public.mcp_servers (name, description, endpoint, capabilities, organization_id)
SELECT 
  'Sales CRM',
  'Access to customer relationship management data',
  'http://localhost:3001/mcp',
  ARRAY['read_customers', 'update_leads'],
  id
FROM public.organizations
WHERE NOT EXISTS (
  SELECT 1 FROM public.mcp_servers 
  WHERE organization_id = organizations.id AND name = 'Sales CRM'
);

-- 11. Add sample knowledge bases for existing organizations
INSERT INTO public.knowledge_bases (name, description, type, organization_id)
SELECT 
  'Company Documentation',
  'Internal company policies and procedures',
  'documentation',
  id
FROM public.organizations
WHERE NOT EXISTS (
  SELECT 1 FROM public.knowledge_bases 
  WHERE organization_id = organizations.id AND name = 'Company Documentation'
);

-- 12. Create function to update knowledge base document count
CREATE OR REPLACE FUNCTION update_knowledge_base_document_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.knowledge_bases 
    SET document_count = document_count + 1,
        updated_at = NOW()
    WHERE id = NEW.knowledge_base_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.knowledge_bases 
    SET document_count = document_count - 1,
        updated_at = NOW()
    WHERE id = OLD.knowledge_base_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 13. Create trigger for document count updates
DROP TRIGGER IF EXISTS trigger_update_kb_document_count ON public.knowledge_base_documents;
CREATE TRIGGER trigger_update_kb_document_count
  AFTER INSERT OR DELETE ON public.knowledge_base_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_document_count();

-- 14. Verify migration
SELECT 
  'Migration completed successfully!' as status,
  COUNT(*) as total_organizations,
  COUNT(CASE WHEN librechat_config != '{}'::jsonb THEN 1 END) as configured_organizations
FROM public.organizations; 