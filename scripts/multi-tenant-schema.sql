-- Multi-Tenant LibreChat Schema
-- This file contains additional tables for MCP servers and knowledge bases

-- MCP Servers Table
CREATE TABLE IF NOT EXISTS mcp_servers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  endpoint TEXT NOT NULL,
  capabilities TEXT[] DEFAULT '{}',
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for MCP servers
CREATE INDEX IF NOT EXISTS idx_mcp_servers_organization_id ON mcp_servers(organization_id);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_active ON mcp_servers(is_active);

-- Knowledge Bases Table
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'custom' CHECK (type IN ('documentation', 'sales_data', 'company_knowledge', 'custom')),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  document_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for knowledge bases
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_organization_id ON knowledge_bases(organization_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_active ON knowledge_bases(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_type ON knowledge_bases(type);

-- Knowledge Base Documents Table
CREATE TABLE IF NOT EXISTS knowledge_base_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  knowledge_base_id UUID REFERENCES knowledge_bases(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  file_path TEXT,
  file_type TEXT,
  file_size INTEGER,
  embedding_vector VECTOR(1536), -- For vector search (requires pgvector extension)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for knowledge base documents
CREATE INDEX IF NOT EXISTS idx_kb_documents_kb_id ON knowledge_base_documents(knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_kb_documents_file_type ON knowledge_base_documents(file_type);

-- Enable Row Level Security
ALTER TABLE mcp_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_documents ENABLE ROW LEVEL SECURITY;

-- MCP Servers Policies
CREATE POLICY "Users can view organization MCP servers" ON mcp_servers
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage organization MCP servers" ON mcp_servers
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Knowledge Bases Policies
CREATE POLICY "Users can view organization knowledge bases" ON knowledge_bases
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage organization knowledge bases" ON knowledge_bases
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Knowledge Base Documents Policies
CREATE POLICY "Users can view organization knowledge base documents" ON knowledge_base_documents
  FOR SELECT USING (
    knowledge_base_id IN (
      SELECT id FROM knowledge_bases 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage organization knowledge base documents" ON knowledge_base_documents
  FOR ALL USING (
    knowledge_base_id IN (
      SELECT id FROM knowledge_bases 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
      )
    )
  );

-- Update function for knowledge base document count
CREATE OR REPLACE FUNCTION update_knowledge_base_document_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE knowledge_bases 
    SET document_count = document_count + 1,
        updated_at = NOW()
    WHERE id = NEW.knowledge_base_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE knowledge_bases 
    SET document_count = document_count - 1,
        updated_at = NOW()
    WHERE id = OLD.knowledge_base_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for document count updates
CREATE TRIGGER trigger_update_kb_document_count
  AFTER INSERT OR DELETE ON knowledge_base_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_document_count();

-- Sample data for testing
INSERT INTO mcp_servers (name, description, endpoint, capabilities, organization_id) VALUES
  ('Sales CRM', 'Access to customer relationship management data', 'http://localhost:3001/mcp', ARRAY['read_customers', 'update_leads'], 
   (SELECT id FROM organizations LIMIT 1)),
  ('Company Database', 'Internal company knowledge and documents', 'http://localhost:3002/mcp', ARRAY['search_documents', 'read_company_data'], 
   (SELECT id FROM organizations LIMIT 1));

INSERT INTO knowledge_bases (name, description, type, organization_id) VALUES
  ('Company Documentation', 'Internal company policies and procedures', 'documentation', 
   (SELECT id FROM organizations LIMIT 1)),
  ('Sales Data', 'Customer interactions and sales history', 'sales_data', 
   (SELECT id FROM organizations LIMIT 1)),
  ('Product Knowledge', 'Product specifications and features', 'company_knowledge', 
   (SELECT id FROM organizations LIMIT 1));

-- Update organizations table to include LibreChat configuration
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS librechat_config JSONB DEFAULT '{}'::jsonb;

-- Add default LibreChat configuration based on plan type
UPDATE organizations 
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
WHERE librechat_config = '{}'::jsonb; 