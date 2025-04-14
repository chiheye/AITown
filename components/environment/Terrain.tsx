"use client"

import { useRef } from "react"
import * as THREE from "three"
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise"

interface TerrainProps {
  size?: number
  height?: number
  segments?: number
  scale?: number
}

export default function Terrain({ size = 500, height = 20, segments = 128, scale = 0.2 }: TerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Generate heightmap
  const generateHeightmap = () => {
    const simplex = new SimplexNoise()
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments)
    const vertices = geometry.attributes.position.array
    const colors = new Float32Array(vertices.length)

    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i]
      const z = vertices[i + 2]

      // Multiple layers of noise for more natural terrain
      const noise1 = simplex.noise(x * scale * 0.01, z * scale * 0.01) * 0.5
      const noise2 = simplex.noise(x * scale * 0.02, z * scale * 0.02) * 0.25
      const noise3 = simplex.noise(x * scale * 0.04, z * scale * 0.04) * 0.125

      // Combine noise layers
      let elevation = (noise1 + noise2 + noise3) * height

      // Create a flat area in the center for the town
      const distanceFromCenter = Math.sqrt(x * x + z * z)
      const flattenFactor = 1 - Math.max(0, 1 - distanceFromCenter / 30)
      elevation *= flattenFactor

      vertices[i + 1] = elevation

      // Set vertex colors based on height
      const colorIndex = (i / 3) * 3
      if (elevation < 1) {
        // Sandy/beach areas
        colors[colorIndex] = 0.76
        colors[colorIndex + 1] = 0.7
        colors[colorIndex + 2] = 0.5
      } else if (elevation < 5) {
        // Grass areas
        colors[colorIndex] = 0.2 + elevation / 10
        colors[colorIndex + 1] = 0.5 + elevation / 20
        colors[colorIndex + 2] = 0.1
      } else {
        // Rocky/mountain areas
        colors[colorIndex] = 0.3
        colors[colorIndex + 1] = 0.3
        colors[colorIndex + 2] = 0.3
      }
    }

    // Add colors to geometry
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    // Update normals for lighting
    geometry.computeVertexNormals()
    return geometry
  }

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow geometry={generateHeightmap()}>
      <meshStandardMaterial vertexColors={true} roughness={0.8} metalness={0.1} />
    </mesh>
  )
}
