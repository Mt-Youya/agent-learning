export type ChapterLevel = "入门" | "工具链" | "核心" | "实战" | "进阶"
export type VideoStatus = "ready" | "generating" | "pending"

export interface Chapter {
  slug: string
  title: string
  level: ChapterLevel
  duration: string
  description: string
  order: number
  trackColor: string
  videoStatus: VideoStatus
  videoUrl?: string
  prevChapter?: string
  nextChapter?: string
}

export interface TranscriptLine {
  /** Start time in seconds */
  time: number
  text: string
}

export const CHAPTERS: Chapter[] = [
  {
    slug: "llm-basics",
    title: "LLM 基础认知",
    level: "入门",
    duration: "1–2 周",
    description: "理解 Token、Context Window、Temperature、Prompt Engineering 与 Chat Completion API。",
    order: 1,
    trackColor: "var(--track-llm)",
    videoStatus: "ready",
    videoUrl: "/videos/llm-basics.mp4",
    nextChapter: "js-ts-toolchain",
  },
  {
    slug: "js-ts-toolchain",
    title: "JavaScript / TypeScript AI 工具链",
    level: "工具链",
    duration: "2–3 周",
    description: "学习 Vercel AI SDK、LangChain.js、OpenAI SDK、Anthropic SDK，从熟悉的 JavaScript 生态出发。",
    order: 2,
    trackColor: "var(--track-ts)",
    videoStatus: "generating",
    prevChapter: "llm-basics",
    nextChapter: "agent-core",
  },
  {
    slug: "agent-core",
    title: "Agent 核心概念",
    level: "核心",
    duration: "2–4 周",
    description: "理解 Tool Use、Function Calling、Memory、Planning、ReAct 循环、Agent Loop 等核心机制。",
    order: 3,
    trackColor: "var(--track-agent)",
    videoStatus: "ready",
    videoUrl: "/videos/agent-core.mp4",
    prevChapter: "js-ts-toolchain",
    nextChapter: "agent-frameworks",
  },
  {
    slug: "agent-frameworks",
    title: "Agent 框架实战",
    level: "实战",
    duration: "1–2 月",
    description: "使用 LangGraph.js、Mastra、MCP 构建真实 Agent，接入搜索、数据库、文件、代码执行等工具。",
    order: 4,
    trackColor: "var(--track-fw)",
    videoStatus: "pending",
    prevChapter: "agent-core",
    nextChapter: "multi-agent",
  },
  {
    slug: "multi-agent",
    title: "Multi-Agent 系统设计",
    level: "进阶",
    duration: "持续进阶",
    description: "学习 Orchestrator / Subagent 多智能体编排、RAG 检索增强、Agent 评估与可观测性。",
    order: 5,
    trackColor: "var(--track-multi)",
    videoStatus: "ready",
    videoUrl: "/videos/multi-agent.mp4",
    prevChapter: "agent-frameworks",
  },
]

/** Demo transcript for LLM Basics chapter */
export const LLM_BASICS_TRANSCRIPT: TranscriptLine[] = [
  { time: 0, text: "这一章我们先搞懂 LLM 应用开发中最重要的几个基础概念。" },
  { time: 8, text: "从前端开发者的视角来看，LLM 其实就是一个特殊的 API 端点。" },
  { time: 16, text: "Token 是模型处理文本时的最小计算单位，不等同于字符、词语或汉字。" },
  { time: 25, text: "中文一个汉字通常对应 1–2 个 Token，英文单词大约 1 个。" },
  { time: 34, text: "Context Window 决定了模型在一次调用中能处理的最大 Token 数量。" },
  { time: 44, text: "超出 Context Window 的内容会被截断，这是最常见的 bug 来源之一。" },
  { time: 54, text: "Temperature 控制输出的随机性，0 是确定性输出，1 以上是高随机。" },
  { time: 63, text: "Prompt Engineering 的核心是给模型提供清晰的上下文和明确的指令。" },
  { time: 72, text: "接下来我们用 Vercel AI SDK 的 streamText 函数演示一个最小实现。" },
  {
    time: 82,
    text: "注意 toDataStreamResponse，它把流式响应转换为客户端可消费的 ReadableStream。",
  },
]

export function getChapter(slug: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.slug === slug)
}

export function getAdjacentChapters(slug: string): {
  prev: Chapter | null
  next: Chapter | null
} {
  const chapter = getChapter(slug)
  if (!chapter) return { prev: null, next: null }
  return {
    prev: chapter.prevChapter ? (getChapter(chapter.prevChapter) ?? null) : null,
    next: chapter.nextChapter ? (getChapter(chapter.nextChapter) ?? null) : null,
  }
}
