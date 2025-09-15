'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

// Customer logos data with actual files from GitHub
const customerLogos = [
  { name: 'Caraline Support Services', src: '/caraline.png', alt: 'Caraline Support Services' },
  { name: 'Elite Sedation', src: '/elitesedation.png', alt: 'Elite Sedation' },
  { name: 'Horizon HR Partners', src: '/horizon.png', alt: 'Horizon HR Partners' },
  { name: 'Mettespace', src: '/mettespace.png', alt: 'Mettespace' },
  { name: 'Optivise Consulting', src: '/optivis.png', alt: 'Optivise Consulting' },
  { name: 'Take5 Digital', src: '/take5digital.png', alt: 'Take5 Digital' },
]

// Duplicate the array for seamless looping
const duplicatedLogos = [...customerLogos, ...customerLogos]

export default function CustomerLogos() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-light text-gray-800 mb-4">
            Trusted by innovative companies
          </h2>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
            Join industry leaders who have transformed their operations with Henly AI
          </p>
        </motion.div>

        {/* Logo Scrolling Container */}
        <div className="relative">
          <div className="flex animate-scroll">
            {duplicatedLogos.map((logo, index) => (
              <motion.div
                key={`${logo.name}-${index}`}
                className="flex-shrink-0 mx-6 flex items-center justify-center"
                style={{ width: '220px', height: '100px' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative w-full h-full flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all duration-500 hover:scale-105">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={180}
                    height={70}
                    className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-500"
                    onError={(e) => {
                      // Fallback to text if image fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `<span class="text-gray-500 font-medium text-sm">${logo.name}</span>`
                      }
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10" />
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
