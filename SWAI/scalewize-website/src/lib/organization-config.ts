import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface LibreChatConfig {
  enabled_models: string[]
  max_tokens: number
  knowledge_bases: string[]
  mcp_servers: string[]
  custom_instructions: string
  allowed_endpoints: string[]
  features: {
    file_upload: boolean
    image_generation: boolean
    voice_chat: boolean
    code_interpreter: boolean
  }
}

export interface OrganizationConfig {
  id: string
  name: string
  domain: string
  plan_type: 'starter' | 'professional' | 'enterprise'
  librechat_config: LibreChatConfig
  mcp_servers: MCPServer[]
  knowledge_bases: KnowledgeBase[]
}

export interface MCPServer {
  id: string
  name: string
  description: string
  endpoint: string
  capabilities: string[]
  organization_id: string
  is_active: boolean
}

export interface KnowledgeBase {
  id: string
  name: string
  description: string
  type: 'documentation' | 'sales_data' | 'company_knowledge' | 'custom'
  organization_id: string
  is_active: boolean
  document_count: number
}

export class OrganizationConfigManager {
  private static instance: OrganizationConfigManager

  static getInstance(): OrganizationConfigManager {
    if (!OrganizationConfigManager.instance) {
      OrganizationConfigManager.instance = new OrganizationConfigManager()
    }
    return OrganizationConfigManager.instance
  }

  /**
   * Get organization configuration with LibreChat settings
   */
  async getOrganizationConfig(organizationId: string): Promise<OrganizationConfig | null> {
    try {
      const { data: org, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single()

      if (error || !org) {
        return null
      }

      // Get MCP servers for this organization
      const { data: mcpServers } = await supabase
        .from('mcp_servers')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)

      // Get knowledge bases for this organization
      const { data: knowledgeBases } = await supabase
        .from('knowledge_bases')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)

      return {
        id: org.id,
        name: org.name,
        domain: org.domain,
        plan_type: org.plan_type,
        librechat_config: org.librechat_config || this.getDefaultConfig(org.plan_type),
        mcp_servers: mcpServers || [],
        knowledge_bases: knowledgeBases || []
      }
    } catch (error) {
      console.error('Error getting organization config:', error)
      return null
    }
  }

  /**
   * Get default LibreChat configuration based on plan type
   */
  getDefaultConfig(planType: string): LibreChatConfig {
    const baseConfig: LibreChatConfig = {
      enabled_models: ['gpt-3.5-turbo'],
      max_tokens: 10000,
      knowledge_bases: [],
      mcp_servers: [],
      custom_instructions: 'You are a helpful AI assistant for this organization.',
      allowed_endpoints: ['/api/chat'],
      features: {
        file_upload: false,
        image_generation: false,
        voice_chat: false,
        code_interpreter: false
      }
    }

    switch (planType) {
      case 'starter':
        return {
          ...baseConfig,
          enabled_models: ['gpt-3.5-turbo'],
          max_tokens: 10000,
          features: {
            file_upload: true,
            image_generation: false,
            voice_chat: false,
            code_interpreter: false
          }
        }

      case 'professional':
        return {
          ...baseConfig,
          enabled_models: ['gpt-3.5-turbo', 'gpt-4', 'claude-3-sonnet'],
          max_tokens: 100000,
          features: {
            file_upload: true,
            image_generation: true,
            voice_chat: false,
            code_interpreter: true
          }
        }

      case 'enterprise':
        return {
          ...baseConfig,
          enabled_models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-sonnet', 'claude-3-opus'],
          max_tokens: 1000000,
          features: {
            file_upload: true,
            image_generation: true,
            voice_chat: true,
            code_interpreter: true
          }
        }

      default:
        return baseConfig
    }
  }

  /**
   * Update organization's LibreChat configuration
   */
  async updateLibreChatConfig(
    organizationId: string, 
    config: Partial<LibreChatConfig>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          librechat_config: config,
          updated_at: new Date().toISOString()
        })
        .eq('id', organizationId)

      return !error
    } catch (error) {
      console.error('Error updating LibreChat config:', error)
      return false
    }
  }

  /**
   * Add MCP server to organization
   */
  async addMCPServer(organizationId: string, server: Omit<MCPServer, 'id' | 'organization_id'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('mcp_servers')
        .insert({
          ...server,
          organization_id: organizationId
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error adding MCP server:', error)
        return null
      }

      return data.id
    } catch (error) {
      console.error('Error adding MCP server:', error)
      return null
    }
  }

  /**
   * Add knowledge base to organization
   */
  async addKnowledgeBase(organizationId: string, kb: Omit<KnowledgeBase, 'id' | 'organization_id' | 'document_count'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('knowledge_bases')
        .insert({
          ...kb,
          organization_id: organizationId,
          document_count: 0
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error adding knowledge base:', error)
        return null
      }

      return data.id
    } catch (error) {
      console.error('Error adding knowledge base:', error)
      return null
    }
  }

  /**
   * Get available MCP servers for organization
   */
  async getMCPServers(organizationId: string): Promise<MCPServer[]> {
    try {
      const { data, error } = await supabase
        .from('mcp_servers')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)

      if (error) {
        console.error('Error getting MCP servers:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting MCP servers:', error)
      return []
    }
  }

  /**
   * Get available knowledge bases for organization
   */
  async getKnowledgeBases(organizationId: string): Promise<KnowledgeBase[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_bases')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)

      if (error) {
        console.error('Error getting knowledge bases:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting knowledge bases:', error)
      return []
    }
  }

  /**
   * Check if organization has access to specific feature
   */
  async hasFeatureAccess(organizationId: string, feature: keyof LibreChatConfig['features']): Promise<boolean> {
    const config = await this.getOrganizationConfig(organizationId)
    return config?.librechat_config.features[feature] || false
  }

  /**
   * Check if organization has access to specific model
   */
  async hasModelAccess(organizationId: string, model: string): Promise<boolean> {
    const config = await this.getOrganizationConfig(organizationId)
    return config?.librechat_config.enabled_models.includes(model) || false
  }

  /**
   * Get organization usage limits
   */
  async getUsageLimits(organizationId: string): Promise<{
    max_tokens: number
    max_users: number
    max_chat_sessions: number
  }> {
    try {
      const { data: org, error } = await supabase
        .from('organizations')
        .select('max_tokens, max_users, max_chat_sessions')
        .eq('id', organizationId)
        .single()

      if (error || !org) {
        return {
          max_tokens: 10000,
          max_users: 10,
          max_chat_sessions: 100
        }
      }

      return {
        max_tokens: org.max_tokens,
        max_users: org.max_users,
        max_chat_sessions: org.max_chat_sessions
      }
    } catch (error) {
      console.error('Error getting usage limits:', error)
      return {
        max_tokens: 10000,
        max_users: 10,
        max_chat_sessions: 100
      }
    }
  }
}

export const organizationConfig = OrganizationConfigManager.getInstance() 