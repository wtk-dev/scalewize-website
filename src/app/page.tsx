'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { ArrowRight, Shield, Zap, Users, BarChart3, Clock, DollarSign, TrendingUp, MessageSquare, UserCheck, Settings, Play } from 'lucide-react'

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
    startX: number
    startY: number
    delay: number
  }>>([])
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 })
  const [isInHeroSection, setIsInHeroSection] = useState(true)

  useEffect(() => {
    // Check if we're in the hero section
    const checkHeroSection = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop
      const heroHeight = window.innerHeight
      setIsInHeroSection(scrollY < heroHeight * 0.8) // Hide particles when 80% scrolled past hero
    }

    // Set fixed target position (center of screen, roughly where video will be)
    const setFixedTarget = () => {
      setTargetPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      })
    }

    // Generate particles that start from left and right edges only
    const generateParticles = () => {
      const newParticles = Array.from({ length: 15 }, (_, i) => {
        // Only spawn from left (0) or right (1) sides
        const side = Math.random() < 0.5 ? 0 : 1
        let startX, startY
        
        if (side === 0) {
          // Left side - more sporadic positioning
          startX = -30 - Math.random() * 20
          startY = Math.random() * window.innerHeight
        } else {
          // Right side - more sporadic positioning
          startX = window.innerWidth + 30 + Math.random() * 20
          startY = Math.random() * window.innerHeight
        }

        return {
          id: i + Date.now(), // Unique ID to force re-render
          startX,
          startY,
          delay: Math.random() * 8, // Stagger over 8 seconds
        }
      })
      setParticles(newParticles)
    }

    // Initialize once
    setFixedTarget()
    generateParticles()
    checkHeroSection()
    
    // Add scroll listener to check hero section
    const handleScroll = () => {
      checkHeroSection()
    }
    
    // Only regenerate particles on window resize
    const handleResize = () => {
      setFixedTarget()
      generateParticles()
      checkHeroSection()
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Regenerate particles periodically with more sporadic timing
    const interval = setInterval(generateParticles, 6000) // Every 6 seconds

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      clearInterval(interval)
    }
  }, [])

  // Don't render particles if not in hero section
  if (!isInHeroSection) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          delay={particle.delay}
          startX={particle.startX}
          startY={particle.startY}
          targetX={targetPosition.x}
          targetY={targetPosition.y}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const videoRef = useRef<HTMLDivElement | null>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 border-b bg-white/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Image
                src="/henly_ai_cover_logo.png"
                alt="Henly AI"
                width={200}
                height={45}
                className="h-12 w-auto"
                priority
              />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#solutions" className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors">
                Solutions
              </Link>
              <Link href="#results" className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors">
                Results
              </Link>
              <Link href="#blog" className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors">
                Blog
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors">
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
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-amber-50/30" style={{ background: 'linear-gradient(135deg, #f8f7f4 0%, #f0ede8 100%)' }} />
        
        <div className="relative z-20 max-w-7xl mx-auto text-center">
          {/* Headlines */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-20"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light mb-8 leading-[1.1] tracking-tight pb-4">
              <span className="block text-gray-900 mb-2 font-extralight">Make AI</span>
              <span className="block font-normal bg-gradient-to-r from-[#595F39] to-[#9C8B5E] bg-clip-text text-transparent">
                work for you
              </span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light"
            >
              All-in-one secure AI platform, uniting your systems, knowledge, and people.
            </motion.p>
          </motion.div>

          {/* Video Demo Section */}
          <motion.div
            ref={videoRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative mb-16"
          >
            {/* Ambient Glow */}
            <div className="absolute inset-0 rounded-3xl blur-3xl scale-110 animate-pulse" style={{ background: 'rgba(89, 95, 57, 0.2)' }} />
            <div className="absolute inset-0 rounded-2xl blur-2xl scale-105" style={{ background: 'rgba(89, 95, 57, 0.1)' }} />
            
            {/* Video Container */}
            <div className="relative w-full max-w-4xl mx-auto bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video relative">
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
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-green-900/20 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: '#595F39' }}>
                        <Play className="w-8 h-8 ml-1" fill="white" />
                      </div>
                      <p className="text-lg font-medium mb-2">Henly AI Demo</p>
                      <p className="text-gray-300 text-sm">
                        {videoError ? 'Video unavailable - Click to view demo' : 'Loading demo video...'}
                      </p>
                      {videoError && (
                        <button 
                          onClick={() => window.open('https://github.com/scalewizeai/scalewize-website/blob/main/public/chatbot_demo_video.mov', '_blank')}
                          className="mt-4 px-6 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-80"
                          style={{ backgroundColor: '#595F39' }}
                        >
                          View Demo Video
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Video Controls Overlay */}
              {isVideoLoaded && !videoError && (
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-2 flex items-center space-x-2 max-w-xs">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#595F39' }} />
                  <span className="text-white text-xs font-medium">Live Demo</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-12"
          >
            <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed mb-8 font-light">
              At Henly AI, our mission is to simplify the power of artificial intelligence for our clients — 
              delivering tailored, human-centric solutions that save time, maximize operational efficiency, and 
              provide measurable results.
            </p>
            
            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Link 
                href="#book-call" 
                className="inline-flex items-center text-white px-8 py-3 rounded-xl text-base font-medium transition-all duration-500 ease-out shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#595F39' }}
              >
                Book a Call
                <ArrowRight className="ml-3 h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Secondary Mission */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="text-3xl sm:text-4xl font-light text-gray-900 mb-8 leading-tight">
              We put customers first, ensuring every journey is seamless
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed font-light">
              Offering innovative AI at a fraction of traditional costs.
          </p>
          </motion.div>
        </div>
      </section>

      {/* Time is Money Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extralight mb-8 leading-tight tracking-tight">
              <span className="block text-gray-900 mb-2 font-extralight">TIME IS</span>
              <span className="block mb-2 font-light" style={{ color: '#595F39' }}>MONEY,</span>
              <span className="block text-gray-900 font-extralight">SAVE BOTH</span>
          </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              Henly AI empowers clients to navigate AI with ease — delivering efficient, cost-effective solutions 
            and delightful customer experiences, always putting people first
          </p>
          </motion.div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6">
              Solutions that <span style={{ color: '#595F39' }}>scale</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Comprehensive AI automation across every aspect of your business
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[
               {
                 icon: TrendingUp,
                 title: "Sales",
                 color: "#595F39",
                 problem: "Generating qualified leads at scale and running high-conversion outreach is time-consuming.",
                 solution: "We source thousands of verified prospects based on your Ideal Client Profile, then run targeted email campaigns—minimal setup, maximum impact.",
                 impact: "Accelerated pipeline growth, higher email open rates, and more closed deals."
               },
               {
                 icon: MessageSquare,
                 title: "Marketing",
                 color: "#9C8B5E",
                 problem: "Generic campaigns waste budget. Content generation lacks personalization.",
                 solution: "AI-powered audience insights personalize messaging and timing for maximum engagement.",
                 impact: "Better click-through rates, higher ROI, stronger brand engagement."
               },
               {
                 icon: Users,
                 title: "Support",
                 color: "#595F39",
                 problem: "Manual support processes create bottlenecks and inconsistent experiences.",
                 solution: "AI chatbots handle basic issues intelligently, route complex cases to specialists.",
                 impact: "Quicker resolution times, higher satisfaction scores, significant cost savings."
               },
               {
                 icon: UserCheck,
                 title: "Talent",
                 color: "#9C8B5E",
                 problem: "Manual screening delays hiring top candidates in competitive markets.",
                 solution: "AI-powered candidate screening and automated interview scheduling.",
                 impact: "Faster hiring cycles, improved candidate quality, reduced recruitment costs."
               },
               {
                 icon: Settings,
                 title: "Operations",
                 color: "#595F39",
                 problem: "Complex processes slow product delivery and create inefficiencies.",
                 solution: "Workflow automation and predictive analytics optimize supply chains and operations.",
                 impact: "Shortened turnaround, fewer bottlenecks, consistent output quality."
               },
               {
                 icon: DollarSign,
                 title: "Finance",
                 color: "#9C8B5E",
                 problem: "Tedious invoicing and error-prone reconciliations drain resources.",
                 solution: "Automated billing systems and real-time financial dashboards with AI insights.",
                 impact: "Reduced processing time, fewer errors, stronger cash flow oversight."
               }
             ].map((solution, index) => (
               <motion.div
                 key={solution.title}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                 whileHover={{ y: -4, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }}
                 className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 ease-out border border-gray-100"
               >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                  style={{ backgroundColor: `${solution.color}20` }}
                >
                  <solution.icon className="h-8 w-8" style={{ color: solution.color }} />
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-6">{solution.title}</h3>
              <div className="space-y-4">
                <div>
                    <h4 className="font-medium text-gray-900 mb-2 text-sm uppercase tracking-wide">Problem</h4>
                    <p className="text-gray-600 text-sm leading-relaxed font-light">{solution.problem}</p>
                </div>
                <div>
                    <h4 className="font-medium text-gray-900 mb-2 text-sm uppercase tracking-wide">Solution</h4>
                    <p className="text-gray-600 text-sm leading-relaxed font-light">{solution.solution}</p>
                </div>
                <div>
                    <h4 className="font-medium text-gray-900 mb-2 text-sm uppercase tracking-wide">Impact</h4>
                    <p className="text-gray-600 text-sm leading-relaxed font-light">{solution.impact}</p>
              </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="book-call" className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#595F39' }}>
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="text-4xl sm:text-5xl font-light text-white mb-6 leading-tight">
            Get Started Today
          </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed font-light">
            Book a free workflow & AI readiness audit for your business today
          </p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
          <Link 
            href="#book-call" 
                className="inline-flex items-center bg-white hover:bg-gray-50 px-10 py-4 rounded-2xl text-lg font-medium transition-all duration-500 ease-out shadow-lg hover:shadow-xl"
                style={{ color: '#595F39' }}
          >
            Book Now
                <ArrowRight className="ml-3 h-5 w-5" />
          </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Performance Stats */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="text-4xl sm:text-5xl font-light mb-4">WORLD-CLASS</h2>
            <p className="text-xl text-gray-300 mb-16 font-light">Agents & automations that improve your bottom line</p>
          
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { value: "20K", label: "Hours Saved Annually" },
                { value: "$13K", label: "Monthly Savings" },
                { value: "8X", label: "Productivity Increase" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="text-center"
                >
                  <div className="text-6xl sm:text-7xl font-light mb-4" style={{ color: '#9C8B5E' }}>{stat.value}</div>
                  <p className="text-gray-300 text-lg font-light">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center md:text-left"
            >
              <h3 className="text-3xl font-light text-gray-900 mb-6">Our Vision</h3>
              <p className="text-lg text-gray-600 leading-relaxed font-light">
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
              <h3 className="text-3xl font-light text-gray-900 mb-6">Our Mission</h3>
              <p className="text-lg text-gray-600 leading-relaxed font-light">
                Make automation a reality, helping companies worldwide unlock new levels of efficiency and sustainable growth
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2">
              <div className="flex items-center mb-6">
                <Image src="/henly_logo.png" alt="Henly AI Logo" width={48} height={48} className="h-10 w-10" />
                <span className="ml-3 text-2xl font-light">Henly AI</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed font-light">
                Your vision, our expertise. We customize AI solutions to meet your everyday challenges—delivering faster results and freeing you to focus on what really matters.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-6 text-lg">Locations</h4>
              <div className="space-y-3 text-gray-400 font-light">
                <p>Calgary, Canada</p>
                <p>Copenhagen, Denmark</p>
                <p>Toronto, Canada</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-6 text-lg">Newsletter</h4>
              <p className="text-gray-400 mb-6 font-light">START UNLOCKING TIME TODAY!</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Email*" 
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#595F39' } as React.CSSProperties}
                />
                <button className="px-6 py-3 rounded-r-xl text-white font-medium transition-colors" style={{ backgroundColor: '#595F39' }}>
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            © 2024 Henly AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
