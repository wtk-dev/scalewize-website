import Link from 'next/link'
import { ArrowRight, Bot, Shield, Zap, Users, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ScaleWize AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Enterprise AI Automation
            <span className="text-blue-600"> Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            ScaleWize AI provides custom chatbot solutions for businesses. 
            Connect your internal tools and databases with AI-powered automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="#features" 
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg text-lg font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ScaleWize AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for enterprise teams that need secure, scalable AI solutions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Tenant Security</h3>
              <p className="text-gray-600">
                Complete data isolation between organizations with enterprise-grade security
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Integrations</h3>
              <p className="text-gray-600">
                Connect to your internal tools and databases with n8n automation workflows
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Usage Analytics</h3>
              <p className="text-gray-600">
                Track usage, costs, and performance with detailed analytics and reporting
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 10+ enterprise clients already using ScaleWize AI
          </p>
          <Link 
            href="/signup" 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Bot className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">ScaleWize AI</span>
            </div>
            <div className="text-gray-400">
              © 2024 ScaleWize AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
