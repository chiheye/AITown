"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { shaderMaterial } from "@react-three/drei"
import * as THREE from "three"
import { extend } from "@react-three/fiber"

// Create a custom shader material for water
const WaterMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.0, 0.3, 0.5),
    scale: 1.0,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying float vElevation;
    uniform float time;
    uniform float scale;
    
    void main() {
      vUv = uv;
      
      // Create waves
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      float elevation = sin(modelPosition.x * 0.1 * scale + time * 0.5) * 
                        sin(modelPosition.z * 0.1 * scale + time * 0.5) * 
                        0.5;
      
      modelPosition.y += elevation;
      vElevation = elevation;
      
      gl_Position = projectionMatrix * viewMatrix * modelPosition;
    }
  `,
  // Fragment shader
  `
    uniform vec3 color;
    uniform float time;
    varying vec2 vUv;
    varying float vElevation;
    
    void main() {
      // Water color based on depth and waves
      vec3 waterColor = color;
      waterColor = mix(waterColor, vec3(0.0, 0.7, 1.0), vElevation * 0.5 + 0.5);
      
      // Add wave highlights
      float highlight = smoothstep(0.4, 0.6, sin(vUv.x * 40.0 + time) * 0.5 + 0.5);
      waterColor = mix(waterColor, vec3(1.0), highlight * 0.1);
      
      gl_FragColor = vec4(waterColor, 0.8);
    }
  `,
)

// Extend the Three.js materials with our custom material
extend({ WaterMaterial })

// Add the type for our custom material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      waterMaterial: any
    }
  }
}

interface WaterProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
}

export default function Water({ position = [0, 0.2, 0], rotation = [0, 0, 0], scale = [100, 1, 100] }: WaterProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<any>(null)

  // Animate water
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.getElapsedTime()
    }
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale} receiveShadow>
      <planeGeometry args={[1, 1, 32, 32]} />
      <waterMaterial ref={materialRef} transparent side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}
