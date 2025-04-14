"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Sky, Stars } from "@react-three/drei"
import type * as THREE from "three"

interface SkySystemProps {
  sunPosition?: [number, number, number]
  time?: number
}

export default function SkySystem({ sunPosition = [100, 10, 100], time = 0 }: SkySystemProps) {
  const skyRef = useRef<any>(null)
  const cloudsRef = useRef<THREE.Group>(null)

  // Animate clouds
  useFrame((state, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.01
    }
  })

  return (
    <>
      {/* Advanced sky with atmospheric scattering */}
      <Sky
        ref={skyRef}
        distance={450000}
        sunPosition={sunPosition}
        inclination={0.49}
        azimuth={0.25}
        mieCoefficient={0.001}
        mieDirectionalG={0.8}
        rayleigh={1}
        turbidity={10}
      />

      {/* Stars visible at night */}
      <Stars radius={300} depth={50} count={5000} factor={4} fade speed={1} />

      {/* Simple cloud system */}
      <group ref={cloudsRef}>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={i} position={[(Math.random() - 0.5) * 200, 30 + Math.random() * 20, (Math.random() - 0.5) * 200]}>
            <sphereGeometry args={[5 + Math.random() * 10, 8, 8]} />
            <meshStandardMaterial color="white" transparent opacity={0.8} />
          </mesh>
        ))}
      </group>
    </>
  )
}
