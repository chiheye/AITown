"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, AlertCircle, RefreshCw, CheckCircle, Info } from "lucide-react"
import { useLLMConfig } from "@/context/LLMContext"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OpenAIModel {
  id: string
  created: number
  object: string
  owned_by: string
}

export default function LLMConfig() {
  const { config, updateConfig, isConfigured } = useLLMConfig()
  const [isOpen, setIsOpen] = useState(!isConfigured)
  const [apiKey, setApiKey] = useState(config.apiKey || "")
  const [baseUrl, setBaseUrl] = useState(config.baseUrl || "https://api.openai.com/v1")
  const [model, setModel] = useState(config.model || "gpt-3.5-turbo")
  const [models, setModels] = useState<OpenAIModel[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic")
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // 验证API密钥格式
  const validateApiKey = (key: string): boolean => {
    // OpenAI API密钥通常以sk-开头，但也可能使用其他格式
    return key.trim().length > 10
  }

  // 获取模型列表
  const fetchModels = async () => {
    if (!apiKey) {
      setError("请先输入API密钥")
      return
    }

    if (!validateApiKey(apiKey)) {
      setError("API密钥格式无效")
      return
    }

    setIsLoadingModels(true)
    setError(null)
    setDebugInfo(null)

    try {
      // 确保baseUrl没有尾部斜杠
      const url = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl

      console.log("正在获取模型列表...", { url })

      // 准备请求头
      const headers = new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      })

      const response = await fetch(`${url}/models`, {
        headers,
      })

      console.log("模型列表响应状态:", response.status)

      // 保存调试信息
      const responseText = await response.text()
      let responseData
      try {
        responseData = JSON.parse(responseText)
        setDebugInfo(JSON.stringify(responseData, null, 2))
      } catch (e) {
        setDebugInfo(responseText)
        throw new Error(`无法解析响应: ${responseText}`)
      }

      if (!response.ok) {
        console.error("获取模型列表错误:", responseText)

        let errorMessage = "获取模型列表失败"
        try {
          errorMessage = responseData.error?.message || responseData.detail || `HTTP错误: ${response.status}`
        } catch (e) {
          errorMessage = responseText || `HTTP错误: ${response.status}`
        }

        // 如果是授权错误，提供更具体的错误信息
        if (response.status === 401 || errorMessage.includes("auth") || errorMessage.includes("key")) {
          throw new Error(`授权失败: ${errorMessage}。请检查您的API密钥是否正确。`)
        } else {
          throw new Error(errorMessage)
        }
      }

      console.log("获取到模型数量:", responseData.data?.length || 0)

      // 过滤出聊天模型
      const chatModels = responseData.data.filter(
        (model: OpenAIModel) =>
          (model.id.includes("gpt") || model.id.includes("claude") || model.id.includes("llama")) &&
          !model.id.includes("instruct") &&
          !model.id.includes("-vision") &&
          !model.id.includes("embedding"),
      )

      // 按创建时间排序，最新的在前面
      chatModels.sort((a: OpenAIModel, b: OpenAIModel) => b.created - a.created)

      setModels(chatModels)

      // 如果当前选择的模型不在列表中，选择第一个模型
      if (chatModels.length > 0 && !chatModels.some((m) => m.id === model)) {
        setModel(chatModels[0].id)
      }

      // 如果没有找到模型，设置默认模型
      if (chatModels.length === 0) {
        setModel("gpt-3.5-turbo")
      }
    } catch (err) {
      console.error("获取模型列表时出错:", err)
      setError(err instanceof Error ? err.message : "获取模型列表时出错")

      // 设置默认模型
      setModel("gpt-3.5-turbo")
    } finally {
      setIsLoadingModels(false)
    }
  }

  // 测试API连接
  const testConnection = async () => {
    if (!apiKey) {
      setError("请先输入API密钥")
      return
    }

    if (!validateApiKey(apiKey)) {
      setError("API密钥格式无效")
      return
    }

    setTestStatus("testing")
    setError(null)
    setDebugInfo(null)

    try {
      // 确保baseUrl没有尾部斜杠
      const url = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl

      // 准备请求头
      const headers = new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      })

      // 记录请求详情（不包含完整API密钥）
      const maskedKey = apiKey.trim().substring(0, 4) + "..." + apiKey.trim().substring(apiKey.trim().length - 4)
      console.log("测试API连接:", {
        url: `${url}/chat/completions`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${maskedKey}`,
        },
        model: model || "gpt-3.5-turbo",
      })

      const response = await fetch(`${url}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: model || "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 5,
        }),
      })

      console.log("测试连接响应状态:", response.status)

      // 保存调试信息
      const responseText = await response.text()
      setDebugInfo(responseText)

      if (!response.ok) {
        console.error("测试连接错误:", responseText)

        let errorMessage = "API连接测试失败"
        try {
          const responseData = JSON.parse(responseText)
          errorMessage = responseData.error?.message || responseData.detail || `HTTP错误: ${response.status}`
        } catch (e) {
          errorMessage = responseText || `HTTP错误: ${response.status}`
        }

        // 如果是授权错误，提供更具体的错误信息
        if (response.status === 401 || errorMessage.includes("auth") || errorMessage.includes("key")) {
          throw new Error(`授权失败: ${errorMessage}。请检查您的API密钥是否正确。`)
        } else {
          throw new Error(errorMessage)
        }
      }

      setTestStatus("success")
    } catch (err) {
      console.error("测试连接时出错:", err)
      setError(err instanceof Error ? err.message : "测试连接时出错")
      setTestStatus("error")
    }
  }

  // 当API密钥或基础URL变化时重置错误状态
  useEffect(() => {
    setError(null)
    setTestStatus("idle")
    setDebugInfo(null)
  }, [apiKey, baseUrl])

  // 保存配置
  const saveConfig = () => {
    if (!validateApiKey(apiKey)) {
      setError("API密钥格式无效")
      return
    }

    // 确保baseUrl没有尾部斜杠
    const url = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl

    updateConfig({
      apiKey: apiKey.trim(),
      baseUrl: url,
      model: model || "gpt-3.5-turbo",
    })
    setIsOpen(false)
  }

  // 使用模拟模式
  const useMockMode = () => {
    updateConfig({
      apiKey: "",
      baseUrl: "https://api.openai.com/v1",
      model: "mock",
    })
    setIsOpen(false)
  }

  // 当配置变化时更新状态
  useEffect(() => {
    setApiKey(config.apiKey || "")
    setBaseUrl(config.baseUrl || "https://api.openai.com/v1")
    setModel(config.model || "gpt-3.5-turbo")
  }, [config])

  if (!isOpen) {
    return (
      <Button className="absolute top-4 right-4 z-50 bg-black/50 text-white" onClick={() => setIsOpen(true)}>
        配置LLM
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>LLM配置</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {testStatus === "success" && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">API连接测试成功！</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "basic" | "advanced")}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="basic">基本设置</TabsTrigger>
              <TabsTrigger value="advanced">高级设置</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">OpenAI API密钥</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <p className="text-xs text-muted-foreground">API密钥通常以"sk-"开头，请确保输入完整的密钥</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="model">模型</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchModels}
                    disabled={!apiKey || isLoadingModels}
                    className="h-6 text-xs"
                  >
                    {isLoadingModels ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        加载中
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        刷新
                      </>
                    )}
                  </Button>
                </div>
                <Select value={model} onValueChange={setModel} disabled={isLoadingModels}>
                  <SelectTrigger id="model">
                    <SelectValue
                      placeholder={
                        isLoadingModels ? "加载模型中..." : models.length === 0 ? "请先输入API密钥" : "选择模型"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.id}
                      </SelectItem>
                    ))}
                    {models.length === 0 && !isLoadingModels && (
                      <>
                        <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
                        <SelectItem value="gpt-4">gpt-4</SelectItem>
                        <SelectItem value="gpt-4-turbo">gpt-4-turbo</SelectItem>
                        <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {isLoadingModels && <p className="text-xs text-muted-foreground">正在加载可用模型...</p>}
              </div>

              <Button
                onClick={testConnection}
                disabled={!apiKey || testStatus === "testing"}
                variant="outline"
                className="w-full"
              >
                {testStatus === "testing" ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    测试中...
                  </>
                ) : (
                  "测试API连接"
                )}
              </Button>
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baseUrl">API基础URL</Label>
                <Input
                  id="baseUrl"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                />
                <p className="text-xs text-muted-foreground">
                  如果使用代理或自定义端点，请修改此URL。确保URL以"/v1"结尾，不要包含尾部斜杠。
                </p>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-600">
                  如果您遇到"Invalid authorization credentials"错误，请尝试以下方法：
                  <ul className="list-disc pl-5 mt-2 text-xs">
                    <li>确认API密钥格式正确且没有多余空格</li>
                    <li>检查API基础URL是否正确</li>
                    <li>如果使用代理服务，确认代理服务配置正确</li>
                    <li>尝试使用模拟模式进行测试</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {debugInfo && (
                <div className="space-y-2">
                  <Label>调试信息</Label>
                  <div className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                    <pre>{debugInfo}</pre>
                  </div>
                </div>
              )}

              <Button onClick={useMockMode} variant="outline" className="w-full">
                使用模拟模式（无需API密钥）
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            取消
          </Button>
          <Button onClick={saveConfig} disabled={!apiKey && activeTab === "basic"}>
            保存配置
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
