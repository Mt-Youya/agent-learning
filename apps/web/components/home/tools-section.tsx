"use client"

/**
 * Tools Section — Asymmetric 2+2 Bento Grid
 *
 * ANIMATION ENGINE: GSAP ScrollTrigger (replaced motion/react whileInView)
 */

import { useRef } from "react"
import { Badge, Button, Card } from "@agent-learning/ui"
import { IconArrowRight } from "@tabler/icons-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"
import Link from "next/link"

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface Tool {
  name: string
  description: string
  href: string
  available: boolean
  badge: string
  preview: React.ReactNode
  bgStyle: React.CSSProperties
}

/* ── Previews ────────────────────────────────────────── */
function TokenPreview() {
  const tokens = ["import", " { ", "streamText", " }", " from", ' "ai"', ";"]
  const colors = [
    "var(--track-agent)",
    "var(--text-secondary)",
    "var(--text-primary)",
    "var(--text-secondary)",
    "var(--track-agent)",
    "var(--track-ts)",
    "var(--text-secondary)",
  ]
  return (
    <div className="mt-auto pt-5">
      <p className="font-mono text-sm mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        Token 可视化
      </p>
      <div className="flex flex-wrap gap-0.5">
        {tokens.map((t, i) => (
          <span
            key={i}
            className="font-mono text-xs px-0.5 py-px rounded-lg"
            style={{
              color: colors[i],
              backgroundColor: i % 2 === 0 ? "oklch(18.5% 0.008 248)" : "oklch(22% 0.008 248)",
              outline: "1px solid var(--border-subtle)",
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <p className="font-mono text-xs tabular-nums mt-2" style={{ color: "var(--text-muted)" }}>
        7 tokens · 48 chars
      </p>
    </div>
  )
}

function PromptPreview() {
  return (
    <div className="mt-auto pt-5">
      <div
        className="font-mono text-sm p-2 rounded-lg"
        style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}
      >
        <p style={{ color: "var(--text-muted)" }}>system</p>
        <p style={{ color: "var(--text-secondary)" }}>你是专业的前端工程师...</p>
        <p className="mt-1.5" style={{ color: "var(--text-muted)" }}>
          user
        </p>
        <p style={{ color: "var(--text-secondary)" }}>streamText 的流式原理是什么？</p>
      </div>
      <p className="font-mono text-xs mt-2 tabular-nums" style={{ color: "var(--text-muted)" }}>
        temperature: 0.7 · max_tokens: 512
      </p>
    </div>
  )
}

function RAGPreview() {
  return (
    <div className="mt-auto pt-4">
      <div className="flex flex-col gap-1">
        {["文档切片", "Embedding", "向量检索", "Rerank"].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <span className="font-mono text-xs tabular-nums" style={{ color: "var(--accent)", minWidth: "1rem" }}>
              0{i + 1}
            </span>
            <span className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AgentPreview() {
  return (
    <div className="mt-auto pt-4">
      <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
        <p>
          <span style={{ color: "var(--track-agent)" }}>agent</span> → 调用工具
        </p>
        <p>
          <span style={{ color: "var(--track-ts)" }}>tools</span> → 搜索结果返回
        </p>
        <p>
          <span style={{ color: "var(--track-fw)" }}>agent</span> → 合并并回答
        </p>
      </div>
      <p className="font-mono text-xs mt-2" style={{ color: "var(--text-muted)" }}>
        ReAct Loop · 3 steps
      </p>
    </div>
  )
}

const TOOLS: Tool[] = [
  {
    name: "Token 计数器",
    description: "实时可视化 Token 边界。支持 GPT-4o、GPT-3.5、Claude 模型计价估算。",
    href: "/tools/token-counter",
    available: true,
    badge: "可用",
    preview: <TokenPreview />,
    bgStyle: { backgroundColor: "oklch(17% 0.03 248)" },
  },
  {
    name: "Prompt Playground",
    description: "流式对话测试台，调节 Temperature 与 Max Tokens。",
    href: "/tools/prompt-playground",
    available: true,
    badge: "可用",
    preview: <PromptPreview />,
    bgStyle: { backgroundColor: "oklch(14% 0.007 248)" },
  },
  {
    name: "RAG 检索",
    description: "粘贴文档，体验向量检索与 Rerank 排序的完整流程。",
    href: "/tools/rag-playground",
    available: true,
    badge: "可用",
    preview: <RAGPreview />,
    bgStyle: { backgroundColor: "oklch(12.5% 0.007 248)" },
  },
  {
    name: "Agent Playground",
    description: "配置工具集，观察 ReAct 循环的完整执行过程。",
    href: "/tools/agent-playground",
    available: true,
    badge: "可用",
    preview: <AgentPreview />,
    bgStyle: { backgroundColor: "var(--surface-1)" },
  },
]

/* ── Tool cell ─────────────────────────────────────── */
function ToolCell({ tool, className, delay }: { tool: Tool; className?: string; delay: number }) {
  const cellRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!cellRef.current) return
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

      gsap.from(cellRef.current, {
        opacity: 0,
        y: 18,
        duration: 0.5,
        delay,
        ease: "expo.out",
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: cellRef.current,
          start: "top 85%",
          once: true,
        },
      })
    },
    { scope: cellRef }
  )

  return (
    /* Card provides ring-1 ring-foreground/10 + rounded-xl — cleaner than
       bare border. bgStyle overrides bg-card via inline style specificity. */
    <Card ref={cellRef} className={cn("gap-0 py-0 p-5 min-h-50", className)} style={tool.bgStyle}>
      <div className="flex items-start justify-between gap-3">
        <h3
          className="text-balance font-sans text-xl font-medium leading-snug"
          style={{ color: tool.available ? "var(--text-primary)" : "var(--text-secondary)" }}
        >
          {tool.name}
        </h3>
        {/* secondary = filled subtle bg, no border box feel */}
        <Badge variant={tool.available ? "default" : "secondary"} className="font-mono text-xs shrink-0 mt-px">
          {tool.badge}
        </Badge>
      </div>

      <p className="text-pretty font-mono text-base leading-[1.65] mt-2" style={{ color: "var(--text-muted)" }}>
        {tool.description}
      </p>

      {tool.preview}

      {tool.available && (
        <Button variant="outline" size="sm" className="self-start mt-4" aria-label={`打开 ${tool.name}`}>
          <Link href={tool.href}>立即使用 →</Link>
        </Button>
      )}
    </Card>
  )
}

/* ── Section ─────────────────────────────────────────── */
export function ToolsSection() {
  const [tokenCounter, promptPG, ragPG, agentPG] = TOOLS

  return (
    <section aria-labelledby="tools-heading" className="py-24 px-6" style={{ backgroundColor: "var(--surface-1)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h2
            id="tools-heading"
            className="text-balance text-[1.75rem] font-light tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            边学边用的 AI 工具
          </h2>
          <p
            className="text-pretty font-mono text-sm mt-3"
            style={{ color: "var(--text-secondary)", maxWidth: "52ch" }}
          >
            每个工具对应一个核心章节，在浏览器中直接体验，无需本地安装。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ToolCell tool={tokenCounter} className="md:col-span-2" delay={0} />
          <ToolCell tool={promptPG} className="md:col-span-1" delay={0.07} />
          <ToolCell tool={ragPG} className="md:col-span-1" delay={0.14} />
          <ToolCell tool={agentPG} className="md:col-span-2" delay={0.21} />
        </div>

        <div className="mt-6 flex justify-end">
          <a href="/tools" className="link-arrow flex items-center gap-1.5">
            查看全部工具
            <IconArrowRight size={14} stroke={1.5} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
