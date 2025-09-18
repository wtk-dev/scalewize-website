'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'

interface Node {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  type: 'agent' | 'tool'
  image: string
  alt: string
  radius: number
}

interface Connection {
  from: string
  to: string
  active: boolean
}

export default function AgentNetwork() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // Agent and tool configurations
  const agents = [
    { id: 'agent1', image: '/icon1.png', alt: 'AI Agent 1' },
    { id: 'agent2', image: '/icon2.png', alt: 'AI Agent 2' },
    { id: 'agent3', image: '/icon3.png', alt: 'AI Agent 3' },
    { id: 'agent4', image: '/icon4.png', alt: 'AI Agent 4' },
  ]

  const tools = [
    { id: 'slack', image: '/slack.png', alt: 'Slack' },
    { id: 'outlook', image: '/outlook.png', alt: 'Outlook' },
    { id: 'google_calendar', image: '/google_calendar.png', alt: 'Google Calendar' },
    { id: 'linkedin', image: '/linkedin.png', alt: 'LinkedIn' },
    { id: 'hubspot', image: '/hubspot.png', alt: 'HubSpot' },
    { id: 'salesforce', image: '/salesforce.png', alt: 'Salesforce' },
  ]

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: Math.min(window.innerWidth - 100, 1000),
        height: Math.min(window.innerHeight * 0.6, 600)
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    // Generate initial node positions with physics properties
    const newNodes: Node[] = []
    
    // Position agents in a tighter circle in the center
    agents.forEach((agent, index) => {
      const angle = (index * 2 * Math.PI) / agents.length
      const radius = Math.min(dimensions.width, dimensions.height) * 0.12 // Smaller radius
      newNodes.push({
        ...agent,
        type: 'agent',
        x: dimensions.width / 2 + Math.cos(angle) * radius,
        y: dimensions.height / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.3, // Slower initial velocity
        vy: (Math.random() - 0.5) * 0.3,
        radius: 24, // Smaller agent radius
      })
    })

    // Position tools in a wider circle around the agents
    tools.forEach((tool, index) => {
      const angle = (index * 2 * Math.PI) / tools.length
      const radius = Math.min(dimensions.width, dimensions.height) * 0.25 // Closer to center
      newNodes.push({
        ...tool,
        type: 'tool',
        x: dimensions.width / 2 + Math.cos(angle) * radius,
        y: dimensions.height / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.2, // Even slower for tools
        vy: (Math.random() - 0.5) * 0.2,
        radius: 20, // Smaller tool radius
      })
    })

    setNodes(newNodes)

    // Generate connections (each agent connects to multiple tools)
    const newConnections: Connection[] = []
    agents.forEach(agent => {
      tools.forEach(tool => {
        if (Math.random() > 0.3) { // 70% chance of connection
          newConnections.push({
            from: agent.id,
            to: tool.id,
            active: false
          })
        }
      })
    })

    setConnections(newConnections)
  }, [dimensions])

  // Physics simulation
  useEffect(() => {
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime

      setNodes(prevNodes => {
        return prevNodes.map(node => {
          let newX = node.x + node.vx * deltaTime * 0.08 // Slower movement
          let newY = node.y + node.vy * deltaTime * 0.08
          let newVx = node.vx
          let newVy = node.vy

          // Wall collision detection with bounce (with padding)
          const padding = 20
          if (newX - node.radius < padding || newX + node.radius > dimensions.width - padding) {
            newVx = -newVx * 0.8 // Bounce with slight energy loss
            newX = Math.max(node.radius + padding, Math.min(dimensions.width - node.radius - padding, newX))
          }
          if (newY - node.radius < padding || newY + node.radius > dimensions.height - padding) {
            newVy = -newVy * 0.8 // Bounce with slight energy loss
            newY = Math.max(node.radius + padding, Math.min(dimensions.height - node.radius - padding, newY))
          }

          // Node-to-node collision detection
          prevNodes.forEach(otherNode => {
            if (otherNode.id !== node.id) {
              const dx = newX - otherNode.x
              const dy = newY - otherNode.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              const minDistance = node.radius + otherNode.radius + 8 // Smaller minimum distance

              if (distance < minDistance && distance > 0) {
                // Collision response
                const overlap = minDistance - distance
                const separationX = (dx / distance) * overlap * 0.5
                const separationY = (dy / distance) * overlap * 0.5

                newX += separationX
                newY += separationY

                // Velocity exchange (simplified elastic collision)
                const relativeVx = newVx - otherNode.vx
                const relativeVy = newVy - otherNode.vy
                const speed = relativeVx * dx + relativeVy * dy

                if (speed < 0) {
                  const impulse = 2 * speed / (distance * distance)
                  newVx -= impulse * dx * 0.05 // Reduced impulse
                  newVy -= impulse * dy * 0.05
                }
              }
            }
          })

          // Apply slight friction
          newVx *= 0.999
          newVy *= 0.999

          return {
            ...node,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy
          }
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions])

  // Animate connections
  useEffect(() => {
    const interval = setInterval(() => {
      setConnections(prev => 
        prev.map(conn => ({
          ...conn,
          active: Math.random() > 0.5
        }))
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        {/* Render connections */}
        {connections.map((connection, index) => {
          const fromNode = nodes.find(n => n.id === connection.from)
          const toNode = nodes.find(n => n.id === connection.to)
          
          if (!fromNode || !toNode) return null

          return (
            <motion.line
              key={`${connection.from}-${connection.to}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={connection.active ? '#595F39' : '#E5E7EB'}
              strokeWidth={connection.active ? 2 : 1}
              opacity={connection.active ? 0.8 : 0.3}
              className="transition-all duration-1000"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          )
        })}

        {/* Render animated data packets */}
        {connections.map((connection, index) => {
          const fromNode = nodes.find(n => n.id === connection.from)
          const toNode = nodes.find(n => n.id === connection.to)
          
          if (!fromNode || !toNode || !connection.active) return null

          return (
            <motion.circle
              key={`packet-${connection.from}-${connection.to}-${index}`}
              r="2"
              fill="#595F39"
              initial={{ 
                cx: fromNode.x, 
                cy: fromNode.y,
                opacity: 0 
              }}
              animate={{ 
                cx: toNode.x, 
                cy: toNode.y,
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 3 + 1,
                ease: "easeInOut"
              }}
            />
          )
        })}
      </svg>

      {/* Render nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: node.x,
            top: node.y,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: Math.random() * 0.5,
            type: "spring",
            stiffness: 200
          }}
          whileHover={{ scale: 1.1 }}
        >
          <div className={`
            relative w-12 h-12 rounded-full shadow-lg border-2 transition-all duration-300
            ${node.type === 'agent' 
              ? 'bg-white border-[#595F39] shadow-[#595F39]/20' 
              : 'bg-gray-50 border-gray-300 shadow-gray-300/20'
            }
            hover:shadow-xl hover:border-[#595F39]
          `}>
            <Image
              src={node.image}
              alt={node.alt}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover m-auto mt-1"
              onError={(e) => {
                // Fallback to a colored circle if image fails to load
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-8 h-8 rounded-full m-auto mt-1 flex items-center justify-center text-white font-bold text-sm ${
                      node.type === 'agent' ? 'bg-[#595F39]' : 'bg-gray-500'
                    }">
                      ${node.type === 'agent' ? 'A' : node.alt.charAt(0)}
                    </div>
                  `
                }
              }}
            />
            
            {/* Glowing effect for active connections */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${node.type === 'agent' ? '#595F39' : '#6B7280'}20 0%, transparent 70%)`
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
