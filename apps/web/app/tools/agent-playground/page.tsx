"use client"

import { useCallback, useRef, useState } from "react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Button } from "@agent-learning/ui"

/* ─── Types ─────────────────────────────────────────── */
type StepKind = "thought" | "action" | "observation" | "answer"

interface ReActStep {
  id: number
  kind: StepKind
  content: string
}

interface Tool {
  id: string
  name: string
  description: string
  icon: string
}

/* ─── Available tools ────────────────────────────────── */
const TOOLS: Tool[] = [
  { id: "search", name: "web_search", description: "搜索互联网获取实时信息", icon: "⌕" },
  { id: "calc", name: "calculator", description: "执行数学计算", icon: "∑" },
  { id: "weather", name: "weather_api", description: "查询城市天气信息", icon: "◎" },
  { id: "code", name: "code_runner", description: "执行 JavaScript 代码片段", icon: "▷" },
]

/* ─── Scenarios ──────────────────────────────────────── */
interface Scenario {
  keywords: string[]
  steps: Omit<ReActStep, "id">[]
}

const SCENARIOS: Scenario[] = [
  {
    keywords: ["天气", "weather", "气温", "温度"],
    steps: [
      { kind: "thought", content: "用户想知道天气情况。我需要查询实时天气数据，应该调用 weather_api 工具。" },
      { kind: "action", content: 'weather_api({"city": "北京", "date": "today"})' },
      {
        kind: "observation",
        content:
          '{"city": "北京", "temp": 22, "feels_like": 20, "weather": "晴", "humidity": "45%", "wind": "东北风 3级"}',
      },
      { kind: "thought", content: "已获取天气数据。北京今天22°C，晴天，适合外出。现在可以回答用户的问题了。" },
      {
        kind: "answer",
        content: "北京今天天气晴，气温22°C（体感20°C），湿度45%，东北风3级。适合外出活动，建议携带薄外套。",
      },
    ],
  },
  {
    keywords: ["计算", "多少", "等于", "+", "-", "×", "÷", "math", "数学"],
    steps: [
      { kind: "thought", content: "用户需要进行数学计算。我应该调用 calculator 工具来确保计算结果准确。" },
      { kind: "action", content: 'calculator({"expression": "1024 * 1024 / 1024", "precision": 4})' },
      { kind: "observation", content: '{"result": 1024, "expression": "1024 * 1024 / 1024", "type": "integer"}' },
      { kind: "thought", content: "计算完成，结果为 1024。可以直接回答用户了。" },
      { kind: "answer", content: "计算结果是 1024。一兆字节（1 MB）= 1024 KB = 1024 × 1024 字节 = 1,048,576 字节。" },
    ],
  },
  {
    keywords: ["搜索", "search", "最新", "新闻", "找", "查"],
    steps: [
      { kind: "thought", content: "用户需要搜索实时信息。我应该使用 web_search 工具查询。" },
      { kind: "action", content: 'web_search({"query": "LangGraph.js 最新版本 2024", "max_results": 3})' },
      {
        kind: "observation",
        content:
          '{"results": [{"title": "LangGraph.js v0.2.x Released", "url": "...", "snippet": "新版本支持多 Agent 并行执行和持久化 Checkpoint..."}, {"title": "LangGraph.js 教程", "url": "..."}]}',
      },
      {
        kind: "thought",
        content: "已获取搜索结果。LangGraph.js 最新版本是 v0.2.x，支持多 Agent 并行和 Checkpoint。可以回答了。",
      },
      {
        kind: "answer",
        content:
          "根据搜索结果，LangGraph.js 最新版本为 v0.2.x，主要更新包括：支持多 Agent 并行执行、持久化 Checkpoint 机制、以及更完善的状态管理 API。",
      },
    ],
  },
  {
    keywords: ["代码", "code", "js", "javascript", "typescript", "运行", "执行"],
    steps: [
      { kind: "thought", content: "用户需要运行代码。我应该使用 code_runner 工具来执行并返回结果。" },
      {
        kind: "action",
        content:
          'code_runner({"code": "const arr = [3,1,4,1,5,9]; return arr.sort((a,b)=>a-b)", "language": "javascript"})',
      },
      {
        kind: "observation",
        content: '{"output": "[1, 1, 3, 4, 5, 9]", "execution_time": "0.3ms", "status": "success"}',
      },
      { kind: "thought", content: "代码执行成功。排序结果为 [1, 1, 3, 4, 5, 9]。" },
      {
        kind: "answer",
        content:
          "代码执行成功！结果：[1, 1, 3, 4, 5, 9]。Array.sort() 默认按字符串排序，传入比较函数 `(a,b) => a-b` 可实现正确的数字升序排序。执行耗时 0.3ms。",
      },
    ],
  },
]

const DEFAULT_SCENARIO: Scenario = {
  keywords: [],
  steps: [
    {
      kind: "thought",
      content:
        "用户发来了一个问题。让我分析需要哪些信息来回答它。看起来这是一个关于 AI Agent 的问题，我可以直接从训练知识中回答，不需要调用外部工具。",
    },
    {
      kind: "thought",
      content:
        "Agent 是一个能够自主感知环境、作出决策的 AI 系统。它与普通问答模型的关键区别在于工具调用能力和自主规划能力。我有足够的知识来回答。",
    },
    {
      kind: "answer",
      content:
        "AI Agent 是能够自主感知环境、作出决策并采取行动的智能系统。它的核心能力包括：\n\n1. 工具调用（Tool Use）：通过 Function Calling 使用外部工具\n2. 自主规划（Planning）：将复杂目标分解为可执行步骤\n3. 记忆管理（Memory）：在上下文中维护状态信息\n4. 自我反思（Reflection）：评估执行结果并调整策略",
    },
  ],
}

function getScenario(query: string): Scenario {
  const lower = query.toLowerCase()
  for (const s of SCENARIOS) {
    if (s.keywords.some((kw) => lower.includes(kw))) return s
  }
  return DEFAULT_SCENARIO
}

/* ─── Step display ───────────────────────────────────── */
const STEP_CONFIG: Record<StepKind, { label: string; color: string; bg: string }> = {
  thought: { label: "Thought", color: "var(--track-agent)", bg: "oklch(20% 0.015 285)" },
  action: { label: "Action", color: "var(--track-ts)", bg: "oklch(16% 0.012 152)" },
  observation: { label: "Observation", color: "var(--track-llm)", bg: "oklch(18% 0.01 75)" },
  answer: { label: "Final Answer", color: "var(--track-multi)", bg: "oklch(18% 0.008 15)" },
}

/* ─── Page ──────────────────────────────────────────── */
export default function AgentPlaygroundPage() {
  const [query, setQuery] = useState("")
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set(["search", "calc"]))
  const [steps, setSteps] = useState<ReActStep[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const abortRef = useRef(false)

  const toggleTool = useCallback((id: string) => {
    setSelectedTools((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const run = useCallback(async () => {
    if (isRunning) return
    const q = query.trim() || "什么是 AI Agent？"
    const scenario = getScenario(q)
    setSteps([])
    setCurrentStepIndex(-1)
    setIsRunning(true)
    abortRef.current = false

    for (let i = 0; i < scenario.steps.length; i++) {
      if (abortRef.current) break
      setCurrentStepIndex(i)
      await new Promise<void>((r) => setTimeout(r, scenario.steps[i].kind === "observation" ? 800 : 1000))
      setSteps((prev) => [...prev, { ...scenario.steps[i], id: i }])
    }

    setCurrentStepIndex(-1)
    setIsRunning(false)
  }, [isRunning, query])

  const stop = useCallback(() => {
    abortRef.current = true
    setIsRunning(false)
    setCurrentStepIndex(-1)
  }, [])

  const reset = useCallback(() => {
    stop()
    setSteps([])
    setCurrentStepIndex(-1)
  }, [stop])

  const loopCount = steps.filter((s) => s.kind === "thought").length

  return (
    <>
      <Nav />
      <main id="main-content" tabIndex={-1}>
        <div className="pt-28 pb-24 px-6 max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 font-mono text-xs" aria-label="面包屑导航">
            <a href="/tools" className="link-arrow" style={{ fontSize: "0.75rem" }}>
              工具箱
            </a>
            <span style={{ color: "var(--text-muted)" }} aria-hidden="true">
              /
            </span>
            <span style={{ color: "var(--text-secondary)" }}>Agent Playground</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-[clamp(1.5rem,3.5vw,2.125rem)] font-light tracking-tight mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Agent Playground
            </h1>
            <p className="font-mono text-sm" style={{ color: "var(--text-secondary)", maxWidth: "62ch" }}>
              可视化 ReAct（Reasoning + Acting）循环的完整执行过程：思考、工具调用、结果回填、最终回答。 对应第三章
              Agent 核心概念。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
            {/* Left: execution log */}
            <div className="flex flex-col gap-4">
              {/* Query input + run */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isRunning && run()}
                  className="flex-1 font-mono text-sm px-3 py-2.5 rounded-lg"
                  style={{
                    backgroundColor: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    outline: "none",
                    caretColor: "var(--accent)",
                  }}
                  placeholder="输入任务，例如：今天北京天气怎么样？"
                  aria-label="任务输入"
                />
                {isRunning ? (
                  <Button
                    onClick={stop}
                    className="font-mono shrink-0"
                    style={{ backgroundColor: "var(--track-multi)" }}
                  >
                    停止
                  </Button>
                ) : (
                  <Button onClick={run} className="font-mono shrink-0">
                    运行
                  </Button>
                )}
                {steps.length > 0 && !isRunning && (
                  <button
                    onClick={reset}
                    className="font-mono text-xs px-3 py-2.5 rounded-lg shrink-0"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    重置
                  </button>
                )}
              </div>

              {/* Execution log */}
              <div
                className="rounded-lg overflow-hidden min-h-[300px]"
                style={{ border: "1px solid var(--border)" }}
                role="log"
                aria-label="Agent 执行日志"
                aria-live="polite"
              >
                {/* Log header */}
                <div
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
                >
                  <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                    执行日志
                  </span>
                  <div className="flex items-center gap-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                    {steps.length > 0 && (
                      <>
                        <span>{loopCount} 次推理</span>
                        <span style={{ color: "var(--border)" }} aria-hidden="true">
                          ·
                        </span>
                        <span>{steps.filter((s) => s.kind === "action").length} 次工具调用</span>
                      </>
                    )}
                    {isRunning && (
                      <span style={{ color: "var(--accent)", animation: "dot-pulse 1.2s ease-in-out infinite" }}>
                        运行中
                      </span>
                    )}
                  </div>
                </div>

                {/* Steps */}
                <div className="p-4 flex flex-col gap-3">
                  {steps.length === 0 && !isRunning ? (
                    <div className="py-12 flex flex-col items-center gap-3">
                      <p className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>
                        点击"运行"观察 ReAct 循环执行过程
                      </p>
                      <p className="font-mono text-xs" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
                        试试：今天北京天气怎么样？/ 搜索最新 AI 新闻 / 计算斐波那契数列
                      </p>
                    </div>
                  ) : (
                    steps.map((step) => {
                      const cfg = STEP_CONFIG[step.kind]
                      return (
                        <div
                          key={step.id}
                          className="rounded-lg p-3.5 flex flex-col gap-2"
                          style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.color}22` }}
                        >
                          <span
                            className="font-mono text-[0.6875rem] font-medium uppercase tracking-wider"
                            style={{ color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                          <pre
                            className="font-mono text-xs leading-[1.7] whitespace-pre-wrap"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {step.content}
                          </pre>
                        </div>
                      )
                    })
                  )}

                  {/* Loading indicator */}
                  {isRunning && currentStepIndex >= 0 && (
                    <div
                      className="rounded-lg p-3.5 flex flex-col gap-2"
                      style={{
                        backgroundColor: "var(--surface-1)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <span
                        className="font-mono text-[0.6875rem] uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {currentStepIndex % 2 === 0 ? "Thinking" : "Calling tool"}
                      </span>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="inline-block w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor: "var(--text-muted)",
                              animation: `dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {(Object.entries(STEP_CONFIG) as [StepKind, (typeof STEP_CONFIG)[StepKind]][]).map(([kind, cfg]) => (
                  <div key={kind} className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-2 h-2 rounded-sm shrink-0"
                      style={{ backgroundColor: cfg.color }}
                      aria-hidden="true"
                    />
                    <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                      {cfg.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: tool selection + info */}
            <div className="flex flex-col gap-5">
              {/* Tool selection */}
              <div className="flex flex-col gap-2">
                <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  可用工具
                </p>
                <div className="flex flex-col gap-2" role="group" aria-label="工具选择">
                  {TOOLS.map((tool) => {
                    const active = selectedTools.has(tool.id)
                    return (
                      <button
                        key={tool.id}
                        onClick={() => toggleTool(tool.id)}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg text-left"
                        style={{
                          backgroundColor: active ? "var(--accent-subtle)" : "var(--surface-1)",
                          border: `1px solid ${active ? "var(--accent-dim)" : "var(--border)"}`,
                          cursor: "pointer",
                          transition: "all 150ms",
                        }}
                        aria-pressed={active}
                        aria-label={`${active ? "取消选择" : "选择"} ${tool.name}`}
                      >
                        <span
                          className="font-mono text-sm mt-px shrink-0"
                          style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
                        >
                          {tool.icon}
                        </span>
                        <div>
                          <code
                            className="font-mono text-xs block"
                            style={{ color: active ? "var(--accent)" : "var(--text-secondary)" }}
                          >
                            {tool.name}
                          </code>
                          <span
                            className="font-mono text-[0.625rem] leading-[1.5]"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {tool.description}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ReAct concept */}
              <div
                className="rounded-lg p-4 flex flex-col gap-3"
                style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
              >
                <p
                  className="font-mono text-[0.6875rem] uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  ReAct 模式
                </p>
                <pre
                  className="font-mono text-[0.625rem] leading-[1.8]"
                  style={{ color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}
                >
                  {`Thought: 分析任务，决定下一步
Action:  tool_name({"arg": "val"})
Obs:     {"result": "..."}
Thought: 基于结果继续推理
...
Answer:  最终回答`}
                </pre>
              </div>

              {/* Function calling */}
              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
              >
                <p
                  className="font-mono text-[0.6875rem] uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  工具定义格式
                </p>
                <pre
                  className="font-mono text-[0.625rem] leading-[1.7] overflow-x-auto"
                  style={{ color: "var(--text-secondary)", whiteSpace: "pre" }}
                >
                  {`{
  "name": "web_search",
  "description": "搜索互联网",
  "parameters": {
    "query": { "type": "string" },
    "max_results": { "type": "number" }
  }
}`}
                </pre>
              </div>

              <p className="font-mono text-[0.6875rem] leading-[1.6]" style={{ color: "var(--text-muted)" }}>
                * 此工具为教学演示，工具调用结果为预设场景。真实 Agent 使用 Function Calling API 调用实际服务。
              </p>
            </div>
          </div>

          {/* Related chapter */}
          <div className="mt-10 flex items-center gap-4 py-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <span className="font-mono text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
              相关章节
            </span>
            <a
              href="/learn/agent-core"
              className="font-mono text-xs"
              style={{ color: "var(--text-secondary)", textDecoration: "none" }}
            >
              <span className="mr-2" style={{ color: "var(--track-agent)" }}>
                03
              </span>
              Agent 核心概念: ReAct 循环与 Tool Use →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
