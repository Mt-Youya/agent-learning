import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "工具箱 — AgentLab",
  description: "AI 开发辅助工具集，配合课程章节使用。",
}

interface Tool {
  id: string
  name: string
  description: string
  href: string | null /* null = not yet available */
  badge: string
  available: boolean
}

const TOOLS: Tool[] = [
  {
    id: "01",
    name: "Token 计数器",
    description:
      "实时分析文本的 Token 组成，可视化 Token 边界。支持 GPT-4o / GPT-3.5 / Claude 模型计价估算。对应第一章 LLM 基础认知。",
    href: "/tools/token-counter",
    badge: "可用",
    available: true,
  },
  {
    id: "02",
    name: "Prompt Playground",
    description: "流式对话测试台。调节 Temperature、Max Tokens，实时观察大模型输出变化。对应第二章 JS/TS 工具链。",
    href: "/tools/prompt-playground",
    badge: "可用",
    available: true,
  },
  {
    id: "03",
    name: "RAG 检索",
    description: "粘贴文档，体验文档切片、Embedding、向量检索、Rerank 排序的完整 RAG 流程。对应第五章 Multi-Agent。",
    href: "/tools/rag-playground",
    badge: "可用",
    available: true,
  },
  {
    id: "04",
    name: "Agent Playground",
    description:
      "配置工具集，观察 ReAct 循环的完整执行过程：思考、工具调用、结果回填、下一步规划。对应第三章 Agent 核心概念。",
    href: "/tools/agent-playground",
    badge: "可用",
    available: true,
  },
  {
    id: "05",
    name: "TubePilot Video Agent",
    description:
      "真实 Agent Loop 演示——Claude 自主调用 5 个工具（脚本→语音→场景→视频→发布）完成视频生成 Pipeline。对应《Agent 开发实战》第十四章。",
    href: "/tools/video-agent",
    badge: "真实 API",
    available: true,
  },
]

export default function ToolsPage() {
  return (
    <>
      <Nav />
      <main id="main-content" tabIndex={-1}>
        <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
          {/* Page header */}
          <div className="mb-14">
            <p className="font-mono text-xs tracking-[0.18em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
              工具箱
            </p>
            <h1
              className="text-[clamp(1.75rem,4vw,2.5rem)] font-light tracking-tight leading-tight mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              AI 开发辅助工具
            </h1>
            <p className="font-mono text-sm" style={{ color: "var(--text-secondary)", maxWidth: "54ch" }}>
              每个工具对应一个核心概念，在浏览器中直接体验。 不需要本地安装任何环境。
            </p>
          </div>

          {/* Tool list */}
          <ol className="flex flex-col list-none m-0 p-0" aria-label="工具列表">
            {TOOLS.map((tool, index) => {
              return (
                <li
                  key={tool.id}
                  className="grid gap-4 py-6"
                  style={{
                    gridTemplateColumns: "2.5rem 1fr auto",
                    borderTop: "1px solid var(--border-subtle)",
                    ...(index === TOOLS.length - 1 ? { borderBottom: "1px solid var(--border-subtle)" } : {}),
                  }}
                >
                  {/* Number */}
                  <span
                    className="font-mono text-xs pt-1.5 tabular-nums select-none"
                    style={{ color: "var(--text-muted)" }}
                    aria-hidden="true"
                  >
                    {tool.id}
                  </span>

                  {/* Content */}
                  <div className="flex flex-col gap-2.5 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2
                        className="font-sans text-[1.0625rem] font-medium leading-snug"
                        style={{
                          color: tool.available ? "var(--text-primary)" : "var(--text-secondary)",
                        }}
                      >
                        {tool.name}
                      </h2>
                      <span
                        className="font-mono text-xs px-2 py-0.5 rounded-lg"
                        style={{
                          backgroundColor: tool.available ? "var(--accent-subtle)" : "var(--surface-2)",
                          color: tool.available ? "var(--accent)" : "var(--text-muted)",
                          border: `1px solid ${tool.available ? "var(--accent-dim)" : "var(--border)"}`,
                        }}
                      >
                        {tool.badge}
                      </span>
                    </div>
                    <p
                      className="font-mono text-sm leading-[1.65]"
                      style={{
                        color: tool.available ? "var(--text-secondary)" : "var(--text-muted)",
                        maxWidth: "62ch",
                      }}
                    >
                      {tool.description}
                    </p>
                  </div>

                  {/* Arrow — only for available tools */}
                  {tool.href ? (
                    <a
                      href={tool.href}
                      className="link-arrow self-start pt-1.5 text-base"
                      aria-label={`打开 ${tool.name}`}
                    >
                      →
                    </a>
                  ) : (
                    <span
                      className="self-start pt-1.5 text-base font-mono"
                      style={{ color: "var(--border)" }}
                      aria-hidden="true"
                    >
                      →
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </main>
      <Footer />
    </>
  )
}
