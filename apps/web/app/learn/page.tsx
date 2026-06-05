/* Server Component */

import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { CHAPTERS } from "@/lib/chapters"
import { Badge } from "@agent-learning/ui"
import { IconCircleCheck, IconClock, IconCircle, IconArrowRight } from "@tabler/icons-react"

export const metadata: Metadata = {
  title: "学习路线 — AgentLab",
  description: "五个模块系统学习 AI Agent 开发。从 LLM 基础到 Multi-Agent 系统设计，每章配套自动生成视频讲解。",
}

/* ─── Video status display config ───────────────────── */
const VIDEO_STATUS = {
  ready: {
    label: "视频已就绪",
    icon: IconCircleCheck,
    color: "var(--track-ts)",
  },
  generating: {
    label: "生成中",
    icon: IconClock,
    color: "var(--track-llm)",
  },
  pending: {
    label: "待生成",
    icon: IconCircle,
    color: "var(--text-muted)",
  },
} as const

/* ─── Track color per level ─────────────────────────── */
const LEVEL_COLOR: Record<string, string> = {
  入门: "var(--track-llm)",
  工具链: "var(--track-ts)",
  核心: "var(--track-agent)",
  实战: "var(--track-fw)",
  进阶: "var(--track-multi)",
}

/* ─── One-sentence learning outcomes ────────────────── */
const CHAPTER_OUTCOMES: Record<string, string> = {
  "llm-basics": "完成后你能写出第一个流式对话接口，理解 Token 与 Context Window 的工程影响。",
  "js-ts-toolchain": "完成后你能用 Vercel AI SDK 和 LangChain.js 构建生产可用的 AI 应用后端。",
  "agent-core": "完成后你理解 ReAct 循环与 Tool Use 机制，能设计基础 Agent 行为逻辑。",
  "agent-frameworks": "完成后你能用 LangGraph.js 或 Mastra 构建接入真实工具的 Agent。",
  "multi-agent": "完成后你能设计多 Agent 协作系统，具备 RAG 检索增强与可观测性能力。",
}

/* ─── Page ──────────────────────────────────────────── */
export default function LearnIndexPage() {
  return (
    <>
      <Nav />
      <main id="main-content" tabIndex={-1}>
        <div className="pt-28 pb-24 px-6 max-w-4xl mx-auto">
          {/* Page header */}
          <div className="mb-14">
            <p className="font-mono text-xs tracking-[0.18em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
              学习路线
            </p>
            <h1
              className="text-balance font-light tracking-tight mb-4"
              style={{
                color: "var(--text-primary)",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              五个模块，从 LLM 到 Multi-Agent。
            </h1>
            <p className="text-pretty font-mono text-sm" style={{ color: "var(--text-secondary)", maxWidth: "56ch" }}>
              按顺序学习效果最佳。每个章节包含图文教程、代码示例、交互 Demo 和自动生成的视频讲解。
            </p>
          </div>

          {/* Chapter list */}
          <ol className="flex flex-col list-none m-0 p-0" aria-label="课程章节列表">
            {CHAPTERS.map((chapter, index) => {
              const vc = VIDEO_STATUS[chapter.videoStatus]
              const VIcon = vc.icon
              const id = String(chapter.order).padStart(2, "0")
              const outcome = CHAPTER_OUTCOMES[chapter.slug]

              return (
                <li
                  key={chapter.slug}
                  className="py-8 grid gap-5"
                  style={{
                    gridTemplateColumns: "minmax(3rem, 5rem) 1fr",
                    borderTop: "1px solid var(--border-subtle)",
                    ...(index === CHAPTERS.length - 1 ? { borderBottom: "1px solid var(--border-subtle)" } : {}),
                  }}
                >
                  {/* Typographic number anchor */}
                  <span
                    className="font-mono font-light tabular-nums select-none leading-none"
                    style={{
                      fontSize: "clamp(2.5rem, 6vw, 3.75rem)",
                      lineHeight: 1,
                      color: "var(--text-muted)",
                      paddingTop: "0.1em",
                    }}
                    aria-hidden="true"
                  >
                    {id}
                  </span>

                  {/* Chapter content + CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                    {/* Left: title, description, outcome, meta */}
                    <div className="flex flex-col gap-2.5 min-w-0 flex-1">
                      <h2
                        className="text-balance text-[1.125rem] font-medium leading-snug"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {chapter.title}
                      </h2>

                      <p
                        className="text-pretty font-mono text-sm leading-[1.7]"
                        style={{ color: "var(--text-secondary)", maxWidth: "56ch" }}
                      >
                        {chapter.description}
                      </p>

                      {/* Learning outcome — what you can do after */}
                      {outcome && (
                        <p
                          className="font-mono text-xs leading-[1.6]"
                          style={{
                            color: "var(--accent)",
                            borderLeft: "2px solid var(--accent-dim)",
                            paddingLeft: "0.75rem",
                            marginTop: "0.25rem",
                          }}
                        >
                          {outcome}
                        </p>
                      )}

                      {/* Meta: level · duration · video status */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs"
                          style={{ color: LEVEL_COLOR[chapter.level] }}
                        >
                          {chapter.level}
                        </Badge>

                        <span className="font-mono text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>
                          {chapter.duration}
                        </span>

                        <span
                          className="inline-flex items-center gap-1 font-mono text-xs"
                          style={{ color: vc.color }}
                          aria-label={`视频状态：${vc.label}`}
                        >
                          <VIcon
                            size={12}
                            stroke={1.5}
                            aria-hidden="true"
                            style={
                              chapter.videoStatus === "generating"
                                ? { animation: "dot-pulse 1.2s ease-in-out infinite" }
                                : undefined
                            }
                          />
                          {vc.label}
                        </span>
                      </div>
                    </div>

                    {/* CTA — link style, no border box */}
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
                </li>
              )
            })}
          </ol>

          {/* Video explanation note */}
          <p className="font-mono text-xs mt-10 text-center" style={{ color: "var(--text-muted)" }}>
            每个章节均配套自动生成的视频讲解，支持字幕与进度追踪。
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
