/**
 * 02 — 工具设计黄金法则
 * 对应章节：第五章 Tools 设计与实现
 *
 * 演示三个核心原则：
 *   ① description 写法：何时用 / 何时不用 / 返回什么
 *   ② 返回值精简：给 LLM 看的，不是给程序看的
 *   ③ 错误返回：结构化 + suggestion，让模型知道下一步
 *
 * 运行：
 *   pnpm tsx 02-tool-design.ts
 */

import { generateText, tool, jsonSchema, stepCountIs } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

// ─────────────────────────────────────────────────────────────────
// ✅ 好的工具示例：description 清晰，返回值精简，错误有 guidance
// ─────────────────────────────────────────────────────────────────

const searchVideos = tool({
  // ① description 是写给 LLM 的"使用说明书"，要有三要素：
  //    - 何时使用（触发条件）
  //    - 何时不用（排除条件，防止模型误用）
  //    - 返回什么（帮助模型理解下一步怎么用）
  description: `搜索 YouTube 视频。

何时使用：用户想查找某主题的视频，但没有提供具体 URL 或视频 ID。
何时不用：用户已提供视频 ID 时，直接用 getVideoInfo，不要再搜索。

返回：最多 5 个匹配视频（标题、ID、时长）。结果按相关性排序，第一个最匹配。`,

  inputSchema: jsonSchema<{ query: string; maxResults?: number }>({
    type: "object",
    properties: {
      query: {
        type: "string",
        // ② 参数的 description 要包含格式示例
        description: "搜索关键词，使用用户描述中的核心词汇，2-5 个词最佳。例如：'React hooks tutorial 2024'",
      },
      maxResults: {
        type: "number",
        description: "返回结果数量，1-10 之间，默认 5",
      },
    },
    required: ["query"],
  }),

  execute: async ({ query, maxResults = 5 }: { query: string; maxResults?: number }) => {
    console.log(`  [Tool] searchVideos("${query}", max=${maxResults})`)

    // 模拟 API 调用
    await new Promise((r) => setTimeout(r, 100))

    // ③ 偶尔模拟错误场景
    if (query.length < 2) {
      return {
        error: true,
        message: "搜索词过短",
        suggestion: "请提供至少 2 个字符的搜索词，例如 'React tutorial'",
        retryable: true,
      }
    }

    // ✅ 精简返回值：只给 LLM 需要的字段，不要返回原始 API 响应
    return {
      count: Math.min(maxResults, 3),
      videos: [
        { id: "dQw4w9WgXcQ", title: `${query} - 完整教程`, duration: "12:34", views: 150_000 },
        { id: "abc123xyz", title: `${query} 实战案例`, duration: "8:22", views: 45_000 },
        { id: "xyz789abc", title: `${query} 入门指南`, duration: "5:11", views: 20_000 },
      ].slice(0, maxResults),
    }
  },
})

const getVideoInfo = tool({
  description: `获取 YouTube 视频的详细信息。

何时使用：已知视频 ID 时（用户直接提供，或 searchVideos 返回后）。
何时不用：不知道视频 ID 时，先用 searchVideos。

返回：标题、时长、是否有字幕、观看数。`,

  inputSchema: jsonSchema<{ videoId: string }>({
    type: "object",
    properties: {
      videoId: {
        type: "string",
        description: "YouTube 视频 ID，11 位字母数字。例如：dQw4w9WgXcQ",
      },
    },
    required: ["videoId"],
  }),

  execute: async ({ videoId }: { videoId: string }) => {
    console.log(`  [Tool] getVideoInfo("${videoId}")`)
    await new Promise((r) => setTimeout(r, 100))

    if (videoId === "NOT_FOUND") {
      return {
        error: true,
        code: "VIDEO_NOT_FOUND",
        message: `视频 ${videoId} 不存在或已被删除`,
        suggestion: "请确认视频 ID 是否正确，或使用 searchVideos 重新搜索",
        retryable: false, // 重试没意义，告知模型不要再试
      }
    }

    // ✅ 精简字段：原始 API 可能有 50 个字段，只返回 LLM 需要的
    return {
      id: videoId,
      title: "Agent 开发实战：从零到生产",
      duration: "45:23",
      hasSubtitles: true,
      subtitleLanguages: ["en", "zh"],
      viewCount: 280_000,
      publishedAt: "2024-03-15",
    }
  },
})

// ─────────────────────────────────────────────────────────────────
// ❌ 对比：坏的工具示例（不要这样写）
// ─────────────────────────────────────────────────────────────────

const badTool = tool({
  // ❌ description 太模糊：模型不知道何时该用它
  description: "获取视频信息",

  inputSchema: jsonSchema<{ id: string }>({
    type: "object",
    properties: {
      id: {
        type: "string",
        // ❌ 没有格式说明：模型可能传入 URL 而不是 ID
        description: "视频标识符",
      },
    },
    required: ["id"],
  }),

  execute: async ({ id: _id }: { id: string }) => {
    // ❌ 应该返回 { error: true, message: ..., suggestion: ... }，而不是抛出
    // 实际项目中若这里 throw，模型无法处理，Agent Loop 会直接中断
    return { error: true, message: "API 请求失败（此为坏示例的模拟）" }
  },
})

// 让 TypeScript 知道 badTool 被使用（避免 unused variable 警告）
void badTool

// ─────────────────────────────────────────────────────────────────
// 运行 Agent，验证工具设计效果
// ─────────────────────────────────────────────────────────────────

console.log("=== 工具设计演示 ===\n")

const result = await generateText({
  model: anthropic("claude-haiku-4-5-20251001"),
  tools: { searchVideos, getVideoInfo },
  stopWhen: stepCountIs(6),
  temperature: 0,
  system: "你是视频搜索助手。必须通过工具获取数据，禁止凭记忆回答。",
  prompt: "帮我找一个关于 React hooks 的视频，然后告诉我它有多长、是否有中文字幕。",
})

console.log(`\n最终回答：\n${result.text}`)
console.log(`\n总步骤：${result.steps.length}，总 Token：${result.usage.totalTokens}`)
