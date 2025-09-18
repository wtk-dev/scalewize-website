'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createLinkedInService } from '@/lib/linkedin-service'
import { TrendingUp, Users, MessageSquare, Calendar, BarChart3, PieChart } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

export default function AnalyticsPage() {
  const { organization, user, profile } = useAuth()
  const [linkedinMetrics, setLinkedinMetrics] = useState<Array<{
    date: string
    leads: number
    messages: number
    replies: number
  }>>([])
  const [leadSources, setLeadSources] = useState<Array<{
    source: string
    count: number
    percentage: number
  }>>([])
        const [detailedData, setDetailedData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const linkedinService = organization ? createLinkedInService(organization.id) : null

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Dashboard Supabase session:', session);
    });
    console.log('Dashboard AuthContext user:', user);
    console.log('Dashboard AuthContext profile:', profile);
    console.log('Dashboard AuthContext organization:', organization);
    if (linkedinService && organization) {
      loadAnalytics()
    }
  }, [organization?.id]) // Only reload when organization ID changes

  const loadAnalytics = async () => {
    if (!linkedinService) return

    setLoading(true)
    try {
      const [metricsData, sourcesData, detailedData] = await Promise.all([
        linkedinService.getDailyMetrics(7), // Last 7 days
        linkedinService.getLeadSources(),
        linkedinService.getDetailedMetrics()
      ])

      setLinkedinMetrics(metricsData)
      setLeadSources(sourcesData)
      // Store detailed data for enhanced analytics
      setDetailedData(detailedData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for other metrics (replace with real data later)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Track your LinkedIn automation performance and insights</p>
      </div>

      {/* LinkedIn Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">
                {detailedData ? detailedData.totalLeads : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Messages Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {detailedData ? detailedData.connectionRequestsSent : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {detailedData ? `${detailedData.responseRate}%` : '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Sources */}
      {leadSources.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Sources</h3>
          <div className="space-y-3">
            {leadSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{source.source}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{source.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {detailedData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Connection Rate</span>
                <span className="text-lg font-semibold text-green-600">{detailedData.connectionRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Conversations</span>
                <span className="text-lg font-semibold text-blue-600">{detailedData.activeConversations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <span className="text-lg font-semibold text-gray-900">{detailedData.avgTimeToResponse} days</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {linkedinMetrics.slice(-5).map((metric, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{metric.date}</span>
                  <div className="flex space-x-4">
                    <span className="text-sm text-blue-600">{metric.leads} leads</span>
                    <span className="text-sm text-green-600">{metric.messages} messages</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
