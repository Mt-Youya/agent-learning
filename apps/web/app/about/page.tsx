import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "关于 — AgentLab",
  description: "AgentLab 是面向前端工程师的 AI Agent 系统学习平台。",
}

const TRACKS = [
  { order: "01", title: "LLM 基础认知", color: "var(--track-llm)", slug: "llm-basics" },
  { order: "02", title: "JavaScript / TypeScript AI 工具链", color: "var(--track-ts)", slug: "js-ts-toolchain" },
  { order: "03", title: "Agent 核心概念", color: "var(--track-agent)", slug: "agent-core" },
  { order: "04", title: "Agent 框架实战", color: "var(--track-fw)", slug: "agent-frameworks" },
  { order: "05", title: "Multi-Agent 系统设计", color: "var(--track-multi)", slug: "multi-agent" },
]

const TOOLS = [
  { name: "Token 计数器", href: "/tools/token-counter", desc: "可视化 Token 边界与计价估算" },
  { name: "Prompt Playground", href: "/tools/prompt-playground", desc: "流式对话测试台" },
  { name: "RAG 检索", href: "/tools/rag-playground", desc: "向量检索流程演示" },
  { name: "Agent Playground", href: "/tools/agent-playground", desc: "ReAct 循环可视化" },
]

const PRINCIPLES = [
  {
    title: "前端为起点",
    body: "所有概念从 JS/TS 生态出发，async/await 就是 Agent Loop，Zustand 就是 Agent State。不要求 Python 背景，不讲 GPU 编程，不训练模型。",
  },
  {
    title: "代码先于理论",
    body: "每个概念都有对应的可运行代码示例。先看代码，再理解原理。每章配套交互工具，在浏览器中直接体验，无需本地安装。",
  },
  {
    title: "工程而非科研",
    body: "关注如何用 LLM API 构建可靠的生产应用，而不是研究模型内部结构。可观测性、错误处理、成本控制是一等公民。",
  },
  {
    title: "持续更新",
    body: "AI 工具链迭代极快。我们持续跟踪 Vercel AI SDK、LangGraph.js、Mastra、MCP 等工具的最新变化，保持内容时效性。",
  },
]

const STACK = [
  ["框架", "Next.js 15 App Router"],
  ["语言", "TypeScript 5"],
  ["样式", "Tailwind CSS v4"],
  ["UI 组件", "shadcn/ui + Radix UI"],
  ["动画", "GSAP ScrollTrigger"],
  ["图标", "@tabler/icons-react"],
  ["字体", "Geist + Geist Mono"],
  ["部署", "Vercel"],
]

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main id="main-content" tabIndex={-1}>
        <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <p className="font-mono text-xs tracking-[0.18em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
              关于
            </p>
            <h1
              className="text-[clamp(1.75rem,4vw,2.5rem)] font-light tracking-tight leading-tight mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              AgentLab
            </h1>
            <p
              className="font-mono text-sm leading-[1.75]"
              style={{ color: "var(--text-secondary)", maxWidth: "58ch" }}
            >
              AgentLab 是面向前端工程师的 AI Agent 系统学习平台。 我们相信，拥有 async/await
              和状态管理经验的前端工程师， 已经掌握了构建 AI Agent 所需的大部分思维模型。 只需一座桥梁，把已有技能映射到
              AI 工程领域。
            </p>
          </div>

          {/* Why frontend engineers */}
          <section className="mb-16" aria-labelledby="why-heading">
            <h2
              id="why-heading"
              className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] mb-6"
              style={{ color: "var(--text-muted)" }}
            >
              为什么是前端工程师
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
              {[
                ["async/await · Promise", "Agent Loop 异步 I/O", "var(--track-llm)"],
                ["事件驱动思维", "Tool Use 回调机制", "var(--track-ts)"],
                ["Redux · Zustand 状态管理", "Agent State 管理", "var(--track-agent)"],
                ["API 调用与错误处理", "LLM API 调用", "var(--track-fw)"],
                ["组件化 · 模块化思维", "Subagent 拆分", "var(--track-multi)"],
                ["TypeScript 类型系统", "Zod 结构化输出", "var(--track-llm)"],
              ].map(([from, to, color], i) => (
                <div
                  key={i}
                  className="grid gap-0 py-3"
                  style={{
                    gridTemplateColumns: "1fr auto 1fr",
                    borderTop: "1px solid var(--border-subtle)",
                    ...(i >= 4 ? { borderBottom: "1px solid var(--border-subtle)" } : {}),
                  }}
                >
                  <span className="font-mono text-xs pr-3" style={{ color: "var(--text-secondary)" }}>
                    {from}
                  </span>
                  <span className="font-mono text-xs px-3" style={{ color }}>
                    →
                  </span>
                  <span className="font-mono text-xs font-medium" style={{ color }}>
                    {to}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Learning path */}
          <section className="mb-16" aria-labelledby="path-heading">
            <h2
              id="path-heading"
              className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] mb-6"
              style={{ color: "var(--text-muted)" }}
            >
              学习路线
            </h2>
            <div className="flex flex-col">
              {TRACKS.map((t, i) => (
                <a
                  key={t.order}
                  href={`/learn/${t.slug}`}
                  className="flex items-center gap-4 py-3"
                  style={{
                    borderTop: "1px solid var(--border-subtle)",
                    textDecoration: "none",
                    ...(i === TRACKS.length - 1 ? { borderBottom: "1px solid var(--border-subtle)" } : {}),
                  }}
                >
                  <span className="font-mono text-xs tabular-nums shrink-0 w-5" style={{ color: t.color }}>
                    {t.order}
                  </span>
                  <span className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                    {t.title}
                  </span>
                  <span className="font-mono text-xs ml-auto" style={{ color: "var(--text-muted)" }} aria-hidden="true">
                    →
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* Interactive tools */}
          <section className="mb-16" aria-labelledby="tools-heading">
            <h2
              id="tools-heading"
              className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] mb-6"
              style={{ color: "var(--text-muted)" }}
            >
              交互工具
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TOOLS.map((tool) => (
                <a
                  key={tool.href}
                  href={tool.href}
                  className="flex flex-col gap-1 p-4 rounded-lg"
                  style={{
                    backgroundColor: "var(--surface-1)",
                    border: "1px solid var(--border-subtle)",
                    textDecoration: "none",
                  }}
                >
                  <span className="font-mono text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {tool.name}
                  </span>
                  <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                    {tool.desc}
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* Design principles */}
          <section className="mb-16" aria-labelledby="principles-heading">
            <h2
              id="principles-heading"
              className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] mb-6"
              style={{ color: "var(--text-muted)" }}
            >
              设计原则
            </h2>
            <div className="flex flex-col gap-0">
              {PRINCIPLES.map((p, i) => (
                <div
                  key={p.title}
                  className="py-5"
                  style={{
                    borderTop: "1px solid var(--border-subtle)",
                    ...(i === PRINCIPLES.length - 1 ? { borderBottom: "1px solid var(--border-subtle)" } : {}),
                  }}
                >
                  <h3 className="font-mono text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                    {p.title}
                  </h3>
                  <p
                    className="font-mono text-xs leading-[1.7]"
                    style={{ color: "var(--text-secondary)", maxWidth: "58ch" }}
                  >
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Tech stack */}
          <section className="mb-16" aria-labelledby="stack-heading">
            <h2
              id="stack-heading"
              className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] mb-6"
              style={{ color: "var(--text-muted)" }}
            >
              技术栈
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
              {STACK.map(([label, value], i) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4 py-2.5"
                  style={{ borderTop: "1px solid var(--border-subtle)" }}
                >
                  <span className="font-mono text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
                    {label}
                  </span>
                  <span className="font-mono text-xs text-right" style={{ color: "var(--text-secondary)" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* GitHub */}
          <section
            className="rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="flex flex-col gap-1">
              <span className="font-mono text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                开源在 GitHub
              </span>
              <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                欢迎提交 Issue、PR 或 Star。
              </span>
            </div>
            <a
              href="https://github.com/Mt-Youya"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm px-4 py-2 rounded-lg shrink-0"
              style={{
                backgroundColor: "var(--accent-subtle)",
                color: "var(--accent)",
                border: "1px solid var(--accent-dim)",
                textDecoration: "none",
              }}
            >
              github.com/Mt-Youya →
            </a>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
