import type { GameState, Character, Building } from "@/types/game"

interface LLMConfig {
  apiKey: string
  baseUrl: string
  model: string
}

interface Message {
  role: "system" | "user" | "assistant"
  content: string
}

// 使用OpenAI API生成响应
export async function generateAIResponse(
  message: string,
  gameState: GameState,
  selectedCharacter: Character | null,
  selectedBuilding: Building | null,
  chatHistory: { role: "user" | "ai"; content: string }[],
  config: LLMConfig,
): Promise<string> {
  // 如果没有配置API密钥或模型，使用模拟响应
  if (!config.apiKey || !config.model) {
    console.log("使用模拟响应，因为API密钥或模型未配置")
    return generateMockResponse(message, gameState, selectedCharacter, selectedBuilding)
  }

  try {
    // 构建系统提示
    let systemPrompt = "你是AI小镇中的AI助手，帮助玩家了解游戏状态和提供建议。"

    // 添加游戏状态信息
    systemPrompt += `\n\n游戏状态：
- 天数：${gameState.day}
- 人口：${gameState.resources.population}
- 金钱：${gameState.resources.money}
- 建筑数量：${gameState.buildings.length}
- 建筑类型：${gameState.buildings.map((b) => getBuildingName(b.type)).join(", ")}
`

    // 如果选择了角色，添加角色信息
    if (selectedCharacter) {
      systemPrompt += `\n你现在是${selectedCharacter.name}，${getRoleDescription(selectedCharacter.role)}。请以这个角色的身份回答问题，使用第一人称。`
    }

    // 如果选择了建筑，添加建筑信息
    if (selectedBuilding) {
      systemPrompt += `\n用户正在查看${getBuildingName(selectedBuilding.type)}。这个建筑的作用是${getBuildingDescription(selectedBuilding.type)}。`
    }

    // 构建消息数组
    const messages: Message[] = [{ role: "system", content: systemPrompt }]

    // 添加聊天历史
    chatHistory.forEach((msg) => {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })
    })

    // 添加当前用户消息
    messages.push({ role: "user", content: message })

    // 确保baseUrl没有尾部斜杠
    const baseUrl = config.baseUrl.endsWith("/") ? config.baseUrl.slice(0, -1) : baseUrl

    console.log("正在调用OpenAI API...", {
      baseUrl,
      model: config.model,
      messagesCount: messages.length,
    })

    // 尝试使用API，如果失败则回退到模拟响应
    try {
      // 准备API密钥 - 确保没有空格和正确的格式
      const apiKey = config.apiKey.trim()

      // 准备请求头
      const headers = new Headers({
        "Content-Type": "application/json",
      })

      // 添加授权头 - 确保格式正确
      headers.append("Authorization", `Bearer ${apiKey}`)

      // 记录请求详情（不包含完整API密钥）
      console.log("API请求详情:", {
        url: `${baseUrl}/chat/completions`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`,
        },
        model: config.model,
      })

      // 调用OpenAI API
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      })

      console.log("API响应状态:", response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error("OpenAI API错误响应:", errorData)

        let errorMessage = "API调用失败"
        try {
          const errorJson = JSON.parse(errorData)
          errorMessage = errorJson.error?.message || errorJson.detail || "未知错误"
        } catch (e) {
          errorMessage = errorData || `HTTP错误: ${response.status}`
        }

        // 如果是授权错误，提供更具体的错误信息
        if (response.status === 401 || errorMessage.includes("auth") || errorMessage.includes("key")) {
          throw new Error(`授权失败: ${errorMessage}。请检查您的API密钥是否正确，或者API服务是否需要特定的授权格式。`)
        } else {
          throw new Error(`API错误: ${errorMessage}`)
        }
      }

      const data = await response.json()
      console.log("API响应成功，获取到回复")
      return data.choices[0].message.content
    } catch (error) {
      console.error("API调用失败，回退到模拟响应:", error)

      // 如果是授权错误，抛出错误以便UI显示
      if (
        error instanceof Error &&
        (error.message.includes("授权失败") ||
          error.message.includes("auth") ||
          error.message.includes("key") ||
          error.message.includes("Invalid authorization"))
      ) {
        throw error
      }

      // 其他错误回退到模拟响应
      return generateMockResponse(message, gameState, selectedCharacter, selectedBuilding, true)
    }
  } catch (error) {
    console.error("生成AI响应时出错:", error)
    throw error
  }
}

// 模拟响应（当没有API密钥时使用）
function generateMockResponse(
  message: string,
  gameState: GameState,
  selectedCharacter: Character | null,
  selectedBuilding: Building | null,
  isErrorFallback = false,
): string {
  // 如果是错误回退，添加提示信息
  const fallbackPrefix = isErrorFallback ? "【注意：API连接失败，使用本地模拟响应】\n\n" : ""

  // 检查消息中的关键词
  const lowerMessage = message.toLowerCase()

  // 如果选择了角色，生成角色特定的响应
  if (selectedCharacter) {
    if (lowerMessage.includes("你好") || lowerMessage.includes("hi") || lowerMessage.includes("hello")) {
      return (
        fallbackPrefix +
        `你好！我是${selectedCharacter.name}，${getRoleDescription(selectedCharacter.role)}。很高兴与你交谈！`
      )
    }

    if (lowerMessage.includes("建议") || lowerMessage.includes("怎么做") || lowerMessage.includes("如何")) {
      return fallbackPrefix + getCharacterAdvice(selectedCharacter, gameState)
    }

    if (lowerMessage.includes("介绍") || lowerMessage.includes("你是谁")) {
      return (
        fallbackPrefix +
        `我是${selectedCharacter.name}，${getRoleDescription(selectedCharacter.role)}。我在这个小镇已经生活了${Math.floor(Math.random() * 10) + 5}年了。`
      )
    }

    // 角色默认响应
    return fallbackPrefix + getCharacterResponse(selectedCharacter, gameState)
  }

  // 如果选择了建筑，生成建筑特定的响应
  if (selectedBuilding) {
    if (lowerMessage.includes("升级") || lowerMessage.includes("提升")) {
      return (
        fallbackPrefix +
        `升级这个${getBuildingName(selectedBuilding.type)}将花费${selectedBuilding.level * 100}金币，但会增加产出和效率。`
      )
    }

    if (lowerMessage.includes("作用") || lowerMessage.includes("功能")) {
      return fallbackPrefix + getBuildingDescription(selectedBuilding.type)
    }

    // 建筑默认响应
    return (
      fallbackPrefix +
      `这是一个${getBuildingName(selectedBuilding.type)}，等级${selectedBuilding.level}。${getBuildingDescription(selectedBuilding.type)}`
    )
  }

  // 一般问题的响应
  if (lowerMessage.includes("人口") || lowerMessage.includes("居民")) {
    return fallbackPrefix + `当前小镇人口为${gameState.resources.population}人。随着更多住房的建造，人口会继续增长。`
  }

  if (lowerMessage.includes("金钱") || lowerMessage.includes("资金") || lowerMessage.includes("钱")) {
    return fallbackPrefix + `你目前拥有${gameState.resources.money}金币。每天，你的建筑会产生一些收入。`
  }

  if (lowerMessage.includes("建筑") || lowerMessage.includes("设施")) {
    return (
      fallbackPrefix + `小镇目前有${gameState.buildings.length}座建筑。你可以建造住宅、农场、工厂和实验室来发展小镇。`
    )
  }

  if (lowerMessage.includes("建议") || lowerMessage.includes("怎么做") || lowerMessage.includes("如何")) {
    return fallbackPrefix + getGeneralAdvice(gameState)
  }

  if (lowerMessage.includes("天气") || lowerMessage.includes("今天")) {
    return fallbackPrefix + `今天是小镇的第${gameState.day}天，天气晴朗，非常适合建设和发展。`
  }

  // 默认响应
  const defaultResponses = [
    `欢迎来到AI小镇！你可以询问我关于小镇的任何事情。`,
    `小镇正在蓬勃发展！目前有${gameState.resources.population}名居民和${gameState.buildings.length}座建筑。`,
    `今天是小镇的第${gameState.day}天。你有什么计划吗？`,
    `你可以与小镇的居民交谈，了解他们的想法和建议。`,
    `尝试建造不同类型的建筑，每种建筑都有独特的功能。`,
    `随着科技的发展，小镇将解锁更多高级建筑和功能。`,
  ]

  return fallbackPrefix + defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}

// 获取角色职业描述
function getRoleDescription(role: string): string {
  switch (role) {
    case "mayor":
      return "小镇的市长，负责小镇的整体规划和发展"
    case "scientist":
      return "小镇的科学家，专注于研究和技术创新"
    case "farmer":
      return "小镇的农民，负责食物生产和农业发展"
    case "worker":
      return "小镇的工人，负责建设和维护基础设施"
    default:
      return "小镇的居民"
  }
}

// 获取角色建议
function getCharacterAdvice(character: Character, gameState: GameState): string {
  switch (character.role) {
    case "mayor":
      return `作为市长，我建议你平衡发展各类建筑。目前我们有${gameState.buildings.length}座建筑，但我们需要更多的住房来吸引新居民。`
    case "scientist":
      if (gameState.buildings.some((b) => b.type === "lab")) {
        return "我们的实验室正在进行重要研究。随着时间推移，我们将解锁新技术，提高小镇的生产效率。"
      } else {
        return "我们需要建造实验室来推动科技发展。科技进步将为小镇带来更多可能性。"
      }
    case "farmer":
      if (gameState.buildings.some((b) => b.type === "farm")) {
        return "农场运转良好，但随着人口增长，我们需要更多的农场来满足食物需求。"
      } else {
        return "我们应该优先建造农场，确保食物供应充足。没有食物，小镇将无法发展。"
      }
    case "worker":
      return "我们需要更多的工厂来提高生产力。工厂可以生产建筑材料和日常用品，促进小镇经济发展。"
    default:
      return "继续发展小镇，建造更多建筑，吸引更多居民。"
  }
}

// 获取角色响应
function getCharacterResponse(character: Character, gameState: GameState): string {
  const responses = [
    `今天是个好天气，不是吗？`,
    `小镇发展得很好，我很高兴能在这里生活。`,
    `你有什么需要我帮忙的吗？`,
    `我最近一直在思考如何改善小镇的生活质量。`,
    `随着小镇的发展，我们需要更多的${character.role === "scientist" ? "研究设施" : character.role === "farmer" ? "农田" : character.role === "worker" ? "工厂" : "基础设施"}。`,
  ]

  return `${character.name}：${responses[Math.floor(Math.random() * responses.length)]}`
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

// 获取建筑描述
function getBuildingDescription(type: string): string {
  switch (type) {
    case "house":
      return "住宅为居民提供住所，增加小镇人口上限。"
    case "farm":
      return "农场生产食物，满足居民的基本需求，并产生少量收入。"
    case "factory":
      return "工厂生产各种商品，提供就业机会，并产生可观的收入。"
    case "lab":
      return "实验室进行科学研究，随着时间推移解锁新技术和建筑类型。"
    case "townhall":
      return "市政厅是小镇的中心，负责管理和协调小镇的各项事务。"
    default:
      return "这是一座重要的建筑，为小镇的发展做出贡献。"
  }
}

// 获取一般建议
function getGeneralAdvice(gameState: GameState): string {
  const { buildings, resources } = gameState

  if (buildings.length < 5) {
    return "你应该建造更多的建筑来发展小镇。住宅可以增加人口上限，农场和工厂可以产生收入。"
  }

  if (resources.money < 500) {
    return "你的资金有些紧张。考虑建造更多工厂来增加收入，或者升级现有建筑提高效率。"
  }

  if (!buildings.some((b) => b.type === "lab")) {
    return "建造一座实验室将有助于科技发展，随着时间推移解锁新的建筑类型和功能。"
  }

  if (buildings.filter((b) => b.type === "house").length < buildings.length / 3) {
    return "你的住房不足，这会限制人口增长。考虑建造更多住宅来吸引新居民。"
  }

  return "继续平衡发展各类建筑，关注资源分配，小镇会越来越繁荣。"
}
