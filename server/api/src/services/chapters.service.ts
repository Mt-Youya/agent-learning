/**
 * Chapters Service — authoritative chapter data.
 *
 * Currently in-memory. Replace the store with a DB call
 * (Prisma, Drizzle, etc.) without touching controllers or routes.
 *
 * This is the single source of truth for chapter metadata;
 * the frontend should fetch from here instead of keeping its own copy.
 */

import { AppError } from "@agent-learning/server-shared"

/* ── Chapter types ─────────────────────────────────── */
export type ChapterLevel = "入门" | "工具链" | "核心" | "实战" | "进阶"
export type VideoStatus = "ready" | "generating" | "pending"

export interface Chapter {
  slug: string
  order: number
  title: string
  level: ChapterLevel
  duration: string
  description: string
  videoStatus: VideoStatus
  videoUrl?: string
  prevChapter?: string
  nextChapter?: string
}

/* ── In-memory store ───────────────────────────────── */
const CHAPTERS: Chapter[] = [
  {
    slug: "llm-basics",
    order: 1,
    title: "LLM 基础认知",
    level: "入门",
    duration: "1-2 周",
    description: "理解 Token、Context Window、Temperature、Prompt Engineering 与 Chat Completion API 的基本用法。",
    videoStatus: "ready",
    videoUrl: "/videos/llm-basics.mp4",
    nextChapter: "js-ts-toolchain",
  },
  {
    slug: "js-ts-toolchain",
    order: 2,
    title: "JavaScript / TypeScript AI 工具链",
    level: "工具链",
    duration: "2-3 周",
    description: "从 JS/TS 生态出发，学习 Vercel AI SDK、LangChain.js、OpenAI SDK 与 Anthropic SDK。",
    videoStatus: "generating",
    prevChapter: "llm-basics",
    nextChapter: "agent-core",
  },
  {
    slug: "agent-core",
    order: 3,
    title: "Agent 核心概念",
    level: "核心",
    duration: "2-4 周",
    description: "理解 Tool Use、Function Calling、Memory、Planning 与 ReAct 循环。",
    videoStatus: "ready",
    prevChapter: "js-ts-toolchain",
    nextChapter: "agent-frameworks",
  },
  {
    slug: "agent-frameworks",
    order: 4,
    title: "Agent 框架实战",
    level: "实战",
    duration: "1-2 月",
    description: "使用 LangGraph.js、Mastra、MCP 构建真实 Agent，接入搜索、数据库与代码执行工具。",
    videoStatus: "pending",
    prevChapter: "agent-core",
    nextChapter: "multi-agent",
  },
  {
    slug: "multi-agent",
    order: 5,
    title: "Multi-Agent 系统设计",
    level: "进阶",
    duration: "持续进阶",
    description: "学习 Orchestrator / Subagent 编排、RAG 检索增强、Agent 评估与可观测性。",
    videoStatus: "ready",
    prevChapter: "agent-frameworks",
  },
]

/* Index for O(1) slug lookups */
const BY_SLUG = new Map(CHAPTERS.map((c) => [c.slug, c]))

/* ── Service methods ───────────────────────────────── */
export function listChapters(): Chapter[] {
  return CHAPTERS
}

export function getChapter(slug: string): Chapter {
  const chapter = BY_SLUG.get(slug)
  if (!chapter) throw AppError.notFound(`Chapter "${slug}"`)
  return chapter
}

/* ── Future: updateVideoStatus, trackProgress, etc. ── */
