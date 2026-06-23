/**
 * 01 — 模型分层（Model Cascade）
 * 对应章节：第一章 1.2 第二个问题：选择模型
 *
 * 核心思想：
 *   用便宜模型做任务路由（分类），用合适模型执行实际任务。
 *   Haiku 成本约为 Sonnet 的 1/20，简单分类任务绰绰有余。
 *
 * 运行：
 *   pnpm tsx 01-model-cascade.ts
 *   # 需要环境变量 ANTHROPIC_API_KEY
 */

import { generateText, generateObject, jsonSchema } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

// ── 路由结果的类型 ───────────────────────────────────────────────
interface RouteResult {
  complexity: "simple" | "complex"
  category: "translate" | "analyze" | "generate" | "other"
  reason: string
}

// ── 第一层：Haiku 路由（低成本分类） ─────────────────────────────
async function routeTask(input: string): Promise<RouteResult> {
  console.log("[Router] 使用 Haiku 分析任务复杂度...")

  const { object } = await generateObject({
    model: anthropic("claude-haiku-4-5-20251001"),
    schema: jsonSchema<RouteResult>({
      type: "object",
      properties: {
        complexity: {
          type: "string",
          enum: ["simple", "complex"],
          description: "simple=单步操作可完成; complex=需要多步推理或专业知识",
        },
        category: {
          type: "string",
          enum: ["translate", "analyze", "generate", "other"],
        },
        reason: { type: "string", description: "判断理由，一句话" },
      },
      required: ["complexity", "category", "reason"],
    }),
    prompt: `判断以下用户请求的复杂度和类别：\n\n"${input}"`,
    temperature: 0,
  })

  return object
}

// ── 第二层：按复杂度选择执行模型 ──────────────────────────────────
async function executeTask(input: string, route: RouteResult): Promise<string> {
  // 简单任务用 Haiku，复杂任务用 Sonnet
  const model =
    route.complexity === "simple"
      ? anthropic("claude-haiku-4-5-20251001")
      : anthropic("claude-sonnet-4-6")

  const modelName = route.complexity === "simple" ? "Haiku（简单任务）" : "Sonnet（复杂任务）"
  console.log(`[Executor] 使用 ${modelName} 执行...`)

  const { text } = await generateText({
    model,
    prompt: input,
    temperature: 0,
    maxOutputTokens: 500,
  })

  return text
}

// ── 主函数：串联路由 → 执行 ────────────────────────────────────────
async function smartProcess(input: string) {
  console.log(`\n${"─".repeat(60)}`)
  console.log(`输入：${input}`)
  console.log("─".repeat(60))

  // 路由
  const route = await routeTask(input)
  console.log(`路由结果：${route.complexity} / ${route.category} — ${route.reason}`)

  // 执行
  const result = await executeTask(input, route)
  console.log(`\n回答：\n${result}`)

  return result
}

// ── 测试用例 ──────────────────────────────────────────────────────
const CASES = [
  "把 'Hello World' 翻译成中文",                         // simple / translate
  "分析量子计算对现有加密算法的影响，并给出 3 年内的技术路线建议", // complex / analyze
  "写一篇关于 AI Agent 的 2000 字技术博客",               // complex / generate
]

for (const input of CASES) {
  await smartProcess(input)
}
