/* Server Component — no "use client" needed */

/**
 * Footer Section — Site navigation + brand
 *
 * Organized in 4 categories: 学习 / 工具 / 社区 / 平台
 * No version stamps, no locale strips, no scroll cues.
 * No eyebrow (at page limit).
 */

interface NavGroup {
  label: string
  links: { label: string; href: string; external?: boolean }[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "学习",
    links: [
      { label: "LLM 基础认知", href: "/learn/llm-basics" },
      { label: "JS/TS AI 工具链", href: "/learn/js-ts-toolchain" },
      { label: "Agent 核心概念", href: "/learn/agent-core" },
      { label: "Agent 框架实战", href: "/learn/agent-frameworks" },
      { label: "Multi-Agent 系统", href: "/learn/multi-agent" },
    ],
  },
  {
    label: "工具",
    links: [
      { label: "Token 计数器", href: "/tools/token-counter" },
      { label: "Prompt Playground", href: "/tools/prompt-playground" },
      { label: "RAG 检索", href: "/tools/rag-playground" },
      { label: "Agent Playground", href: "/tools/agent-playground" },
    ],
  },
  {
    label: "资源",
    links: [
      { label: "推荐资源", href: "/resources" },
      { label: "实战项目", href: "/projects" },
      { label: "关于", href: "/about" },
      { label: "GitHub", href: "https://github.com/Mt-Youya", external: true },
    ],
  },
]

export function FooterSection() {
  return (
    <footer style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top: brand + nav */}
        <div className="grid grid-cols-2 md:grid-cols-[1fr_repeat(3,auto)] gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
            <a
              href="/"
              className="font-mono text-sm font-medium"
              style={{ color: "var(--text-primary)", textDecoration: "none" }}
            >
              AgentLab<span style={{ color: "var(--accent)" }}>.</span>
            </a>
            <p className="text-pretty font-mono text-xs" style={{ color: "var(--text-muted)", maxWidth: "28ch" }}>
              面向前端工程师的 AI Agent 系统学习平台
            </p>
          </div>

          {/* Nav columns */}
          {NAV_GROUPS.map((group) => (
            <nav key={group.label} aria-label={`${group.label}导航`}>
              <p
                className="font-mono text-xs font-medium mb-4 uppercase"
                style={{ color: "var(--text-primary)", letterSpacing: "0.06em" }}
              >
                {group.label}
              </p>
              <ul className="flex flex-col gap-3 list-none m-0 p-0">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="link-arrow"
                      style={{ fontSize: "0.8125rem" }}
                      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom: copyright */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            © 2026 AgentLab. MIT License.
          </p>
          <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            Built with Next.js · Tailwind · Geist
          </p>
        </div>
      </div>
    </footer>
  )
}
