"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import { type Group, Vector3 } from "three"
import { useGameContext } from "@/context/GameContext"

interface CharacterProps {
  position: [number, number, number]
  name: string
  role: string
  getValidPosition?: (current: Vector3, target: Vector3) => Vector3
}

export default function Character({ position, name, role, getValidPosition }: CharacterProps) {
  const ref = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const [targetPosition, setTargetPosition] = useState(new Vector3(...position))
  const { setSelectedCharacter } = useGameContext()

  // 根据角色获取颜色
  const getColor = () => {
    switch (role) {
      case "mayor":
        return "#ffd700"
      case "scientist":
        return "#4fc3f7"
      case "farmer":
        return "#66bb6a"
      case "worker":
        return "#ff8a65"
      default:
        return "#e0e0e0"
    }
  }

  // 随机移动
  useEffect(() => {
    const interval = setInterval(() => {
      if (ref.current) {
        const currentPos = ref.current.position.clone()
        const randomX = currentPos.x + (Math.random() - 0.5) * 10
        const randomZ = currentPos.z + (Math.random() - 0.5) * 10
        const newTarget = new Vector3(randomX, currentPos.y, randomZ)
        setTargetPosition(newTarget)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useFrame((state, delta) => {
    if (ref.current) {
      // 移动角色
      const currentPos = ref.current.position.clone()
      const distance = currentPos.distanceTo(targetPosition)

      if (distance > 0.1) {
        // 计算有效的目标位置（考虑碰撞）
        let validTarget = targetPosition.clone()
        if (getValidPosition) {
          validTarget = getValidPosition(currentPos, targetPosition)
        }

        // 移动角色
        ref.current.position.lerp(validTarget, delta * 0.5)

        // 朝向移动方向
        const direction = new Vector3().subVectors(validTarget, currentPos).normalize()
        if (direction.length() > 0) {
          const lookAtPos = new Vector3(currentPos.x + direction.x, currentPos.y, currentPos.z + direction.z)
          ref.current.lookAt(lookAtPos)
        }
      }

      // 悬停效果
      if (hovered) {
        ref.current.scale.setScalar(1.2)
      } else {
        ref.current.scale.setScalar(1)
      }
    }
  })

  // 处理角色点击，打开聊天窗口
  const handleCharacterClick = (e: any) => {
    e.stopPropagation()
    setSelectedCharacter({
      id: Math.random().toString(),
      name,
      role,
      level: 1,
    })

    // 打开聊天窗口
    const chatButton = document.querySelector(".chat-trigger") as HTMLButtonElement
    if (chatButton) {
      chatButton.click()
    }
  }

  return (
    <group>
      <group
        ref={ref}
        position={position}
        onClick={handleCharacterClick}
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
        {/* 角色身体 */}
        <mesh castShadow>
          <capsuleGeometry args={[0.5, 1, 4, 8]} />
          <meshStandardMaterial color={getColor()} />
        </mesh>

        {/* 角色头部 */}
        <mesh position={[0, 1, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color={getColor()} />
        </mesh>

        {/* 眼睛 */}
        <mesh position={[0.15, 1.1, 0.2]} castShadow>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[-0.15, 1.1, 0.2]} castShadow>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>

      {/* 名称标签 */}
      {hovered && (
        <Text
          position={[position[0], position[1] + 2, position[2]]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
          backgroundColor="#00000080"
          padding={0.2}
        >
          {name} - {getRoleTitle(role)}
        </Text>
      )}
    </group>
  )
}

// 获取角色职位名称
function getRoleTitle(role: string): string {
  switch (role) {
    case "mayor":
      return "市长"
    case "scientist":
      return "科学家"
    case "farmer":
      return "农民"
    case "worker":
      return "工人"
    default:
      return "居民"
  }
}
