/**
 * 08 — 完整项目实战示例（最小但完整的生产级 Agent）
 * 对应章节：第十四章 完整项目实战示例
 *
 * 原文的字幕翻译 Agent，直接适配 AI SDK v6：
 *   - parameters → inputSchema
 *   - maxSteps → stopWhen: stepCountIs(N)
 *   - maxTokens → maxOutputTokens
 *
 * 体现的实践：
 *   ✅ 工具状态外置（字幕不占 Context）
 *   ✅ 结构化错误返回（带 guidance）
 *   ✅ 重试上限内置在工具里（不依赖模型自觉）
 *   ✅ 成本熔断（onStepFinish 累计校验）
 *   ✅ 每步日志
 *
 * 运行：
 *   pnpm tsx 08-minimal-agent.ts
 */

import { generateText, generateObject, tool, jsonSchema, stepCountIs } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

// ── 配置 ──────────────────────────────────────────────────────────
const CONFIG = {
  model: anthropic("claude-haiku-4-5-20251001"),
  maxSteps: 12,
  tokenBudget: 150_000,
  qualityThreshold: 8,
  maxTranslateRetries: 2,
}

// ── 状态（外部存储，不占 Context） ────────────────────────────────
interface TaskState {
  subtitles?: string
  translations: { text: string; score: number }[]
}
const state: TaskState = { translations: [] }

// ── 模拟外部 API ──────────────────────────────────────────────────
async function fetchSubtitles(videoId: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 100))
  if (videoId === "no_sub") {
    const err = Object.assign(new Error("No subtitles found"), { code: "NO_SUBTITLES" })
    throw err
  }
  // 返回模拟的英文字幕（实际项目替换为 YouTube Data API 调用）
  return `Welcome to this tutorial on AI Agents. Today we'll explore how agents work,
including the ReAct loop, tool use, and memory management. By the end of this video,
you'll understand how to build production-ready agents using modern AI SDKs.`
}

// ── 工具定义 ──────────────────────────────────────────────────────
const tools = {
  getSubtitles: tool({
    description: `获取 YouTube 视频的英文字幕。
何时使用：任务开始时，第一个调用的工具。
返回：字幕文本预览和总长度。完整内容已存入任务状态。`,
    inputSchema: jsonSchema<{ videoId: string }>({
      type: "object",
      properties: {
        videoId: { type: "string", description: "YouTube 视频 ID，11 位字符，如 dQw4w9WgXcQ" },
      },
      required: ["videoId"],
    }),
    execute: async ({ videoId }: { videoId: string }) => {
      try {
        const subs = await fetchSubtitles(videoId)
        state.subtitles = subs
        return {
          success: true,
          preview: subs.slice(0, 200),
          totalLength: subs.length,
          note: "完整字幕已加载。调用 translate 工具进行翻译。",
        }
      } catch (e) {
        const err = e as Error & { code?: string }
        return {
          error: true,
          code: err.code ?? "UNKNOWN",
          message:
            err.code === "NO_SUBTITLES"
              ? "该视频没有英文字幕，无法处理。请告知用户并结束任务。"
              : `获取失败：${err.message}。可重试一次。`,
        }
      }
    },
  }),

  translate: tool({
    description: `将已加载的字幕翻译成简体中文（字幕风格：简洁、口语化）。
何时使用：getSubtitles 成功后。如果 evaluate 反馈质量不达标，可携带改进意见重新调用。`,
    inputSchema: jsonSchema<{ improvements?: string }>({
      type: "object",
      properties: {
        improvements: {
          type: "string",
          description: "可选。上一次质量评估给出的改进意见，重新翻译时传入",
        },
      },
    }),
    execute: async ({ improvements }: { improvements?: string }) => {
      if (!state.subtitles) {
        return { error: true, message: "尚未加载字幕，请先调用 getSubtitles" }
      }
      if (state.translations.length > CONFIG.maxTranslateRetries) {
        return {
          error: true,
          message: `已重试 ${CONFIG.maxTranslateRetries} 次，停止重试。使用当前最高分版本并向用户说明。`,
        }
      }

      const { text } = await generateText({
        model: CONFIG.model,
        system: "你是专业字幕翻译。输出仅包含译文，简洁口语化，每句不超过 20 字。",
        prompt: `${improvements ? `改进要求：${improvements}\n\n` : ""}翻译：\n${state.subtitles}`,
        temperature: 0,
        maxOutputTokens: 500,
      })

      state.translations.push({ text, score: 0 })
      return {
        success: true,
        attempt: state.translations.length,
        preview: text.slice(0, 200),
      }
    },
  }),

  evaluate: tool({
    description: `评估最新一次翻译的质量（0-10 分）。
何时使用：每次 translate 之后必须调用。
评分 >= ${CONFIG.qualityThreshold} 即达标。`,
    inputSchema: jsonSchema<Record<never, never>>({
      type: "object",
      properties: {},
    }),
    execute: async () => {
      const latest = state.translations.at(-1)
      if (!latest) return { error: true, message: "没有可评估的翻译" }

      const { object } = await generateObject({
        model: CONFIG.model,
        schema: jsonSchema<{ score: number; issues: string[] }>({
          type: "object",
          properties: {
            score: { type: "number", description: "综合评分 0-10，8 分及以上为合格字幕译文" },
            issues: { type: "array", items: { type: "string" }, description: "具体问题列表" },
          },
          required: ["score", "issues"],
        }),
        system: "你是严格的字幕质量评审员。字幕要求：简洁（≤20字/句）、口语化、准确。",
        prompt: `评估翻译质量：
原文：${state.subtitles!.slice(0, 500)}
译文：${latest.text.slice(0, 500)}`,
        temperature: 0,
      })

      latest.score = object.score

      return {
        score: object.score,
        passed: object.score >= CONFIG.qualityThreshold,
        issues: object.issues,
        guidance:
          object.score >= CONFIG.qualityThreshold
            ? "质量达标，可以输出最终结果。"
            : `未达标。携带 issues 中的改进意见重新调用 translate。`,
      }
    },
  }),
}

// ── System Prompt ─────────────────────────────────────────────────
const SYSTEM = `你是字幕处理 Agent。

# 流程
1. getSubtitles 获取字幕
2. translate 翻译
3. evaluate 评估，未达 ${CONFIG.qualityThreshold} 分则带改进意见重新 translate（最多 ${CONFIG.maxTranslateRetries} 次重试）
4. 完成后输出：质量评分 + 最终译文预览

# 规则
- 必须通过工具获取数据，禁止编造
- 工具报告致命错误（如无字幕）时，向用户说明并结束，不要强行继续
- 推理保持简洁`

// ── 主函数 ────────────────────────────────────────────────────────
async function processVideo(videoId: string) {
  // 重置状态（每次调用独立）
  state.subtitles = undefined
  state.translations.length = 0

  let totalTokens = 0
  const startTime = Date.now()

  const result = await generateText({
    model: CONFIG.model,
    system: SYSTEM,
    tools,
    stopWhen: stepCountIs(CONFIG.maxSteps), // v6: 替代 maxSteps
    temperature: 0,
    onStepFinish: ({ usage, toolCalls }) => {
      // v6: LanguageModelUsage 没有 totalTokens，用 inputTokens + outputTokens
      totalTokens += (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0)
      const names = toolCalls?.map((t) => t.toolName).join(", ") || "thinking"
      console.log(`  [${new Date().toISOString().slice(11, 19)}] ${names} (${totalTokens} tokens)`)

      if (totalTokens > CONFIG.tokenBudget) {
        throw new Error(`超出 Token 预算 (${CONFIG.tokenBudget})，任务中止`)
      }
    },
    prompt: `处理视频 ${videoId} 的字幕翻译。`,
  })

  const elapsed = Date.now() - startTime

  return {
    answer: result.text,
    finalTranslation: state.translations.at(-1),
    steps: result.steps.length,
    tokens: totalTokens,
    elapsed,
  }
}

// ── 运行演示 ──────────────────────────────────────────────────────
console.log("=== 最小完整 Agent 演示（字幕翻译）===\n")

// 场景 1：正常流程
console.log("── 场景 1：正常翻译流程")
const ok = await processVideo("dQw4w9WgXcQ")
console.log(`\n最终回答：\n${ok.answer}`)
console.log(`\n执行摘要：${ok.steps} 步 / ${ok.tokens} tokens / ${ok.elapsed}ms`)
if (ok.finalTranslation) {
  console.log(`最高质量分：${ok.finalTranslation.score}/10`)
}

// 场景 2：无字幕视频
console.log("\n── 场景 2：无字幕视频")
const noSub = await processVideo("no_sub")
console.log(`\n最终回答：\n${noSub.answer}`)
