/**
 * 03 — AI SDK 内置 Agent Loop
 * 对应章节：第六章 6.1 用 Vercel AI SDK 的内置 Loop（推荐起点）
 *
 * 核心要点：
 *   - generateText + tools + stopWhen: stepCountIs(N)  ← v6 替代 maxSteps
 *   - onStepFinish 回调：日志、成本熔断、动态干预
 *   - result.steps 保存完整执行轨迹
 *
 * 运行：
 *   pnpm tsx 03-agent-loop-sdk.ts
 */

import { generateText, tool, jsonSchema, stepCountIs } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

// ── 工具定义（模拟一个简单的知识库 + 计算器） ──────────────────────

const searchKnowledge = tool({
  description: "搜索知识库，获取某技术主题的简要说明。",
  inputSchema: jsonSchema<{ topic: string }>({
    type: "object",
    properties: { topic: { type: "string", description: "要搜索的技术主题" } },
    required: ["topic"],
  }),
  execute: async ({ topic }: { topic: string }) => {
    // 模拟延迟
    await new Promise((r) => setTimeout(r, 50))
    const kb: Record<string, string> = {
      "agent loop":
        "Agent Loop 是 AI Agent 的核心机制：模型调用工具 → 工具返回结果 → 模型继续推理，直到任务完成。",
      "context window":
        "Context Window 是模型单次处理的最大 Token 数，超出则截断。GPT-4 128K，Claude 200K，Gemini 1.5M。",
      "prompt caching":
        "Prompt Caching 将重复的 System Prompt / 工具定义缓存，后续请求只按 1/10 价格计费输入 Token。",
    }
    const key = Object.keys(kb).find((k) => topic.toLowerCase().includes(k))
    return key
      ? { found: true, topic: key, content: kb[key] }
      : { found: false, topic, suggestion: "请换个关键词，如 'agent loop'、'context window'、'prompt caching'" }
  },
})

const calculate = tool({
  description: "执行数学计算，返回精确结果。当用户问'多少'或涉及数字运算时使用。",
  inputSchema: jsonSchema<{ expression: string }>({
    type: "object",
    properties: {
      expression: {
        type: "string",
        description: "JavaScript 数学表达式，如 '100 * 0.9' 或 '50000 / 24'",
      },
    },
    required: ["expression"],
  }),
  execute: async ({ expression }: { expression: string }) => {
    try {
      // 安全的数学表达式求值（生产中请用更安全的 math parser）
      const result = Function(`"use strict"; return (${expression})`)() as number
      return { result, expression, formatted: result.toLocaleString("zh-CN") }
    } catch {
      return { error: true, message: `无效表达式：${expression}`, retryable: false }
    }
  },
})

// ── 运行 Agent Loop ────────────────────────────────────────────────

console.log("=== AI SDK Agent Loop 演示 ===\n")

const TOKEN_BUDGET = 50_000
let totalTokens = 0
let stepCount = 0

const result = await generateText({
  model: anthropic("claude-haiku-4-5-20251001"),
  system: `你是 AI 知识助手。必须通过工具获取数据，禁止凭记忆回答技术细节。
推理保持简洁，不超过 2 句话。`,
  tools: { searchKnowledge, calculate },

  // v6 关键：用 stopWhen 替代 maxSteps
  stopWhen: stepCountIs(10),

  temperature: 0,

  // ── onStepFinish：每步回调，用于日志、熔断、监控 ──────────────────
  onStepFinish: ({ toolCalls, usage, finishReason }) => {
    stepCount++
    // v6: LanguageModelUsage 没有 totalTokens，需要手动求和
    const stepTokens = (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0)
    totalTokens += stepTokens

    const toolNames = toolCalls?.map((t) => t.toolName).join(", ") || "—"
    console.log(
      `[Step ${stepCount}] tools=${toolNames} | tokens=${stepTokens} (累计 ${totalTokens}) | finish=${finishReason}`,
    )

    // ── 成本熔断：超预算立刻中止 ──────────────────────────────────
    if (totalTokens > TOKEN_BUDGET) {
      throw new Error(`超出 Token 预算 (${TOKEN_BUDGET})，任务中止`)
    }
  },

  prompt: "解释什么是 Agent Loop，如果每步消耗 500 tokens、执行 8 步，总共要多少 tokens？",
})

// ── 结果分析 ──────────────────────────────────────────────────────
console.log(`\n${"─".repeat(60)}`)
console.log("最终回答：")
console.log(result.text)
console.log(`\n执行摘要：`)
console.log(`  总步骤数：${result.steps.length}`)
// v6: 用 totalUsage.inputTokens + outputTokens 获取全局总量
const totalUsed = (result.totalUsage.inputTokens ?? 0) + (result.totalUsage.outputTokens ?? 0)
console.log(`  总 Token：${totalUsed}（input ${result.totalUsage.inputTokens ?? 0} + output ${result.totalUsage.outputTokens ?? 0}）`)
console.log(`  结束原因：${result.finishReason}`)

// result.steps 保存完整执行轨迹，可用于调试或写入数据库
console.log(`\n执行轨迹（result.steps）：`)
for (const step of result.steps) {
  const tools = step.toolCalls?.map((t) => `${t.toolName}(${JSON.stringify(t.input).slice(0, 40)})`).join(", ")
  console.log(`  Step ${result.steps.indexOf(step) + 1}: ${step.finishReason}${tools ? ` → ${tools}` : ""}`)
}
