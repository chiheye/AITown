"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import { useGameContext } from "@/context/GameContext"

interface BuildingProps {
  position: [number, number, number]
  scale?: [number, number, number]
  type: string
}

export default function Building({ position, scale = [1, 1, 1], type }: BuildingProps) {
  const ref = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const { setSelectedBuilding } = useGameContext()

  // 根据建筑类型获取颜色
  const getColor = () => {
    switch (type) {
      case "house":
        return "#e57373"
      case "farm":
        return "#81c784"
      case "factory":
        return "#64b5f6"
      case "lab":
        return "#ba68c8"
      case "townhall":
        return "#ffb74d"
      default:
        return "#e0e0e0"
    }
  }

  useFrame((state, delta) => {
    if (ref.current) {
      // 悬停效果
      if (hovered) {
        ref.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 2) * 0.1
      } else {
        ref.current.position.y = position[1]
      }

      // 点击效果
      if (clicked) {
        ref.current.rotation.y += delta * 0.5
      }
    }
  })

  // 处理建筑点击，打开聊天窗口
  const handleBuildingClick = (e: any) => {
    e.stopPropagation()
    setClicked(!clicked)
    setSelectedBuilding({
      id: Math.random().toString(),
      type,
      position,
      level: 1,
    })

    // 打开聊天窗口
    const chatButton = document.querySelector(".chat-trigger") as HTMLButtonElement
    if (chatButton) {
      chatButton.click()
    }
  }

  return (
    <group
      ref={ref}
      position={position}
      scale={scale}
      onClick={handleBuildingClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = "pointer"
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = "default"
      }}
    >
      {/* 基础 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={getColor()} />
      </mesh>

      {/* 屋顶 */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <coneGeometry args={[0.8, 0.5, 4]} />
        <meshStandardMaterial color="#424242" />
      </mesh>

      {/* 窗户 */}
      <mesh position={[0, 0, 0.51]} castShadow>
        <planeGeometry args={[0.4, 0.4]} />
        <meshStandardMaterial color="#c9ecff" emissive="#c9ecff" emissiveIntensity={0.2} />
      </mesh>

      {/* 门 */}
      <mesh position={[0, -0.25, 0.51]} castShadow>
        <planeGeometry args={[0.3, 0.5]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
    </group>
  )
}
