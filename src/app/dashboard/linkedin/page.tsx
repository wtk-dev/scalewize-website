'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createLinkedInService } from '@/lib/linkedin-service'
import { Lead } from '@/types/database'
import { LinkedInLead, LinkedInAnalytics } from '@/lib/linkedin-service'
import { Users, MessageSquare, TrendingUp, Filter, Plus, Search, Mail, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function LinkedInPage() {
  const { organization } = useAuth()
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [leads, setLeads] = useState<LinkedInLead[]>([])
  const [analytics, setAnalytics] = useState<LinkedInAnalytics | null>(null)
  const [weeklyData, setWeeklyData] = useState<Array<{
    week_start: string
    messages_sent: number
    messages_received: number
    connections_made: number
  }>>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const linkedinService = organization ? createLinkedInService(organization.id) : null

  useEffect(() => {
    if (linkedinService && organization) {
      loadData()
    }
  }, [organization?.id]) // Only reload when organization ID changes

  const loadData = async () => {
    if (!linkedinService) return

    setLoading(true)
    try {
      const [leadsData, analyticsData, weeklyData] = await Promise.all([
        linkedinService.getLeads(selectedStatus),
        linkedinService.getAnalytics(),
        linkedinService.getWeeklyMessageData()
      ])

      setLeads(leadsData)
      setAnalytics(analyticsData)
      setWeeklyData(weeklyData)
    } catch (error) {
      console.error('Error loading LinkedIn data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Detailed LinkedIn stats based on real analytics data
  const linkedinStats = [
    {
      name: 'Connection Rate',
      value: analytics?.total_leads ? `${Math.round((analytics.connected_leads / analytics.total_leads) * 100)}%` : '0%',
      change: '+2%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Response Rate',
      value: analytics?.total_leads ? `${Math.round(((analytics.responded_leads + analytics.booked_leads + analytics.closed_leads) / analytics.total_leads) * 100)}%` : '0%',
      change: '+5%',
      changeType: 'positive',
      icon: MessageSquare,
    },
    {
      name: 'Active Conversations',
      value: analytics ? `${analytics.responded_leads + analytics.booked_leads}` : '0',
      change: '+3',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      name: 'Messages Sent',
      value: analytics ? `${analytics.connection_requests_sent + analytics.first_messages_sent}` : '0',
      change: '+8',
      changeType: 'positive',
      icon: MessageSquare,
    },
  ]

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'SENT':
        return <Mail style="color: #595F39"" />
      case 'CONNECTED':
        return <CheckCircle style="color: #595F39"" />
      case 'RESPONDED':
        return <CheckCircle style="color: #595F39"" />
      case 'BOOKED':
        return <CheckCircle className="h-4 w-4 text-purple-600" />
      case 'CLOSED':
        return <CheckCircle className="h-4 w-4 text-indigo-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'SENT':
        return 'style="backgroundColor: rgba(89, 95, 57, 0.2)" style="color: rgba(89, 95, 57, 0.8)"'
      case 'CONNECTED':
        return 'style="backgroundColor: rgba(89, 95, 57, 0.2)" style="color: rgba(89, 95, 57, 0.8)"'
      case 'RESPONDED':
        return 'style="backgroundColor: rgba(89, 95, 57, 0.2)" style="color: rgba(89, 95, 57, 0.8)"'
      case 'BOOKED':
        return 'bg-purple-100 text-purple-800'
      case 'CLOSED':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'SENT':
        return 'Connection Sent'
      case 'CONNECTED':
        return 'Connected'
      case 'RESPONDED':
        return 'Responded'
      case 'BOOKED':
        return 'Meeting Booked'
      case 'CLOSED':
        return 'Deal Closed'
      default:
        return 'Pending'
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      (lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (lead.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

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
            <div key={`skeleton-${i}`} className="bg-white overflow-hidden shadow rounded-lg">
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LinkedIn Sales Agent</h1>
            <p className="text-gray-600 mt-1">
              Automated lead identification and outreach for {organization?.name}
            </p>
          </div>
          <button style="backgroundColor: #595F39" hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {linkedinStats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon style="color: #595F39"" />
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

      {/* Detailed Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connection Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Connection Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Requests Sent</span>
                <span className="font-semibold text-gray-900">{analytics.connection_requests_sent || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Connections Made</span>
                <span style="color: #595F39"">{analytics.connected_leads || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Connection Rate</span>
                <span style="color: #595F39"">
                  {analytics.total_leads ? `${Math.round((analytics.connected_leads / analytics.total_leads) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Response Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Response Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Responses Received</span>
                <span style="color: #595F39"">{analytics.responses_received || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Response Rate</span>
                <span style="color: #595F39"">
                  {analytics.total_leads ? `${Math.round(((analytics.responded_leads + analytics.booked_leads + analytics.closed_leads) / analytics.total_leads) * 100)}%` : '0%'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Conversations</span>
                <span className="font-semibold text-purple-600">{analytics.responded_leads + analytics.booked_leads || 0}</span>
              </div>
            </div>
          </div>

          {/* Message Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Message Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Messages</span>
                <span className="font-semibold text-gray-900">{analytics.total_messages || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Messages Sent</span>
                <span className="font-semibold text-gray-900">{(analytics.connection_requests_sent || 0) + (analytics.first_messages_sent || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg per Lead</span>
                <span className="font-semibold text-gray-900">
                  {analytics.total_leads ? Math.round((analytics.total_messages / analytics.total_leads) * 10) / 10 : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Message Activity */}
      {weeklyData.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Message Activity (Last 8 Weeks)</h3>
            <div className="grid grid-cols-8 gap-2">
              {weeklyData.map((week) => {
                const maxValue = Math.max(...weeklyData.map(w => Math.max(w.messages_sent, w.messages_received, w.connections_made)))
                return (
                  <div key={week.week_start} className="text-center">
                    <div className="text-xs text-gray-600 mb-2">{new Date(week.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    <div className="relative h-32 bg-gray-100 rounded">
                      {/* Messages sent bar */}
                      <div 
                        style="backgroundColor: #595F39" rounded-t"
                        style={{ height: `${maxValue > 0 ? (week.messages_sent / maxValue) * 100 : 0}%` }}
                      ></div>
                      {/* Messages received bar */}
                      <div 
                        style="backgroundColor: #595F39" rounded-t"
                        style={{ height: `${maxValue > 0 ? (week.messages_received / maxValue) * 100 : 0}%` }}
                      ></div>
                      {/* Connections made bar */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-purple-500 rounded-t"
                        style={{ height: `${maxValue > 0 ? (week.connections_made / maxValue) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-900 mt-1 font-medium">{week.messages_sent}</div>
                    <div className="text-xs text-gray-500">sent</div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-center space-x-6 mt-4 text-xs">
              <div className="flex items-center">
                <div style="backgroundColor: #595F39" rounded mr-2"></div>
                <span className="text-gray-600">Messages Sent</span>
              </div>
              <div className="flex items-center">
                <div style="backgroundColor: #595F39" rounded mr-2"></div>
                <span className="text-gray-600">Messages Received</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                <span className="text-gray-600">Connections Made</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Automation Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Automation Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Lead Discovery</h4>
              <span style="backgroundColor: rgba(89, 95, 57, 0.2)" style="color: rgba(89, 95, 57, 0.8)"">
                Active
              </span>
            </div>
            <p className="text-sm text-gray-600">Automatically finding new leads based on criteria</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Outreach</h4>
              <span style="backgroundColor: rgba(89, 95, 57, 0.2)" style="color: rgba(89, 95, 57, 0.8)"">
                Active
              </span>
            </div>
            <p className="text-sm text-gray-600">Sending personalized connection requests and messages</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Status Tracking</h4>
              <span style="backgroundColor: rgba(89, 95, 57, 0.2)" style="color: rgba(89, 95, 57, 0.8)"">
                Active
              </span>
            </div>
            <p className="text-sm text-gray-600">Monitoring connection status and responses</p>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Leads ({filteredLeads.length})</h3>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-[#595F39] focus:border-[#595F39]"
                />
              </div>
              {/* Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#595F39] focus:border-[#595F39]"
              >
                <option value="all">All Status</option>
                <option value="">Pending</option>
                <option value="SENT">Sent</option>
                <option value="CONNECTED">Connected</option>
                <option value="RESPONDED">Responded</option>
                <option value="BOOKED">Booked</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {loading ? 'Loading leads...' : 'No leads found'}
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div style="backgroundColor: rgba(89, 95, 57, 0.2)" flex items-center justify-center">
                            <span style="color: rgba(89, 95, 57, 0.8)"">
                              {lead.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{lead.full_name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{lead.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.industry}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(lead.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                          {getStatusText(lead.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.last_contact_at ? new Date(lead.last_contact_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button style="color: #595F39" hover:style="color: rgba(89, 95, 57, 0.9)"">View</button>
                        <button style="color: #595F39" hover:style="color: rgba(89, 95, 57, 0.9)"">Message</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 