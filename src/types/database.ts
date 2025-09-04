export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          domain: string | null
          slug: string
          subscription_status: 'trial' | 'active' | 'inactive' | 'cancelled'
          plan_type: 'starter' | 'professional' | 'enterprise'
          max_users: number
          max_chat_sessions: number
          monthly_token_limit: number
          librechat_config: Json
          n8n_webhook_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          domain?: string | null
          slug: string
          subscription_status?: 'trial' | 'active' | 'inactive' | 'cancelled'
          plan_type?: 'starter' | 'professional' | 'enterprise'
          max_users?: number
          max_chat_sessions?: number
          monthly_token_limit?: number
          librechat_config?: Json
          n8n_webhook_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string | null
          slug: string
          subscription_status?: 'trial' | 'active' | 'inactive' | 'cancelled'
          plan_type?: 'starter' | 'professional' | 'enterprise'
          max_users?: number
          max_chat_sessions?: number
          monthly_token_limit?: number
          librechat_config?: Json
          n8n_webhook_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          organization_id: string | null
          email: string
          full_name: string | null
          role: 'user' | 'admin' | 'super_admin'
          is_active: boolean
          librechat_user_id: string | null
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id?: string | null
          email: string
          full_name?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          is_active?: boolean
          librechat_user_id?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          email?: string
          full_name?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          is_active?: boolean
          librechat_user_id?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string | null
          organization_id: string | null
          title: string | null
          librechat_session_id: string | null
          model_used: string | null
          session_metadata: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          title?: string | null
          librechat_session_id?: string | null
          model_used?: string | null
          session_metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          title?: string | null
          librechat_session_id?: string | null
          model_used?: string | null
          session_metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      usage_metrics: {
        Row: {
          id: string
          organization_id: string | null
          user_id: string | null
          session_id: string | null
          message_count: number
          tokens_used: number
          cost_usd: number
          model_used: string | null
          endpoint_used: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          session_id?: string | null
          message_count?: number
          tokens_used?: number
          cost_usd?: number
          model_used?: string | null
          endpoint_used?: string | null
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          session_id?: string | null
          message_count?: number
          tokens_used?: number
          cost_usd?: number
          model_used?: string | null
          endpoint_used?: string | null
          date?: string
          created_at?: string
        }
      }
      billing_records: {
        Row: {
          id: string
          organization_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          amount_usd: number | null
          billing_period_start: string | null
          billing_period_end: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          amount_usd?: number | null
          billing_period_start?: string | null
          billing_period_end?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          amount_usd?: number | null
          billing_period_start?: string | null
          billing_period_end?: string | null
          status?: string
          created_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          organization_id: string | null
          key_name: string
          key_value: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          key_name: string
          key_value: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          key_name?: string
          key_value?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          organization_id: string
          full_name: string | null
          first_name: string | null
          last_name: string | null
          linkedin_url: string | null
          email: string | null
          company: string | null
          title: string | null
          industry: string | null
          validated: boolean | null
          outreach_message: string | null
          status: 'SENT' | 'REPLIED' | 'PENDING' | 'CONNECTED' | 'RESPONDED' | 'BOOKED' | 'CLOSED'
          delegation_level: number | null
          source: string | null
          user_id: string
          connection_request_sent_at: string | null
          first_message_sent_at: string | null
          last_contact_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          email?: string | null
          company?: string | null
          title?: string | null
          industry?: string | null
          validated?: boolean | null
          outreach_message?: string | null
          status?: 'SENT' | 'REPLIED' | 'PENDING' | 'CONNECTED' | 'RESPONDED' | 'BOOKED' | 'CLOSED'
          delegation_level?: number | null
          source?: string | null
          user_id: string
          connection_request_sent_at?: string | null
          first_message_sent_at?: string | null
          last_contact_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          email?: string | null
          company?: string | null
          title?: string | null
          industry?: string | null
          validated?: boolean | null
          outreach_message?: string | null
          status?: 'SENT' | 'REPLIED' | 'PENDING' | 'CONNECTED' | 'RESPONDED' | 'BOOKED' | 'CLOSED'
          delegation_level?: number | null
          source?: string | null
          user_id?: string
          connection_request_sent_at?: string | null
          first_message_sent_at?: string | null
          last_contact_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          organization_id: string
          email: string
          token: string
          invited_by: string
          expires_at: string
          status: 'pending' | 'accepted' | 'expired' | 'cancelled'
          created_at: string
          magic_link_token: string | null
          magic_link_expires_at: string | null
          accepted_at: string | null
          accepted_by: string | null
          email_sent: boolean
          email_sent_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          token: string
          invited_by: string
          expires_at: string
          status?: 'pending' | 'accepted' | 'expired' | 'cancelled'
          created_at?: string
          magic_link_token?: string | null
          magic_link_expires_at?: string | null
          accepted_at?: string | null
          accepted_by?: string | null
          email_sent?: boolean
          email_sent_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          token?: string
          invited_by?: string
          expires_at?: string
          status?: 'pending' | 'accepted' | 'expired' | 'cancelled'
          created_at?: string
          magic_link_token?: string | null
          magic_link_expires_at?: string | null
          accepted_at?: string | null
          accepted_by?: string | null
          email_sent?: boolean
          email_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          organization_id: string
          conversation_id: string | null
          sender_linkedin_url: string | null
          recipient_linkedin_url: string | null
          from_name: string | null
          to_name: string | null
          message_date: string | null
          subject: string | null
          content: string | null
          folder: string | null
          message_type: 'general' | 'connection_request' | 'first_message' | 'response'
          created_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          conversation_id?: string | null
          sender_linkedin_url?: string | null
          recipient_linkedin_url?: string | null
          from_name?: string | null
          to_name?: string | null
          message_date?: string | null
          subject?: string | null
          content?: string | null
          folder?: string | null
          message_type?: 'general' | 'connection_request' | 'first_message' | 'response'
          created_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          conversation_id?: string | null
          sender_linkedin_url?: string | null
          recipient_linkedin_url?: string | null
          from_name?: string | null
          to_name?: string | null
          message_date?: string | null
          subject?: string | null
          content?: string | null
          folder?: string | null
          message_type?: 'general' | 'connection_request' | 'first_message' | 'response'
          created_at?: string
          user_id?: string | null
        }
      }

    }
    Views: {
      linkedin_analytics: {
        Row: {
          organization_id: string
          total_leads: number
          pending_leads: number
          sent_requests: number
          connected_leads: number
          responded_leads: number
          booked_meetings: number
          closed_deals: number
          total_messages: number
          connection_requests_sent: number
          first_messages_sent: number
          responses_received: number
          connection_rate: number
          response_rate: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Organization = Database['public']['Tables']['organizations']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ChatSession = Database['public']['Tables']['chat_sessions']['Row']
export type UsageMetric = Database['public']['Tables']['usage_metrics']['Row']
export type BillingRecord = Database['public']['Tables']['billing_records']['Row']
export type ApiKey = Database['public']['Tables']['api_keys']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Invitation = Database['public']['Tables']['invitations']['Row']

export type LinkedInAnalytics = Database['public']['Views']['linkedin_analytics']['Row'] 