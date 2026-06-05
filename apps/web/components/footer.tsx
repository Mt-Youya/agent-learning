/* Server Component */

const FOOTER_LINKS = [
  { label: "GitHub", href: "https://github.com/Mt-Youya", external: true },
  { label: "文档", href: "/docs", external: false },
  { label: "关于", href: "/about", external: false },
]

export function Footer() {
  return (
    <footer className="py-12 px-6" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col gap-1.5">
          <a
            href="/"
            className="font-mono text-sm font-medium"
            style={{ color: "var(--text-primary)", textDecoration: "none" }}
          >
            AgentLab
            <span style={{ color: "var(--accent)" }}>.</span>
          </a>
          <p className="text-pretty font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            面向前端工程师的 AI Agent 学习平台
          </p>
        </div>

        {/* Nav */}
        <nav aria-label="页脚导航">
          <ul className="flex flex-wrap gap-6 list-none m-0 p-0">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="link-arrow"
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
