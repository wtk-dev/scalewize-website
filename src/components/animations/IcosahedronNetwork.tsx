'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import { Mesh, Group } from 'three'
import { useFrame } from '@react-three/fiber'

// Simple rotating icosahedron
function Icosahedron() {
  const meshRef = useRef<Mesh>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.3
      meshRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2, 0]} />
      <meshStandardMaterial 
        color="#595F39" 
        wireframe={true}
        transparent={true}
        opacity={0.7}
      />
    </mesh>
  )
}

// Simple orbiting spheres
function OrbitingSphere({ radius, speed, angle, color }: { 
  radius: number
  speed: number
  angle: number
  color: string
}) {
  const meshRef = useRef<Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      const x = Math.cos(state.clock.elapsedTime * speed + angle) * radius
      const z = Math.sin(state.clock.elapsedTime * speed + angle) * radius
      const y = Math.sin(state.clock.elapsedTime * speed * 0.5 + angle) * 0.3
      
      meshRef.current.position.set(x, y, z)
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial 
        color={color}
        transparent={true}
        opacity={0.8}
      />
    </mesh>
  )
}

// Main scene
function Scene() {
  return (
    <>
      {/* Clean lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} />

      {/* Central icosahedron */}
      <Icosahedron />

      {/* Orbiting spheres - agents */}
      <OrbitingSphere radius={3.5} speed={0.4} angle={0} color="#595F39" />
      <OrbitingSphere radius={3.5} speed={0.4} angle={Math.PI / 2} color="#595F39" />
      <OrbitingSphere radius={3.5} speed={0.4} angle={Math.PI} color="#595F39" />
      <OrbitingSphere radius={3.5} speed={0.4} angle={3 * Math.PI / 2} color="#595F39" />

      {/* Orbiting spheres - tools */}
      <OrbitingSphere radius={4.5} speed={-0.3} angle={0} color="#6B7280" />
      <OrbitingSphere radius={4.5} speed={-0.3} angle={Math.PI / 3} color="#6B7280" />
      <OrbitingSphere radius={4.5} speed={-0.3} angle={2 * Math.PI / 3} color="#6B7280" />
      <OrbitingSphere radius={4.5} speed={-0.3} angle={Math.PI} color="#6B7280" />
      <OrbitingSphere radius={4.5} speed={-0.3} angle={4 * Math.PI / 3} color="#6B7280" />
      <OrbitingSphere radius={4.5} speed={-0.3} angle={5 * Math.PI / 3} color="#6B7280" />
    </>
  )
}

// Main component
export default function IcosahedronNetwork() {
  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
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
