/**
 * 09 — LangGraph.js：状态机驱动的 Agent
 * 对应章节：第一章 1.3 框架选型（"复杂工作流 → LangGraph.js"）
 *
 * 核心思想：
 *   AI SDK 方式：generateText({ tools }) → 模型自己决定调哪个工具
 *   LangGraph 方式：你画图（StateGraph），模型只是图中的某些节点
 *
 * 演示的关键特性：
 *   ① StateGraph + Annotation 定义显式状态（不靠 Context 传递）
 *   ② 节点（Node）= 纯函数，只关心自己的输入/输出
 *   ③ 条件边（addConditionalEdges）= 显式路由，不是模型决定
 *   ④ 循环边：evaluate → translate（重试）体现有向图 != 有向无环图
 *
 * 同一任务的对比：
 *   08-minimal-agent.ts  → AI SDK（模型驱动，工具调用）
 *   09-langgraph.ts      → LangGraph（状态机驱动，显式路由）
 *
 * 运行：
 *   pnpm tsx 09-langgraph.ts
 */

import { StateGraph, Annotation, START, END } from "@langchain/langgraph"
import { generateText, generateObject, jsonSchema } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

// LangGraph 管编排（节点 + 边），AI SDK 管 LLM 调用
// 两者完全可以混用——LangGraph 是框架无关的状态机

// ─────────────────────────────────────────────────────────────────
// ① 定义 Graph State（整个工作流共享的状态）
//
//   对比 AI SDK：状态隐藏在 messages 数组里，你看不到
//   LangGraph：状态完全透明，每个节点显式读写
// ─────────────────────────────────────────────────────────────────

// LangGraph v1：有 default 的字段必须同时提供 value（reducer）
// value: (_prev, next) => next  → 最后写入的值覆盖前值（Last Write Wins）
// value: (prev, next) => [...prev, ...next]  → 追加（用于日志等）
const overwrite = <T>(prev: T, next: T): T => next

const GraphState = Annotation.Root({
  // 输入
  videoId: Annotation<string>(),

  // 流程中间状态（外部存储，不占 LLM Context）
  subtitles:   Annotation<string>      ({ value: overwrite, default: () => "" }),
  translation: Annotation<string>      ({ value: overwrite, default: () => "" }),

  // 质量控制
  score:   Annotation<number>    ({ value: overwrite, default: () => 0 }),
  issues:  Annotation<string[]>  ({ value: overwrite, default: () => [] }),
  retries: Annotation<number>    ({ value: overwrite, default: () => 0 }),

  // 错误处理
  error: Annotation<string | null>({ value: overwrite, default: () => null }),

  // 执行日志（追加，不覆盖）
  log: Annotation<string[]>({
    value: (prev: string[], next: string[]) => [...prev, ...next],
    default: () => [],
  }),
})

type State = typeof GraphState.State

// ─────────────────────────────────────────────────────────────────
// 模型实例（节点内复用）
// ─────────────────────────────────────────────────────────────────

const haikuModel = anthropic("claude-haiku-4-5-20251001")

// ─────────────────────────────────────────────────────────────────
// ② 定义节点（Node）
//
//   每个节点：(state: State) => Partial<State>
//   只返回需要更新的字段，其他字段保持不变
// ─────────────────────────────────────────────────────────────────

// 节点 1：获取字幕（模拟外部 API）
async function fetchSubtitles(state: State): Promise<Partial<State>> {
  console.log(`[fetchSubtitles] videoId=${state.videoId}`)

  if (state.videoId === "no_sub") {
    return {
      error: "该视频没有英文字幕，无法处理",
      log: [`fetchSubtitles: 失败，videoId=${state.videoId}`],
    }
  }

  // 模拟 YouTube Data API 调用（实际替换为真实 API）
  await new Promise((r) => setTimeout(r, 100))
  const subtitles = `Welcome to this tutorial on AI Agents.
Today we explore how agents work, including the ReAct loop, tool use, and memory.
By the end you'll understand how to build production-ready agents using modern AI SDKs.`

  return {
    subtitles,
    log: [`fetchSubtitles: 成功，${subtitles.length} 字符`],
  }
}

// 节点 2：翻译字幕
async function translate(state: State): Promise<Partial<State>> {
  const attempt = state.retries + 1
  console.log(`[translate] 第 ${attempt} 次翻译`)

  const issueHint =
    state.issues.length > 0 ? `\n\n上次问题（请改进）：\n${state.issues.map((i) => `- ${i}`).join("\n")}` : ""

  const { text: translation } = await generateText({
    model: haikuModel,
    system: "你是专业字幕翻译。只输出译文，简洁口语化，每句不超过 20 字。",
    prompt: `翻译以下字幕：\n${state.subtitles}${issueHint}`,
    temperature: 0,
    maxOutputTokens: 500,
  })

  return {
    translation,
    retries: state.retries + 1, // 每次调用 +1（第1次→1，第2次→2……）
    log: [`translate: 第${attempt}次，${translation.length} 字符`],
  }
}

// 节点 3：评估翻译质量
async function evaluate(state: State): Promise<Partial<State>> {
  console.log(`[evaluate] 评估第 ${state.retries + 1} 次翻译...`)

  const { object: result } = await generateObject({
    model: haikuModel,
    schema: jsonSchema<{ score: number; issues: string[] }>({
      type: "object",
      properties: {
        score:  { type: "number", description: "综合评分 0-10" },
        issues: { type: "array", items: { type: "string" }, description: "具体问题列表" },
      },
      required: ["score", "issues"],
    }),
    system: "你是严格的字幕评审员。字幕要求：简洁（≤20字/句）、口语化、准确。",
    prompt: `原文：${state.subtitles.slice(0, 500)}\n\n译文：${state.translation.slice(0, 500)}`,
    temperature: 0,
  })

  const { score, issues } = result
  console.log(`[evaluate] 评分：${score}/10，问题：${issues.length} 个`)

  return {
    score,
    issues,
    log: [`evaluate: ${score}/10，${issues.length} 个问题`],
  }
}

// 节点 4：完成（生成最终输出）
async function done(state: State): Promise<Partial<State>> {
  const { text: finalAnswer } = await generateText({
    model: haikuModel,
    system: "你是字幕处理助手，简洁输出结果。",
    prompt: `翻译完成，质量评分 ${state.score}/10。\n译文预览：${state.translation.slice(0, 200)}\n\n用一段话告知用户结果。`,
    temperature: 0,
    maxOutputTokens: 200,
  })
  console.log(`\n最终回答：\n${finalAnswer}`)
  return { log: [`done: 输出最终答案`], translation: state.translation, score: state.score }
}

// ─────────────────────────────────────────────────────────────────
// ③ 条件路由函数
//
//   这里是 LangGraph 最核心的差异：
//   你（开发者）决定下一步走哪条边，而不是模型
// ─────────────────────────────────────────────────────────────────

const QUALITY_THRESHOLD = 8
const MAX_RETRIES = 2

function routeAfterFetch(state: State): string {
  // 获取失败 → 直接结束（不走翻译流程）
  return state.error ? END : "translate"
}

function routeAfterEvaluate(state: State): string {
  // 质量达标 OR translate 已调用超过 MAX_RETRIES 次 → 结束
  // retries 每次 translate 后 +1，> MAX_RETRIES 即第 3 次后停止
  if (state.score >= QUALITY_THRESHOLD || state.retries > MAX_RETRIES) {
    return "done"
  }
  // 否则：带着 issues 重新翻译（循环边！这是 DAG 变 Graph 的关键）
  console.log(`  → 未达标（${state.score}/${QUALITY_THRESHOLD}），重试 ${state.retries + 1}/${MAX_RETRIES}`)
  return "translate"
}

// ─────────────────────────────────────────────────────────────────
// ④ 构建 StateGraph
// ─────────────────────────────────────────────────────────────────

const workflow = new StateGraph(GraphState)
  // 注册节点
  .addNode("fetchSubtitles", fetchSubtitles)
  .addNode("translate", translate)
  .addNode("evaluate", evaluate)
  .addNode("done", done)

  // 静态边：确定性的先后顺序
  .addEdge(START, "fetchSubtitles")
  .addEdge("translate", "evaluate")
  .addEdge("done", END)

  // 条件边：根据状态决定走哪条路
  .addConditionalEdges("fetchSubtitles", routeAfterFetch)
  .addConditionalEdges("evaluate", routeAfterEvaluate)

const app = workflow.compile()

// ─────────────────────────────────────────────────────────────────
// 运行演示
// ─────────────────────────────────────────────────────────────────

console.log("=== LangGraph.js 状态机 Agent 演示 ===\n")

// 场景 1：正常翻译流程
console.log("── 场景 1：正常翻译")
const result1 = await app.invoke({ videoId: "dQw4w9WgXcQ" })

console.log(`\n执行日志：`)
for (const entry of result1.log) {
  console.log(`  · ${entry}`)
}
console.log(`最终评分：${result1.score}/10`)
console.log(`译文预览：${result1.translation.slice(0, 100)}...`)

// 场景 2：无字幕视频（错误路由）
console.log("\n── 场景 2：无字幕视频")
const result2 = await app.invoke({ videoId: "no_sub" })
console.log(`错误信息：${result2.error}`)
console.log(`日志：${result2.log.join(" → ")}`)

// ─────────────────────────────────────────────────────────────────
// 关键对比总结
// ─────────────────────────────────────────────────────────────────

console.log(`
${"═".repeat(60)}
AI SDK vs LangGraph 核心差异

AI SDK（generateText + tools）：
  ┌──────────────────────────────────────────────────┐
  │  你定义工具描述，模型决定调哪个工具、调几次        │
  │  适合：工具数少、流程灵活、让模型自由发挥          │
  └──────────────────────────────────────────────────┘

LangGraph.js（StateGraph）：
  ┌──────────────────────────────────────────────────┐
  │  你画图（节点+边），模型只是节点内的计算单元       │
  │  适合：流程固定、需要精确控制、有条件分支+循环     │
  └──────────────────────────────────────────────────┘

何时选 LangGraph：
  ✓ 工作流有明确的阶段（fetch → process → validate → publish）
  ✓ 需要显式的重试/循环逻辑
  ✓ 多个 LLM 节点各司其职（翻译模型 ≠ 评估模型）
  ✓ 需要 Human-in-the-loop（interrupt/resume）
  ✓ 需要持久化检查点（断点续跑）
${"═".repeat(60)}
`)
