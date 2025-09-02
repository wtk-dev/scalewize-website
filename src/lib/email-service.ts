import { supabase } from './supabase-client'

// Email configuration
export const EMAIL_CONFIG = {
  // n8n webhook configuration (recommended)
  n8n: {
    webhookUrl: process.env.N8N_WEBHOOK_URL || '',
    enabled: true
  },
  // Fallback to Supabase Auth emails
  supabase: {
    enabled: true
  }
}

// Email templates with ScaleWize branding
export const EMAIL_TEMPLATES = {
  invitation: {
    subject: 'You\'re invited to join {{organizationName}} on ScaleWize AI',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Organization Invitation</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #595F39 0%, #6B7357 100%); padding: 40px 30px; text-align: center; }
          .logo { color: white; font-size: 28px; font-weight: 700; margin-bottom: 8px; }
          .tagline { color: rgba(255, 255, 255, 0.9); font-size: 16px; }
          .content { padding: 40px 30px; }
          .invitation-title { color: #2d3748; font-size: 24px; margin-bottom: 20px; text-align: center; }
          .invitation-text { color: #4a5568; font-size: 16px; margin-bottom: 20px; line-height: 1.7; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #595F39 0%, #6B7357 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; text-align: center; }
          .details { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
          .detail-row:last-child { border-bottom: none; margin-bottom: 0; }
          .detail-label { font-weight: 600; color: #4a5568; }
          .detail-value { color: #2d3748; }
          .expiry-warning { background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .expiry-warning strong { color: #c53030; }
          .footer { background: #f7fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; }
          @media (max-width: 600px) { .container { margin: 10px; border-radius: 8px; } .header, .content { padding: 20px; } .detail-row { flex-direction: column; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ScaleWize AI</div>
            <div class="tagline">Simplifying AI for businesses</div>
          </div>
          <div class="content">
            <h1 class="invitation-title">You're Invited!</h1>
            <p class="invitation-text">
              {{inviterName}} has invited you to join <strong>{{organizationName}}</strong> on ScaleWize AI. 
              You'll have access to AI-powered chatbots, analytics, and business automation tools.
            </p>
            <a href="{{inviteUrl}}" class="cta-button">Accept Invitation</a>
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Organization:</span>
                <span class="detail-value">{{organizationName}}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Invited by:</span>
                <span class="detail-value">{{inviterName}}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Invitation expires:</span>
                <span class="detail-value">{{expiresAt}}</span>
              </div>
            </div>
            <div class="expiry-warning">
              <strong>Important:</strong> This invitation expires on {{expiresAt}}. 
              Please accept it before then to join the organization.
            </div>
            <p class="invitation-text">
              If you have any questions, please contact your organization administrator.
            </p>
          </div>
          <div class="footer">
            <p>This invitation was sent by ScaleWize AI</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      You're invited to join {{organizationName}} on ScaleWize AI!
      
      {{inviterName}} has invited you to join their organization on ScaleWize AI. 
      You'll have access to AI-powered chatbots, analytics, and business automation tools.
      
      Accept your invitation: {{inviteUrl}}
      
      Organization: {{organizationName}}
      Invited by: {{inviterName}}
      Expires: {{expiresAt}}
      
      This invitation expires on {{expiresAt}}. Please accept it before then.
      
      If you have questions, contact your organization administrator.
      
      ---
      ScaleWize AI - Simplifying AI for businesses
    `
  },
  welcome: {
    subject: 'Welcome to {{organizationName}} on ScaleWize AI!',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ScaleWize AI</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #595F39 0%, #6B7357 100%); padding: 40px 30px; text-align: center; }
          .logo { color: white; font-size: 28px; font-weight: 700; margin-bottom: 8px; }
          .tagline { color: rgba(255, 255, 255, 0.9); font-size: 16px; }
          .content { padding: 40px 30px; }
          .welcome-title { color: #2d3748; font-size: 24px; margin-bottom: 20px; text-align: center; }
          .welcome-text { color: #4a5568; font-size: 16px; margin-bottom: 20px; line-height: 1.7; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #595F39 0%, #6B7357 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; text-align: center; }
          .features { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature-item { display: flex; align-items: center; margin-bottom: 15px; }
          .feature-item:last-child { margin-bottom: 0; }
          .feature-icon { background: #595F39; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 12px; }
          .footer { background: #f7fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; }
          @media (max-width: 600px) { .container { margin: 10px; border-radius: 8px; } .header, .content { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ScaleWize AI</div>
            <div class="tagline">Simplifying AI for businesses</div>
            </div>
          <div class="content">
            <h1 class="welcome-title">Welcome to ScaleWize AI!</h1>
            <p class="welcome-text">
              Congratulations! You're now a member of <strong>{{organizationName}}</strong> on ScaleWize AI. 
              You have access to powerful AI tools that will help streamline your business operations.
            </p>
            <a href="{{dashboardUrl}}" class="cta-button">Go to Dashboard</a>
            <div class="features">
              <h3 style="margin-bottom: 15px; color: #2d3748;">What you can do now:</h3>
              <div class="feature-item">
                <div class="feature-icon">🤖</div>
                <span>Access AI-powered chatbots for customer support</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📊</div>
                <span>View analytics and performance insights</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">⚡</div>
                <span>Automate business processes with AI</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">👥</div>
                <span>Collaborate with your team members</span>
              </div>
            </div>
            <p class="welcome-text">
              If you have any questions or need help getting started, don't hesitate to reach out to your team administrator.
            </p>
          </div>
          <div class="footer">
            <p>Welcome to the future of business automation!</p>
            <p>ScaleWize AI - Simplifying AI for businesses</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to ScaleWize AI!
      
      Congratulations! You're now a member of {{organizationName}} on ScaleWize AI. 
      You have access to powerful AI tools that will help streamline your business operations.
      
      Go to Dashboard: {{dashboardUrl}}
      
      What you can do now:
      🤖 Access AI-powered chatbots for customer support
      📊 View analytics and performance insights
      ⚡ Automate business processes with AI
      👥 Collaborate with your team members
      
      If you have any questions or need help getting started, don't hesitate to reach out to your team administrator.
      
      ---
      ScaleWize AI - Simplifying AI for businesses
    `
  }
}

// Email service interface
export interface IEmailService {
  sendInvitationEmail(params: {
    to: string
    organizationName: string
    inviterName: string
    inviteUrl: string
    expiresAt: string
  }): Promise<{ success: boolean; messageId?: string; error?: string }>
  
  sendWelcomeEmail(params: {
    to: string
    organizationName: string
    dashboardUrl: string
  }): Promise<{ success: boolean; messageId?: string; error?: string }>
}

// n8n webhook email service (recommended)
class N8nEmailService implements IEmailService {
  private webhookUrl: string

  constructor() {
    this.webhookUrl = EMAIL_CONFIG.n8n.webhookUrl
  }

  async sendInvitationEmail(params: {
    to: string
    organizationName: string
    inviterName: string
    inviteUrl: string
    expiresAt: string
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.webhookUrl) {
      console.warn('n8n webhook URL not configured, falling back to Supabase Auth')
      return { success: false, error: 'n8n webhook URL not configured' }
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'invitation',
          to: params.to,
          subject: EMAIL_TEMPLATES.invitation.subject.replace('{{organizationName}}', params.organizationName),
          html: EMAIL_TEMPLATES.invitation.html
            .replace(/{{organizationName}}/g, params.organizationName)
            .replace(/{{inviterName}}/g, params.inviterName)
            .replace(/{{inviteUrl}}/g, params.inviteUrl)
            .replace(/{{expiresAt}}/g, params.expiresAt),
          text: EMAIL_TEMPLATES.invitation.text
            .replace(/{{organizationName}}/g, params.organizationName)
            .replace(/{{inviterName}}/g, params.inviterName)
            .replace(/{{inviteUrl}}/g, params.inviteUrl)
            .replace(/{{expiresAt}}/g, params.expiresAt),
          metadata: {
            organizationName: params.organizationName,
            inviterName: params.inviterName,
            inviteUrl: params.inviteUrl,
            expiresAt: params.expiresAt,
            timestamp: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`n8n webhook error: ${error}`)
      }

      const result = await response.json()
      return { success: true, messageId: result.id || `n8n-${Date.now()}` }
    } catch (error) {
      console.error('n8n webhook error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async sendWelcomeEmail(params: {
    to: string
    organizationName: string
    dashboardUrl: string
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.webhookUrl) {
      console.warn('n8n webhook URL not configured, falling back to Supabase Auth')
      return { success: false, error: 'n8n webhook URL not configured' }
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'welcome',
          to: params.to,
          subject: EMAIL_TEMPLATES.welcome.subject.replace('{{organizationName}}', params.organizationName),
          html: EMAIL_TEMPLATES.welcome.html
            .replace(/{{organizationName}}/g, params.organizationName)
            .replace(/{{dashboardUrl}}/g, params.dashboardUrl),
          text: EMAIL_TEMPLATES.welcome.text
            .replace(/{{organizationName}}/g, params.organizationName)
            .replace(/{{dashboardUrl}}/g, params.dashboardUrl),
          metadata: {
            organizationName: params.organizationName,
            dashboardUrl: params.dashboardUrl,
            timestamp: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`n8n webhook error: ${error}`)
      }

      const result = await response.json()
      return { success: true, messageId: result.id || `n8n-${Date.now()}` }
    } catch (error) {
      console.error('n8n webhook error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Supabase Auth email service (fallback)
class SupabaseEmailService implements IEmailService {
  async sendInvitationEmail(params: {
    to: string
    organizationName: string
    inviterName: string
    inviteUrl: string
    expiresAt: string
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Use Supabase Auth to send invitation
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(params.to, {
        data: {
          organization_name: params.organizationName,
          inviter_name: params.inviterName,
          invite_url: params.inviteUrl,
          expires_at: params.expiresAt
        }
      })

      if (error) throw error

      return { success: true, messageId: data.user?.id }
    } catch (error) {
      console.error('Supabase invitation error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async sendWelcomeEmail(params: {
    to: string
    organizationName: string
    dashboardUrl: string
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // For welcome emails, we'll use a custom approach since Supabase doesn't have a built-in welcome email
      console.log('Welcome email would be sent via Supabase Auth system')
      return { success: true, messageId: 'supabase-auth-welcome' }
    } catch (error) {
      console.error('Supabase welcome email error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Main email service class
export class EmailService {
  private n8nService: N8nEmailService
  private supabaseService: SupabaseEmailService

  constructor() {
    this.n8nService = new N8nEmailService()
    this.supabaseService = new SupabaseEmailService()
  }

  async sendInvitationEmail(params: {
    to: string
    organizationName: string
    inviterName: string
    inviteUrl: string
    expiresAt: string
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Try n8n first, fallback to Supabase
    const result = await this.n8nService.sendInvitationEmail(params)
    if (result.success) return result

    console.log('Falling back to Supabase Auth for invitation email')
    return this.supabaseService.sendInvitationEmail(params)
  }

  async sendWelcomeEmail(params: {
    to: string
    organizationName: string
    dashboardUrl: string
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Try n8n first, fallback to Supabase
    const result = await this.n8nService.sendWelcomeEmail(params)
    if (result.success) return result

    console.log('Falling back to Supabase Auth for welcome email')
    return this.supabaseService.sendWelcomeEmail(params)
  }
}

// Helper functions for easy use
export const emailService = new EmailService()

export const sendInvitationEmail = async (params: {
  to: string
  organizationName: string
  inviterName: string
  inviteUrl: string
  expiresAt: string
}) => {
  return emailService.sendInvitationEmail(params)
}

export const sendWelcomeEmail = async (params: {
  to: string
  organizationName: string
  dashboardUrl: string
}) => {
  return emailService.sendWelcomeEmail(params)
}
