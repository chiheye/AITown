"use client"

import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Sparkles, BakeShadows } from "@react-three/drei"
import * as THREE from "three"

export default function EnvironmentEffects() {
  const { scene } = useThree()
  const particlesRef = useRef<THREE.Points>(null)

  // Add fog to the scene
  scene.fog = new THREE.FogExp2(0xc9e8ff, 0.005)

  // Animate particles
  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.01
    }
  })

  return (
    <>
      {/* Bake shadows for performance */}
      <BakeShadows />

      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.5} color="#c9e8ff" />

      {/* Main directional light (sun) */}
      <directionalLight
        position={[50, 50, 20]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />

      {/* Secondary light for fill */}
      <directionalLight position={[-10, 20, -30]} intensity={0.3} color="#ffeedd" />

      {/* Sparkles for magical atmosphere */}
      <Sparkles count={200} scale={100} size={4} speed={0.4} opacity={0.1} />

      {/* Dust particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1000}
            array={new Float32Array(3000).map(() => (Math.random() - 0.5) * 100)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.1} color="#ffffff" transparent opacity={0.2} />
      </points>
    </>
  )
}
