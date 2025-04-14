"use client"

import { useEffect, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import * as THREE from "three"
import Building from "./Building"
import Road from "./Road"
import Character from "./Character"
import Terrain from "../environment/Terrain"
import Vegetation from "../environment/Vegetation"
import Water from "../environment/Water"
import SkySystem from "../environment/SkySystem"
import EnvironmentEffects from "../environment/EnvironmentEffects"
import { useGameContext } from "@/context/GameContext"

export default function Town() {
  const townRef = useRef<Group>(null)
  const { gameState, updateGameState } = useGameContext()
  const [characterPositions, setCharacterPositions] = useState<THREE.Vector3[]>([])
  const [buildingPositions, setBuildingPositions] = useState<THREE.Vector3[]>([])

  // 初始化位置数组
  useEffect(() => {
    // 建筑位置
    const buildings = [
      new THREE.Vector3(0, 0, 0), // 市政厅
      ...gameState.buildings.map((b) => new THREE.Vector3(b.position[0], b.position[1], b.position[2])),
    ]
    setBuildingPositions(buildings)

    // 角色初始位置
    const characters = gameState.characters.map((_, index) => {
      return new THREE.Vector3(10 * Math.sin(index * 0.5), 0, 10 * Math.cos(index * 0.5))
    })
    setCharacterPositions(characters)
  }, [gameState.buildings.length])

  // 检查位置是否有碰撞
  const checkCollision = (position: THREE.Vector3, radius = 3): boolean => {
    // 检查与建筑的碰撞
    for (const buildingPos of buildingPositions) {
      const distance = position.distanceTo(buildingPos)
      if (distance < radius) {
        return true
      }
    }

    // 检查与其他角色的碰撞
    for (const charPos of characterPositions) {
      const distance = position.distanceTo(charPos)
      if (distance < radius * 0.5 && distance > 0.1) {
        // 避免与自己碰撞
        return true
      }
    }

    return false
  }

  // 获取有效的移动位置
  const getValidPosition = (
    currentPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    characterIndex: number,
  ): THREE.Vector3 => {
    if (!checkCollision(targetPos)) {
      // 更新角色位置数组
      const newPositions = [...characterPositions]
      newPositions[characterIndex] = targetPos.clone()
      setCharacterPositions(newPositions)
      return targetPos
    }

    // 如果有碰撞，尝试找到附近的有效位置
    for (let i = 0; i < 8; i++) {
      const angle = ((Math.PI * 2) / 8) * i
      const offset = new THREE.Vector3(Math.cos(angle) * 3, 0, Math.sin(angle) * 3)
      const alternativePos = currentPos.clone().add(offset)

      if (!checkCollision(alternativePos)) {
        // 更新角色位置数组
        const newPositions = [...characterPositions]
        newPositions[characterIndex] = alternativePos.clone()
        setCharacterPositions(newPositions)
        return alternativePos
      }
    }

    // 如果所有尝试都失败，保持原位置
    return currentPos
  }

  // 模拟小镇增长和随时间变化
  useFrame((state, delta) => {
    if (townRef.current) {
      // 微妙的环境移动
      townRef.current.rotation.y += delta * 0.001
    }
  })

  useEffect(() => {
    // 设置更新游戏状态的间隔
    const interval = setInterval(() => {
      updateGameState({
        ...gameState,
        resources: {
          ...gameState.resources,
          money: gameState.resources.money + gameState.buildings.length * 5,
          population: Math.min(gameState.resources.population + 1, gameState.buildings.length * 10),
        },
        day: gameState.day + 1,
      })
    }, 10000) // 每10秒更新一次

    return () => clearInterval(interval)
  }, [gameState, updateGameState])

  return (
    <>
      {/* 环境系统 */}
      <SkySystem />
      <EnvironmentEffects />

      {/* 地形和水 */}
      <Terrain />
      <Water />

      {/* 小镇元素 */}
      <group ref={townRef}>
        {/* 小镇中心 */}
        <Building position={[0, 0, 0]} scale={[5, 5, 5]} type="townhall" />

        {/* 道路 */}
        <Road position={[10, 0.1, 0]} rotation={[0, Math.PI / 2, 0]} />
        <Road position={[0, 0.1, 10]} />
        <Road position={[-10, 0.1, 0]} rotation={[0, Math.PI / 2, 0]} />
        <Road position={[0, 0.1, -10]} />

        {/* 建筑 */}
        {gameState.buildings.map((building, index) => (
          <Building key={building.id} position={building.position} scale={[3, 3, 3]} type={building.type} />
        ))}

        {/* 角色 */}
        {gameState.characters.map((character, index) => (
          <Character
            key={character.id}
            position={
              characterPositions[index]
                ? [characterPositions[index].x, characterPositions[index].y, characterPositions[index].z]
                : [
                    10 * Math.sin(index * 0.5 + gameState.day * 0.01),
                    0,
                    10 * Math.cos(index * 0.5 + gameState.day * 0.01),
                  ]
            }
            name={character.name}
            role={character.role}
            getValidPosition={(current, target) => getValidPosition(current, target, index)}
          />
        ))}
      </group>

      {/* 植被（树木、草、花） */}
      <Vegetation />
    </>
  )
}
