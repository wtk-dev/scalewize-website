'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  TrendingUp, 
  MessageSquare, 
  Users, 
  UserCheck, 
  Settings, 
  DollarSign,
  Plus,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Solution {
  id: string
  name: string
  icon: any
  color: string
  problem: string
  solution: string
  impact: string
  status: 'available' | 'coming-soon' | 'beta'
  price?: string
}

export default function ExplorePage() {
  const { organization } = useAuth()
  const [selectedSolution, setSelectedSolution] = useState<string | null>(null)

  const solutions: Solution[] = [
    {
      id: 'sales',
      name: 'Sales',
      icon: TrendingUp,
      color: '#595F39',
      problem: 'Generating qualified leads at scale and running high-conversion outreach is time-consuming.',
      solution: 'We source thousands of verified prospects based on your Ideal Client Profile, then run targeted email campaigns—minimal setup, maximum impact.',
      impact: 'Accelerated pipeline growth, higher email open rates, and more closed deals.',
      status: 'available',
      price: '$299/month'
    },
    {
      id: 'marketing',
      name: 'Marketing',
      icon: MessageSquare,
      color: '#9C8B5E',
      problem: 'Generic campaigns waste budget. Content generation.',
      solution: 'AI-powered audience insights personalize messaging and timing.',
      impact: 'Better click-through rates, higher ROI, stronger brand engagement.',
      status: 'coming-soon',
      price: '$199/month'
    },
    {
      id: 'support',
      name: 'Support',
      icon: Users,
      color: '#595F39',
      problem: 'Manual screening delays hiring top candidates.',
      solution: 'AI chatbots handle basic issues, route complex cases.',
      impact: 'Quicker resolution times, higher satisfaction scores, cost savings.',
      status: 'beta',
      price: '$149/month'
    },
    {
      id: 'talent',
      name: 'Talent',
      icon: UserCheck,
      color: '#9C8B5E',
      problem: 'Manual screening delays hiring top candidates.',
      solution: 'AI-powered audience insights personalize messaging and timing.',
      impact: 'Better click-through rates, higher ROI, stronger brand engagement.',
      status: 'coming-soon',
      price: '$249/month'
    },
    {
      id: 'operations',
      name: 'Operations',
      icon: Settings,
      color: '#595F39',
      problem: 'Complex processes slow product delivery.',
      solution: 'Workflow automation and predictive analytics optimize supply chains.',
      impact: 'Shortened turnaround, fewer bottlenecks, consistent output quality.',
      status: 'coming-soon',
      price: '$399/month'
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: DollarSign,
      color: '#9C8B5E',
      problem: 'Tedious invoicing and error-prone reconciliations.',
      solution: 'Automated billing systems and real-time financial dashboards.',
      impact: 'Reduced processing time, fewer errors, stronger cash flow oversight.',
      status: 'coming-soon',
      price: '$179/month'
    }
  ]

  const getStatusBadge = (status: Solution['status']) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Available
          </span>
        )
      case 'beta':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Beta
          </span>
        )
      case 'coming-soon':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3 mr-1" />
            Coming Soon
          </span>
        )
    }
  }

  const handleAddToTeam = (solutionId: string) => {
    // TODO: Implement add to team functionality
    console.log('Adding solution to team:', solutionId)
    setSelectedSolution(solutionId)
    
    // Simulate API call
    setTimeout(() => {
      setSelectedSolution(null)
      alert(`${solutions.find(s => s.id === solutionId)?.name} has been added to your team!`)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Explore AI Solutions</h1>
            <p className="text-gray-600 mt-2">
              Discover and add powerful AI agents to your team
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Organization</p>
            <p className="font-medium text-gray-900">{organization?.name || 'Loading...'}</p>
          </div>
        </div>
      </div>

      {/* Solutions Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {solutions.map((solution) => (
          <div key={solution.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: '#f0ede8' }}
                  >
                    <solution.icon 
                      className="h-6 w-6" 
                      style={{ color: solution.color }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{solution.name}</h3>
                    {solution.price && (
                      <p className="text-sm text-gray-600">{solution.price}</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(solution.status)}
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Problem</h4>
                  <p className="text-sm text-gray-600">{solution.problem}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                  <p className="text-sm text-gray-600">{solution.solution}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Impact</h4>
                  <p className="text-sm text-gray-600">{solution.impact}</p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-6">
                {solution.status === 'available' ? (
                  <button
                    onClick={() => handleAddToTeam(solution.id)}
                    disabled={selectedSolution === solution.id}
                    className="w-full bg-white border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {selectedSolution === solution.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Team
                      </>
                    )}
                  </button>
                ) : solution.status === 'beta' ? (
                  <button
                    onClick={() => handleAddToTeam(solution.id)}
                    disabled={selectedSolution === solution.id}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {selectedSolution === solution.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Try Beta
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-400 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed flex items-center justify-center"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Coming Soon
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How it works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">1</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Choose Solution</h4>
            <p className="text-sm text-gray-600">Browse our AI solutions and select the ones that fit your needs</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">2</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Add to Team</h4>
            <p className="text-sm text-gray-600">Click "Add to Team" to integrate the solution into your workspace</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">3</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Start Using</h4>
            <p className="text-sm text-gray-600">Configure and start using your new AI agents immediately</p>
          </div>
        </div>
      </div>
    </div>
  )
} 