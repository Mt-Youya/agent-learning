/**
 * 06 — 错误处理与容错设计
 * 对应章节：第八章 错误处理与容错设计
 *
 * 演示：
 *   ① withRetry：指数退避 + 随机抖动，区分可重试/不可重试错误
 *   ② 错误分类矩阵：喂给模型 vs 直接抛出
 *   ③ 优雅降级：主模型挂了自动切备用
 *   ④ 在 Agent 工具中的实际用法
 *
 * 运行：
 *   pnpm tsx 06-error-retry.ts
 */

import { generateText, tool, jsonSchema, stepCountIs } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

// ─────────────────────────────────────────────────────────────────
// ① 指数退避重试（生产级实现）
// ─────────────────────────────────────────────────────────────────

interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  // 判断是否可重试的函数（不传则默认只重试网络/限流错误）
  isRetryable?: (error: unknown) => boolean
}

async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000 } = options

  const isRetryable =
    options.isRetryable ??
    ((error: unknown) => {
      const e = error as { status?: number; code?: string }
      return (
        e.status === 429 || // 限流 Rate Limited
        e.status === 503 || // 服务不可用
        e.code === "ETIMEDOUT" || // 网络超时
        e.code === "ECONNRESET" // 连接重置
      )
    })

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (!isRetryable(error) || attempt === maxRetries) {
        throw error // 不可重试，或已用完重试次数
      }

      // 指数退避 + 随机抖动，避免所有请求同时重试
      const delay = baseDelay * 2 ** attempt + Math.random() * 1000
      console.warn(`  [Retry] 第 ${attempt + 1}/${maxRetries} 次重试，等待 ${Math.round(delay)}ms...`)
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw new Error("unreachable")
}

// ─────────────────────────────────────────────────────────────────
// ② 错误分类：什么时候喂给模型，什么时候直接抛出
// ─────────────────────────────────────────────────────────────────

class FatalAgentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "FatalAgentError"
  }
}

// 模拟 API 调用，演示错误分类
async function fetchVideoInfo(videoId: string): Promise<{ title: string; hasSubtitles: boolean }> {
  // 模拟各种错误场景
  if (videoId === "NOT_FOUND") {
    const err = new Error("Video not found") as Error & { code: string }
    err.code = "VIDEO_NOT_FOUND"
    throw err
  }
  if (videoId === "QUOTA_EXCEEDED") {
    const err = new Error("API quota exceeded") as Error & { code: string }
    err.code = "QUOTA_EXCEEDED"
    throw err
  }
  if (videoId === "FLAKY") {
    // 模拟 50% 概率的网络错误（用于测试重试）
    if (Math.random() < 0.5) {
      const err = new Error("Network timeout") as Error & { code: string; status?: number }
      err.status = 503
      throw err
    }
  }
  return { title: `视频 ${videoId} 的标题`, hasSubtitles: true }
}

// ─────────────────────────────────────────────────────────────────
// ③ 工具中的错误处理实战
// ─────────────────────────────────────────────────────────────────

const getVideoInfoTool = tool({
  description: "获取视频信息。遇到临时错误自动重试，永久错误返回明确说明。",
  inputSchema: jsonSchema<{ videoId: string }>({
    type: "object",
    properties: { videoId: { type: "string", description: "视频 ID，11 位字符，如 dQw4w9WgXcQ" } },
    required: ["videoId"],
  }),
  execute: async ({ videoId }: { videoId: string }) => {
    try {
      // 自动重试网络/限流错误
      const result = await withRetry(() => fetchVideoInfo(videoId), {
        maxRetries: 2,
        baseDelay: 200, // demo 缩短延迟
      })
      return { success: true, ...result }
    } catch (error) {
      const e = error as Error & { code?: string }

      // ── 模型能处理：视频不存在，告诉模型换一个 ────────────────────
      if (e.code === "VIDEO_NOT_FOUND") {
        return {
          error: true,
          code: "VIDEO_NOT_FOUND",
          message: `视频 ${videoId} 不存在或已删除`,
          suggestion: "请提示用户检查视频 ID 是否正确，或建议用 searchVideos 重新搜索",
        }
      }

      // ── 模型无法处理：配额耗尽，重试也没用 ─────────────────────────
      if (e.code === "QUOTA_EXCEEDED") {
        throw new FatalAgentError("YouTube API 每日配额耗尽，今日无法继续处理视频")
        // FatalAgentError 会向上抛出，终止整个 Agent，不会被模型"吃掉"
      }

      // ── 其他未知错误：重新抛出 ────────────────────────────────────
      throw error
    }
  },
})

// ─────────────────────────────────────────────────────────────────
// ④ 优雅降级：主模型挂了切备用
// ─────────────────────────────────────────────────────────────────

const MODEL_CHAIN = [
  anthropic("claude-sonnet-4-6"),        // 主力
  anthropic("claude-haiku-4-5-20251001"), // 降级备用
]

async function generateWithFallback(prompt: string): Promise<string> {
  let lastError: unknown
  for (const model of MODEL_CHAIN) {
    try {
      const { text } = await generateText({ model, prompt, maxOutputTokens: 100, temperature: 0 })
      console.log(`  [Fallback] 使用模型：${model.modelId}`)
      return text
    } catch (error) {
      const e = error as { status?: number }
      lastError = error
      // 529 = 模型过载，尝试下一个
      if (e.status === 529 || e.status === 503) {
        console.warn(`  [Fallback] ${model.modelId} 不可用，切换备用...`)
        continue
      }
      throw error // 其他错误直接抛
    }
  }
  throw lastError
}

// ─────────────────────────────────────────────────────────────────
// 演示
// ─────────────────────────────────────────────────────────────────

console.log("=== 错误处理与容错演示 ===\n")

// 演示 1：withRetry
console.log("── 演示 1：指数退避重试（FLAKY 视频有 50% 概率失败）")
try {
  const result = await withRetry(() => fetchVideoInfo("FLAKY"), { maxRetries: 3, baseDelay: 100 })
  console.log("  成功：", result)
} catch (e) {
  console.log("  重试耗尽后最终失败：", (e as Error).message)
}

// 演示 2：Agent 中的错误处理
console.log("\n── 演示 2：Agent 工具中的错误分类")
const result = await generateText({
  model: anthropic("claude-haiku-4-5-20251001"),
  tools: { getVideoInfo: getVideoInfoTool },
  stopWhen: stepCountIs(4),
  temperature: 0,
  system: "你是视频助手。工具返回错误时，向用户友好地说明情况。",
  prompt: "帮我获取视频 NOT_FOUND 的信息",
})
console.log("  Agent 回答：", result.text)

// 演示 3：优雅降级
console.log("\n── 演示 3：优雅降级（主模型 → 备用模型）")
const fallbackText = await generateWithFallback("用一句话解释 Agent Loop")
console.log("  结果：", fallbackText)
