"use client"

import { useRef } from "react"
import type { Mesh } from "three"

interface RoadProps {
  position: [number, number, number]
  rotation?: [number, number, number]
}

export default function Road({ position, rotation = [0, 0, 0] }: RoadProps) {
  const ref = useRef<Mesh>(null)

  return (
    <mesh ref={ref} position={position} rotation={rotation} receiveShadow>
      <boxGeometry args={[20, 0.1, 2]} />
      <meshStandardMaterial color="#555555" />

      {/* Road markings */}
      <mesh position={[0, 0.06, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[18, 0.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </mesh>
  )
}
