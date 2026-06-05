import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "推荐资源 — AgentLab",
  description: "精选 AI Agent 开发学习资源，按章节分类整理。",
}

interface Resource {
  title: string
  author?: string
  href: string
  description: string
  type: "article" | "video" | "repo" | "doc" | "course"
  free: boolean
  lang: "zh" | "en"
}

interface ResourceGroup {
  chapter: string
  color: string
  label: string
  items: Resource[]
}

const TYPE_LABEL: Record<Resource["type"], string> = {
  article: "文章",
  video: "视频",
  repo: "仓库",
  doc: "文档",
  course: "课程",
}

const GROUPS: ResourceGroup[] = [
  {
    chapter: "01",
    color: "var(--track-llm)",
    label: "LLM 基础认知",
    items: [
      {
        title: "A Hacker's Guide to Language Models",
        author: "Jeremy Howard",
        href: "https://www.youtube.com/watch?v=jkrNMKz9pWU",
        description: "深入浅出讲解大语言模型原理，适合有编程基础的工程师快速建立认知。",
        type: "video",
        free: true,
        lang: "en",
      },
      {
        title: "Anthropic Cookbook",
        href: "https://github.com/anthropics/anthropic-cookbook",
        description: "Anthropic 官方实战代码示例合集，覆盖 Prompt Engineering 核心技巧。",
        type: "repo",
        free: true,
        lang: "en",
      },
      {
        title: "OpenAI Chat Completions API 文档",
        href: "https://platform.openai.com/docs/guides/chat",
        description: "Chat Completions API 完整参考，理解 messages、role、temperature 等核心参数。",
        type: "doc",
        free: true,
        lang: "en",
      },
      {
        title: "Token 与 Embedding 可视化工具",
        href: "https://tiktokenizer.vercel.app",
        description: "在线 Token 边界可视化，直观理解大模型如何切分中英文文本。",
        type: "article",
        free: true,
        lang: "en",
      },
    ],
  },
  {
    chapter: "02",
    color: "var(--track-ts)",
    label: "JavaScript / TypeScript AI 工具链",
    items: [
      {
        title: "Vercel AI SDK 官方文档",
        href: "https://sdk.vercel.ai/docs",
        description: "streamText、generateObject、useChat 等核心 API 参考，前端 AI 应用首选工具链。",
        type: "doc",
        free: true,
        lang: "en",
      },
      {
        title: "Anthropic TypeScript SDK",
        href: "https://github.com/anthropics/anthropic-sdk-typescript",
        description: "Anthropic 官方 TypeScript SDK，含 streaming、tool use、vision 示例。",
        type: "repo",
        free: true,
        lang: "en",
      },
      {
        title: "OpenAI Node.js Library",
        href: "https://github.com/openai/openai-node",
        description: "OpenAI 官方 Node.js 客户端，支持流式响应、Function Calling、Batch API。",
        type: "repo",
        free: true,
        lang: "en",
      },
      {
        title: "LangChain.js 文档",
        href: "https://js.langchain.com/docs",
        description: "LangChain JavaScript/TypeScript 版本官方文档，含 Chain、Agent、Memory 模式。",
        type: "doc",
        free: true,
        lang: "en",
      },
    ],
  },
  {
    chapter: "03",
    color: "var(--track-agent)",
    label: "Agent 核心概念",
    items: [
      {
        title: "ReAct: Synergizing Reasoning and Acting in Language Models",
        href: "https://arxiv.org/abs/2210.03629",
        description: "ReAct 模式原论文，推理 + 行动交替的核心范式，Agent 开发必读。",
        type: "article",
        free: true,
        lang: "en",
      },
      {
        title: "Tool Use & Function Calling — Anthropic 指南",
        href: "https://docs.anthropic.com/en/docs/tool-use",
        description: "Claude 工具调用完整指南，含定义、调用、结果回填的完整循环示例。",
        type: "doc",
        free: true,
        lang: "en",
      },
      {
        title: "Building AI Agents with the Vercel AI SDK",
        href: "https://sdk.vercel.ai/docs/ai-sdk-core/agents",
        description: "用 Vercel AI SDK 构建 maxSteps 驱动的自主 Agent，最简工程实践。",
        type: "doc",
        free: true,
        lang: "en",
      },
      {
        title: "什么是 AI Agent？",
        author: "Lilian Weng",
        href: "https://lilianweng.github.io/posts/2023-06-23-agent/",
        description: "深度解析 Agent 的规划、记忆、工具三要素，OpenAI 研究员出品必读长文。",
        type: "article",
        free: true,
        lang: "en",
      },
    ],
  },
  {
    chapter: "04",
    color: "var(--track-fw)",
    label: "Agent 框架实战",
    items: [
      {
        title: "LangGraph.js 官方文档",
        href: "https://langchain-ai.github.io/langgraphjs",
        description: "基于图结构编排 Agent 工作流，支持持久化 Checkpoint 和多 Agent 并行。",
        type: "doc",
        free: true,
        lang: "en",
      },
      {
        title: "Mastra 文档",
        href: "https://mastra.ai/docs",
        description: "TypeScript 原生 AI 框架，工作流 + 记忆 + 工具一体化，对前端友好。",
        type: "doc",
        free: true,
        lang: "en",
      },
      {
        title: "Model Context Protocol (MCP) 规范",
        href: "https://spec.modelcontextprotocol.io",
        description: "Anthropic 提出的 AI 工具标准化协议，连接 LLM 与任意外部服务的通用接口。",
        type: "doc",
        free: true,
        lang: "en",
      },
      {
        title: "LangGraph.js 实战系列",
        href: "https://github.com/langchain-ai/langgraphjs/tree/main/examples",
        description: "官方示例：RAG Agent、子图编排、人机协作、持久化状态等完整案例。",
        type: "repo",
        free: true,
        lang: "en",
      },
    ],
  },
  {
    chapter: "05",
    color: "var(--track-multi)",
    label: "Multi-Agent 系统设计",
    items: [
      {
        title: "Orchestrating Agents: Routines and Handoffs",
        author: "OpenAI",
        href: "https://cookbook.openai.com/examples/orchestrating_agents",
        description: "OpenAI 官方 Swarm 架构：Orchestrator 路由 + Handoff 移交的轻量多 Agent 模式。",
        type: "article",
        free: true,
        lang: "en",
      },
      {
        title: "Langfuse 文档",
        href: "https://langfuse.com/docs",
        description: "开源 LLM 可观测性平台，Trace、Span、评估一体化，生产必备。",
        type: "doc",
        free: true,
        lang: "en",
      },
      {
        title: "RAG from Scratch — DeepLearning.AI",
        href: "https://www.deeplearning.ai/short-courses/building-and-evaluating-advanced-rag",
        description: "从向量检索到 Rerank 的完整 RAG 实现，搭配 LangChain 代码演示。",
        type: "course",
        free: true,
        lang: "en",
      },
      {
        title: "Evaluating LLM Applications",
        href: "https://github.com/confident-ai/deepeval",
        description: "DeepEval 开源评估框架，为 LLM/Agent 输出质量提供可量化指标。",
        type: "repo",
        free: true,
        lang: "en",
      },
    ],
  },
]

function ResourceCard({ item }: { item: Resource }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2 py-4"
      style={{ borderTop: "1px solid var(--border-subtle)", textDecoration: "none" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-mono text-[0.6875rem] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: "var(--surface-2)",
              color: "var(--text-muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {TYPE_LABEL[item.type]}
          </span>
          <span
            className="font-mono text-[0.6875rem] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: item.free ? "var(--accent-subtle)" : "var(--surface-2)",
              color: item.free ? "var(--accent)" : "var(--text-muted)",
              border: `1px solid ${item.free ? "var(--accent-dim)" : "var(--border-subtle)"}`,
            }}
          >
            {item.free ? "免费" : "付费"}
          </span>
          <span
            className="font-mono text-[0.6875rem] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: "var(--surface-2)",
              color: "var(--text-muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {item.lang === "zh" ? "中文" : "EN"}
          </span>
        </div>
        <span
          className="font-mono text-xs shrink-0 transition-all group-hover:mr-[-4px]"
          style={{ color: "var(--accent)" }}
          aria-hidden="true"
        >
          →
        </span>
      </div>

      <h3 className="font-mono text-sm font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
        {item.title}
        {item.author && (
          <span className="font-normal ml-1.5" style={{ color: "var(--text-muted)" }}>
            · {item.author}
          </span>
        )}
      </h3>

      <p className="font-mono text-xs leading-[1.65]" style={{ color: "var(--text-secondary)", maxWidth: "68ch" }}>
        {item.description}
      </p>
    </a>
  )
}

export default function ResourcesPage() {
  const totalCount = GROUPS.reduce((acc, g) => acc + g.items.length, 0)

  return (
    <>
      <Nav />
      <main id="main-content" tabIndex={-1}>
        <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-14">
            <p className="font-mono text-xs tracking-[0.18em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
              推荐资源
            </p>
            <h1
              className="text-[clamp(1.75rem,4vw,2.5rem)] font-light tracking-tight leading-tight mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              精选学习资料
            </h1>
            <p className="font-mono text-sm leading-[1.7]" style={{ color: "var(--text-secondary)", maxWidth: "56ch" }}>
              按学习章节分类整理，共 {totalCount} 份资源。 优先收录免费、英文原版、有代码示例的高质量内容。
            </p>
          </div>

          {/* Groups */}
          <div className="flex flex-col gap-14">
            {GROUPS.map((group) => (
              <section key={group.chapter} aria-labelledby={`group-${group.chapter}`}>
                {/* Group header */}
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xs tabular-nums font-medium" style={{ color: group.color }}>
                    {group.chapter}
                  </span>
                  <h2
                    id={`group-${group.chapter}`}
                    className="font-mono text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {group.label}
                  </h2>
                  <span className="font-mono text-[0.6875rem] ml-auto" style={{ color: "var(--text-muted)" }}>
                    {group.items.length} 份
                  </span>
                </div>

                {/* Items */}
                <div role="list" aria-label={`${group.label}资源列表`}>
                  {group.items.map((item, i) => (
                    <div key={i} role="listitem">
                      <ResourceCard item={item} />
                    </div>
                  ))}
                </div>

                {/* Footer link to chapter */}
                <a
                  href={`/learn/${["llm-basics", "js-ts-toolchain", "agent-core", "agent-frameworks", "multi-agent"][parseInt(group.chapter) - 1]}`}
                  className="font-mono text-xs mt-2 inline-flex items-center gap-1"
                  style={{ color: group.color, textDecoration: "none" }}
                >
                  前往第 {group.chapter} 章学习 →
                </a>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
