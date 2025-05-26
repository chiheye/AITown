"use client"

import { useEffect, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import * as THREE from "three"
import Building from "./Building"
import Road from "./Road"
import Character from "./Character"
import Terrain, { TerrainHandle } from "../environment/Terrain"
import Vegetation from "../environment/Vegetation"
import Water from "../environment/Water"
import SkySystem from "../environment/SkySystem"
import EnvironmentEffects from "../environment/EnvironmentEffects"
import { useGameContext } from "@/context/GameContext"

export default function Town() {
  const townRef = useRef<Group>(null)
  const terrainRef = useRef<TerrainHandle>(null)
  const { gameState, updateGameState } = useGameContext()
  const [characterPositions, setCharacterPositions] = useState<THREE.Vector3[]>([])
  const [buildingPositions, setBuildingPositions] = useState<
    Array<{ position: THREE.Vector3; scale: THREE.Vector3; type: string }>
  >([])

  // 初始化位置数组
  useEffect(() => {
    // 建筑位置
    const buildings = [
      { position: new THREE.Vector3(0, 0, 0), scale: new THREE.Vector3(5, 5, 5), type: "townhall" }, // 市政厅
      ...gameState.buildings.map((b) => ({
        position: new THREE.Vector3(b.position[0], b.position[1], b.position[2]),
        scale: new THREE.Vector3(3, 3, 3), // Default scale for other buildings
        type: b.type,
      })),
    ]
    setBuildingPositions(buildings)

    // 角色初始位置
    const characters = gameState.characters.map((_, index) => {
      return new THREE.Vector3(10 * Math.sin(index * 0.5), 0, 10 * Math.cos(index * 0.5))
    })
    setCharacterPositions(characters)
  }, [gameState.buildings.length])

  // 检查位置是否有碰撞
  const checkCollision = (position: THREE.Vector3, characterIndexToIgnore: number = -1, radius = 3): boolean => {
    // 1. Terrain Collision Check
    if (!terrainRef.current) {
      console.warn("Terrain ref not available for collision check.")
      return true // Collision if terrain ref is not set
    }

    const terrainY = terrainRef.current.getHeightAt(position.x, position.z)

    // 2. Handle Missing Terrain/Ref
    if (terrainY === null) {
      // console.warn(`Position (${position.x.toFixed(2)}, ${position.z.toFixed(2)}) is off-terrain or terrain not ready.`)
      return true // Collision if off-terrain or height not found
    }

    // 3. Perform Terrain Collision Check
    const characterBaseOffset = 0.5 // Assuming character's pivot is center, feet are 0.5 units below.
    if (position.y - characterBaseOffset < terrainY) {
      // console.log(`Terrain collision detected: CharY ${position.y} - offset ${characterBaseOffset} < TerrainY ${terrainY}`);
      return true // Collision if character's base is below terrain
    }

    // Existing collision checks (Building and Character)
    const buildingCharRadius = 0.5 // Character's radius for building collision

    // 检查与建筑的碰撞 (AABB)
    for (const building of buildingPositions) {
      const halfScaleX = building.scale.x / 2
      const halfScaleY = building.scale.y / 2
      const halfScaleZ = building.scale.z / 2

      const minX = building.position.x - halfScaleX
      const maxX = building.position.x + halfScaleX
      const minY = building.position.y - halfScaleY
      const maxY = building.position.y + halfScaleY
      const minZ = building.position.z - halfScaleZ
      const maxZ = building.position.z + halfScaleZ

      // Find the closest point in the AABB to the character's position
      const closestPoint = new THREE.Vector3(
        THREE.MathUtils.clamp(position.x, minX, maxX),
        THREE.MathUtils.clamp(position.y, minY, maxY),
        THREE.MathUtils.clamp(position.z, minZ, maxZ),
      )

      const distanceSq = position.distanceToSquared(closestPoint)

      if (distanceSq < buildingCharRadius * buildingCharRadius) {
        return true // Collision with a building
      }
    }

    // 检查与其他角色的碰撞
    const charCollisionRadius = 0.5 // Radius for character-to-character collision
    for (let i = 0; i < characterPositions.length; i++) {
      if (i === characterIndexToIgnore) {
        continue // Skip self-collision check
      }
      const otherCharPos = characterPositions[i]
      const distance = position.distanceTo(otherCharPos)

      if (distance < 2 * charCollisionRadius) {
        // Collision with another character
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
    const characterStandOffset = 0.5 // Offset to make character stand on terrain

    // 1. Initial Target Position Check
    if (!checkCollision(targetPos, characterIndex)) {
      const terrainY = terrainRef.current?.getHeightAt(targetPos.x, targetPos.z)
      if (terrainY !== null) {
        targetPos.y = terrainY + characterStandOffset
      }
      const newPositions = [...characterPositions]
      newPositions[characterIndex] = targetPos.clone()
      setCharacterPositions(newPositions)
      return targetPos
    }

    // 2. "Step Back" on Collision
    const stepBackPos = targetPos.clone().lerp(currentPos, 0.2) // Move 20% back
    if (!checkCollision(stepBackPos, characterIndex)) {
      const terrainY = terrainRef.current?.getHeightAt(stepBackPos.x, stepBackPos.z)
      if (terrainY !== null) {
        stepBackPos.y = terrainY + characterStandOffset
      }
      const newPositions = [...characterPositions]
      newPositions[characterIndex] = stepBackPos.clone()
      setCharacterPositions(newPositions)
      return stepBackPos
    }

    // 3. Refine Alternative Position Search Loop
    const searchRadius = 1.0 // Search radius for alternative positions
    for (let i = 0; i < 8; i++) {
      const angle = ((Math.PI * 2) / 8) * i
      const offset = new THREE.Vector3(Math.cos(angle) * searchRadius, 0, Math.sin(angle) * searchRadius)
      const alternativePos = currentPos.clone().add(offset)

      if (!checkCollision(alternativePos, characterIndex)) {
        const terrainY = terrainRef.current?.getHeightAt(alternativePos.x, alternativePos.z)
        if (terrainY !== null) {
          alternativePos.y = terrainY + characterStandOffset
        }
        const newPositions = [...characterPositions]
        newPositions[characterIndex] = alternativePos.clone()
        setCharacterPositions(newPositions)
        return alternativePos
      }
    }

    // 4. Final Fallback: If all attempts fail, maintain original position
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
      <Terrain ref={terrainRef} />
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
