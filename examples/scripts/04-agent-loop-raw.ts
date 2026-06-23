/**
 * 04 — 手写 Agent Loop（理解原理）
 * 对应章节：第六章 6.2 手写 Agent Loop
 *
 * 原文用 @anthropic-ai/sdk 直接调用。本文件用 AI SDK v6 的等价实现，
 * 核心结构完全相同：
 *
 *   原文 client.messages.create()  ↔  generateText(..., stopWhen: stepCountIs(1))
 *   原文 messages.push(...)        ↔  messages = result.messages
 *   原文 stop_reason === 'tool_use' ↔  result.finishReason === 'tool-calls'
 *
 * 这段代码就是所有 Agent 框架的本质。
 * LangGraph、Mastra、OpenAI Agents SDK 都是在这个循环上加抽象。
 *
 * 运行：
 *   pnpm tsx 04-agent-loop-raw.ts
 */

import { generateText, tool, jsonSchema, stepCountIs } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import type { ModelMessage } from "ai"

// ── 自定义错误类型 ─────────────────────────────────────────────────
class AgentError extends Error {
  constructor(
    public code: "MAX_STEPS_EXCEEDED" | "TOKEN_BUDGET_EXCEEDED" | "FATAL",
    message: string,
  ) {
    super(message)
    this.name = "AgentError"
  }
}

// ── 工具定义 ──────────────────────────────────────────────────────
const tools = {
  getWeather: tool({
    description: "获取指定城市的当前天气。",
    inputSchema: jsonSchema<{ city: string }>({
      type: "object",
      properties: { city: { type: "string", description: "城市名，如 '北京'、'Shanghai'" } },
      required: ["city"],
    }),
    execute: async ({ city }: { city: string }) => {
      await new Promise((r) => setTimeout(r, 50))
      return {
        city,
        temp: Math.floor(Math.random() * 30) + 5,
        weather: ["晴", "多云", "小雨"][Math.floor(Math.random() * 3)],
        humidity: `${Math.floor(Math.random() * 40) + 40}%`,
      }
    },
  }),

  convertCurrency: tool({
    description: "货币换算。",
    inputSchema: jsonSchema<{ amount: number; from: string; to: string }>({
      type: "object",
      properties: {
        amount: { type: "number" },
        from: { type: "string", description: "源货币代码，如 USD、CNY、EUR" },
        to: { type: "string", description: "目标货币代码" },
      },
      required: ["amount", "from", "to"],
    }),
    execute: async ({ amount, from, to }: { amount: number; from: string; to: string }) => {
      await new Promise((r) => setTimeout(r, 50))
      // 模拟汇率
      const rates: Record<string, number> = { USD: 1, CNY: 7.25, EUR: 0.92, JPY: 149 }
      const fromRate = rates[from.toUpperCase()] ?? 1
      const toRate = rates[to.toUpperCase()] ?? 1
      const result = (amount / fromRate) * toRate
      return { result: Math.round(result * 100) / 100, from, to, rate: toRate / fromRate }
    },
  }),
}

// ── 手写 Agent Loop ────────────────────────────────────────────────
// 等价于文档 6.2 节的 runAgentLoop 函数

interface AgentResult {
  finalText: string
  steps: number
  totalTokens: number
}

async function runAgentLoop(
  userMessage: string,
  options: { maxSteps?: number; tokenBudget?: number } = {},
): Promise<AgentResult> {
  const { maxSteps = 15, tokenBudget = 100_000 } = options

  // ① 对话历史 = Agent 的工作记忆（等价于原文的 messages 数组）
  let messages: ModelMessage[] = [{ role: "user", content: userMessage }]

  let totalTokens = 0

  for (let step = 0; step < maxSteps; step++) {
    // ② 单步调用 LLM（stopWhen: stepCountIs(1) = 只执行一步，手动控制循环）
    const response = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      messages,
      tools,
      stopWhen: stepCountIs(1), // 每次只走一步，循环控制权在我们手里
      system: "你是旅行助手，请使用工具获取实时数据。",
      temperature: 0,
    })

    // ③ 累计成本，实现熔断
    // v6: LanguageModelUsage 没有 totalTokens，用 inputTokens + outputTokens
    totalTokens += (response.usage.inputTokens ?? 0) + (response.usage.outputTokens ?? 0)
    if (totalTokens > tokenBudget) {
      throw new AgentError("TOKEN_BUDGET_EXCEEDED", `已消耗 ${totalTokens} tokens，超出预算`)
    }

    // ④ 工具调用日志
    for (const tc of response.toolCalls ?? []) {
      console.log(`  [Step ${step + 1}] 调用工具: ${tc.toolName}`, tc.input)
    }

    // ⑤ 更新消息历史
    // v6: GenerateTextResult 没有 .messages 属性
    // response.response.messages 是 (AssistantModelMessage | ToolModelMessage)[]
    // 它们都是 ModelMessage 的子类型，可以安全 push
    messages.push(...(response.response.messages as ModelMessage[]))

    // ⑥ 终止条件判断
    if (response.finishReason === "stop") {
      // 模型没有调用工具 = 任务完成
      console.log(`  [Step ${step + 1}] 完成（${totalTokens} tokens 共 ${step + 1} 步）`)
      return { finalText: response.text, steps: step + 1, totalTokens }
    }

    // finishReason === 'tool-calls' 意味着工具已执行，进入下一轮
    // （工具结果已包含在 response.messages 中，下次循环时一起发给模型）
  }

  // ⑦ 达到 maxSteps 仍未完成
  throw new AgentError("MAX_STEPS_EXCEEDED", `执行 ${maxSteps} 步后任务仍未完成`)
}

// ── 对比：SDK 内置 Loop（一行搞定，与上面等价） ───────────────────
async function runAgentLoopSDK(userMessage: string) {
  return generateText({
    model: anthropic("claude-haiku-4-5-20251001"),
    tools,
    stopWhen: stepCountIs(15), // ← 和手写循环的 maxSteps 等价
    system: "你是旅行助手，请使用工具获取实时数据。",
    temperature: 0,
    prompt: userMessage,
  })
}

// ── 运行演示 ──────────────────────────────────────────────────────
const userInput = "北京今天天气怎么样？如果买机票要花 3000 元，折合多少美元？"

console.log("=== 手写 Agent Loop ===")
console.log(`问题：${userInput}\n`)

// 方案一：手写循环
const manual = await runAgentLoop(userInput)
console.log(`\n[手写 Loop] 回答：\n${manual.finalText}`)
console.log(`执行 ${manual.steps} 步，消耗 ${manual.totalTokens} tokens\n`)

console.log("=== SDK 内置 Loop（等价简洁版）===")
const sdk = await runAgentLoopSDK(userInput)
console.log(`\n[SDK Loop] 回答：\n${sdk.text}`)
console.log(`执行 ${sdk.steps.length} 步，消耗 ${sdk.usage.totalTokens} tokens`)
