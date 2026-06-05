/* Server Component */

/**
 * AI Skills Section
 *
 * Showcases the three core AI coding skills:
 * Impeccable, baseline-ui, and taste-skill.
 *
 * Layout: info-split rows (left: skill name, right: description + link).
 * Intentionally different from:
 *   - RoadmapSection (large typographic number anchors)
 *   - ToolsSection (2+2 bento grid)
 * Bento Background Diversity: 3 rows with distinct surface treatments.
 *
 * Replaces the placeholder "关注大佬" experts section.
 * No eyebrow: at the 2-eyebrow page limit (hero + roadmap use both slots).
 */

import { Badge, Card, CardContent } from "@agent-learning/ui"
import { IconArrowRight } from "@tabler/icons-react"

interface Skill {
  id: string
  name: string
  category: string
  description: string
  href: string
  accent: string /* track color for the ID + category */
  bgStyle: React.CSSProperties
}

const SKILLS: Skill[] = [
  {
    id: "01",
    name: "Impeccable",
    category: "UI 迭代",
    description:
      "生产级 UI 迭代技能集。shape → craft → audit → polish 完整工作流，内置设计禁令与审查规则。每次设计决策可追溯，每次输出经过 Pre-Flight 验收检查。",
    href: "/skills/impeccable",
    accent: "var(--accent)",
    bgStyle: { backgroundColor: "var(--accent-subtle)" },
  },
  {
    id: "02",
    name: "baseline-ui",
    category: "质量校验",
    description:
      "Tailwind CSS 组件基线校验技能。动效时长约束、字体比例执行、可访问性检查、布局反模式检测。让 AI 生成的组件在交付前通过统一基准。",
    href: "/skills/baseline-ui",
    accent: "var(--track-ts)",
    bgStyle: { backgroundColor: "var(--surface-1)" },
  },
  {
    id: "03",
    name: "taste-skill",
    category: "设计判断力",
    description:
      "反模板化前端设计技能。读懂需求，推断正确的设计方向，输出非模板化的界面。真实设计系统，重构优先，拒绝 AI 生成的视觉平庸。",
    href: "/skills/taste-skill",
    accent: "var(--track-agent)",
    bgStyle: { backgroundColor: "oklch(14% 0.008 248)" },
  },
]

function SkillRow({ skill }: { skill: Skill }) {
  return (
    /* Card provides ring-1 ring-foreground/10, rounded-xl, bg-card.
       bgStyle overrides the default bg-card via inline style specificity. */
    <Card className="gap-0 py-0" style={skill.bgStyle}>
      <CardContent className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-5 py-5">
        {/* Left: ID + name + category */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[0.6875rem] tabular-nums" style={{ color: skill.accent }} aria-hidden="true">
            {skill.id}
          </span>
          <h3 className="text-balance text-lg font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
            {skill.name}
          </h3>
          <Badge variant="outline" className="font-mono text-[0.625rem] self-start" style={{ color: skill.accent }}>
            {skill.category}
          </Badge>
        </div>

        {/* Right: description + link */}
        <div className="flex flex-col gap-3 justify-between">
          <p
            className="text-pretty font-mono text-sm leading-[1.7]"
            style={{ color: "var(--text-secondary)", maxWidth: "58ch" }}
          >
            {skill.description}
          </p>
          <a
            href={skill.href}
            className="link-arrow self-start flex items-center gap-1.5 font-mono text-xs"
            aria-label={`了解 ${skill.name} 技能`}
          >
            了解更多
            <IconArrowRight size={12} stroke={1.5} aria-hidden="true" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

export function SkillsSection() {
  return (
    <section
      aria-labelledby="skills-heading"
      className="py-20 px-6 max-w-7xl mx-auto"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      {/* Section header — no eyebrow (at page limit) */}
      <div className="mb-10">
        <h2
          id="skills-heading"
          className="text-balance text-[1.875rem] font-light tracking-tight leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          学 Agent 之前，先掌握这些技能。
        </h2>
        <p className="text-pretty font-mono text-sm mt-4" style={{ color: "var(--text-secondary)", maxWidth: "54ch" }}>
          AI 编程技能是可调用的专项能力集。每个技能有明确的工作流和验收标准，与课程章节配合使用。
        </p>
      </div>

      {/* Skill rows — info-split layout, distinct from roadmap and tools */}
      <div className="flex flex-col gap-3">
        {SKILLS.map((skill) => (
          <SkillRow key={skill.id} skill={skill} />
        ))}
      </div>

      {/* View all */}
      <div className="mt-6 flex justify-end">
        <a href="/skills" className="link-arrow flex items-center gap-1.5">
          查看全部技能
          <IconArrowRight size={14} stroke={1.5} aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
