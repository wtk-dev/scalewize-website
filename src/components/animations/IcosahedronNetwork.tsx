'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import { Mesh, Group } from 'three'
import { useFrame } from '@react-three/fiber'
import Image from 'next/image'

// Icosahedron geometry generator
function createIcosahedronGeometry() {
  const phi = (1 + Math.sqrt(5)) / 2 // Golden ratio
  const vertices = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
  ]
  
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
  ]
  
  return { vertices, faces }
}

// Icosahedron component
function Icosahedron({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2
      meshRef.current.rotation.y += delta * 0.3
    }
  })

  const { vertices, faces } = useMemo(() => createIcosahedronGeometry(), [])

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[1.5, 0]} />
      <meshStandardMaterial 
        color="#595F39" 
        wireframe={true}
        transparent={true}
        opacity={0.6}
      />
    </mesh>
  )
}

// Orbiting icon component
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
      groupRef.current.position.x = Math.cos(state.clock.elapsedTime * speed + angle) * radius
      groupRef.current.position.z = Math.sin(state.clock.elapsedTime * speed + angle) * radius
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * speed * 0.5 + angle) * 0.5
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={type === 'agent' ? '#595F39' : '#6B7280'}
          transparent={true}
          opacity={0.8}
        />
      </mesh>
      {/* Icon plane */}
      <mesh position={[0, 0, 0.35]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshBasicMaterial 
          transparent={true}
          opacity={0.9}
        />
      </mesh>
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

      {/* Central icosahedron */}
      <Icosahedron position={[0, 0, 0]} />

      {/* Orbiting agents */}
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

      {/* Orbiting tools */}
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

      {/* Connection lines */}
      {agents.map((agent, agentIndex) => (
        tools.map((tool, toolIndex) => (
          <mesh key={`${agent.id}-${tool.id}`}>
            <cylinderGeometry args={[0.01, 0.01, 1.5]} />
            <meshBasicMaterial 
              color="#595F39" 
              transparent={true}
              opacity={0.3}
            />
          </mesh>
        ))
      ))}
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
