"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGameContext } from "@/context/GameContext"
import type { BuildingType } from "@/types/game"
import Tutorial from "./Tutorial"
import {
  Home,
  Factory,
  Leaf,
  FlaskRoundIcon as Flask,
  Users,
  Coins,
  Calendar,
  Plus,
  Settings,
  HelpCircle,
  MessageSquare,
} from "lucide-react"

interface InterfaceProps {
  showTutorial: boolean
  setShowTutorial: (show: boolean) => void
}

export default function Interface({ showTutorial, setShowTutorial }: InterfaceProps) {
  const { gameState, selectedBuilding, selectedCharacter, addBuilding, upgradeBuilding } = useGameContext()

  const [activeTab, setActiveTab] = useState("overview")

  const buildingIcons: Record<string, React.ReactNode> = {
    house: <Home className="h-4 w-4" />,
    farm: <Leaf className="h-4 w-4" />,
    factory: <Factory className="h-4 w-4" />,
    lab: <Flask className="h-4 w-4" />,
    townhall: <Users className="h-4 w-4" />,
  }

  const handleAddBuilding = (type: BuildingType) => {
    const cost = getBuildingCost(type)
    if (gameState.resources.money >= cost) {
      // 在城镇中心周围随机位置
      const angle = Math.random() * Math.PI * 2
      const distance = 15 + Math.random() * 15
      const x = Math.sin(angle) * distance
      const z = Math.cos(angle) * distance

      addBuilding({
        id: Math.random().toString(),
        type,
        position: [x, 0, z],
        level: 1,
      })
    }
  }

  const getBuildingCost = (type: BuildingType): number => {
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

  // 触发聊天窗口的函数
  const triggerChat = () => {
    const chatButton = document.querySelector(".chat-trigger") as HTMLButtonElement
    if (chatButton) {
      chatButton.click()
    }
  }

  return (
    <>
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}

      <div className="absolute top-0 left-0 w-full p-4 game-hud">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-black/50 text-white px-3 py-1 flex items-center gap-1">
              <Coins className="h-4 w-4" /> {gameState.resources.money}
            </Badge>
            <Badge variant="outline" className="bg-black/50 text-white px-3 py-1 flex items-center gap-1">
              <Users className="h-4 w-4" /> {gameState.resources.population}
            </Badge>
            <Badge variant="outline" className="bg-black/50 text-white px-3 py-1 flex items-center gap-1">
              <Calendar className="h-4 w-4" /> 第 {gameState.day} 天
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="bg-black/50 text-white" onClick={triggerChat}>
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-black/50 text-white"
              onClick={() => setShowTutorial(true)}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="bg-black/50 text-white">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 w-80 game-hud">
        <Card className="bg-black/70 text-white border-none">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 bg-black/50">
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="build">建造</TabsTrigger>
              <TabsTrigger value="selected">选中</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">小镇概览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>人口:</span>
                    <span>
                      {gameState.resources.population} / {gameState.buildings.length * 10}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>建筑:</span>
                    <span>{gameState.buildings.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>收入:</span>
                    <span>每天 +{gameState.buildings.length * 5}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>科技:</span>
                    <span>等级 {Math.floor(gameState.day / 10) + 1}</span>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="build" className="p-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">建造新建筑</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center justify-start gap-2"
                    onClick={() => handleAddBuilding("house")}
                    disabled={gameState.resources.money < getBuildingCost("house")}
                  >
                    <Home className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span>住宅</span>
                      <span className="text-xs text-muted-foreground">{getBuildingCost("house")} 金币</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex items-center justify-start gap-2"
                    onClick={() => handleAddBuilding("farm")}
                    disabled={gameState.resources.money < getBuildingCost("farm")}
                  >
                    <Leaf className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span>农场</span>
                      <span className="text-xs text-muted-foreground">{getBuildingCost("farm")} 金币</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex items-center justify-start gap-2"
                    onClick={() => handleAddBuilding("factory")}
                    disabled={gameState.resources.money < getBuildingCost("factory")}
                  >
                    <Factory className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span>工厂</span>
                      <span className="text-xs text-muted-foreground">{getBuildingCost("factory")} 金币</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex items-center justify-start gap-2"
                    onClick={() => handleAddBuilding("lab")}
                    disabled={gameState.resources.money < getBuildingCost("lab")}
                  >
                    <Flask className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span>实验室</span>
                      <span className="text-xs text-muted-foreground">{getBuildingCost("lab")} 金币</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="selected" className="p-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {selectedBuilding ? "建筑详情" : selectedCharacter ? "角色详情" : "未选中任何对象"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedBuilding && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {buildingIcons[selectedBuilding.type]}
                      <span className="capitalize">{getBuildingName(selectedBuilding.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>等级:</span>
                      <span>{selectedBuilding.level}</span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => upgradeBuilding(selectedBuilding.id)}
                      disabled={gameState.resources.money < selectedBuilding.level * 100}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      升级 ({selectedBuilding.level * 100} 金币)
                    </Button>
                    <Button className="w-full mt-2" variant="secondary" onClick={triggerChat}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      了解更多
                    </Button>
                  </div>
                )}

                {selectedCharacter && (
                  <div className="space-y-2">
                    <div className="text-lg font-bold">{selectedCharacter.name}</div>
                    <div className="flex justify-between">
                      <span>职业:</span>
                      <span className="capitalize">{getRoleTitle(selectedCharacter.role)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>等级:</span>
                      <span>{selectedCharacter.level}</span>
                    </div>
                    <Button className="w-full" onClick={triggerChat}>
                      <MessageSquare className="h-4 w-4 mr-2" />与 {selectedCharacter.name} 交谈
                    </Button>
                  </div>
                )}

                {!selectedBuilding && !selectedCharacter && (
                  <div className="text-center text-muted-foreground">点击建筑或角色查看详情</div>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* 隐藏的聊天触发按钮 */}
      <button className="chat-trigger hidden"></button>
    </>
  )
}

// 获取建筑名称
function getBuildingName(type: string): string {
  switch (type) {
    case "house":
      return "住宅"
    case "farm":
      return "农场"
    case "factory":
      return "工厂"
    case "lab":
      return "实验室"
    case "townhall":
      return "市政厅"
    default:
      return "建筑"
  }
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
