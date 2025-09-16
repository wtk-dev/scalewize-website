'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { ArrowRight, Shield, Zap, Users, BarChart3, Clock, DollarSign, TrendingUp, MessageSquare, UserCheck, Settings, Play, Star, CheckCircle } from 'lucide-react'
import CustomerLogos from '@/components/CustomerLogos'
import AIAdoptionProgram from '@/components/AIAdoptionProgram'

// Particle component for the animation
const Particle = ({ delay, startX, startY, targetX, targetY }: {
  delay: number
  startX: number
  startY: number
  targetX: number
  targetY: number
}) => {
  return (
    <motion.div
      className="absolute w-2.5 h-2.5 rounded-full opacity-0"
      style={{
        background: '#595F39',
        boxShadow: '0 0 6px #595F39, 0 0 12px #595F39',
      }}
      initial={{
        x: startX,
        y: startY,
        opacity: 0,
        scale: 0,
      }}
      animate={{
        x: targetX,
        y: targetY,
        opacity: [0, 0.8, 0],
        scale: [0, 1.2, 0],
      }}
      transition={{
        duration: Math.random() * 2 + 3, // Random duration between 3-5 seconds
        delay: delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 4 + 1, // Random delay between 1-5 seconds
        ease: "easeInOut",
      }}
    />
  )
}

// Floating particle background
const ParticleField = ({ videoRef }: { videoRef: React.RefObject<HTMLDivElement | null> }) => {
  const [particles, setParticles] = useState<Array<{
    id: number
    delay: number
    startX: number
    startY: number
    targetX: number
    targetY: number
  }>>([])

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = []
      for (let i = 0; i < 15; i++) {
        newParticles.push({
          id: i,
          delay: Math.random() * 2,
          startX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
          startY: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          targetX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
          targetY: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
        })
      }
      setParticles(newParticles)
    }

    generateParticles()
    const interval = setInterval(generateParticles, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          delay={particle.delay}
          startX={particle.startX}
          startY={particle.startY}
          targetX={particle.targetX}
          targetY={particle.targetY}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef<HTMLDivElement>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Image
                src="/henly_ai_logo.png"
                alt="Henly AI"
                width={200}
                height={45}
                className="h-12 w-auto"
                priority
              />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#ai-adoption-program" className="text-gray-800 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors">
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

      {/* Particle Animation Background */}
      <ParticleField videoRef={videoRef} />

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
              <span className="block text-gray-900 mb-3 font-extralight">Make AI</span>
              <span className="block font-normal bg-gradient-to-r from-[#595F39] via-[#7A8B5A] to-[#9C8B5E] bg-clip-text text-transparent">
                work for you
              </span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-xl sm:text-2xl text-gray-900 max-w-4xl mx-auto leading-relaxed font-light mb-10"
            >
              All-in-one secure AI platform, uniting your systems, knowledge, and people.
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
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Link 
                  href="#ai-adoption-program" 
                  className="inline-flex items-center text-gray-800 hover:text-gray-900 px-12 py-4 rounded-2xl text-lg font-medium transition-all duration-500 ease-out border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50"
                >
                  View Program
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Enhanced Video Demo Section */}
          <motion.div
            ref={videoRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative mb-20"
          >
            {/* Enhanced Ambient Glow */}
            <div className="absolute inset-0 rounded-3xl blur-3xl scale-110 animate-pulse" style={{ background: 'rgba(89, 95, 57, 0.1)' }} />
            <div className="absolute inset-0 rounded-2xl blur-2xl scale-105" style={{ background: 'rgba(89, 95, 57, 0.05)' }} />
            
            {/* Video Container */}
            <div className="relative w-full max-w-4xl mx-auto bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
              <div className="aspect-[11/8] relative">
                {/* Video */}
                {!videoError && (
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    onLoadedData={() => {
                      console.log('Video loaded successfully')
                      setIsVideoLoaded(true)
                    }}
                    onError={(e) => {
                      console.error('Video loading error:', e)
                      setVideoError(true)
                    }}
                    onCanPlay={() => {
                      console.log('Video can play')
                      setIsVideoLoaded(true)
                    }}
                  >
                    <source src="/chatbot_demo_video.mov" type="video/quicktime" />
                    <source src="/chatbot_demo_video.mp4" type="video/mp4" />
                    <source src="/chatbot_demo_video.webm" type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                )}
                
                {/* Loading state or video placeholder */}
                {(!isVideoLoaded || videoError) && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-[rgba(89,95,57,0.2)] flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ backgroundColor: '#595F39' }}>
                        <Play className="w-10 h-10 ml-1" fill="white" />
                      </div>
                      <p className="text-xl font-medium mb-3">Henly AI Demo</p>
                      <p className="text-gray-200 text-base">
                        {videoError ? 'Video unavailable - Click to view demo' : 'Loading demo video...'}
                      </p>
                      {videoError && (
                        <button 
                          onClick={() => window.open('https://github.com/scalewizeai/scalewize-website/blob/main/public/chatbot_demo_video.mov', '_blank')}
                          className="mt-6 px-8 py-3 rounded-xl text-white font-medium transition-colors hover:opacity-80"
                          style={{ backgroundColor: '#595F39' }}
                        >
                          View Demo Video
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Enhanced Video Controls Overlay */}
              {isVideoLoaded && !videoError && (
                <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-sm rounded-xl p-3 flex items-center space-x-3 max-w-xs">
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#595F39' }} />
                  <span className="text-white text-sm font-medium">Live Demo</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Customer Logos Section */}
      <CustomerLogos />

      {/* AI Adoption Program Section */}
      <AIAdoptionProgram />      {/* Enhanced CTA Section */}
      <section id="book-call" className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#595F39' }}>
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="text-4xl sm:text-5xl font-light text-white mb-6 leading-tight">
              Get Started Today
            </h2>
            <p className="text-xl sm:text-2xl text-white/90 mb-12 leading-relaxed font-light max-w-3xl mx-auto">
              Book a free workflow & AI readiness audit for your business today
            </p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Link 
                href="#book-call" 
                className="inline-flex items-center bg-white hover:bg-gray-50 px-12 py-5 rounded-2xl text-xl font-medium transition-all duration-500 ease-out shadow-xl hover:shadow-2xl"
                style={{ color: '#595F39' }}
              >
                Book Now
                <ArrowRight className="ml-4 h-6 w-6" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Performance Stats */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="text-4xl sm:text-5xl font-light mb-6">WORLD-CLASS</h2>
            <p className="text-xl sm:text-2xl text-gray-200 mb-20 font-light">Agents & automations that improve your bottom line</p>
          
            <div className="grid md:grid-cols-3 gap-16">
              {[
                { value: "20K", label: "Hours Saved Annually", icon: Clock },
                { value: "$13K", label: "Monthly Savings", icon: DollarSign },
                { value: "8X", label: "Productivity Increase", icon: TrendingUp }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="text-center group"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#9C8B5E20' }}>
                    <stat.icon className="w-8 h-8" style={{ color: '#9C8B5E' }} />
                  </div>
                  <div className="text-6xl sm:text-7xl font-light mb-6" style={{ color: '#9C8B5E' }}>{stat.value}</div>
                  <p className="text-gray-200 text-lg font-light">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Vision & Mission */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center md:text-left"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-8 mx-auto md:mx-0" style={{ backgroundColor: '#595F3920' }}>
                <Star className="w-8 h-8" style={{ color: '#595F39' }} />
              </div>
              <h3 className="text-3xl sm:text-4xl font-light text-gray-900 mb-8">Our Vision</h3>
              <p className="text-xl text-gray-900 leading-relaxed font-light">
                Accelerate business growth with AI solutions that cut complexity, boost performance, and scale with you
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center md:text-left"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-8 mx-auto md:mx-0" style={{ backgroundColor: '#9C8B5E20' }}>
                <CheckCircle className="w-8 h-8" style={{ color: '#9C8B5E' }} />
              </div>
              <h3 className="text-3xl sm:text-4xl font-light text-gray-900 mb-8">Our Mission</h3>
              <p className="text-xl text-gray-900 leading-relaxed font-light">
                Make automation a reality, helping companies worldwide unlock new levels of efficiency and sustainable growth
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-16">
            <div className="col-span-2">
              <div className="flex items-center mb-8">
                <Image src="/henly_logo.png" alt="Henly AI Logo" width={48} height={48} className="h-12 w-12" />
                <span className="ml-4 text-3xl font-light">Henly AI</span>
              </div>
              <p className="text-gray-300 mb-8 leading-relaxed font-light text-lg">
                Your vision, our expertise. We customize AI solutions to meet your everyday challenges—delivering faster results and freeing you to focus on what really matters.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-8 text-xl">Locations</h4>
              <div className="space-y-4 text-gray-300 font-light text-lg">
                <p>Calgary, Canada</p>
                <p>Copenhagen, Denmark</p>
                <p>Toronto, Canada</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-8 text-xl">Newsletter</h4>
              <p className="text-gray-300 mb-8 font-light text-lg">START UNLOCKING TIME TODAY!</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Email*" 
                  className="flex-1 px-6 py-4 bg-gray-800 border border-gray-700 rounded-l-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 text-lg"
                  style={{ '--tw-ring-color': '#595F39' } as React.CSSProperties}
                />
                <button className="px-8 py-4 rounded-r-xl text-white font-medium transition-colors hover:opacity-90 text-lg" style={{ backgroundColor: '#595F39' }}>
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-300 text-lg">
            © 2024 Henly AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
