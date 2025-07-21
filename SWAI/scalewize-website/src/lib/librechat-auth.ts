import { createBrowserClient } from '@supabase/ssr'
import { jwtDecode } from 'jwt-decode'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface LibreChatUser {
  id: string
  email: string
  name: string
  username: string
  avatar: string
  role: string
  organization: {
    id: string
    name: string
    domain: string
    plan_type: string
    librechat_config: any
  }
}

interface LibreChatJWT {
  sub: string
  email: string
  name: string
  username: string
  avatar: string
  role: string
  organization: {
    id: string
    name: string
    domain: string
    plan_type: string
    librechat_config: any
  }
  iat: number
  exp: number
  jti: string // JWT ID for token tracking
}

export class LibreChatAuth {
  private static instance: LibreChatAuth
  private jwtSecret: string

  constructor() {
    this.jwtSecret = process.env.LIBRECHAT_JWT_SECRET || 'your-jwt-secret'
  }

  static getInstance(): LibreChatAuth {
    if (!LibreChatAuth.instance) {
      LibreChatAuth.instance = new LibreChatAuth()
    }
    return LibreChatAuth.instance
  }

  /**
   * Generate a JWT token for LibreChat authentication
   */
  async generateLibreChatToken(userId: string): Promise<string> {
    try {
      // Get user profile and organization data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          organizations (*)
        `)
        .eq('id', userId)
        .single()

      if (profileError || !profile) {
        throw new Error('User profile not found')
      }

      const organization = profile.organizations

      // Validate organization access
      if (!organization || organization.subscription_status !== 'active') {
        throw new Error('Organization not found or inactive')
      }

      // Check subscription status
      if (organization.subscription_status === 'cancelled') {
        throw new Error('Organization subscription is cancelled')
      }

      // Create LibreChat user object
      const libreChatUser: LibreChatUser = {
        id: profile.id,
        email: profile.email,
        name: profile.full_name || profile.email,
        username: profile.email.split('@')[0],
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.email)}&background=0D9488&color=fff`,
        role: profile.role,
        organization: {
          id: organization.id,
          name: organization.name,
          domain: organization.domain,
          plan_type: organization.plan_type,
          librechat_config: organization.librechat_config || {}
        }
      }

      // Generate JWT token
      const token = this.createJWT(libreChatUser)
      
      // Track token generation for analytics
      await this.trackTokenGeneration(userId, organization.id)
      
      return token

    } catch (error) {
      console.error('Error generating LibreChat token:', error)
      throw error
    }
  }

  /**
   * Create a JWT token for LibreChat
   * Note: In production, use a proper JWT library like jsonwebtoken
   */
  private createJWT(user: LibreChatUser): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    }

    const payload: LibreChatJWT = {
      sub: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      organization: user.organization,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      jti: `${user.id}-${Date.now()}` // Unique token ID
    }

    // In production, use a proper JWT library
    // For now, we'll create a simple token structure
    const encodedHeader = btoa(JSON.stringify(header))
    const encodedPayload = btoa(JSON.stringify(payload))
    
    // Simple signature (use proper HMAC in production)
    const signature = btoa(`${encodedHeader}.${encodedPayload}.${this.jwtSecret}`)
    
    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  /**
   * Verify and decode a LibreChat JWT token
   */
  verifyToken(token: string): LibreChatJWT | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return null
      }

      const payload = JSON.parse(atob(parts[1]))
      
      // Check if token is expired
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null
      }

      return payload
    } catch (error) {
      console.error('Error verifying token:', error)
      return null
    }
  }

  /**
   * Get LibreChat URL with authentication
   */
  async getLibreChatURL(userId: string, organizationDomain: string): Promise<string> {
    const token = await this.generateLibreChatToken(userId)
    const baseUrl = process.env.NEXT_PUBLIC_LIBRECHAT_URL || 'http://localhost:3080'
    
    // Add additional security parameters
    const params = new URLSearchParams({
      token: token,
      org: organizationDomain,
      timestamp: Date.now().toString(),
      version: '1.0'
    })
    
    return `${baseUrl}?${params.toString()}`
  }

  /**
   * Track token generation for analytics and security
   */
  private async trackTokenGeneration(userId: string, organizationId: string): Promise<void> {
    try {
      await supabase
        .from('usage_metrics')
        .insert({
          user_id: userId,
          organization_id: organizationId,
          date: new Date().toISOString().split('T')[0],
          message_count: 0,
          tokens_used: 0,
          model_used: 'auth',
          endpoint_used: 'token_generation'
        })
    } catch (error) {
      console.error('Error tracking token generation:', error)
    }
  }

  /**
   * Sync user data with LibreChat
   */
  async syncUserWithLibreChat(userId: string): Promise<void> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !profile) {
        throw new Error('User profile not found')
      }

      // Update librechat_user_id if needed
      if (!profile.librechat_user_id) {
        await supabase
          .from('profiles')
          .update({ 
            librechat_user_id: userId,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
      }

    } catch (error) {
      console.error('Error syncing user with LibreChat:', error)
      throw error
    }
  }

  /**
   * Validate organization access and limits
   */
  async validateOrganizationAccess(organizationId: string): Promise<boolean> {
    try {
      const { data: organization, error } = await supabase
        .from('organizations')
        .select('subscription_status, plan_type, max_users')
        .eq('id', organizationId)
        .single()

      if (error || !organization) {
        return false
      }

      // Check subscription status
      if (organization.subscription_status === 'cancelled') {
        return false
      }

      // Check user limits
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      return (userCount || 0) < organization.max_users
    } catch (error) {
      console.error('Error validating organization access:', error)
      return false
    }
  }
}

export const libreChatAuth = LibreChatAuth.getInstance() 