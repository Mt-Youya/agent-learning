"use client"

/**
 * Hero Section — Asymmetric Split
 *
 * ANIMATION ENGINE: GSAP (replaced motion/react)
 *   - Entry: useGSAP staggered from() on mount
 *   - CTA:   GSAP magnetic spring — gsap.to() with overwrite:"auto"
 *   - Scroll-based exit: none (keep it simple on hero)
 *   - Reduced motion: window.matchMedia guard, skips all GSAP calls
 */

import { useRef, useState } from "react"
import { Tabs } from "@base-ui/react"
import { IconArrowRight } from "@tabler/icons-react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@agent-learning/ui"

/* ─── Register GSAP plugins ─────────────────────────── */
gsap.registerPlugin(useGSAP)

/* ─── Syntax tokenizer ──────────────────────────────── */
const KW = new Set([
  "import",
  "export",
  "from",
  "async",
  "function",
  "const",
  "let",
  "var",
  "return",
  "await",
  "new",
  "type",
])

function tokenize(code: string): React.ReactNode[] {
  const pattern =
    /(\/\/[^\n]*)|(["'`][^"'`\n]*["'`])|(\b(?:import|export|from|async|function|const|let|var|return|await|new|type)\b)/g
  const nodes: React.ReactNode[] = []
  let cursor = 0
  let m: RegExpExecArray | null
  while ((m = pattern.exec(code)) !== null) {
    if (m.index > cursor)
      nodes.push(
        <span key={`t${cursor}`} style={{ color: "var(--text-primary)" }}>
          {code.slice(cursor, m.index)}
        </span>
      )
    const [full, comment, str, kw] = m
    if (comment)
      nodes.push(
        <span key={`c${m.index}`} style={{ color: "var(--text-muted)" }}>
          {full}
        </span>
      )
    else if (str)
      nodes.push(
        <span key={`s${m.index}`} style={{ color: "var(--track-ts)" }}>
          {full}
        </span>
      )
    else if (kw && KW.has(kw))
      nodes.push(
        <span key={`k${m.index}`} style={{ color: "var(--track-agent)" }}>
          {full}
        </span>
      )
    cursor = m.index + full.length
  }
  if (cursor < code.length)
    nodes.push(
      <span key="tail" style={{ color: "var(--text-primary)" }}>
        {code.slice(cursor)}
      </span>
    )
  return nodes
}

/* ─── Code examples ─────────────────────────────────── */
type TabKey = "stream" | "agent"

const TABS: {
  key: TabKey
  label: string
  file: string
  comment: string
  code: string
  href: string
}[] = [
  {
    key: "stream",
    label: "streamText()",
    file: "app/api/chat/route.ts",
    comment: "// Chapter 01 · Vercel AI SDK · 流式响应",
    href: "/learn/llm-basics",
    code: `import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages,
  });

  return result.toDataStreamResponse();
}`,
  },
  {
    key: "agent",
    label: "agent.invoke()",
    file: "lib/agent/graph.ts",
    comment: "// Chapter 04 · LangGraph.js · Agent 执行图",
    href: "/learn/agent-frameworks",
    code: `import { StateGraph } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";

const graph = new StateGraph({ channels: agentState })
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .compile();

const result = await graph.invoke({
  messages: [new HumanMessage("搜索最新 AI 新闻")],
});`,
  },
]

/* ─── Magnetic CTA ───────────────────────────────────
   GSAP replaces motion/react useMotionValue + useSpring.
   gsap.to() with overwrite:"auto" gives the same spring-like
   feel without maintaining MotionValue subscriptions.        */
function MagneticCTA({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null)

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!ref.current) return
    /* Skip if user prefers reduced motion */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * 0.13
    const y = (e.clientY - rect.top - rect.height / 2) * 0.16

    gsap.to(ref.current, {
      x,
      y,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    })
  }

  function onLeave() {
    if (!ref.current) return
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.55,
      ease: "elastic.out(1, 0.45)",
      overwrite: "auto",
    })
  }

  return (
    <a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(buttonVariants({ variant: "default" }), "font-mono", className)}
      aria-label="从第一章 LLM 基础认知开始学习"
    >
      {children}
    </a>
  )
}

/* ─── Component ─────────────────────────────────────── */
export function HeroSection() {
  const [active, setActive] = useState<TabKey>("stream")
  const heroRef = useRef<HTMLDivElement>(null)
  const tab = TABS.find((t) => t.key === active)!

  /* GSAP entry animation — staggered fade-up on mount */
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

      /* Left column items stagger */
      gsap.from(".hero-item", {
        opacity: 0,
        y: 18,
        duration: 0.6,
        stagger: 0.07,
        ease: "expo.out",
        clearProps: "transform,opacity",
      })

      /* Code panel — slight delay */
      gsap.from(".hero-panel", {
        opacity: 0,
        y: 18,
        duration: 0.6,
        delay: 0.1,
        ease: "expo.out",
        clearProps: "transform,opacity",
      })
    },
    { scope: heroRef }
  )

  return (
    <div
      ref={heroRef}
      className="relative overflow-hidden"
      style={{
        background: [
          "radial-gradient(ellipse 90% 65% at 8% 55%,",
          "  oklch(62% 0.16 248 / 0.065) 0%,",
          "  transparent 55%",
          ")",
        ].join(" "),
      }}
    >
      <section className="pt-24 pb-20 px-6 max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_45%] gap-10 lg:gap-16 items-start">
          {/* ── Left: text ───────────────────────────── */}
          <div className="flex flex-col gap-6">
            <p
              className="hero-item font-mono text-xs tracking-[0.18em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              Frontend × AI Engineering
            </p>

            <h1
              className="hero-item text-balance font-light tracking-tight"
              style={{
                color: "var(--text-primary)",
                fontSize: "clamp(3.25rem, 7.5vw, 5.5rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.025em",
              }}
            >
              用 JavaScript
              <br />
              构建 AI Agent。
            </h1>

            <p
              className="hero-item text-pretty font-mono text-[0.9375rem] leading-[1.72]"
              style={{ color: "var(--text-secondary)", maxWidth: "50ch" }}
            >
              你的 async/await 就是 Agent Loop。你的 Zustand 就是 Agent State。
              <br />
              五个模块，从 LLM 到 Multi-Agent，无需 Python 背景。
            </p>

            <div className="hero-item flex flex-wrap items-center gap-3 pt-1">
              <MagneticCTA href="/learn/llm-basics">
                开始学习
                <IconArrowRight size={14} stroke={1.5} aria-hidden="true" />
              </MagneticCTA>
              <a
                href="/learn"
                className="font-mono text-sm"
                style={{ color: "var(--text-secondary)", textDecoration: "none" }}
              >
                查看路线 →
              </a>
            </div>
          </div>

          {/* ── Right: Base UI Tabs code panel ──────────
              Base UI handles arrow-key navigation + roving tabIndex. */}
          <div
            className="hero-panel rounded-lg overflow-hidden"
            style={{
              backgroundColor: "var(--surface-1)",
              border: "1px solid var(--border)",
            }}
          >
            <Tabs.Root value={active} onValueChange={(v) => setActive(v as TabKey)}>
              {/* Tab bar */}
              <div className="flex items-center justify-between px-4 border-b" style={{ borderColor: "var(--border)" }}>
                <Tabs.List className="flex gap-0" aria-label="代码示例">
                  {TABS.map((t) => (
                    <Tabs.Tab
                      key={t.key}
                      value={t.key}
                      className={cn(
                        "font-mono text-xs px-3 py-3 border-b-2 transition-colors cursor-pointer bg-transparent",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
                      )}
                      style={
                        {
                          borderColor: active === t.key ? "var(--accent)" : "transparent",
                          color: active === t.key ? "var(--text-primary)" : "var(--text-muted)",
                        } as React.CSSProperties
                      }
                    >
                      {t.label}
                    </Tabs.Tab>
                  ))}
                </Tabs.List>

                <span
                  className="font-mono text-[0.6875rem] truncate ml-2 shrink-0"
                  style={{ color: "var(--text-muted)" }}
                  aria-hidden="true"
                >
                  {tab.file}
                </span>
              </div>

              {TABS.map((t) => (
                <Tabs.Panel key={t.key} value={t.key} className="p-5 overflow-x-auto">
                  <p className="font-mono text-[0.6875rem] mb-3" style={{ color: "var(--text-muted)" }}>
                    {t.comment}
                  </p>
                  <pre className="font-mono text-[0.8125rem] leading-[1.7] m-0" tabIndex={0}>
                    <code>{tokenize(t.code)}</code>
                  </pre>
                </Tabs.Panel>
              ))}

              {/* Panel footer */}
              <div
                className="px-5 py-3 flex items-center justify-between border-t"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <span className="font-mono text-[0.6875rem]" style={{ color: "var(--text-muted)" }}>
                  TypeScript · Next.js App Router
                </span>
                <a href={tab.href} className="font-mono text-[0.6875rem] link-arrow">
                  查看章节 →
                </a>
              </div>
            </Tabs.Root>
          </div>
        </div>
      </section>
    </div>
  )
}
