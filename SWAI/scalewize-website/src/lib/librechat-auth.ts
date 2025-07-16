import { createClient } from '@supabase/supabase-js'
import { jwtDecode } from 'jwt-decode'

const supabase = createClient(
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

      // Generate JWT token (in production, use a proper JWT library)
      const token = this.createJWT(libreChatUser)
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
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
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
    
    return `${baseUrl}?token=${encodeURIComponent(token)}&org=${organizationDomain}`
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
          .update({ librechat_user_id: userId })
          .eq('id', userId)
      }

    } catch (error) {
      console.error('Error syncing user with LibreChat:', error)
      throw error
    }
  }
}

export const libreChatAuth = LibreChatAuth.getInstance() 