/* Server Component */

interface PipelineStep {
  id: string
  name: string
  nameEn: string
  description: string
}

const STEPS: PipelineStep[] = [
  {
    id: "01",
    name: "MDX 章节",
    nameEn: "MDX INPUT",
    description: "解析 frontmatter、正文、代码块与 Callout 元素",
  },
  {
    id: "02",
    name: "脚本生成",
    nameEn: "SCRIPT GEN",
    description: "LLM 生成口播大纲与分镜 storyboard JSON",
  },
  {
    id: "03",
    name: "TTS 旁白",
    nameEn: "TTS",
    description: "文字转语音，输出旁白音频与 SRT 字幕文件",
  },
  {
    id: "04",
    name: "画面生成",
    nameEn: "VISUAL GEN",
    description: "按分镜生成讲解画面、代码动效与概念图示",
  },
  {
    id: "05",
    name: "MP4 输出",
    nameEn: "MP4 OUTPUT",
    description: "FFmpeg 合成视频，写入 public/videos 并更新元数据",
  },
]

/* ── Connector arrow ─────────────────────────────────── */
function Connector({ direction }: { direction: "right" | "down" }) {
  return (
    <div
      className={
        direction === "right"
          ? "hidden lg:flex items-center justify-center w-6 shrink-0 self-stretch"
          : "lg:hidden flex items-center justify-center h-6 shrink-0"
      }
      aria-hidden="true"
    >
      <span className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>
        {direction === "right" ? "→" : "↓"}
      </span>
    </div>
  )
}

export function VideoPipeline() {
  return (
    <section aria-labelledby="pipeline-heading" className="py-24 px-6 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="mb-16">
        <p className="font-mono text-xs tracking-[0.18em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
          视频讲解系统
        </p>
        <h2
          id="pipeline-heading"
          className="text-balance text-[1.75rem] font-light tracking-tight leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          输入 MDX，输出完整视频讲解。
        </h2>
        <p className="text-pretty font-mono text-sm mt-4" style={{ color: "var(--text-secondary)", maxWidth: "56ch" }}>
          每个章节自动生成视频：脚本、分镜、TTS 旁白、字幕和 MP4。 无需人工参与，输出直接挂载到章节详情页。
        </p>
      </div>

      {/* Pipeline visualization */}
      <div className="flex flex-col lg:flex-row items-stretch">
        {STEPS.map((step, index) => (
          /* Fragment wraps step node + its trailing connector */
          <div key={step.id} className="flex flex-col lg:flex-row items-stretch flex-1">
            {/* Step node */}
            <div
              className="fade-up flex flex-col gap-2.5 p-5 flex-1"
              style={{
                backgroundColor: "var(--surface-1)",
                border: "1px solid var(--border)",
                animationDelay: `${index * 80}ms`,
              }}
            >
              {/* Step label row */}
              <div className="flex items-baseline gap-2.5">
                <span
                  className="font-mono text-xs tabular-nums"
                  style={{ color: "var(--text-muted)" }}
                  aria-hidden="true"
                >
                  {step.id}
                </span>
                <span
                  className="font-mono text-[0.6875rem] tracking-widest uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  {step.nameEn}
                </span>
              </div>

              {/* Step name */}
              <h3
                className="text-balance font-sans text-[0.9375rem] font-medium leading-snug"
                style={{ color: "var(--text-primary)" }}
              >
                {step.name}
              </h3>

              {/* Description */}
              <p className="font-mono text-xs leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
                {step.description}
              </p>
            </div>

            {/* Connector — only between steps, not after last */}
            {index < STEPS.length - 1 && (
              <>
                <Connector direction="right" />
                <Connector direction="down" />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Command example */}
      <div
        className="mt-8 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3"
        style={{
          backgroundColor: "var(--surface-1)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[0.6875rem] mb-1.5" style={{ color: "var(--text-muted)" }}>
            # 生成单章节视频
          </p>
          <code className="font-mono text-sm block" style={{ color: "var(--text-primary)" }}>
            <span style={{ color: "var(--text-muted)" }}>$ </span>
            <span style={{ color: "var(--track-ts)" }}>pnpm</span>
            {" video:generate "}
            <span style={{ color: "var(--track-agent)" }}>--chapter</span>
            {" llm-basics"}
          </code>
        </div>
        <a href="/docs/video-generation" className="link-arrow flex-shrink-0">
          查看文档 →
        </a>
      </div>
    </section>
  )
}
