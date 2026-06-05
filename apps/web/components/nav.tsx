"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"
import { Button } from "@agent-learning/ui"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

gsap.registerPlugin(ScrollTrigger)

const NAV_LINKS = [
  { label: "学习路线", href: "/learn" },
  { label: "工具", href: "/tools", hasDropdown: true },
  { label: "推荐资源", href: "/resources" },
  { label: "实战项目", href: "/projects" },
]

const TOOL_ITEMS = [
  { label: "Token 计数器", href: "/tools/token-counter", desc: "Token 边界可视化", color: "var(--track-llm)" },
  { label: "Prompt Playground", href: "/tools/prompt-playground", desc: "流式对话测试台", color: "var(--track-ts)" },
  { label: "RAG 检索", href: "/tools/rag-playground", desc: "向量检索流程演示", color: "var(--track-agent)" },
  { label: "Agent Playground", href: "/tools/agent-playground", desc: "ReAct 循环可视化", color: "var(--track-fw)" },
]

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

export function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const toolsRef = useRef<HTMLLIElement>(null)
  const pathname = usePathname()
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* GSAP ScrollTrigger — boolean flip on 80px threshold.
     Not tracking continuous scroll values (taste-skill §3.B).
     ScrollTrigger is the correct GSAP API for "did we pass N px". */
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: "80px top",
      onEnter: () => setScrolled(true),
      onLeaveBack: () => setScrolled(false),
    })
    return () => st.kill()
  }, [])

  /* Close tools dropdown when clicking outside */
  useEffect(() => {
    if (!toolsOpen) return
    function handleClick(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [toolsOpen])

  function openTools() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setToolsOpen(true)
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setToolsOpen(false), 120)
  }

  /* Web approximation of Apple Liquid Glass material.
     NOT official Apple CSS — backdrop-filter + layered borders + highlight.
     Solid fallback for prefers-reduced-transparency (see globals.css).
     Reference: taste-skill Appendix C. */
  const glassStyle: React.CSSProperties = scrolled
    ? {
        background: [
          "linear-gradient(135deg,",
          "  oklch(100% 0 0 / 0.06),",
          "  oklch(100% 0 0 / 0.02)",
          "),",
          "oklch(12% 0.008 248 / 0.72)",
        ].join(" "),
        backdropFilter: "blur(16px) saturate(160%)",
        WebkitBackdropFilter: "blur(16px) saturate(160%)",
        borderBottom: "1px solid oklch(100% 0 0 / 0.09)",
        boxShadow: "inset 0 1px 0 oklch(100% 0 0 / 0.10)",
      }
    : {
        backgroundColor: "var(--base)",
        borderBottom: "1px solid var(--border-subtle)",
      }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-overlay nav-glass-transition"
      style={{
        ...glassStyle,
        paddingTop: "max(0px, env(safe-area-inset-top))",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between" aria-label="主导航">
        {/* Logo */}
        <a
          href="/"
          className="font-mono text-sm font-medium tracking-tight"
          style={{ color: "var(--text-primary)", textDecoration: "none" }}
          aria-current={pathname === "/" ? "page" : undefined}
        >
          AgentLab<span style={{ color: "var(--accent)" }}>.</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href)

            if (link.hasDropdown) {
              return (
                <li
                  key={link.href}
                  ref={toolsRef}
                  className="relative"
                  onMouseEnter={openTools}
                  onMouseLeave={scheduleClose}
                >
                  <a
                    href={link.href}
                    className={cn("nav-link flex items-center gap-1", active && "font-medium")}
                    aria-current={active ? "page" : undefined}
                    aria-expanded={toolsOpen}
                    aria-haspopup="true"
                    style={active ? { color: "var(--text-primary)" } : undefined}
                    onClick={() => setToolsOpen((v) => !v)}
                  >
                    {link.label}
                    <span
                      className="font-mono text-[0.625rem] transition-transform duration-150"
                      style={{
                        color: "var(--text-muted)",
                        transform: toolsOpen ? "rotate(180deg)" : "rotate(0deg)",
                        display: "inline-block",
                      }}
                      aria-hidden="true"
                    >
                      ▾
                    </span>
                  </a>

                  {/* Dropdown */}
                  {toolsOpen && (
                    <div
                      className="absolute top-full left-1/2 mt-2 w-[280px] rounded-lg overflow-hidden"
                      style={{
                        transform: "translateX(-50%)",
                        backgroundColor: scrolled ? "oklch(14% 0.009 248 / 0.96)" : "var(--surface-1)",
                        border: "1px solid var(--border-subtle)",
                        boxShadow: "0 12px 40px oklch(0% 0 0 / 0.35)",
                        backdropFilter: scrolled ? "blur(12px)" : "none",
                      }}
                      onMouseEnter={openTools}
                      onMouseLeave={scheduleClose}
                      role="menu"
                      aria-label="工具列表"
                    >
                      <div className="px-3 pt-2.5 pb-1">
                        <span
                          className="font-mono text-[0.6rem] uppercase tracking-[0.14em]"
                          style={{ color: "var(--text-muted)" }}
                        >
                          工具箱
                        </span>
                      </div>
                      {TOOL_ITEMS.map((tool) => {
                        const toolActive = pathname === tool.href
                        return (
                          <a
                            key={tool.href}
                            href={tool.href}
                            className="flex items-start gap-3 px-3 py-2.5 transition-colors"
                            style={{
                              backgroundColor: toolActive ? "var(--accent-subtle)" : "transparent",
                              textDecoration: "none",
                            }}
                            onMouseEnter={(e) => {
                              if (!toolActive)
                                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)"
                            }}
                            onMouseLeave={(e) => {
                              if (!toolActive) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                            }}
                            onClick={() => setToolsOpen(false)}
                            role="menuitem"
                          >
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full mt-[5px] shrink-0"
                              style={{ backgroundColor: tool.color }}
                              aria-hidden="true"
                            />
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span
                                className="font-mono text-xs font-medium"
                                style={{ color: toolActive ? "var(--accent)" : "var(--text-primary)" }}
                              >
                                {tool.label}
                              </span>
                              <span className="font-mono text-[0.625rem]" style={{ color: "var(--text-muted)" }}>
                                {tool.desc}
                              </span>
                            </div>
                          </a>
                        )
                      })}
                      <div className="px-3 py-2 mt-0.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                        <a
                          href="/tools"
                          className="font-mono text-[0.6875rem] flex items-center gap-1"
                          style={{ color: "var(--text-muted)", textDecoration: "none" }}
                          onClick={() => setToolsOpen(false)}
                          role="menuitem"
                        >
                          查看全部工具 →
                        </a>
                      </div>
                    </div>
                  )}
                </li>
              )
            }

            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={cn("nav-link", active && "font-medium")}
                  aria-current={active ? "page" : undefined}
                  style={active ? { color: "var(--text-primary)" } : undefined}
                >
                  {link.label}
                </a>
              </li>
            )
          })}
        </ul>

        {/* CTA + theme toggle + hamburger */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button className="hidden md:inline-flex font-mono">
            <Link href="/learn">开始学习</Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            aria-label={open ? "关闭菜单" : "打开菜单"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="md:hidden"
          >
            {/* Animated hamburger → X lines */}
            <div className="flex flex-col gap-[5px] w-[14px] justify-center">
              {[false, true, false].map((isMiddle, i) => (
                <span
                  key={i}
                  className="block h-px transition-all duration-200"
                  style={{
                    backgroundColor: "var(--text-primary)",
                    width: isMiddle && open ? "0" : "100%",
                    opacity: isMiddle && open ? 0 : 1,
                    transform: !isMiddle
                      ? open
                        ? `translateY(${i === 0 ? 5 : -5}px) rotate(${i === 0 ? 45 : -45}deg)`
                        : "none"
                      : "none",
                  }}
                />
              ))}
            </div>
          </Button>
        </div>
      </nav>

      {/* Mobile menu — matches glass state when scrolled */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden border-t"
          style={{
            backgroundColor: scrolled ? "oklch(12% 0.008 248 / 0.85)" : "var(--surface-1)",
            borderColor: scrolled ? "oklch(100% 0 0 / 0.09)" : "var(--border-subtle)",
          }}
        >
          <ul className="p-6 flex flex-col gap-5 list-none m-0">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href)
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={cn("nav-link text-base", active && "font-medium")}
                    aria-current={active ? "page" : undefined}
                    style={active ? { color: "var(--text-primary)" } : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                  {/* Mobile tool sub-links */}
                  {link.hasDropdown && (
                    <ul className="mt-2 ml-4 flex flex-col gap-2 list-none p-0">
                      {TOOL_ITEMS.map((tool) => (
                        <li key={tool.href}>
                          <a
                            href={tool.href}
                            className="font-mono text-sm flex items-center gap-2"
                            style={{
                              color: pathname === tool.href ? "var(--accent)" : "var(--text-muted)",
                              textDecoration: "none",
                            }}
                            onClick={() => setOpen(false)}
                          >
                            <span
                              className="inline-block w-1 h-1 rounded-full shrink-0"
                              style={{ backgroundColor: tool.color }}
                              aria-hidden="true"
                            />
                            {tool.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
            <li className="pt-1">
              <Button onClick={() => setOpen(false)}>
                <Link href="/learn">开始学习</Link>
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
