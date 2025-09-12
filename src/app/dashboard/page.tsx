'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createLinkedInService } from '@/lib/linkedin-service'
import { LinkedInAnalytics } from '@/lib/linkedin-service'
import { MessageSquare, Users, Zap, TrendingUp, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const { profile, organization } = useAuth()
  const [detailedMetrics, setDetailedMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const linkedinService = organization ? createLinkedInService(organization.id) : null

  useEffect(() => {
    if (linkedinService && organization) {
      loadDetailedData()
    }
  }, [organization?.id]) // Only reload when organization ID changes

  const loadDetailedData = async () => {
    if (!linkedinService) return

    setLoading(true)
    try {
      const metrics = await linkedinService.getDetailedMetrics()
      setDetailedMetrics(metrics)
    } catch (error) {
      console.error('Error loading detailed metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Detailed LinkedIn stats based on real data
  const stats = [
    {
      name: 'Connection Rate',
      value: detailedMetrics ? `${detailedMetrics.connectionRate}%` : '0%',
      change: '+2%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Response Rate',
      value: detailedMetrics ? `${detailedMetrics.responseRate}%` : '0%',
      change: '+5%',
      changeType: 'positive',
      icon: MessageSquare,
    },
    {
      name: 'Active Conversations',
      value: detailedMetrics ? `${detailedMetrics.activeConversations}` : '0',
      change: '+3',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      name: 'Avg Response Time',
      value: detailedMetrics ? `${detailedMetrics.avgTimeToResponse} days` : '0 days',
      change: '-1 day',
      changeType: 'positive',
      icon: Clock,
    },
  ]

  // Calculate usage percentage based on your schema
  const usagePercentage = organization 
    ? Math.round((0 / organization.monthly_token_limit) * 100) // We'll calculate actual usage later
    : 0

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
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Your AI assistant is ready to help with {organization?.name}'s automation needs.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'style="color: #595F39"' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Usage Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Monthly Usage</h3>
          <span className="text-sm text-gray-500">
            0 / {organization?.monthly_token_limit?.toLocaleString()} tokens
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 60 ? 'bg-yellow-500' : 'style="backgroundColor: #595F39"'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {usagePercentage}% of your monthly limit used
        </p>
      </div>

      {/* Services Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Chatbot Service */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">AI Chatbot</h3>
            <p className="text-sm text-gray-600">
              Your custom AI assistant connected to your business systems and databases.
            </p>
          </div>
          <div className="p-6">
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MessageSquare style="color: #595F39" mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Preview of your AI Chatbot</p>
                <Link 
                  href="/dashboard/chatbot"
                  style="backgroundColor: #595F39" hover:opacity-90"
                >
                  Open Chatbot
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* LinkedIn Sales Service */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">LinkedIn Sales Agent</h3>
            <p className="text-sm text-gray-600">
              Automated lead identification and outreach on LinkedIn.
            </p>
          </div>
          <div className="p-6">
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Users style="color: #595F39" mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {detailedMetrics ? (
                    <>
                      <span style="color: #595F39"">
                        {detailedMetrics.totalLeads}
                      </span>
                      <span className="text-sm">Total Leads</span>
                    </>
                  ) : (
                    'LinkedIn Sales Dashboard'
                  )}
                </p>
                <Link 
                  href="/dashboard/linkedin"
                  style="backgroundColor: #595F39" hover:opacity-90"
                >
                  View Leads
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed LinkedIn Metrics */}
      {detailedMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connection & Response Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Connection & Response Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Connection Requests Sent</span>
                <span className="text-lg font-semibold text-gray-900">{detailedMetrics.connectionRequestsSent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Connections Made</span>
                <span style="color: #595F39"">{detailedMetrics.connectionsMade}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Responses Received</span>
                <span style="color: #595F39"">{detailedMetrics.responses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Conversations</span>
                <span className="text-lg font-semibold text-purple-600">{detailedMetrics.activeConversations}</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Connection Rate</span>
                <span style="color: #595F39"">{detailedMetrics.connectionRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Response Rate</span>
                <span style="color: #595F39"">{detailedMetrics.responseRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Conversation Rate</span>
                <span className="text-lg font-semibold text-purple-600">{detailedMetrics.activeConversationRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Messages per Lead</span>
                <span className="text-lg font-semibold text-gray-900">{detailedMetrics.avgMessagesPerLead}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Status */}
      {detailedMetrics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pipeline Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(detailedMetrics.statusBreakdown).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{count as number}</div>
                <div className="text-sm text-gray-600 capitalize">{status.toLowerCase()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/chatbot" className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <MessageSquare style="color: #595F39" mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Start Chat</div>
              <div className="text-sm text-gray-500">Open AI chatbot</div>
            </div>
          </Link>
          
          <Link href="/dashboard/linkedin" className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Users style="color: #595F39" mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">View Leads</div>
              <div className="text-sm text-gray-500">Check LinkedIn leads</div>
            </div>
          </Link>
          
          <Link href="/dashboard/analytics" className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Zap className="h-5 w-5 text-purple-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Analytics</div>
              <div className="text-sm text-gray-500">View performance metrics</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
} 