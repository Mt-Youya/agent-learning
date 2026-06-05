/* Server Component */

interface Skill {
  id: string
  name: string
  description: string
  tags: string[]
  href: string
}

const SKILLS: Skill[] = [
  {
    id: "01",
    name: "Impeccable",
    description:
      "生产级 UI 迭代技能集。shape → craft → audit → polish 完整工作流，内置设计禁令与审查规则。每次设计决策可追溯。",
    tags: ["设计系统", "UI 迭代", "代码质量"],
    href: "https://github.com/pbakaus/impeccable",
  },
  {
    id: "02",
    name: "baseline-ui",
    description:
      "Tailwind CSS 组件基线校验：动效时长约束、字体比例执行、组件可访问性检查、布局反模式检测。让组件库保持一致。",
    tags: ["Tailwind", "校验", "可访问性"],
    href: "#",
  },
  {
    id: "03",
    name: "design-taste-frontend",
    description:
      "落地页与作品集的设计判断力。拒绝模板化，真实设计系统，audit-first 重构流程。在重构之前先读懂现有代码。",
    tags: ["落地页", "设计判断", "重构"],
    href: "#",
  },
  {
    id: "04",
    name: "taste-skill",
    description: "GSAP ScrollTrigger 精确工程，宽行距编辑风格排版，Python 驱动的真随机布局差异化。强排版与滚动动效。",
    tags: ["GSAP", "ScrollTrigger", "排版"],
    href: "#",
  },
]

export function UISkills() {
  return (
    <section aria-labelledby="skills-heading" className="py-24 px-6" style={{ backgroundColor: "var(--surface-1)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="font-mono text-xs tracking-[0.18em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
              UI Skills
            </p>
            <h2
              id="skills-heading"
              className="text-balance text-[1.75rem] font-light tracking-tight leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              可复用的前端设计技能集。
            </h2>
            <p
              className="text-pretty font-mono text-sm mt-4"
              style={{ color: "var(--text-secondary)", maxWidth: "54ch" }}
            >
              独立的技能模块，覆盖 UI 迭代、组件校验、动效工程。 每个 Skill 有独立工作流和约束规则，与平台课程章节关联。
            </p>
          </div>
          <a href="/skills" className="link-arrow flex-shrink-0 self-start sm:self-end">
            查看全部 Skills →
          </a>
        </div>

        {/* Skills list */}
        <ol className="flex flex-col list-none m-0 p-0" aria-label="UI Skills 列表">
          {SKILLS.map((skill, index) => (
            <li
              key={skill.id}
              className="fade-up grid gap-4 py-6"
              style={{
                gridTemplateColumns: "2.5rem 1fr auto",
                borderTop: "1px solid var(--border-subtle)",
                ...(index === SKILLS.length - 1 ? { borderBottom: "1px solid var(--border-subtle)" } : {}),
                animationDelay: `${index * 60}ms`,
              }}
            >
              {/* Number */}
              <span
                className="font-mono text-xs pt-1 tabular-nums select-none"
                style={{ color: "var(--text-muted)" }}
                aria-hidden="true"
              >
                {skill.id}
              </span>

              {/* Content */}
              <div className="flex flex-col gap-2 min-w-0">
                <h3
                  className="text-balance text-[1.0625rem] font-medium leading-snug"
                  style={{ color: "var(--text-primary)" }}
                >
                  {skill.name}
                </h3>
                <p
                  className="text-pretty font-mono text-sm leading-[1.65]"
                  style={{ color: "var(--text-secondary)", maxWidth: "62ch" }}
                >
                  {skill.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skill.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs px-2 py-0.5 rounded-lg"
                      style={{
                        backgroundColor: "var(--surface-2)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Arrow link */}
              <a
                href={skill.href}
                className="link-arrow self-start pt-0.5 text-base"
                aria-label={`查看 ${skill.name}`}
                {...(skill.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                →
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
