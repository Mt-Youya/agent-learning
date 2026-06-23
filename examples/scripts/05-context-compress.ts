/**
 * 05 — Context 压缩策略
 * 对应章节：第七章 7.1 Context Window 管理策略
 *
 * 演示三种策略：
 *   1. 滑动窗口（最简单）—— 丢弃旧消息，保留最近 N 条
 *   2. 摘要压缩（推荐）—— 用便宜模型压缩旧历史
 *   3. 外部状态（复杂任务）—— 大数据不进 Context，只存引用
 *
 * 运行：
 *   pnpm tsx 05-context-compress.ts
 */

import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import type { ModelMessage } from "ai"

// ─────────────────────────────────────────────────────────────────
// 策略 1：滑动窗口（最简单）
// ─────────────────────────────────────────────────────────────────

function slidingWindow(messages: ModelMessage[], maxMessages = 20): ModelMessage[] {
  if (messages.length <= maxMessages) return messages

  // 保留：第一条 user（任务定义）+ 最近的 N-1 条
  const first = messages[0]
  const recent = messages.slice(-(maxMessages - 1))

  console.log(`[滑动窗口] 原 ${messages.length} 条 → 保留 ${1 + recent.length} 条（丢弃中间 ${messages.length - maxMessages} 条）`)

  return [first, ...recent]
}

// ─────────────────────────────────────────────────────────────────
// 策略 2：摘要压缩（推荐）
// ─────────────────────────────────────────────────────────────────

async function compressHistory(messages: ModelMessage[]): Promise<ModelMessage[]> {
  // 只压缩旧消息，保留最近 10 条原样
  const keepRecent = 10
  if (messages.length <= keepRecent) return messages

  const oldMessages = messages.slice(0, -keepRecent)
  const recentMessages = messages.slice(-keepRecent)

  // 把旧历史序列化为文本
  const historyText = oldMessages
    .map((m) => {
      const role = m.role === "user" ? "用户" : "助手"
      const content =
        typeof m.content === "string"
          ? m.content.slice(0, 200) // 截断，只用前 200 字
          : "[非文本内容]"
      return `${role}: ${content}`
    })
    .join("\n")

  console.log(`[摘要压缩] 压缩旧 ${oldMessages.length} 条消息，保留最近 ${recentMessages.length} 条...`)

  // 用便宜模型（Haiku）压缩旧历史
  const { text: summary } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"),
    prompt: `将以下 Agent 执行历史压缩成简洁摘要（不超过 200 字），保留：
- 已完成的关键步骤
- 重要的中间结果
- 当前进度状态

对话历史：
${historyText}`,
    maxOutputTokens: 300,
    temperature: 0,
  })

  console.log(`[摘要压缩] 摘要（${summary.length} 字）：${summary.slice(0, 80)}...`)

  // 将摘要作为"历史背景"注入，再接上最近消息
  return [
    { role: "user", content: `[历史摘要]\n${summary}` },
    { role: "assistant", content: "了解，我会在此基础上继续处理。" },
    ...recentMessages,
  ]
}

// ─────────────────────────────────────────────────────────────────
// 策略 3：外部状态（复杂任务）
// ─────────────────────────────────────────────────────────────────

// 大数据放外部，Context 里只存引用和摘要
interface ExternalState {
  subtitles?: string // 可能有 5 万字
  translated?: string
  qualityScore?: number
  refs: Map<string, string> // ref_id → 实际内容
}

const externalState: ExternalState = { refs: new Map() }

// 模拟"存储大数据，返回引用"的工具
async function saveToExternal(content: string): Promise<string> {
  const ref = `ref_${Date.now()}`
  externalState.refs.set(ref, content)
  return ref
}

// 工具只返回引用，不把 50K 数据塞进 Context
async function mockGetSubtitles(videoId: string): Promise<{ preview: string; ref: string; totalLength: number; note: string }> {
  const subtitles = `[模拟字幕] 这是视频 ${videoId} 的字幕内容。`.repeat(100) // 约 5K 字
  const ref = await saveToExternal(subtitles)
  return {
    preview: subtitles.slice(0, 200), // 只返回预览
    ref,                               // 完整内容的引用
    totalLength: subtitles.length,
    note: `完整字幕已保存为 ${ref}，通过 readRef(${ref}) 分段读取`,
  }
}

// ─────────────────────────────────────────────────────────────────
// 演示
// ─────────────────────────────────────────────────────────────────

console.log("=== Context 压缩策略演示 ===\n")

// 构造一段模拟的长对话历史
const mockHistory: ModelMessage[] = Array.from({ length: 30 }, (_, i) => {
  const turn = Math.floor(i / 2)
  return i % 2 === 0
    ? { role: "user" as const, content: `任务 ${turn + 1}：处理数据集 ${turn + 1}` }
    : {
        role: "assistant" as const,
        content: `已完成任务 ${turn + 1}，结果：数据集 ${turn + 1} 处理成功，发现 ${turn * 3} 个异常项。`,
      }
})

console.log(`原始对话：${mockHistory.length} 条消息\n`)

// 策略 1：滑动窗口
const windowed = slidingWindow(mockHistory, 10)
console.log(`策略 1 结果：${windowed.length} 条消息\n`)

// 策略 2：摘要压缩
const compressed = await compressHistory(mockHistory)
console.log(`策略 2 结果：${compressed.length} 条消息\n`)

// 策略 3：外部状态演示
console.log("策略 3：外部状态")
const subtitleResult = await mockGetSubtitles("abc123")
console.log(`获取字幕：${subtitleResult.totalLength} 字`)
console.log(`Context 中只存引用：${subtitleResult.ref}（不是 ${subtitleResult.totalLength} 字的实际内容）`)
console.log(`预览：${subtitleResult.preview.slice(0, 60)}...`)

console.log("\n─── 策略选择指南 ───")
console.log("数据量小（< 10 条）: 不需要压缩")
console.log("数据量中（10-50 条）: 滑动窗口，简单快速")
console.log("数据量大（> 50 条）: 摘要压缩，保留语义")
console.log("超大数据（MB级）: 外部存储 + 引用，Context 极简")
