"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise"

interface VegetationProps {
  count?: number
  radius?: number
  centerExclusion?: number
}

export default function Vegetation({ count = 1000, radius = 200, centerExclusion = 30 }: VegetationProps) {
  const treesRef = useRef<THREE.Group>(null)
  const grassRef = useRef<THREE.Group>(null)
  const flowersRef = useRef<THREE.Group>(null)

  // Generate positions for vegetation
  const simplex = useMemo(() => new SimplexNoise(), [])

  // Tree positions
  const treePositions = useMemo(() => {
    const positions = []
    for (let i = 0; i < count / 10; i++) {
      // Random position within radius
      const theta = Math.random() * Math.PI * 2
      const r = centerExclusion + Math.random() * (radius - centerExclusion)
      const x = Math.cos(theta) * r
      const z = Math.sin(theta) * r

      // Use noise to determine if we should place a tree here
      const noise = simplex.noise(x * 0.01, z * 0.01)
      if (noise > 0.2) {
        // Get height at this position (simplified - in a real app you'd sample the terrain)
        const noise1 = simplex.noise(x * 0.01, z * 0.01) * 0.5
        const noise2 = simplex.noise(x * 0.02, z * 0.02) * 0.25
        const noise3 = simplex.noise(x * 0.04, z * 0.04) * 0.125
        const y = (noise1 + noise2 + noise3) * 20

        positions.push({
          position: [x, y, z],
          rotation: [0, Math.random() * Math.PI * 2, 0],
          scale: 0.8 + Math.random() * 0.4,
        })
      }
    }
    return positions
  }, [count, radius, centerExclusion, simplex])

  // Grass positions
  const grassPositions = useMemo(() => {
    const positions = []
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const r = Math.random() * radius
      const x = Math.cos(theta) * r
      const z = Math.sin(theta) * r

      // Don't place grass in the center
      if (Math.sqrt(x * x + z * z) < centerExclusion) continue

      const noise1 = simplex.noise(x * 0.01, z * 0.01) * 0.5
      const noise2 = simplex.noise(x * 0.02, z * 0.02) * 0.25
      const noise3 = simplex.noise(x * 0.04, z * 0.04) * 0.125
      const y = (noise1 + noise2 + noise3) * 20

      positions.push({
        position: [x, y - 0.1, z],
        rotation: [0, Math.random() * Math.PI * 2, 0],
        scale: 0.5 + Math.random() * 0.5,
      })
    }
    return positions
  }, [count, radius, centerExclusion, simplex])

  // Flower positions
  const flowerPositions = useMemo(() => {
    const positions = []
    for (let i = 0; i < count / 5; i++) {
      const theta = Math.random() * Math.PI * 2
      const r = Math.random() * radius
      const x = Math.cos(theta) * r
      const z = Math.sin(theta) * r

      // Don't place flowers in the center
      if (Math.sqrt(x * x + z * z) < centerExclusion) continue

      const noise1 = simplex.noise(x * 0.01, z * 0.01) * 0.5
      const noise2 = simplex.noise(x * 0.02, z * 0.02) * 0.25
      const noise3 = simplex.noise(x * 0.04, z * 0.04) * 0.125
      const y = (noise1 + noise2 + noise3) * 20

      // Use noise to create flower patches
      const flowerNoise = simplex.noise(x * 0.05, z * 0.05)
      if (flowerNoise > 0.3) {
        positions.push({
          position: [x, y, z],
          rotation: [0, Math.random() * Math.PI * 2, 0],
          scale: 0.3 + Math.random() * 0.3,
        })
      }
    }
    return positions
  }, [count, radius, centerExclusion, simplex])

  // Create simple geometries for trees, grass, and flowers
  useFrame((state, delta) => {
    if (treesRef.current) {
      treesRef.current.rotation.y += delta * 0.01
    }
  })

  return (
    <group>
      {/* Trees */}
      <group ref={treesRef}>
        {treePositions.map((props, i) => (
          <mesh
            key={i}
            position={props.position as [number, number, number]}
            rotation={props.rotation as [number, number, number]}
            scale={props.scale}
          >
            <cylinderGeometry args={[0, 0.5, 2, 8]} />
            <meshStandardMaterial color="#2d4c1e" />
            <mesh position={[0, 1.5, 0]}>
              <coneGeometry args={[1, 3, 8]} />
              <meshStandardMaterial color="#3a6324" />
            </mesh>
          </mesh>
        ))}
      </group>

      {/* Grass */}
      <group ref={grassRef}>
        {grassPositions.map((props, i) => (
          <mesh
            key={i}
            position={props.position as [number, number, number]}
            rotation={props.rotation as [number, number, number]}
            scale={props.scale}
          >
            <boxGeometry args={[0.1, 0.5, 0.1]} />
            <meshStandardMaterial color="#4a7c3a" />
          </mesh>
        ))}
      </group>

      {/* Flowers */}
      <group ref={flowersRef}>
        {flowerPositions.map((props, i) => (
          <mesh
            key={i}
            position={props.position as [number, number, number]}
            rotation={props.rotation as [number, number, number]}
            scale={props.scale}
          >
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color={i % 3 === 0 ? "#ff5555" : i % 3 === 1 ? "#ffff55" : "#ff55ff"} />
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
              <meshStandardMaterial color="#4a7c3a" />
            </mesh>
          </mesh>
        ))}
      </group>
    </group>
  )
}
