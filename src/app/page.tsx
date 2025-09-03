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
      className="absolute w-2 h-2 bg-green-400 rounded-full opacity-0"
      style={{
        boxShadow: '0 0 6px #4ade80, 0 0 12px #4ade80',
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
        scale: [0, 1, 0],
      }}
      transition={{
        duration: 3,
        delay: delay,
        repeat: Infinity,
        repeatDelay: 2,
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

  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      startX: Math.random() * window.innerWidth,
      startY: Math.random() * window.innerHeight,
      delay: Math.random() * 5,
    }))
    setParticles(newParticles)

    // Update target position based on video position
    const updateTarget = () => {
      if (videoRef.current) {
        const rect = videoRef.current.getBoundingClientRect()
        setTargetPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        })
      }
    }

    updateTarget()
    window.addEventListener('resize', updateTarget)
    window.addEventListener('scroll', updateTarget)

    return () => {
      window.removeEventListener('resize', updateTarget)
      window.removeEventListener('scroll', updateTarget)
    }
  }, [videoRef])

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
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

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 border-b bg-white/80 backdrop-blur-sm sticky top-0">
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
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-green-50/30" />
        
        <div className="relative z-20 max-w-7xl mx-auto text-center">
          {/* Headlines */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-16"
          >
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight">
              <span className="block text-gray-900 mb-4">Make AI</span>
              <span className="block text-green-600 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                work for you
              </span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light mb-16"
            >
              All-in-one secure AI platform, uniting your systems, knowledge, and people.
            </motion.p>
          </motion.div>

          {/* Video Demo Section */}
          <motion.div
            ref={videoRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="relative mb-20"
          >
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-green-500/20 rounded-3xl blur-3xl scale-110 animate-pulse" />
            <div className="absolute inset-0 bg-green-400/10 rounded-2xl blur-2xl scale-105" />
            
            {/* Video Container */}
            <div className="relative w-full max-w-4xl mx-auto bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video relative">
                {/* Placeholder for video - will be replaced when video file is added */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-green-900/20 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Play className="w-8 h-8 ml-1" fill="white" />
                    </div>
                    <p className="text-lg font-medium mb-2">ScaleWize AI Demo</p>
                    <p className="text-gray-300 text-sm">Watch how AI connects your business systems</p>
                  </div>
                </div>
                
                {/* Uncomment when video file is added */}
                {/*
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  onLoadedData={() => setIsVideoLoaded(true)}
                >
                  <source src="/chatbot_demo_video.mov" type="video/mp4" />
                  <source src="/chatbot_demo_video.mp4" type="video/mp4" />
                </video>
                */}
              </div>
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm font-medium">Live Demo</span>
                </div>
                <div className="text-white/70 text-sm">AI-powered business automation</div>
              </div>
            </div>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
            className="mb-12"
          >
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-10">
              At ScaleWize AI, our mission is to simplify the power of artificial intelligence for our clients — 
              delivering tailored, human-centric solutions that save time, maximize operational efficiency, and 
              provide measurable results.
            </p>
            
            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="#book-call" 
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Book a Call
                <ArrowRight className="ml-3 h-5 w-5" />
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
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              We put customers first, ensuring every journey is seamless
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
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
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight tracking-tight">
              <span className="block text-gray-900 mb-2">TIME IS</span>
              <span className="block text-green-600 mb-2">MONEY,</span>
              <span className="block text-gray-900">SAVE BOTH</span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              ScaleWize AI empowers clients to navigate AI with ease — delivering efficient, cost-effective solutions 
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
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Solutions that <span className="text-green-600">scale</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive AI automation across every aspect of your business
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Sales",
                color: "#10b981",
                problem: "Generating qualified leads at scale and running high-conversion outreach is time-consuming.",
                solution: "We source thousands of verified prospects based on your Ideal Client Profile, then run targeted email campaigns—minimal setup, maximum impact.",
                impact: "Accelerated pipeline growth, higher email open rates, and more closed deals."
              },
              {
                icon: MessageSquare,
                title: "Marketing",
                color: "#059669",
                problem: "Generic campaigns waste budget. Content generation lacks personalization.",
                solution: "AI-powered audience insights personalize messaging and timing for maximum engagement.",
                impact: "Better click-through rates, higher ROI, stronger brand engagement."
              },
              {
                icon: Users,
                title: "Support",
                color: "#10b981",
                problem: "Manual support processes create bottlenecks and inconsistent experiences.",
                solution: "AI chatbots handle basic issues intelligently, route complex cases to specialists.",
                impact: "Quicker resolution times, higher satisfaction scores, significant cost savings."
              },
              {
                icon: UserCheck,
                title: "Talent",
                color: "#059669",
                problem: "Manual screening delays hiring top candidates in competitive markets.",
                solution: "AI-powered candidate screening and automated interview scheduling.",
                impact: "Faster hiring cycles, improved candidate quality, reduced recruitment costs."
              },
              {
                icon: Settings,
                title: "Operations",
                color: "#10b981",
                problem: "Complex processes slow product delivery and create inefficiencies.",
                solution: "Workflow automation and predictive analytics optimize supply chains and operations.",
                impact: "Shortened turnaround, fewer bottlenecks, consistent output quality."
              },
              {
                icon: DollarSign,
                title: "Finance",
                color: "#059669",
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
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                  style={{ backgroundColor: `${solution.color}20` }}
                >
                  <solution.icon className="h-8 w-8" style={{ color: solution.color }} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{solution.title}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Problem</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{solution.problem}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Solution</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{solution.solution}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Impact</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{solution.impact}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="book-call" className="py-24 px-4 sm:px-6 lg:px-8 bg-green-600">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Get Started Today
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Book a free workflow & AI readiness audit for your business today
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="#book-call" 
                className="inline-flex items-center bg-white text-green-600 hover:bg-gray-50 px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
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
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">WORLD-CLASS</h2>
            <p className="text-xl text-gray-300 mb-16">Agents & automations that improve your bottom line</p>
            
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
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="text-center"
                >
                  <div className="text-6xl sm:text-7xl font-bold mb-4 text-green-400">{stat.value}</div>
                  <p className="text-gray-300 text-lg">{stat.label}</p>
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
              transition={{ duration: 0.8 }}
              className="text-center md:text-left"
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Accelerate business growth with AI solutions that cut complexity, boost performance, and scale with you
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center md:text-left"
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
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
                <Image src="/scalewize_logo.png" alt="ScaleWize AI Logo" width={48} height={48} className="h-10 w-10" />
                <span className="ml-3 text-2xl font-bold">ScaleWize AI</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Your vision, our expertise. We customize AI solutions to meet your everyday challenges—delivering faster results and freeing you to focus on what really matters.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Locations</h4>
              <div className="space-y-3 text-gray-400">
                <p>Calgary, Canada</p>
                <p>Copenhagen, Denmark</p>
                <p>Toronto, Canada</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Newsletter</h4>
              <p className="text-gray-400 mb-6">START UNLOCKING TIME TODAY!</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Email*" 
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-r-xl text-white font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            © 2024 ScaleWize AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
