"use client"

import { useState } from "react"
import { Tabs } from "@base-ui/react"
import { cn } from "@/lib/utils"

/* ─── Tokenizer (no runtime dependency) ─────────────── */
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
  let match: RegExpExecArray | null

  while ((match = pattern.exec(code)) !== null) {
    if (match.index > cursor) {
      nodes.push(
        <span key={`t-${cursor}`} style={{ color: "var(--text-primary)" }}>
          {code.slice(cursor, match.index)}
        </span>
      )
    }

    const [full, comment, str, kw] = match

    if (comment) {
      nodes.push(
        <span key={`c-${match.index}`} style={{ color: "var(--text-muted)" }}>
          {full}
        </span>
      )
    } else if (str) {
      nodes.push(
        <span key={`s-${match.index}`} style={{ color: "var(--track-ts)" }}>
          {full}
        </span>
      )
    } else if (kw && KW.has(kw)) {
      nodes.push(
        <span key={`k-${match.index}`} style={{ color: "var(--track-agent)" }}>
          {full}
        </span>
      )
    }

    cursor = match.index + full.length
  }

  if (cursor < code.length) {
    nodes.push(
      <span key="t-end" style={{ color: "var(--text-primary)" }}>
        {code.slice(cursor)}
      </span>
    )
  }

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
  chapterHref: string
}[] = [
  {
    key: "stream",
    label: "streamText()",
    file: "app/api/chat/route.ts",
    comment: "// Chapter 01 · Vercel AI SDK · 流式响应",
    chapterHref: "/learn/llm-basics",
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
    chapterHref: "/learn/agent-frameworks",
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

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3 7h8M7 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ─── Component ─────────────────────────────────────── */
export function Hero() {
  const [active, setActive] = useState<TabKey>("stream")
  const tab = TABS.find((t) => t.key === active)!

  return (
    <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_44%] gap-10 lg:gap-16 items-start">
        {/* ── Left: text ───────────────────────────── */}
        <div className="flex flex-col gap-6">
          <p
            className="fade-up font-mono text-xs tracking-[0.18em] uppercase"
            style={{ color: "var(--text-muted)", animationDelay: "0ms" }}
          >
            Frontend × AI Engineering
          </p>

          <h1
            className="fade-up text-balance text-[clamp(2.25rem,5vw,3.375rem)] font-light leading-[1.05] tracking-tight"
            style={{ color: "var(--text-primary)", animationDelay: "80ms" }}
          >
            用 JavaScript
            <br />
            构建 AI Agent。
          </h1>

          <p
            className="fade-up text-pretty font-mono text-[0.9375rem] leading-[1.7]"
            style={{
              color: "var(--text-secondary)",
              maxWidth: "54ch",
              animationDelay: "160ms",
            }}
          >
            面向前端工程师的 AI Agent 系统学习路线。
            <br />
            五个模块，真实代码，完整 JS/TS 工具链。
            <br />
            不需要 Python，不需要机器学习背景。
          </p>

          <div className="fade-up flex flex-wrap items-center gap-4 pt-1" style={{ animationDelay: "240ms" }}>
            <a href="/learn/llm-basics" className="btn-primary">
              从第一章开始
              <ArrowRight />
            </a>
            <a href="/learn" className="btn-ghost">
              查看全部模块 →
            </a>
          </div>

          <p className="fade-up font-mono text-xs" style={{ color: "var(--text-muted)", animationDelay: "300ms" }}>
            5 个模块 · 交互式 Demo · 自动视频讲解
          </p>
        </div>

        {/* ── Right: code panel (Radix Tabs for a11y) ── */}
        <Tabs.Root
          value={active}
          onValueChange={(v) => setActive(v as TabKey)}
          className="fade-up rounded-lg overflow-hidden"
          style={{
            backgroundColor: "var(--surface-1)",
            border: "1px solid var(--border)",
            animationDelay: "120ms",
          }}
        >
          {/* Tab bar */}
          <div className="flex items-center justify-between px-4 border-b" style={{ borderColor: "var(--border)" }}>
            {/*
              Base UI Tabs.List handles:
              - Arrow key navigation between tabs
              - Home / End (first / last tab)
              - Roving tabIndex within the list
              Fixes baseline-ui violation: "NEVER rebuild keyboard/focus behavior by hand"
            */}
            <Tabs.List className="flex gap-0" aria-label="代码示例">
              {TABS.map((t) => (
                <Tabs.Tab
                  key={t.key}
                  value={t.key}
                  className={cn(
                    "font-mono text-xs px-3 py-3 border-b-2 transition-colors cursor-pointer bg-transparent",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
                  )}
                  style={
                    {
                      borderColor: active === t.key ? "var(--accent)" : "transparent",
                      color: active === t.key ? "var(--text-primary)" : "var(--text-muted)",
                      // focus-visible ring uses CSS custom property
                      "--tw-ring-color": "var(--accent)",
                    } as React.CSSProperties
                  }
                >
                  {t.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>

            {/* File path indicator */}
            <span
              className="font-mono text-[0.6875rem] truncate ml-2"
              style={{ color: "var(--text-muted)" }}
              aria-hidden="true"
            >
              {tab.file}
            </span>
          </div>

          {/* Tab panels — Radix renders role="tabpanel" + aria-labelledby automatically */}
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
            className="px-5 py-3 border-t flex items-center justify-between"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <span className="font-mono text-[0.6875rem]" style={{ color: "var(--text-muted)" }}>
              TypeScript · Next.js App Router
            </span>
            <a href={tab.chapterHref} className="font-mono text-[0.6875rem] link-arrow">
              查看章节 →
            </a>
          </div>
        </Tabs.Root>
      </div>
    </section>
  )
}
