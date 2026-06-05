/* Server Component */

/**
 * Frontend Advantage Section
 *
 * Shows the 1:1 mapping between frontend skills and Agent concepts.
 * Source: README.md — "为什么前端工程师有独特优势" table.
 *
 * Layout: Two-column skill mapping grid.
 * Visual treatment: distinct from RoadmapSection (large numbers)
 * and ToolsSection (bento grid) — uses connector arrows.
 *
 * No GSAP needed — static content, no scroll animation required here.
 */

interface SkillMap {
  frontend: string
  agent: string
  color: string
}

const SKILL_MAPS: SkillMap[] = [
  {
    frontend: "async/await · Promise",
    agent: "Agent Loop 异步 I/O",
    color: "var(--track-llm)",
  },
  {
    frontend: "事件驱动思维",
    agent: "Tool Use 回调机制",
    color: "var(--track-ts)",
  },
  {
    frontend: "Redux · Zustand 状态管理",
    agent: "Agent State 管理",
    color: "var(--track-agent)",
  },
  {
    frontend: "API 调用与错误处理",
    agent: "LLM API 调用",
    color: "var(--track-fw)",
  },
  {
    frontend: "组件化 · 模块化思维",
    agent: "Subagent 拆分",
    color: "var(--track-multi)",
  },
  {
    frontend: "TypeScript 类型系统",
    agent: "Zod 结构化输出",
    color: "var(--track-llm)",
  },
  {
    frontend: "React 单向数据流",
    agent: "LangGraph 状态流转",
    color: "var(--track-ts)",
  },
]

const NOT_NEEDED = ["深度学习数学", "GPU 编程", "训练模型", "Transformer 内部结构"]

export function FrontendAdvantageSection() {
  return (
    <section
      aria-labelledby="advantage-heading"
      className="py-12 sm:py-24 px-4 sm:px-6"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 sm:mb-14 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 sm:gap-8 items-end">
          <div>
            <p className="font-mono text-xs tracking-[0.18em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
              前端工程师的优势
            </p>
            <h2
              id="advantage-heading"
              className="text-balance font-light leading-tight"
              style={{
                color: "var(--text-primary)",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                letterSpacing: "-0.015em",
              }}
            >
              你已经掌握了 70% 的知识。
            </h2>
            <p
              className="text-pretty font-mono text-sm mt-4 leading-[1.72]"
              style={{ color: "var(--text-secondary)", maxWidth: "52ch" }}
            >
              前端技能与 Agent 概念存在精确的一一对应关系。 你不是在从零学习，而是在给已有知识贴上新标签。
            </p>
          </div>

          {/* "不需要" pill list */}
          <div
            className="rounded-lg px-5 py-4 shrink-0"
            style={{
              backgroundColor: "var(--surface-1)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <p
              className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              你不需要
            </p>
            <ul className="flex flex-col gap-2 list-none m-0 p-0">
              {NOT_NEEDED.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 font-mono text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span
                    aria-hidden="true"
                    className="inline-block w-3 h-px shrink-0"
                    style={{ backgroundColor: "var(--border)" }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Skill mapping grid */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-0" role="list" aria-label="前端技能与 Agent 概念对应关系">
          {/* Column headers */}
          <div
            className="font-mono text-[0.625rem] sm:text-xs uppercase tracking-[0.14em] pb-3 sm:pb-4 px-2 sm:px-4"
            style={{ color: "var(--text-muted)" }}
            aria-hidden="true"
          >
            你已掌握的
          </div>
          <div aria-hidden="true" />
          <div
            className="font-mono text-[0.625rem] sm:text-xs uppercase tracking-[0.14em] pb-3 sm:pb-4 px-2 sm:px-4"
            style={{ color: "var(--text-muted)" }}
            aria-hidden="true"
          >
            Agent 中的对应
          </div>

          {SKILL_MAPS.map((map, i) => {
            const isLast = i === SKILL_MAPS.length - 1
            return (
              <div key={map.frontend} className="contents" role="listitem">
                {/* Frontend skill */}
                <div
                  className="px-2 sm:px-4 py-2.5 sm:py-3.5 font-mono text-[0.6875rem] sm:text-sm"
                  style={{
                    borderTop: "1px solid var(--border-subtle)",
                    ...(isLast ? { borderBottom: "1px solid var(--border-subtle)" } : {}),
                    color: "var(--text-secondary)",
                    backgroundColor: i % 2 === 0 ? "transparent" : "var(--surface-1)",
                  }}
                >
                  {map.frontend}
                </div>

                {/* Arrow connector */}
                <div
                  className="flex items-center justify-center px-1 sm:px-3"
                  style={{
                    borderTop: "1px solid var(--border-subtle)",
                    ...(isLast ? { borderBottom: "1px solid var(--border-subtle)" } : {}),
                    backgroundColor: i % 2 === 0 ? "transparent" : "var(--surface-1)",
                  }}
                  aria-hidden="true"
                >
                  <span className="font-mono text-[0.6875rem] sm:text-xs" style={{ color: map.color }}>
                    →
                  </span>
                </div>

                {/* Agent concept */}
                <div
                  className="px-2 sm:px-4 py-2.5 sm:py-3.5 font-mono text-[0.6875rem] sm:text-sm font-medium"
                  style={{
                    borderTop: "1px solid var(--border-subtle)",
                    ...(isLast ? { borderBottom: "1px solid var(--border-subtle)" } : {}),
                    color: map.color,
                    backgroundColor: i % 2 === 0 ? "transparent" : "var(--surface-1)",
                  }}
                >
                  {map.agent}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom callout */}
        <p className="mt-8 font-mono text-xs leading-[1.7]" style={{ color: "var(--text-muted)", maxWidth: "64ch" }}>
          你只需要：理解 LLM 的 API 使用方式、掌握 Tool Use 机制、学会用框架编排 Agent。 你的异步编程经验直接对应 Agent
          Loop，你的状态管理直接对应 Agent State。
        </p>
      </div>
    </section>
  )
}
