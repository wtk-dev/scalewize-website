import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Shield, Zap, Users, BarChart3, Clock, DollarSign, TrendingUp, MessageSquare, UserCheck, Settings } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image src="/scalewize_cover_logo.png" alt="ScaleWize AI Cover Logo" width={180} height={40} className="h-10 w-auto" priority />
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="#solutions" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Solutions
              </Link>
              <Link href="#results" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Results
              </Link>
              <Link href="#blog" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Blog
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Log In
              </Link>
              <Link href="#book-call" className="text-white px-4 py-2 rounded-md text-sm font-medium" style={{ backgroundColor: '#595F39' }}>
                Book a Call
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #f8f7f4 0%, #f0ede8 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              AI THAT
              <br />
              <span style={{ color: '#595F39' }}>WORKS</span>
              <br />
              FOR YOU
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              At ScaleWize AI, our mission is to simplify the power of artificial intelligence for our clients - 
              delivering tailored, human-centric solutions that save time, maximize operational efficiency, and 
              provide measurable results. Our commitment is to help clients navigate AI with confidence, driving 
              net-positive investment and sustainable growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="#book-call" 
                className="text-white px-8 py-4 rounded-lg text-lg font-medium inline-flex items-center"
                style={{ backgroundColor: '#595F39' }}
              >
                Book a Call
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl text-gray-700 leading-relaxed">
            We put customers first, ensuring every journey is seamless, while offering innovative AI at a fraction of traditional costs.
          </p>
        </div>
      </section>

      {/* Time is Money Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f8f7f4' }}>
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            TIME IS
            <br />
            <span style={{ color: '#595F39' }}>MONEY,</span>
            <br />
            SAVE BOTH
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ScaleWize AI empowers clients to navigate AI with ease - delivering efficient, cost-effective solutions 
            and delightful customer experiences, always putting people first
          </p>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Sales */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#f0ede8' }}>
                <TrendingUp className="h-8 w-8" style={{ color: '#595F39' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sales</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Problem</h4>
                  <p className="text-gray-600">Generating qualified leads at scale and running high-conversion outreach is time-consuming.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                  <p className="text-gray-600">We source thousands of verified prospects based on your Ideal Client Profile, then run targeted email campaigns—minimal setup, maximum impact.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Impact</h4>
                  <p className="text-gray-600">Accelerated pipeline growth, higher email open rates, and more closed deals.</p>
                </div>
              </div>
            </div>

            {/* Marketing */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#f0ede8' }}>
                <MessageSquare className="h-8 w-8" style={{ color: '#9C8B5E' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Marketing</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Problem</h4>
                  <p className="text-gray-600">Generic campaigns waste budget. Content generation.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                  <p className="text-gray-600">AI-powered audience insights personalize messaging and timing.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Impact</h4>
                  <p className="text-gray-600">Better click-through rates, higher ROI, stronger brand engagement.</p>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#f0ede8' }}>
                <Users className="h-8 w-8" style={{ color: '#595F39' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Support</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Problem</h4>
                  <p className="text-gray-600">Manual screening delays hiring top candidates.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                  <p className="text-gray-600">AI chatbots handle basic issues, route complex cases.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Impact</h4>
                  <p className="text-gray-600">Quicker resolution times, higher satisfaction scores, cost savings.</p>
                </div>
              </div>
            </div>

            {/* Talent */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#f0ede8' }}>
                <UserCheck className="h-8 w-8" style={{ color: '#9C8B5E' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Talent</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Problem</h4>
                  <p className="text-gray-600">Manual screening delays hiring top candidates.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                  <p className="text-gray-600">AI-powered audience insights personalize messaging and timing.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Impact</h4>
                  <p className="text-gray-600">Better click-through rates, higher ROI, stronger brand engagement.</p>
                </div>
              </div>
            </div>

            {/* Operations */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#f0ede8' }}>
                <Settings className="h-8 w-8" style={{ color: '#595F39' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Operations</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Problem</h4>
                  <p className="text-gray-600">Complex processes slow product delivery.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                  <p className="text-gray-600">Workflow automation and predictive analytics optimize supply chains.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Impact</h4>
                  <p className="text-gray-600">Shortened turnaround, fewer bottlenecks, consistent output quality.</p>
                </div>
              </div>
            </div>

            {/* Finance */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#f0ede8' }}>
                <DollarSign className="h-8 w-8" style={{ color: '#9C8B5E' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Finance</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Problem</h4>
                  <p className="text-gray-600">Tedious invoicing and error-prone reconciliations.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                  <p className="text-gray-600">Automated billing systems and real-time financial dashboards.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Impact</h4>
                  <p className="text-gray-600">Reduced processing time, fewer errors, stronger cash flow oversight.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="book-call" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#595F39' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Get Started Today
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Book a free workflow & AI readiness audit for your business today
          </p>
          <Link 
            href="#book-call" 
            className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-medium inline-flex items-center"
          >
            Book Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Performance Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">WORLD-CLASS</h2>
          <p className="text-xl text-gray-300 mb-12">Agents & automations that improve your bottom line</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2" style={{ color: '#9C8B5E' }}>20K</div>
              <p className="text-gray-300">Hours Saved Annually</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2" style={{ color: '#9C8B5E' }}>$13K</div>
              <p className="text-gray-300">Monthly Savings</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2" style={{ color: '#9C8B5E' }}>8X</div>
              <p className="text-gray-300">Productivity</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                Accelerate business growth with AI solutions that cut complexity, boost performance, and scale with you
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                Make automation a reality, helping companies worldwide unlock new levels of efficiency and sustainable growth
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <Image src="/scalewize_logo.png" alt="ScaleWize AI Logo" width={48} height={48} className="h-8 w-8" />
                <span className="ml-2 text-xl font-bold">ScaleWize AI</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your vision, our expertise. We customize AI solutions to meet your everyday challenges—delivering faster results and freeing you to focus on what really matters.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Locations</h4>
              <div className="space-y-2 text-gray-400">
                <p>Calgary, Canada</p>
                <p>Copenhagen, Denmark</p>
                <p>Toronto, Canada</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-400 mb-4">START UNLOCKING TIME TODAY!</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Email*" 
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md text-white placeholder-gray-400 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#595F39' } as React.CSSProperties}
                />
                <button className="px-4 py-2 rounded-r-md text-white font-medium" style={{ backgroundColor: '#595F39' }}>
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            © 2024 ScaleWize AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
