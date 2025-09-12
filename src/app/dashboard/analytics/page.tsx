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
  const chatbotMetrics = [
    { date: '2024-01-01', sessions: 45, messages: 234, tokens: 12340 },
    { date: '2024-01-02', sessions: 52, messages: 289, tokens: 15670 },
    { date: '2024-01-03', sessions: 48, messages: 267, tokens: 14230 },
    { date: '2024-01-04', sessions: 61, messages: 345, tokens: 18920 },
    { date: '2024-01-05', sessions: 55, messages: 298, tokens: 16240 },
    { date: '2024-01-06', sessions: 67, messages: 378, tokens: 20150 },
    { date: '2024-01-07', sessions: 73, messages: 412, tokens: 22480 },
  ]

  const topChatbotTopics = [
    { topic: 'Product Information', count: 234, percentage: 28 },
    { topic: 'Technical Support', count: 189, percentage: 23 },
    { topic: 'Pricing Questions', count: 156, percentage: 19 },
    { topic: 'Account Management', count: 123, percentage: 15 },
    { topic: 'General Inquiries', count: 98, percentage: 12 },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Track performance across all your AI automation tools
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Connection Rate
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {detailedData?.connectionRate || 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Response Rate
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {detailedData?.responseRate || 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Conversations
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {detailedData?.activeConversations || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Avg Messages/Lead
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {detailedData?.avgMessagesPerLead || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LinkedIn Sales Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">LinkedIn Sales Performance</h3>
          <div className="space-y-4">
            {linkedinMetrics.length > 0 ? (
              linkedinMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(metric.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{metric.leads}</div>
                      <div className="text-xs text-gray-500">Leads</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{metric.messages}</div>
                      <div className="text-xs text-gray-500">Messages</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{metric.replies}</div>
                      <div className="text-xs text-gray-500">Replies</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No LinkedIn data available
              </div>
            )}
          </div>
        </div>

        {/* Chatbot Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Chatbot Performance</h3>
          <div className="space-y-4">
            {chatbotMetrics.slice(-7).map((metric, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {new Date(metric.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{metric.sessions}</div>
                    <div className="text-xs text-gray-500">Sessions</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{metric.messages}</div>
                    <div className="text-xs text-gray-500">Messages</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{metric.tokens.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Tokens</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LinkedIn Lead Sources */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">LinkedIn Lead Sources</h3>
          <div className="space-y-4">
            {leadSources.length > 0 ? (
              leadSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">{source.source}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{source.count}</div>
                      <div className="text-xs text-gray-500">leads</div>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8">{source.percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No lead source data available
              </div>
            )}
          </div>
        </div>

        {/* Chatbot Topics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Chatbot Topics</h3>
          <div className="space-y-4">
            {topChatbotTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">{topic.topic}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{topic.count}</div>
                    <div className="text-xs text-gray-500">queries</div>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${topic.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-8">{topic.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed LinkedIn Insights */}
      {detailedData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connection & Response Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Connection & Response Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Connection Requests Sent</span>
                <span className="font-semibold">{detailedData.connectionRequestsSent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Connections Made</span>
                <span className="font-semibold text-green-600">{detailedData.connectionsMade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Responses Received</span>
                <span className="font-semibold text-green-600">{detailedData.responses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Conversations</span>
                <span className="font-semibold text-purple-600">{detailedData.activeConversations}</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Connection Rate</span>
                <span className="font-semibold text-green-600">{detailedData.connectionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Response Rate</span>
                <span className="font-semibold text-green-600">{detailedData.responseRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Conversation Rate</span>
                <span className="font-semibold text-purple-600">{detailedData.activeConversationRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Messages per Lead</span>
                <span className="font-semibold text-gray-900">{detailedData.avgMessagesPerLead}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {linkedinMetrics.reduce((sum, day) => sum + day.leads, 0)}
            </div>
            <div className="text-sm text-gray-600">LinkedIn Leads</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {chatbotMetrics.reduce((sum, day) => sum + day.sessions, 0)}
            </div>
            <div className="text-sm text-gray-600">Chat Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {chatbotMetrics.reduce((sum, day) => sum + day.tokens, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Tokens Used</div>
          </div>
        </div>
      </div>
    </div>
  )
} 