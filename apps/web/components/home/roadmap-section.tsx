"use client"

/**
 * Roadmap Section — Typographic Number Anchors
 *
 * ANIMATION ENGINE: GSAP ScrollTrigger (replaced motion/react whileInView)
 *   Each ChapterRow fades up when it enters the viewport.
 *   stagger delay is applied via the `delay` prop (index * 0.06s),
 *   which is passed to gsap.from() rather than handled by ScrollTrigger
 *   so timing feels intentional even when rows enter together.
 */

import { Badge } from "@agent-learning/ui"
import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { IconCircleCheck, IconClock, IconCircle, IconArrowRight } from "@tabler/icons-react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

type VideoStatus = "ready" | "generating" | "pending"

interface Chapter {
  slug: string
  order: string
  title: string
  level: string
  duration: string
  description: string
  videoStatus: VideoStatus
  trackColor: string
  tags: string[]
}

const CHAPTERS: Chapter[] = [
  {
    slug: "llm-basics",
    order: "01",
    title: "LLM 基础认知",
    level: "入门",
    duration: "1-2 周",
    description: "理解 Token、Context Window、Temperature、Prompt Engineering 与 Chat Completion API 的基本用法。",
    videoStatus: "ready",
    trackColor: "var(--track-llm)",
    tags: ["Token / Context", "Prompt Eng.", "Temperature", "Messages API"],
  },
  {
    slug: "js-ts-toolchain",
    order: "02",
    title: "JavaScript / TypeScript AI 工具链",
    level: "工具链",
    duration: "2-3 周",
    description: "从 JS/TS 生态出发，学习 Vercel AI SDK、LangChain.js、OpenAI SDK 与 Anthropic SDK。",
    videoStatus: "generating",
    trackColor: "var(--track-ts)",
    tags: ["Vercel AI SDK", "generateObject", "streamText", "useChat"],
  },
  {
    slug: "agent-core",
    order: "03",
    title: "Agent 核心概念",
    level: "核心",
    duration: "2-4 周",
    description: "理解 Tool Use、Function Calling、Memory、Planning 与 ReAct 循环。",
    videoStatus: "ready",
    trackColor: "var(--track-agent)",
    tags: ["Tool Use", "ReAct Loop", "Memory Types", "maxSteps"],
  },
  {
    slug: "agent-frameworks",
    order: "04",
    title: "Agent 框架实战",
    level: "实战",
    duration: "1-2 月",
    description: "使用 LangGraph.js、Mastra、MCP 构建真实 Agent，接入搜索、数据库与代码执行工具。",
    videoStatus: "pending",
    trackColor: "var(--track-fw)",
    tags: ["LangGraph.js", "Mastra", "MCP Server", "LangChain.js"],
  },
  {
    slug: "multi-agent",
    order: "05",
    title: "Multi-Agent 系统设计",
    level: "进阶",
    duration: "持续进阶",
    description: "学习 Orchestrator / Subagent 编排、RAG 检索增强、Agent 评估与可观测性。",
    videoStatus: "ready",
    trackColor: "var(--track-multi)",
    tags: ["Orchestrator", "RAG Pipeline", "Langfuse", "Evals"],
  },
]

const VIDEO_CONFIG: Record<VideoStatus, { label: string; icon: React.ElementType; color: string }> = {
  ready: { label: "视频已就绪", icon: IconCircleCheck, color: "var(--track-ts)" },
  generating: { label: "生成中", icon: IconClock, color: "var(--track-llm)" },
  pending: { label: "待生成", icon: IconCircle, color: "var(--text-muted)" },
}

const CHAPTER_OUTCOMES: Record<string, string> = {
  "llm-basics": "完成后你能写出第一个流式对话接口，理解 Token 与 Context Window 的工程影响。",
  "js-ts-toolchain": "完成后你能用 Vercel AI SDK 和 LangChain.js 构建生产可用的 AI 应用后端。",
  "agent-core": "完成后你理解 ReAct 循环与 Tool Use 机制，能设计基础 Agent 行为逻辑。",
  "agent-frameworks": "完成后你能用 LangGraph.js 或 Mastra 构建接入真实工具的 Agent。",
  "multi-agent": "完成后你能设计多 Agent 协作系统，具备 RAG 检索增强与可观测性能力。",
}

function DifficultyBadge({ level, color }: { level: string; color: string }) {
  /* outline variant uses border-current; style.color drives both text + border */
  return (
    <Badge variant="outline" className="font-mono text-[0.6875rem]" style={{ color }}>
      {level}
    </Badge>
  )
}

function VideoStatusBadge({ status }: { status: VideoStatus }) {
  const { label, icon: Icon, color } = VIDEO_CONFIG[status]
  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-xs"
      style={{ color }}
      aria-label={`视频状态: ${label}`}
    >
      <Icon
        size={12}
        stroke={1.5}
        aria-hidden="true"
        style={status === "generating" ? { animation: "dot-pulse 1.2s ease-in-out infinite" } : undefined}
      />
      {label}
    </span>
  )
}

function ChapterRow({ chapter, index }: { chapter: Chapter; index: number }) {
  const rowRef = useRef<HTMLElement>(null)
  const isLast = index === CHAPTERS.length - 1
  const outcome = CHAPTER_OUTCOMES[chapter.slug]

  /* GSAP ScrollTrigger reveal */
  useGSAP(
    () => {
      if (!rowRef.current) return
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

      gsap.from(rowRef.current, {
        opacity: 0,
        y: 16,
        duration: 0.55,
        delay: index * 0.06,
        ease: "expo.out",
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: rowRef.current,
          start: "top 82%",
          once: true,
        },
      })
    },
    { scope: rowRef }
  )

  return (
    <article
      ref={rowRef}
      className="grid gap-5 py-8"
      style={{
        gridTemplateColumns: "minmax(3rem, 6rem) 1fr",
        borderTop: "1px solid var(--border-subtle)",
        ...(isLast ? { borderBottom: "1px solid var(--border-subtle)" } : {}),
      }}
    >
      {/* Typographic number anchor */}
      <span
        className="font-mono font-light tabular-nums select-none leading-none"
        style={{
          fontSize: "clamp(3rem, 7vw, 5rem)",
          lineHeight: 1,
          color: "var(--text-muted)",
          paddingTop: "0.1em",
        }}
        aria-hidden="true"
      >
        {chapter.order}
      </span>

      {/* Chapter content + CTA */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
        <div className="flex flex-col gap-2.5 min-w-0 flex-1">
          <h3
            className="text-balance text-[1.125rem] font-medium leading-snug"
            style={{ color: "var(--text-primary)" }}
          >
            {chapter.title}
          </h3>

          <p
            className="text-pretty font-mono text-sm leading-[1.7]"
            style={{ color: "var(--text-secondary)", maxWidth: "58ch" }}
          >
            {chapter.description}
          </p>

          {outcome && (
            <p
              className="font-mono text-xs leading-[1.6]"
              style={{
                color: "var(--accent)",
                borderLeft: "2px solid var(--accent-dim)",
                paddingLeft: "0.75rem",
                marginTop: "0.125rem",
              }}
            >
              {outcome}
            </p>
          )}

          {chapter.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1" aria-label="技术栈">
              {chapter.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[0.6875rem] px-2 py-0.5 rounded"
                  style={{
                    color: chapter.trackColor,
                    backgroundColor: "var(--surface-1)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
            <DifficultyBadge level={chapter.level} color={chapter.trackColor} />
            <span className="font-mono text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>
              {chapter.duration}
            </span>
            <VideoStatusBadge status={chapter.videoStatus} />
          </div>
        </div>

        {/* Text link — avoids the "form button box" feel of outline variant */}
        <a
          href={`/learn/${chapter.slug}`}
          className="link-arrow self-start shrink-0 font-mono text-xs
                     flex items-center gap-1 whitespace-nowrap"
          aria-label={`开始学习 ${chapter.title}`}
        >
          开始学习
          <IconArrowRight size={12} stroke={1.5} aria-hidden="true" />
        </a>
      </div>
    </article>
  )
}

/* ── Section ─────────────────────────────────────────── */
export function RoadmapSection() {
  return (
    <section
      aria-labelledby="roadmap-heading"
      className="px-6 max-w-7xl mx-auto"
      style={{ paddingTop: "5rem", paddingBottom: "8rem" }}
    >
      <div className="mb-14">
        <p className="font-mono text-xs tracking-[0.18em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
          学习路线
        </p>

        <h2
          id="roadmap-heading"
          className="text-balance font-light leading-tight"
          style={{
            color: "var(--text-primary)",
            fontSize: "2.25rem",
            letterSpacing: "-0.01em",
          }}
        >
          五个模块，从 LLM 到 Multi-Agent。
        </h2>

        <p className="text-pretty font-mono text-sm mt-4" style={{ color: "var(--text-secondary)", maxWidth: "54ch" }}>
          每个模块包含图文教程、代码示例、交互 Demo 和自动生成的视频讲解。
        </p>

        <div
          className="mt-5 inline-flex items-center gap-2 font-mono text-xs rounded-lg px-3 py-2"
          style={{
            backgroundColor: "var(--accent-subtle)",
            border: "1px solid var(--accent-dim)",
            color: "var(--accent)",
          }}
        >
          <span aria-hidden="true">▷</span>
          每章配套自动生成的视频讲解，支持字幕切换和章节进度追踪。
        </div>
      </div>

      <div className="flex flex-col" aria-label="课程章节列表">
        {CHAPTERS.map((chapter, i) => (
          <ChapterRow key={chapter.slug} chapter={chapter} index={i} />
        ))}
      </div>
    </section>
  )
}
