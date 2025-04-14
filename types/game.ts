export type BuildingType = "house" | "farm" | "factory" | "lab" | "townhall"

export interface Building {
  id: string
  type: BuildingType
  position: [number, number, number]
  level: number
}

export interface Character {
  id: string
  name: string
  role: string
  level: number
}

export interface Resources {
  money: number
  population: number
  food: number
  energy: number
  science: number
}

export interface GameEvent {
  id: string
  type: string
  description: string
  day: number
  effects: {
    resources?: Partial<Resources>
    buildings?: Partial<Building>[]
    characters?: Partial<Character>[]
  }
}

export interface GameState {
  day: number
  resources: Resources
  buildings: Building[]
  characters: Character[]
  events: GameEvent[]
}

export type CharacterType = "mayor" | "scientist" | "farmer" | "worker"
