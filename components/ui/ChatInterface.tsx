"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, X, Minimize, Maximize, Send, AlertCircle, Settings } from "lucide-react"
import { useGameContext } from "@/context/GameContext"
import { useLLMConfig } from "@/context/LLMContext"
import { generateAIResponse } from "@/services/llm-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Message {
  id: string
  sender: "user" | "ai"
  content: string
  timestamp: Date
}

export default function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      content: "欢迎来到AI小镇！我是你的AI助手，有什么可以帮助你的吗？",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { gameState, selectedCharacter, selectedBuilding } = useGameContext()
  const { config, isConfigured } = useLLMConfig()

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, error])

  // 聊天窗口打开时聚焦输入框
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  // 打开LLM配置
  const openLLMConfig = () => {
    const configButton = document.querySelector("button.absolute.top-4.right-4") as HTMLButtonElement
    if (configButton) configButton.click()
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    // 清除之前的错误
    setError(null)

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // 准备聊天历史
      const chatHistory = messages.map((msg) => ({
        role: msg.sender,
        content: msg.content,
      }))

      // 调用LLM服务获取响应
      const aiResponseText = await generateAIResponse(
        input,
        gameState,
        selectedCharacter,
        selectedBuilding,
        chatHistory,
        config,
      )

      // 添加AI响应
      const aiResponse: Message = {
        id: Date.now().toString(),
        sender: "ai",
        content: aiResponseText,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error("获取AI响应时出错:", error)

      // 设置错误信息
      let errorMessage = "未知错误"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      setError(errorMessage)

      // 如果是授权错误，提供配置按钮
      if (
        errorMessage.includes("授权") ||
        errorMessage.includes("auth") ||
        errorMessage.includes("key") ||
        errorMessage.includes("Invalid authorization")
      ) {
        setError(`${errorMessage} 请检查您的API密钥配置。`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* 聊天按钮 */}
      {!isOpen && (
        <Button
          className="absolute bottom-4 right-4 rounded-full h-12 w-12 p-0 chat-trigger"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* 聊天窗口 */}
      {isOpen && (
        <div
          className={`absolute right-4 transition-all duration-300 chat-window rounded-lg ${
            isMinimized ? "bottom-4 h-12 w-64" : "bottom-4 h-96 w-80"
          }`}
        >
          {isMinimized ? (
            <div className="flex items-center justify-between h-full px-4">
              <span className="font-medium">AI助手</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white"
                  onClick={() => setIsMinimized(false)}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Card className="border-none bg-transparent h-full flex flex-col">
              <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-white text-sm">
                  {selectedCharacter
                    ? `与 ${selectedCharacter.name} 对话`
                    : selectedBuilding
                      ? `关于 ${getBuildingName(selectedBuilding.type)}`
                      : "AI助手"}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white"
                    onClick={openLLMConfig}
                    title="配置LLM"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white"
                    onClick={() => setIsMinimized(true)}
                  >
                    <Minimize className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden p-0">
                <ScrollArea className="h-[calc(100%-2rem)] p-4" ref={scrollAreaRef as any}>
                  <div className="flex flex-col gap-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 ${
                            message.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg px-3 py-2 bg-secondary text-secondary-foreground">
                          <div className="flex gap-1">
                            <div
                              className="w-2 h-2 rounded-full bg-white animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 rounded-full bg-white animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 rounded-full bg-white animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                    {error && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {error}
                          <div className="mt-2">
                            <Button variant="outline" size="sm" className="text-xs" onClick={openLLMConfig}>
                              配置LLM
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs ml-2" onClick={() => setError(null)}>
                              关闭
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                    {!isConfigured && !error && messages.length === 1 && (
                      <Alert className="mt-2 bg-blue-50 border-blue-200">
                        <AlertDescription className="text-blue-600">
                          您尚未配置LLM。当前使用的是本地模拟响应，无需API密钥。
                          <div className="mt-2">
                            <Button variant="outline" size="sm" className="text-xs" onClick={openLLMConfig}>
                              配置LLM
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-2">
                <form
                  className="flex w-full gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                >
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="输入消息..."
                    className="bg-secondary/50 border-none text-white"
                    disabled={isLoading}
                  />
                  <Button type="submit" size="sm" disabled={isLoading}>
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
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
