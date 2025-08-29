// @ts-nocheck
import { supabase } from './supabase-client'

export interface LinkedInLead {
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
  status: 'SENT' | 'REPLIED' | 'PENDING' | 'CONNECTED' | 'RESPONDED' | 'ACTIVE' | 'BOOKED' | 'CLOSED'
  connection_request_sent_at: string | null
  first_message_sent_at: string | null
  last_contact_at: string | null
  created_at: string
  updated_at: string
}

export interface LinkedInMessage {
  id: string
  organization_id: string
  sender_linkedin_url: string | null
  recipient_linkedin_url: string | null
  message_type: 'general' | 'connection_request' | 'first_message' | 'response'
  content: string | null
  message_date: string | null
  created_at: string
}

export interface LinkedInAnalytics {
  total_leads: number
  pending_leads: number
  sent_leads: number
  connected_leads: number
  responded_leads: number
  booked_leads: number
  closed_leads: number
  total_messages: number
  connection_requests_sent: number
  first_messages_sent: number
  responses_received: number
}

export class LinkedInService {
  private organizationId: string

  constructor(organizationId: string) {
    this.organizationId = organizationId
  }

  // Get LinkedIn analytics
  async getAnalytics(): Promise<LinkedInAnalytics | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_linkedin_analytics', { org_id: this.organizationId })

      if (error) {
        console.error('Error fetching LinkedIn analytics:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getAnalytics:', error)
      return null
    }
  }

  // Get LinkedIn leads (filtered from existing leads table)
  async getLeads(status?: string): Promise<LinkedInLead[]> {
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .eq('organization_id', this.organizationId)
        .not('linkedin_url', 'is', null) // Only LinkedIn leads
        .order('created_at', { ascending: false })

      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching LinkedIn leads:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getLeads:', error)
      return []
    }
  }

  // Get messages for a specific lead by LinkedIn URL
  async getLeadMessages(leadLinkedInUrl: string): Promise<LinkedInMessage[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_linkedin_url.eq.${leadLinkedInUrl},recipient_linkedin_url.eq.${leadLinkedInUrl}`)
        .in('message_type', ['connection_request', 'first_message', 'response'])
        .order('message_date', { ascending: true })

      if (error) {
        console.error('Error fetching lead messages:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getLeadMessages:', error)
      return []
    }
  }

  // Add a new LinkedIn lead
  async addLead(lead: Omit<LinkedInLead, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Promise<LinkedInLead | null> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...lead,
          organization_id: this.organizationId,
          status: 'PENDING'
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding LinkedIn lead:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in addLead:', error)
      return null
    }
  }

  // Update lead status manually
  async updateLeadStatus(leadId: string, status: LinkedInLead['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .eq('organization_id', this.organizationId)

      if (error) {
        console.error('Error updating lead status:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateLeadStatus:', error)
      return false
    }
  }

  // Add a LinkedIn message (triggers automatic status update)
  async addMessage(leadLinkedInUrl: string, messageType: 'connection_request' | 'first_message' | 'response', content: string, isFromLead: boolean = false): Promise<boolean> {
    try {
      const messageData: any = {
        organization_id: this.organizationId,
        message_type: messageType,
        content,
        message_date: new Date().toISOString()
      }

      if (isFromLead) {
        // Message from lead to us
        messageData.sender_linkedin_url = leadLinkedInUrl
        messageData.recipient_linkedin_url = null
      } else {
        // Message from us to lead
        messageData.sender_linkedin_url = null
        messageData.recipient_linkedin_url = leadLinkedInUrl
      }

      const { error } = await supabase
        .from('messages')
        .insert(messageData)

      if (error) {
        console.error('Error adding LinkedIn message:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in addMessage:', error)
      return false
    }
  }

  // Get daily metrics for the last N days
  async getDailyMetrics(days: number = 7): Promise<Array<{
    date: string
    leads: number
    messages: number
    replies: number
  }>> {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Get leads created per day
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('created_at')
        .eq('organization_id', this.organizationId)
        .not('linkedin_url', 'is', null)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (leadsError) {
        console.error('Error fetching leads for metrics:', leadsError)
        return []
      }

      // Get messages sent per day
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('message_date, message_type')
        .eq('organization_id', this.organizationId)
        .in('message_type', ['connection_request', 'first_message', 'response'])
        .gte('message_date', startDate.toISOString())
        .lte('message_date', endDate.toISOString())

      if (messagesError) {
        console.error('Error fetching messages for metrics:', messagesError)
        return []
      }

      // Group by date
      const dailyData: { [key: string]: { leads: number; messages: number; replies: number } } = {}

      // Initialize all dates
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        dailyData[dateStr] = { leads: 0, messages: 0, replies: 0 }
      }

      // Count leads per day
      leadsData?.forEach(lead => {
        const dateStr = lead.created_at.split('T')[0]
        if (dailyData[dateStr]) {
          dailyData[dateStr].leads++
        }
      })

      // Count messages per day
      messagesData?.forEach(message => {
        const dateStr = message.message_date?.split('T')[0]
        if (dateStr && dailyData[dateStr]) {
          dailyData[dateStr].messages++
          if (message.message_type === 'response') {
            dailyData[dateStr].replies++
          }
        }
      })

      // Convert to array format
      return Object.entries(dailyData).map(([date, metrics]) => ({
        date,
        ...metrics
      }))
    } catch (error) {
      console.error('Error in getDailyMetrics:', error)
      return []
    }
  }

  // Get lead sources (companies) breakdown
  async getLeadSources(): Promise<Array<{ source: string; count: number; percentage: number }>> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('company')
        .eq('organization_id', this.organizationId)
        .not('linkedin_url', 'is', null)
        .not('company', 'is', null)

      if (error) {
        console.error('Error fetching lead sources:', error)
        return []
      }

      // Group by company
      const companyCounts: { [key: string]: number } = {}
      data?.forEach(lead => {
        if (lead.company) {
          companyCounts[lead.company] = (companyCounts[lead.company] || 0) + 1
        }
      })

      const total = Object.values(companyCounts).reduce((sum, count) => sum + count, 0)

      return Object.entries(companyCounts)
        .map(([source, count]) => ({
          source,
          count,
          percentage: Math.round((count / total) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Top 10 sources
    } catch (error) {
      console.error('Error in getLeadSources:', error)
      return []
    }
  }

  // Get detailed LinkedIn metrics
  async getDetailedMetrics(): Promise<{
    // Basic counts
    totalLeads: number
    connectionRequestsSent: number
    connectionsMade: number
    responses: number
    activeConversations: number
    
    // Rates
    connectionRate: number
    responseRate: number
    activeConversationRate: number
    
    // Timing
    avgTimeToResponse: number
    avgTimeToConnection: number
    
    // Pipeline
    pipelineValue: number
    statusBreakdown: { [key: string]: number }
    
    // Performance
    topPerformingCompanies: Array<{ company: string; leads: number; conversionRate: number }>
    weeklyTrends: Array<{ week: string; leads: number; responses: number; connections: number }>
    
    // Message analysis
    totalMessages: number
    messagesSent: number
    messagesReceived: number
    avgMessagesPerLead: number
  } | null> {
    try {
      const analytics = await this.getAnalytics()
      if (!analytics) return null

      // Calculate core metrics
      const totalLeads = analytics.total_leads
      const activeLeads = analytics.connected_leads + analytics.responded_leads + analytics.booked_leads
      const conversionRate = totalLeads > 0 ? Math.round((analytics.closed_leads / totalLeads) * 100) : 0

      // Get leads for detailed analysis
      const leads = await this.getLeads()
      
      // Calculate average time to response
      let totalResponseTime = 0
      let responseCount = 0
      leads.forEach(lead => {
        if (lead.connection_request_sent_at && lead.last_contact_at && lead.status === 'RESPONDED') {
          const sentTime = new Date(lead.connection_request_sent_at).getTime()
          const responseTime = new Date(lead.last_contact_at).getTime()
          totalResponseTime += (responseTime - sentTime)
          responseCount++
        }
      })
      const avgTimeToResponse = responseCount > 0 ? Math.round(totalResponseTime / responseCount / (1000 * 60 * 60 * 24)) : 0 // Days

      // Calculate pipeline value (assuming each lead has potential value)
      const pipelineValue = leads.filter(lead => 
        ['CONNECTED', 'RESPONDED', 'ACTIVE', 'BOOKED'].includes(lead.status)
      ).length * 5000 // Assuming $5K average deal value

      // Get top performing companies
      const companyStats: { [key: string]: { leads: number; closed: number } } = {}
      leads.forEach(lead => {
        if (lead.company) {
          if (!companyStats[lead.company]) {
            companyStats[lead.company] = { leads: 0, closed: 0 }
          }
          companyStats[lead.company].leads++
          if (lead.status === 'CLOSED') {
            companyStats[lead.company].closed++
          }
        }
      })

      const topPerformingCompanies = Object.entries(companyStats)
        .map(([company, stats]) => ({
          company,
          leads: stats.leads,
          conversionRate: stats.leads > 0 ? Math.round((stats.closed / stats.leads) * 100) : 0
        }))
        .sort((a, b) => b.conversionRate - a.conversionRate)
        .slice(0, 5)

      // Get weekly trends (last 4 weeks)
      const weeklyTrends = []
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - (i * 7))
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        
        const weekLeads = leads.filter(lead => {
          const leadDate = new Date(lead.created_at)
          return leadDate >= weekStart && leadDate <= weekEnd
        }).length

        const weekResponses = leads.filter(lead => {
          if (!lead.last_contact_at) return false
          const responseDate = new Date(lead.last_contact_at)
          return responseDate >= weekStart && responseDate <= weekEnd && lead.status === 'RESPONDED'
        }).length

        const weekConversions = leads.filter(lead => {
          if (!lead.last_contact_at) return false
          const conversionDate = new Date(lead.last_contact_at)
          return conversionDate >= weekStart && conversionDate <= weekEnd && lead.status === 'CLOSED'
        }).length

        weeklyTrends.push({
          week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          leads: weekLeads,
          responses: weekResponses,
          connections: weekLeads // Using leads as connections for now
        })
      }

      // Get status breakdown
      const statusBreakdown: { [key: string]: number } = {}
      leads.forEach(lead => {
        statusBreakdown[lead.status] = (statusBreakdown[lead.status] || 0) + 1
      })

      // Calculate detailed metrics
      const connectionRequestsSent = analytics.connection_requests_sent || 0
      const connectionsMade = analytics.connected_leads || 0
      const responses = analytics.responses_received || 0
      const activeConversations = analytics.responded_leads + analytics.booked_leads || 0
      
      const connectionRate = totalLeads > 0 ? Math.round((connectionsMade / totalLeads) * 100) : 0
      const responseRate = totalLeads > 0 ? Math.round(((analytics.responded_leads + analytics.booked_leads + analytics.closed_leads) / totalLeads) * 100) : 0
      const activeConversationRate = totalLeads > 0 ? Math.round((activeConversations / totalLeads) * 100) : 0
      
      // Calculate average time to connection
      let totalConnectionTime = 0
      let connectionCount = 0
      leads.forEach(lead => {
        if (lead.connection_request_sent_at && lead.first_message_sent_at) {
          const requestTime = new Date(lead.connection_request_sent_at).getTime()
          const connectionTime = new Date(lead.first_message_sent_at).getTime()
          totalConnectionTime += (connectionTime - requestTime)
          connectionCount++
        }
      })
      const avgTimeToConnection = connectionCount > 0 ? Math.round(totalConnectionTime / connectionCount / (1000 * 60 * 60 * 24)) : 0 // Days
      
      // Calculate message metrics
      const totalMessages = analytics.total_messages || 0
      const messagesSent = analytics.connection_requests_sent + analytics.first_messages_sent || 0
      const messagesReceived = analytics.responses_received || 0
      const avgMessagesPerLead = totalLeads > 0 ? Math.round(totalMessages / totalLeads * 10) / 10 : 0
      
      return {
        totalLeads,
        connectionRequestsSent,
        connectionsMade,
        responses,
        activeConversations,
        connectionRate,
        responseRate,
        activeConversationRate,
        avgTimeToResponse,
        avgTimeToConnection,
        pipelineValue,
        statusBreakdown,
        topPerformingCompanies,
        weeklyTrends,
        totalMessages,
        messagesSent,
        messagesReceived,
        avgMessagesPerLead
      }
    } catch (error) {
      console.error('Error in getExecutiveMetrics:', error)
      return null
    }
  }

  // Get weekly message data for the last 8 weeks
  async getWeeklyMessageData(): Promise<Array<{
    week_start: string
    messages_sent: number
    messages_received: number
    connections_made: number
  }>> {
    try {
      // Call the Supabase RPC function for weekly analytics
      const { data, error } = await supabase
        .rpc('get_weekly_linkedin_analytics', {
          org_id: this.organizationId,
          weeks_back: 8,
        });
      if (error) {
        console.error('Supabase RPC error:', error);
        throw error;
      }
      return data || [];
    } catch (err) {
      console.error('Error in getWeeklyMessageData:', err);
      throw err;
    }
  }

  // Get dashboard metrics (legacy)
  async getDashboardMetrics(): Promise<{
    totalLeads: number
    activeLeads: number
    conversionRate: number
  } | null> {
    try {
      const analytics = await this.getAnalytics()
      if (!analytics) return null

      const totalLeads = analytics.total_leads
      const activeLeads = analytics.connected_leads + analytics.responded_leads + analytics.booked_leads
      const conversionRate = totalLeads > 0 ? Math.round((analytics.closed_leads / totalLeads) * 100) : 0

      return {
        totalLeads,
        activeLeads,
        conversionRate
      }
    } catch (error) {
      console.error('Error in getDashboardMetrics:', error)
      return null
    }
  }

  // Update all lead statuses based on message history
  async updateAllLeadStatuses(): Promise<{
    totalLeads: number
    updatedLeads: number
    statusDistribution: { [key: string]: number }
  } | null> {
    try {
      // Get all leads and messages for this organization
      const [leads, messages] = await Promise.all([
        this.getLeads(),
        supabase
          .from('messages')
          .select('*')
          .eq('organization_id', this.organizationId)
          .in('message_type', ['connection_request', 'first_message', 'response'])
          .then(({ data, error }) => {
            if (error) throw error
            return data || []
          })
      ])

      const statusUpdates = []
      const statusDistribution: { [key: string]: number } = {}

      for (const lead of leads) {
        const leadMessages = messages.filter(msg => 
          msg.recipient_linkedin_url === lead.linkedin_url || 
          msg.sender_linkedin_url === lead.linkedin_url
        )

        if (leadMessages.length === 0) continue

        let newStatus = lead.status
        let updates: any = {}

        // Check for first_message (CONNECTED status)
        const hasFirstMessage = leadMessages.some(msg => 
          msg.recipient_linkedin_url === lead.linkedin_url && 
          msg.message_type === 'first_message'
        )

        if (hasFirstMessage && lead.status === 'SENT') {
          newStatus = 'CONNECTED'
          updates.first_message_sent_at = leadMessages
            .filter(msg => msg.recipient_linkedin_url === lead.linkedin_url && msg.message_type === 'first_message')
            .sort((a, b) => new Date(a.message_date || '').getTime() - new Date(b.message_date || '').getTime())[0]?.message_date
        }

        // Check for responses (RESPONDED status)
        const responses = leadMessages.filter(msg => 
          msg.sender_linkedin_url === lead.linkedin_url && 
          msg.message_type === 'response'
        )

        if (responses.length > 0 && ['SENT', 'CONNECTED'].includes(newStatus)) {
          newStatus = 'RESPONDED'
        }

              // Check for multiple responses (ACTIVE status)
      if (responses.length > 1 && newStatus === 'RESPONDED') {
        newStatus = 'ACTIVE'
      }

        // Update timestamps
        const connectionRequests = leadMessages.filter(msg => 
          msg.recipient_linkedin_url === lead.linkedin_url && 
          msg.message_type === 'connection_request'
        )

        if (connectionRequests.length > 0 && !lead.connection_request_sent_at) {
          updates.connection_request_sent_at = connectionRequests
            .sort((a, b) => new Date(a.message_date || '').getTime() - new Date(b.message_date || '').getTime())[0]?.message_date
        }

        // Update last_contact_at
        const latestMessage = leadMessages
          .sort((a, b) => new Date(b.message_date || '').getTime() - new Date(a.message_date || '').getTime())[0]

        if (latestMessage) {
          updates.last_contact_at = latestMessage.message_date
        }

        // Only update if status changed or timestamps need updating
        if (newStatus !== lead.status || Object.keys(updates).length > 0) {
          statusUpdates.push({
            id: lead.id,
            status: newStatus,
            ...updates,
            updated_at: new Date().toISOString()
          })
        }

        // Count status distribution
        statusDistribution[newStatus] = (statusDistribution[newStatus] || 0) + 1
      }

      // Batch update the leads
      if (statusUpdates.length > 0) {
        const { error } = await supabase
          .from('leads')
          .upsert(statusUpdates, { onConflict: 'id' })

        if (error) {
          console.error('Error updating leads:', error)
          return null
        }
      }

      return {
        totalLeads: leads.length,
        updatedLeads: statusUpdates.length,
        statusDistribution
      }
    } catch (error) {
      console.error('Error in updateAllLeadStatuses:', error)
      return null
    }
  }
}

// Helper function
export const createLinkedInService = (organizationId: string) => {
  return new LinkedInService(organizationId)
} 