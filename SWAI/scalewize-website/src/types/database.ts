export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
          subscription_tier: 'starter' | 'professional' | 'enterprise'
          subscription_status: 'active' | 'inactive' | 'cancelled'
          stripe_customer_id: string | null
          monthly_usage_limit: number
          current_monthly_usage: number
          settings: Json
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
          subscription_tier?: 'starter' | 'professional' | 'enterprise'
          subscription_status?: 'active' | 'inactive' | 'cancelled'
          stripe_customer_id?: string | null
          monthly_usage_limit?: number
          current_monthly_usage?: number
          settings?: Json
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
          subscription_tier?: 'starter' | 'professional' | 'enterprise'
          subscription_status?: 'active' | 'inactive' | 'cancelled'
          stripe_customer_id?: string | null
          monthly_usage_limit?: number
          current_monthly_usage?: number
          settings?: Json
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          organization_id: string
          role: 'user' | 'admin' | 'super_admin'
          created_at: string
          updated_at: string
          last_sign_in: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          organization_id: string
          role?: 'user' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
          last_sign_in?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          organization_id?: string
          role?: 'user' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
          last_sign_in?: string | null
        }
      }
      chat_sessions: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          session_id: string
          title: string | null
          created_at: string
          updated_at: string
          message_count: number
          total_tokens: number
          status: 'active' | 'archived'
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          session_id: string
          title?: string | null
          created_at?: string
          updated_at?: string
          message_count?: number
          total_tokens?: number
          status?: 'active' | 'archived'
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          session_id?: string
          title?: string | null
          created_at?: string
          updated_at?: string
          message_count?: number
          total_tokens?: number
          status?: 'active' | 'archived'
        }
      }
      usage_metrics: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          date: string
          tokens_used: number
          cost_usd: number
          session_count: number
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          date: string
          tokens_used: number
          cost_usd: number
          session_count: number
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          date?: string
          tokens_used?: number
          cost_usd?: number
          session_count?: number
          created_at?: string
        }
      }
      billing_records: {
        Row: {
          id: string
          organization_id: string
          stripe_invoice_id: string
          amount_usd: number
          status: 'pending' | 'paid' | 'failed'
          billing_period_start: string
          billing_period_end: string
          created_at: string
          paid_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          stripe_invoice_id: string
          amount_usd: number
          status?: 'pending' | 'paid' | 'failed'
          billing_period_start: string
          billing_period_end: string
          created_at?: string
          paid_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          stripe_invoice_id?: string
          amount_usd?: number
          status?: 'pending' | 'paid' | 'failed'
          billing_period_start?: string
          billing_period_end?: string
          created_at?: string
          paid_at?: string | null
        }
      }
      api_keys: {
        Row: {
          id: string
          organization_id: string
          name: string
          key_hash: string
          permissions: string[]
          created_at: string
          last_used: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          key_hash: string
          permissions: string[]
          created_at?: string
          last_used?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          key_hash?: string
          permissions?: string[]
          created_at?: string
          last_used?: string | null
          expires_at?: string | null
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