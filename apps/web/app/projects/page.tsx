import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "实战项目 — AgentLab",
  description: "配套章节的动手项目，从 Hello World 到生产可用的 Agent 系统。",
}

interface Project {
  id: string
  title: string
  description: string
  chapter: string
  chapterTitle: string
  chapterSlug: string
  color: string
  difficulty: "入门" | "进阶" | "实战"
  duration: string
  tags: string[]
  features: string[]
  status: "available" | "soon"
}

const PROJECTS: Project[] = [
  {
    id: "01",
    title: "流式 AI 对话接口",
    description:
      "用 Vercel AI SDK 构建一个流式响应的聊天 API，在 Next.js App Router 中接入 OpenAI / Anthropic，前端用 useChat hook 消费流式数据。",
    chapter: "01",
    chapterTitle: "LLM 基础认知",
    chapterSlug: "llm-basics",
    color: "var(--track-llm)",
    difficulty: "入门",
    duration: "2-4 小时",
    tags: ["Next.js", "Vercel AI SDK", "streamText", "useChat"],
    features: [
      "POST /api/chat 路由，返回 ReadableStream",
      "前端 useChat 消费流式响应",
      "Temperature 和 Max Tokens 参数控制",
      "消息历史持久化到 localStorage",
    ],
    status: "available",
  },
  {
    id: "02",
    title: "结构化数据提取器",
    description:
      "使用 generateObject + Zod Schema 从非结构化文本中提取结构化数据，构建一个简历解析器或产品信息提取工具。",
    chapter: "02",
    chapterTitle: "JavaScript / TypeScript AI 工具链",
    chapterSlug: "js-ts-toolchain",
    color: "var(--track-ts)",
    difficulty: "入门",
    duration: "3-5 小时",
    tags: ["Vercel AI SDK", "generateObject", "Zod", "TypeScript"],
    features: [
      "定义 Zod Schema 约束输出结构",
      "generateObject 调用 LLM 并强制类型化输出",
      "错误处理与 fallback 策略",
      "批量处理多条输入的并发优化",
    ],
    status: "available",
  },
  {
    id: "03",
    title: "自主搜索 Agent",
    description:
      "基于 Vercel AI SDK 的 maxSteps 构建一个能自主搜索网页、提取信息、汇总回答的 Agent，实现完整的 ReAct 循环。",
    chapter: "03",
    chapterTitle: "Agent 核心概念",
    chapterSlug: "agent-core",
    color: "var(--track-agent)",
    difficulty: "进阶",
    duration: "1-2 天",
    tags: ["Vercel AI SDK", "Tool Use", "maxSteps", "ReAct"],
    features: [
      "定义 search / fetch / summarize 工具集",
      "maxSteps 控制最大循环次数",
      "工具调用链路的日志可视化",
      "流式输出中间思考过程",
    ],
    status: "available",
  },
  {
    id: "04",
    title: "客服 Agent 系统",
    description:
      "用 LangGraph.js 构建有状态的客服 Agent：意图识别 → 路由分发 → 专业子 Agent 处理 → 结果汇总，接入产品知识库。",
    chapter: "04",
    chapterTitle: "Agent 框架实战",
    chapterSlug: "agent-frameworks",
    color: "var(--track-fw)",
    difficulty: "实战",
    duration: "3-5 天",
    tags: ["LangGraph.js", "StateGraph", "Checkpoint", "RAG"],
    features: [
      "StateGraph 定义意图分类节点",
      "条件边路由到专业 Agent",
      "持久化 Checkpoint 保存对话状态",
      "接入向量知识库检索",
    ],
    status: "available",
  },
  {
    id: "05",
    title: "代码审查 Multi-Agent",
    description:
      "构建一个多 Agent 协作的代码审查系统：安全审查 Agent + 性能审查 Agent + 可维护性审查 Agent 并行执行，Orchestrator 汇总报告。",
    chapter: "05",
    chapterTitle: "Multi-Agent 系统设计",
    chapterSlug: "multi-agent",
    color: "var(--track-multi)",
    difficulty: "实战",
    duration: "5-7 天",
    tags: ["LangGraph.js", "Multi-Agent", "Langfuse", "Evals"],
    features: [
      "Orchestrator 分解任务并并行调度",
      "三个专业 Worker Agent 独立审查",
      "Langfuse 追踪每条执行链路",
      "自动化评估打分与报告生成",
    ],
    status: "soon",
  },
]

const DIFFICULTY_COLOR: Record<Project["difficulty"], string> = {
  入门: "var(--track-ts)",
  进阶: "var(--track-agent)",
  实战: "var(--track-multi)",
}

export default function ProjectsPage() {
  return (
    <>
      <Nav />
      <main id="main-content" tabIndex={-1}>
        <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-14">
            <p className="font-mono text-xs tracking-[0.18em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
              实战项目
            </p>
            <h1
              className="text-[clamp(1.75rem,4vw,2.5rem)] font-light tracking-tight leading-tight mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              动手做，学得快。
            </h1>
            <p className="font-mono text-sm leading-[1.7]" style={{ color: "var(--text-secondary)", maxWidth: "56ch" }}>
              每个项目对应一个核心章节，从零搭建到完整可运行。 难度循序渐进，完成全部五个项目即可构建生产级 Agent 系统。
            </p>
          </div>

          {/* Project list */}
          <ol className="flex flex-col list-none m-0 p-0" aria-label="实战项目列表">
            {PROJECTS.map((project, index) => (
              <li
                key={project.id}
                className="grid gap-5 py-8"
                style={{
                  gridTemplateColumns: "minmax(3rem,5rem) 1fr",
                  borderTop: "1px solid var(--border-subtle)",
                  ...(index === PROJECTS.length - 1 ? { borderBottom: "1px solid var(--border-subtle)" } : {}),
                }}
              >
                {/* Number */}
                <span
                  className="font-mono font-light tabular-nums select-none leading-none"
                  style={{
                    fontSize: "clamp(2.5rem,6vw,4rem)",
                    lineHeight: 1,
                    color: "var(--text-muted)",
                    paddingTop: "0.05em",
                  }}
                  aria-hidden="true"
                >
                  {project.id}
                </span>

                {/* Content */}
                <div className="flex flex-col gap-3 min-w-0">
                  {/* Chapter badge */}
                  <a
                    href={`/learn/${project.chapterSlug}`}
                    className="font-mono text-xs self-start"
                    style={{ color: project.color, textDecoration: "none" }}
                  >
                    第 {project.chapter} 章 · {project.chapterTitle}
                  </a>

                  {/* Title */}
                  <h2
                    className="text-[1.125rem] font-medium leading-snug text-balance"
                    style={{
                      color: project.status === "available" ? "var(--text-primary)" : "var(--text-secondary)",
                    }}
                  >
                    {project.title}
                    {project.status === "soon" && (
                      <span
                        className="font-mono text-xs font-normal ml-2 px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: "var(--surface-2)",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border-subtle)",
                          verticalAlign: "middle",
                        }}
                      >
                        即将上线
                      </span>
                    )}
                  </h2>

                  {/* Description */}
                  <p
                    className="font-mono text-sm leading-[1.65]"
                    style={{ color: "var(--text-secondary)", maxWidth: "58ch" }}
                  >
                    {project.description}
                  </p>

                  {/* Features */}
                  <ul className="flex flex-col gap-1.5 list-none m-0 p-0" aria-label="项目功能点">
                    {project.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 font-mono text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <span className="shrink-0 mt-[0.2em]" style={{ color: project.color }} aria-hidden="true">
                          ·
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Tags + meta */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                    <span
                      className="font-mono text-xs px-1.5 py-0.5 rounded"
                      style={{
                        color: DIFFICULTY_COLOR[project.difficulty],
                        backgroundColor: "var(--surface-1)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {project.difficulty}
                    </span>
                    <span className="font-mono text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>
                      {project.duration}
                    </span>
                    <div className="flex flex-wrap gap-1.5 ml-auto" aria-label="技术栈">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[0.6875rem] px-1.5 py-0.5 rounded"
                          style={{
                            color: project.color,
                            backgroundColor: "var(--surface-1)",
                            border: "1px solid var(--border-subtle)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  {project.status === "available" && (
                    <a
                      href={`/learn/${project.chapterSlug}`}
                      className="font-mono text-xs self-start mt-1"
                      style={{ color: "var(--accent)", textDecoration: "none" }}
                    >
                      前往章节开始 →
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </main>
      <Footer />
    </>
  )
}
