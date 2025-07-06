export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          domain: string | null
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
    }
    Views: {
      [_ in never]: never
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