'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import CustomerLogos from '@/components/CustomerLogos'
import IcosahedronNetwork from "@/components/animations/IcosahedronNetwork"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Image
                src="/scalewize_cover_logo.png"
                alt="ScaleWize AI"
                width={200}
                height={45}
                className="h-12 w-auto"
                priority
              />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#solutions" className="text-gray-800 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors">
                Solutions
              </Link>
              <Link href="#results" className="text-gray-800 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors">
                Results
              </Link>
              <Link href="#blog" className="text-gray-800 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors">
                Blog
              </Link>
              <Link href="/login" className="text-gray-800 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors">
                Log In
              </Link>
              <Link 
                href="#book-call" 
                className="text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#595F39' }}
              >
                Book a Call
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Enhanced Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-amber-50/20" style={{ background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 50%, #f8f7f4 100%)' }} />
        
        <div className="relative z-20 max-w-7xl mx-auto text-center">
          {/* Enhanced Headlines */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-24"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light mb-8 leading-[1.1] tracking-tight pb-4">
              <span className="block text-gray-900 mb-3 font-extralight">Build Your</span>
              <span className="block font-normal bg-gradient-to-r from-[#595F39] via-[#7A8B5A] to-[#9C8B5E] bg-clip-text text-transparent">
                Team
              </span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-xl sm:text-2xl text-gray-900 max-w-4xl mx-auto leading-relaxed font-light mb-10"
            >
              We build custom AI agents and intelligent workflow automations, for business efficiency
            </motion.p>

            {/* Enhanced CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Link 
                  href="#book-call" 
                  className="inline-flex items-center text-white px-12 py-4 rounded-2xl text-lg font-medium transition-all duration-500 ease-out shadow-xl hover:shadow-2xl"
                  style={{ backgroundColor: '#595F39' }}
                >
                  Book a Call
                  <svg className="ml-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Link 
                  href="#solutions" 
                  className="inline-flex items-center text-gray-800 hover:text-gray-900 px-12 py-4 rounded-2xl text-lg font-medium transition-all duration-500 ease-out border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50"
                >
                  View Solutions
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3D Animation Section - Full Width */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-amber-50/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-light text-gray-900 mb-6">
              Integrated and Collaborative AI Agents
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI agents work together seamlessly, orbiting around a central intelligence core
            </p>
          </motion.div>

          {/* 3D Animation Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            {/* Enhanced Ambient Glow */}
            <div className="absolute inset-0 rounded-3xl blur-3xl scale-110 animate-pulse" style={{ background: "rgba(89, 95, 57, 0.1)" }} />
            <div className="absolute inset-0 rounded-2xl blur-2xl scale-105" style={{ background: "rgba(89, 95, 57, 0.05)" }} />
            
            {/* Animation Container */}
            <div className="relative w-full max-w-6xl mx-auto bg-gradient-to-br from-white via-gray-50 to-amber-50/30 rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
              <div className="aspect-[16/9] relative">
                <IcosahedronNetwork />
                
                {/* Network Info Overlay */}
                <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 max-w-xs shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: "#595F39" }} />
                    <span className="text-gray-800 text-sm font-medium">Build your team</span>
                  </div>
                  <p className="text-gray-600 text-xs mt-1">
                    Integrated and collaborative AI agents
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Customer Logos Section */}
      <CustomerLogos />

      {/* Enhanced Solutions Section */}
      <section id="solutions" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-light text-gray-900 mb-6">
              Powerful AI Solutions for Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline operations, automate workflows, and scale your business with our comprehensive AI platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* LinkedIn Automation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#595F39' }}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">LinkedIn Automation</h3>
              <p className="text-gray-600 mb-6">
                Automate lead generation, connection requests, and follow-up messages on LinkedIn with intelligent AI agents.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>• Smart lead identification</li>
                <li>• Automated outreach sequences</li>
                <li>• Response tracking and analytics</li>
              </ul>
            </motion.div>

            {/* Workflow Automation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#595F39' }}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Workflow Automation</h3>
              <p className="text-gray-600 mb-6">
                Streamline business processes with intelligent automation that adapts to your unique workflow requirements.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>• Custom workflow design</li>
                <li>• Intelligent process optimization</li>
                <li>• Real-time monitoring and alerts</li>
              </ul>
            </motion.div>

            {/* Data Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#595F39' }}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Analytics</h3>
              <p className="text-gray-600 mb-6">
                Transform raw data into actionable insights with AI-powered analytics and predictive modeling.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>• Advanced data visualization</li>
                <li>• Predictive analytics</li>
                <li>• Custom reporting dashboards</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-light text-gray-900 mb-6">
              Proven Results for Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how our AI solutions have transformed businesses across industries.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-5xl font-light mb-4" style={{ color: '#595F39' }}>300%</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Increase in Lead Generation</h3>
              <p className="text-gray-600">Average improvement in qualified leads for our clients</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-5xl font-light mb-4" style={{ color: '#595F39' }}>85%</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Reduction in Manual Tasks</h3>
              <p className="text-gray-600">Time saved through intelligent automation</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-5xl font-light mb-4" style={{ color: '#595F39' }}>24/7</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Continuous Operation</h3>
              <p className="text-gray-600">AI agents work around the clock for your business</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="book-call" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-light text-gray-900 mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              Book a free consultation to discover how our AI solutions can accelerate your growth.
            </p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <Link 
                href="#book-call" 
                className="inline-flex items-center text-white px-12 py-4 rounded-2xl text-lg font-medium transition-all duration-500 ease-out shadow-xl hover:shadow-2xl"
                style={{ backgroundColor: '#595F39' }}
              >
                Book Your Free Consultation
                <svg className="ml-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Image
                src="/scalewize_cover_logo.png"
                alt="ScaleWize AI"
                width={200}
                height={45}
                className="h-12 w-auto mb-4"
              />
              <p className="text-gray-400 text-sm">
                Building the future of AI-powered business automation.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Solutions</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#solutions" className="hover:text-white transition-colors">LinkedIn Automation</Link></li>
                <li><Link href="#solutions" className="hover:text-white transition-colors">Workflow Automation</Link></li>
                <li><Link href="#solutions" className="hover:text-white transition-colors">Data Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#results" className="hover:text-white transition-colors">Results</Link></li>
                <li><Link href="#blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#book-call" className="hover:text-white transition-colors">Book a Call</Link></li>
                <li><Link href="#book-call" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 ScaleWize AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
