import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Shield, Zap, Users, BarChart3, Clock, DollarSign, TrendingUp, MessageSquare, UserCheck, Settings } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ScaleWize AI
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI THAT WORKS FOR YOU
        </p>
        <div className="space-y-4">
          <a 
            href="/debug" 
            className="block text-blue-600 hover:text-blue-800 underline"
          >
            Debug Page
          </a>
          <a 
            href="/test" 
            className="block text-blue-600 hover:text-blue-800 underline"
          >
            Test Page
          </a>
        </div>
      </div>
    </div>
  )
}
