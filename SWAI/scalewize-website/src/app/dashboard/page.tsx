'use client'

import { useAuth } from '@/contexts/AuthContext'
import { MessageSquare, Users, Zap, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { profile, organization } = useAuth()

  // Mock data - in real app, this would come from API
  const stats = [
    {
      name: 'Total Messages',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: MessageSquare,
    },
    {
      name: 'Active Users',
      value: '23',
      change: '+5%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Tokens Used',
      value: '45.2K',
      change: '+8%',
      changeType: 'positive',
      icon: Zap,
    },
    {
      name: 'Cost This Month',
      value: '$234.50',
      change: '+3%',
      changeType: 'positive',
      icon: TrendingUp,
    },
  ]

  const usagePercentage = organization 
    ? Math.round((organization.current_monthly_usage / organization.monthly_usage_limit) * 100)
    : 0

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
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
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
            {organization?.current_monthly_usage?.toLocaleString()} / {organization?.monthly_usage_limit?.toLocaleString()} tokens
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 60 ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {usagePercentage}% of your monthly limit used
        </p>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">AI Assistant</h3>
          <p className="text-sm text-gray-600">
            Chat with your organization's AI assistant. It's connected to your internal tools and databases.
          </p>
        </div>
        <div className="h-96">
          <iframe
            src={`${process.env.NEXT_PUBLIC_LIBRECHAT_URL || 'http://localhost:3080'}?org=${organization?.slug}`}
            className="w-full h-full rounded-b-lg"
            title="ScaleWize AI Chat"
            frameBorder="0"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <MessageSquare className="h-5 w-5 text-blue-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">New Chat</div>
              <div className="text-sm text-gray-500">Start a new conversation</div>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="h-5 w-5 text-green-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Invite Team</div>
              <div className="text-sm text-gray-500">Add new team members</div>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Zap className="h-5 w-5 text-purple-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">View Analytics</div>
              <div className="text-sm text-gray-500">Check usage and performance</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
} 