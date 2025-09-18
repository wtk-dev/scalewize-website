'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import { Mesh, Group } from 'three'
import { useFrame } from '@react-three/fiber'
import Image from 'next/image'

// Icosahedron component
function Icosahedron({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2
      meshRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[1.5, 0]} />
      <meshStandardMaterial 
        color="#595F39" 
        wireframe={true}
        transparent={true}
        opacity={0.2}
      />
    </mesh>
  )
}

// Orbiting icon component - always facing forward (2D) and behind icosahedron
function OrbitingIcon({ 
  icon, 
  radius, 
  speed, 
  angle, 
  type 
}: { 
  icon: string
  radius: number
  speed: number
  angle: number
  type: 'agent' | 'tool'
}) {
  const groupRef = useRef<Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      // Calculate orbital position
      const x = Math.cos(state.clock.elapsedTime * speed + angle) * radius
      const z = Math.sin(state.clock.elapsedTime * speed + angle) * radius
      const y = Math.sin(state.clock.elapsedTime * speed * 0.5 + angle) * 0.5
      
      // Position behind the icosahedron (negative Z)
      groupRef.current.position.set(x, y, z - 2)
    }
  })

  return (
    <group ref={groupRef}>
      <Html
        center
        distanceFactor={20}
        position={[0, 0, 0]}
        transform
        sprite
      >
        <div className={`
          relative rounded-full shadow-lg border-2 transition-all duration-300
          ${type === 'agent' 
            ? 'bg-white border-[#595F39] shadow-[#595F39]/20 w-8 h-8' 
            : 'bg-gray-50 border-gray-300 shadow-gray-300/20 w-7 h-7'
          }
          hover:shadow-xl hover:border-[#595F39]
        `}>
          <Image
            src={icon}
            alt={type === 'agent' ? 'AI Agent' : 'Tool'}
            width={type === 'agent' ? 24 : 20}
            height={type === 'agent' ? 24 : 20}
            className={`rounded-full object-cover m-auto ${
              type === 'agent' ? 'mt-1' : 'mt-0.5'
            }`}
            onError={(e) => {
              // Fallback to a colored circle if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `
                  <div class="rounded-full m-auto flex items-center justify-center text-white font-bold ${
                    type === 'agent' ? 'w-6 h-6 mt-1 text-xs bg-[#595F39]' : 'w-5 h-5 mt-0.5 text-xs bg-gray-500'
                  }">
                    ${type === 'agent' ? 'A' : 'T'}
                  </div>
                `
              }
            }}
          />
        </div>
      </Html>
    </group>
  )
}

// Main 3D scene component
function Scene() {
  const agents = [
    { id: 'agent1', icon: '/icon1.png', alt: 'AI Agent 1' },
    { id: 'agent2', icon: '/icon2.png', alt: 'AI Agent 2' },
    { id: 'agent3', icon: '/icon3.png', alt: 'AI Agent 3' },
    { id: 'agent4', icon: '/icon4.png', alt: 'AI Agent 4' },
  ]

  const tools = [
    { id: 'slack', icon: '/slack.png', alt: 'Slack' },
    { id: 'outlook', icon: '/outlook.png', alt: 'Outlook' },
    { id: 'google_calendar', icon: '/google_calendar.png', alt: 'Google Calendar' },
    { id: 'linkedin', icon: '/linkedin.png', alt: 'LinkedIn' },
    { id: 'hubspot', icon: '/hubspot.png', alt: 'HubSpot' },
    { id: 'salesforce', icon: '/salesforce.png', alt: 'Salesforce' },
  ]

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} />

      {/* Orbiting agents - behind icosahedron */}
      {agents.map((agent, index) => (
        <OrbitingIcon
          key={agent.id}
          icon={agent.icon}
          radius={3}
          speed={0.3}
          angle={(index * Math.PI * 2) / agents.length}
          type="agent"
        />
      ))}

      {/* Orbiting tools - behind icosahedron */}
      {tools.map((tool, index) => (
        <OrbitingIcon
          key={tool.id}
          icon={tool.icon}
          radius={4.5}
          speed={-0.2}
          angle={(index * Math.PI * 2) / tools.length}
          type="tool"
        />
      ))}

      {/* Central icosahedron - in front */}
      <Icosahedron position={[0, 0, 0]} />
    </>
  )
}

// Main component
export default function IcosahedronNetwork() {
  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  )
}
