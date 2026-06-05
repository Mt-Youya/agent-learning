/* Server Component — imports chapter data from the shared lib */
import { CHAPTERS } from "@/lib/chapters"
import { Button } from "@agent-learning/ui"
import Link from "next/link"

type VideoStatus = "ready" | "generating" | "pending"

const VIDEO_STATUS_CONFIG: Record<VideoStatus, { label: string; symbol: string; color: string }> = {
  ready: { label: "视频已就绪", symbol: "●", color: "var(--track-ts)" },
  generating: { label: "生成中", symbol: "◌", color: "var(--track-llm)" },
  pending: { label: "待生成", symbol: "○", color: "var(--text-muted)" },
}

function VideoStatusBadge({ status }: { status: VideoStatus }) {
  const { label, symbol, color } = VIDEO_STATUS_CONFIG[status] ?? VIDEO_STATUS_CONFIG.pending
  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-xs"
      style={{ color }}
      aria-label={`视频状态：${label}`}
    >
      <span aria-hidden="true">{symbol}</span>
      {label}
    </span>
  )
}

export function Roadmap() {
  return (
    <section aria-labelledby="roadmap-heading" className="py-24 px-6 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="mb-14">
        <p className="font-mono text-xs tracking-[0.18em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
          学习路线
        </p>
        <h2
          id="roadmap-heading"
          className="text-balance text-[1.75rem] font-light tracking-tight leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          五个模块，从 LLM 入门到
          <br className="hidden sm:block" />
          多 Agent 系统设计。
        </h2>
        <p className="text-pretty font-mono text-sm mt-4" style={{ color: "var(--text-secondary)", maxWidth: "56ch" }}>
          每个模块包含图文教程、代码示例、交互 Demo 和自动生成的视频讲解。
        </p>
      </div>

      {/* Chapter list — numbered sequence, not a card grid */}
      <ol className="flex flex-col list-none m-0 p-0" aria-label="课程章节列表">
        {CHAPTERS.map((chapter, index) => {
          const id = String(chapter.order).padStart(2, "0")
          const href = `/learn/${chapter.slug}`

          return (
            <li
              key={chapter.slug}
              className="fade-up grid gap-4 py-6"
              style={{
                gridTemplateColumns: "3rem 1fr",
                borderTop: "1px solid var(--border-subtle)",
                ...(index === CHAPTERS.length - 1 ? { borderBottom: "1px solid var(--border-subtle)" } : {}),
                animationDelay: `${index * 60}ms`,
              }}
            >
              {/* Sequence number — structural visual anchor */}
              <span
                className="font-mono text-2xl font-light leading-none pt-1 tabular-nums select-none"
                style={{ color: "var(--text-muted)" }}
                aria-hidden="true"
              >
                {id}
              </span>

              {/* Chapter content + CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Title + meta */}
                <div className="flex flex-col gap-2 min-w-0">
                  <h3
                    className="text-balance text-[1.0625rem] font-medium leading-snug"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {chapter.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                    <span className="font-mono text-xs font-medium" style={{ color: chapter.trackColor }}>
                      {chapter.level}
                    </span>
                    <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                      {chapter.duration}
                    </span>
                    <VideoStatusBadge status={chapter.videoStatus} />
                  </div>
                </div>

                {/* CTA */}
                <Button className="btn-outline self-start sm:self-center shrink-0">
                  <Link href={href}>开始学习 →</Link>
                </Button>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
