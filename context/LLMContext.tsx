"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface LLMConfig {
  apiKey: string
  baseUrl: string
  model: string
}

interface LLMContextType {
  config: LLMConfig
  updateConfig: (newConfig: LLMConfig) => void
  isConfigured: boolean
}

const LLMContext = createContext<LLMContextType | undefined>(undefined)

const LOCAL_STORAGE_KEY = "ai-town-llm-config"

export function LLMProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<LLMConfig>({
    apiKey: "",
    baseUrl: "https://api.openai.com/v1",
    model: "",
  })
  const [isConfigured, setIsConfigured] = useState(false)

  // 从本地存储加载配置
  useEffect(() => {
    const savedConfig = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        setConfig(parsedConfig)
        setIsConfigured(!!parsedConfig.apiKey && !!parsedConfig.model)
      } catch (error) {
        console.error("Failed to parse saved LLM config:", error)
      }
    }
  }, [])

  // 更新配置
  const updateConfig = (newConfig: LLMConfig) => {
    setConfig(newConfig)
    setIsConfigured(!!newConfig.apiKey && !!newConfig.model)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfig))
  }

  return <LLMContext.Provider value={{ config, updateConfig, isConfigured }}>{children}</LLMContext.Provider>
}

export function useLLMConfig() {
  const context = useContext(LLMContext)
  if (context === undefined) {
    throw new Error("useLLMConfig must be used within a LLMProvider")
  }
  return context
}
