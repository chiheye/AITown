"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { GameState, Building, Character } from "@/types/game"

interface GameContextType {
  gameState: GameState
  selectedBuilding: Building | null
  selectedCharacter: Character | null
  updateGameState: (newState: GameState) => void
  setSelectedBuilding: (building: Building | null) => void
  setSelectedCharacter: (character: Character | null) => void
  addBuilding: (building: Building) => void
  upgradeBuilding: (buildingId: string) => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  // Initial game state
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    resources: {
      money: 500,
      population: 10,
      food: 100,
      energy: 100,
      science: 0,
    },
    buildings: [
      {
        id: "1",
        type: "house",
        position: [5, 0, 5],
        level: 1,
      },
      {
        id: "2",
        type: "farm",
        position: [-5, 0, 5],
        level: 1,
      },
    ],
    characters: [
      {
        id: "1",
        name: "Mayor Johnson",
        role: "mayor",
        level: 3,
      },
      {
        id: "2",
        name: "Dr. Chen",
        role: "scientist",
        level: 2,
      },
      {
        id: "3",
        name: "Farmer Rodriguez",
        role: "farmer",
        level: 1,
      },
      {
        id: "4",
        name: "Worker Smith",
        role: "worker",
        level: 1,
      },
    ],
    events: [],
  })

  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

  const updateGameState = (newState: GameState) => {
    setGameState(newState)
  }

  const addBuilding = (building: Building) => {
    setGameState((prev) => ({
      ...prev,
      resources: {
        ...prev.resources,
        money: prev.resources.money - getBuildingCost(building.type),
      },
      buildings: [...prev.buildings, building],
    }))
  }

  const upgradeBuilding = (buildingId: string) => {
    setGameState((prev) => {
      const buildingIndex = prev.buildings.findIndex((b) => b.id === buildingId)
      if (buildingIndex === -1) return prev

      const building = prev.buildings[buildingIndex]
      const upgradeCost = building.level * 100

      if (prev.resources.money < upgradeCost) return prev

      const updatedBuildings = [...prev.buildings]
      updatedBuildings[buildingIndex] = {
        ...building,
        level: building.level + 1,
      }

      return {
        ...prev,
        resources: {
          ...prev.resources,
          money: prev.resources.money - upgradeCost,
        },
        buildings: updatedBuildings,
      }
    })

    // Update selected building if it's the one being upgraded
    if (selectedBuilding && selectedBuilding.id === buildingId) {
      setSelectedBuilding({
        ...selectedBuilding,
        level: selectedBuilding.level + 1,
      })
    }
  }

  const getBuildingCost = (type: string): number => {
    switch (type) {
      case "house":
        return 100
      case "farm":
        return 200
      case "factory":
        return 500
      case "lab":
        return 1000
      default:
        return 100
    }
  }

  return (
    <GameContext.Provider
      value={{
        gameState,
        selectedBuilding,
        selectedCharacter,
        updateGameState,
        setSelectedBuilding,
        setSelectedCharacter,
        addBuilding,
        upgradeBuilding,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGameContext() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider")
  }
  return context
}
