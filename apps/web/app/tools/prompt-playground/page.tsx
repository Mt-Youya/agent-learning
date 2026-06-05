"use client"

import { useCallback, useRef, useState } from "react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Button } from "@agent-learning/ui"

/* ─── Types ─────────────────────────────────────────── */
interface ModelConfig {
  label: string
  provider: "openai" | "anthropic"
  maxTokens: number
}

const MODELS: Record<string, ModelConfig> = {
  "gpt-4o": { label: "GPT-4o", provider: "openai", maxTokens: 128000 },
  "gpt-4o-mini": { label: "GPT-4o Mini", provider: "openai", maxTokens: 128000 },
  "claude-3-5-sonnet": { label: "Claude 3.5 Sonnet", provider: "anthropic", maxTokens: 200000 },
  "claude-3-haiku": { label: "Claude 3 Haiku", provider: "anthropic", maxTokens: 200000 },
}

/* ─── Mock streaming responses ──────────────────────── */
const MOCK_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ["streamtext", "stream", "流式", "streaming", "ai sdk", "vercel"],
    response: `好的，以下是 \`streamText\` 的核心原理：

**流式响应**不是等模型生成完整文本后一次性返回，而是边生成边传输，每生成一个 token 就立刻发给客户端。

技术上，这通过 **Server-Sent Events（SSE）** 或 **ReadableStream** 实现：

\`\`\`typescript
const result = streamText({
  model: openai("gpt-4o-mini"),
  messages,
})
// toDataStreamResponse() 将 ReadableStream
// 封装为符合 Vercel AI SDK 协议的响应
return result.toDataStreamResponse()
\`\`\`

在前端用 \`useChat\` hook 消费时，React 状态随每个 chunk 更新，实现"打字机"效果。

**关键点：**温度越高，生成越随机；max_tokens 控制最大生成长度，不是输入限制。`,
  },
  {
    keywords: ["react loop", "react", "tool use", "工具调用", "function calling"],
    response: `**ReAct 循环**（Reasoning + Acting）是 Agent 的核心执行模式：

\`\`\`
Thought: 我需要查询今天的天气
Action: weather_tool({"city": "北京"})
Observation: {"temp": 22, "weather": "晴"}
Thought: 已获取天气数据，可以回答了
Final Answer: 北京今天22°C，晴天。
\`\`\`

每次循环：
1. **Thought** — LLM 推理下一步应该做什么
2. **Action** — 调用工具（Function Calling）
3. **Observation** — 工具返回结果注入上下文
4. 重复，直到 LLM 输出 **Final Answer**

在 LangGraph.js 中，这被建模为图中的条件边（conditional edges）。`,
  },
  {
    keywords: ["token", "context", "上下文", "context window"],
    response: `**Context Window** 是模型在单次推理中能"看到"的全部文本，包括：

- 系统提示词（System Prompt）
- 完整对话历史（所有轮次）
- 当前用户输入

**当前主流限制：**
- GPT-4o: 128K tokens
- Claude 3.5 Sonnet: 200K tokens
- Gemini 1.5 Pro: 1M tokens

**工程影响：**
超出限制的内容会被截断（通常从最早的消息开始），这会导致"遗忘"。
长对话应用需要设计**记忆管理策略**：摘要压缩、外部存储（Vector DB）、滑动窗口等。

一个 Token 约等于 0.75 个英文单词，或 1 个中文汉字。`,
  },
  {
    keywords: ["temperature", "温度", "参数", "max token"],
    response: `**Temperature** 控制输出的随机性：

- \`0\` — 每次输出几乎相同，最确定性
- \`0.7\` — 平衡创意和准确性（推荐默认值）
- \`1.5+\` — 高度随机，适合创意写作

**Max Tokens** 控制生成的最大长度。注意：
- 这是**输出**的 token 上限，不影响输入处理
- 设太小会截断输出（"answer cut off"）
- 设太大会增加成本（按输出 token 计费）

**最佳实践：**
- 代码生成/事实问答：temperature 0 ~ 0.3
- 对话/摘要：temperature 0.5 ~ 0.8
- 创意写作/头脑风暴：temperature 0.9 ~ 1.2`,
  },
]

const DEFAULT_RESPONSE = `这是一个模拟的流式响应演示。

在真实环境中，每个字符会随着模型生成逐步出现，而非一次性显示。这就是 \`streamText\` 的效果。

**你可以尝试问：**
- streamText 的流式原理是什么？
- ReAct 循环是怎么工作的？
- Context Window 有什么工程影响？
- Temperature 参数如何选择？

每个话题都有对应的演示回答。`

function getMockResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase()
  for (const item of MOCK_RESPONSES) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.response
    }
  }
  return DEFAULT_RESPONSE
}

/* ─── Slider component ──────────────────────────────── */
function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
          {label}
        </label>
        <span
          className="font-mono text-xs tabular-nums px-1.5 py-0.5 rounded"
          style={{ backgroundColor: "var(--surface-2)", color: "var(--text-secondary)" }}
        >
          {format(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, var(--surface-2) ${pct}%, var(--surface-2) 100%)`,
          outline: "none",
        }}
        aria-label={`${label}: ${format(value)}`}
      />
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────── */
export default function PromptPlaygroundPage() {
  const [systemPrompt, setSystemPrompt] = useState(
    "你是一个专业的 AI 工程助手，擅长解释 LLM 和 Agent 开发的核心概念。用简洁清晰的中文回答。"
  )
  const [userMessage, setUserMessage] = useState("")
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(512)
  const [modelId, setModelId] = useState("gpt-4o-mini")
  const [output, setOutput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showApiCall, setShowApiCall] = useState(false)
  const abortRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const model = MODELS[modelId]

  const stopGeneration = useCallback(() => {
    abortRef.current.forEach(clearTimeout)
    abortRef.current = []
    setIsGenerating(false)
  }, [])

  const generate = useCallback(() => {
    if (isGenerating) {
      stopGeneration()
      return
    }
    const message = userMessage.trim() || "streamText 的流式原理是什么？"
    const response = getMockResponse(message)
    setOutput("")
    setIsGenerating(true)
    abortRef.current.forEach(clearTimeout)
    abortRef.current = []

    let i = 0
    /* Char-by-char streaming simulation */
    const schedule = () => {
      if (i >= response.length) {
        setIsGenerating(false)
        return
      }
      const delay = Math.random() * 12 + 4
      const t = setTimeout(() => {
        setOutput((prev) => prev + response[i])
        i++
        schedule()
      }, delay)
      abortRef.current.push(t)
    }
    schedule()
  }, [isGenerating, stopGeneration, userMessage])

  const apiCallSnippet = `import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

const result = streamText({
  model: openai("${modelId}"),
  temperature: ${temperature},
  maxTokens: ${maxTokens},
  messages: [
    {
      role: "system",
      content: "${systemPrompt.slice(0, 40)}..."
    },
    {
      role: "user",
      content: "${(userMessage || "streamText 的流式原理是什么？").slice(0, 40)}..."
    }
  ],
})

return result.toDataStreamResponse()`

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
            <span style={{ color: "var(--text-secondary)" }}>Prompt Playground</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-[clamp(1.5rem,3.5vw,2.125rem)] font-light tracking-tight mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Prompt Playground
            </h1>
            <p className="font-mono text-sm" style={{ color: "var(--text-secondary)", maxWidth: "62ch" }}>
              流式对话测试台。调节 Temperature 与 Max Tokens，实时观察大模型输出变化。 对应第二章 JS/TS AI 工具链。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            {/* Left: prompts + output */}
            <div className="flex flex-col gap-4">
              {/* System prompt */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="system-prompt" className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  系统提示词（System Prompt）
                </label>
                <textarea
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full font-mono text-sm leading-[1.65] p-3 rounded-lg resize-y"
                  style={{
                    backgroundColor: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    outline: "none",
                    minHeight: "88px",
                    maxHeight: "200px",
                    caretColor: "var(--accent)",
                  }}
                  placeholder="设置模型的角色和行为规范……"
                  spellCheck={false}
                  aria-label="系统提示词"
                />
              </div>

              {/* User message */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="user-message" className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  用户消息（User Message）
                </label>
                <textarea
                  id="user-message"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  className="w-full font-mono text-sm leading-[1.65] p-3 rounded-lg resize-y"
                  style={{
                    backgroundColor: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    outline: "none",
                    minHeight: "88px",
                    maxHeight: "200px",
                    caretColor: "var(--accent)",
                  }}
                  placeholder="输入问题，例如：streamText 的流式原理是什么？"
                  spellCheck={false}
                  aria-label="用户消息"
                />
              </div>

              {/* Generate button */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={generate}
                  className="font-mono"
                  style={isGenerating ? { backgroundColor: "var(--track-multi)" } : undefined}
                >
                  {isGenerating ? "停止生成" : "生成响应"}
                </Button>
                {output && !isGenerating && (
                  <button
                    onClick={() => setOutput("")}
                    className="font-mono text-xs"
                    style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
                  >
                    清空输出
                  </button>
                )}
                <span className="font-mono text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
                  {model.label}
                </span>
              </div>

              {/* Output area */}
              <div
                className="rounded-lg p-4 min-h-[200px]"
                style={{
                  backgroundColor: "var(--surface-1)",
                  border: "1px solid var(--border)",
                }}
                role="region"
                aria-label="模型输出"
                aria-live="polite"
              >
                {output ? (
                  <pre
                    className="font-mono text-sm leading-[1.75] whitespace-pre-wrap"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {output}
                    {isGenerating && (
                      <span
                        className="inline-block w-[2px] h-[14px] ml-[2px] align-middle"
                        style={{
                          backgroundColor: "var(--accent)",
                          animation: "dot-pulse 1s ease-in-out infinite",
                        }}
                        aria-hidden="true"
                      />
                    )}
                  </pre>
                ) : (
                  <p className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>
                    点击"生成响应"查看流式输出效果……
                  </p>
                )}
              </div>

              {/* API call toggle */}
              <button
                onClick={() => setShowApiCall((v) => !v)}
                className="flex items-center gap-2 font-mono text-xs self-start"
                style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
              >
                <span style={{ color: "var(--accent)" }}>{showApiCall ? "▾" : "▸"}</span>
                对应的 API 调用
              </button>
              {showApiCall && (
                <div
                  className="rounded-lg p-4 overflow-x-auto"
                  style={{
                    backgroundColor: "oklch(13% 0.008 248)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <pre className="font-mono text-xs leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
                    {apiCallSnippet}
                  </pre>
                </div>
              )}
            </div>

            {/* Right: controls */}
            <div className="flex flex-col gap-5">
              {/* Model */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="model-select" className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  模型
                </label>
                <select
                  id="model-select"
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="w-full font-mono text-xs px-3 py-2 rounded-lg appearance-none"
                  style={{
                    backgroundColor: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <optgroup label="OpenAI">
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                  </optgroup>
                  <optgroup label="Anthropic">
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                    <option value="claude-3-haiku">Claude 3 Haiku</option>
                  </optgroup>
                </select>
              </div>

              {/* Temperature */}
              <Slider
                id="temperature"
                label="Temperature"
                value={temperature}
                min={0}
                max={2}
                step={0.05}
                format={(v) => v.toFixed(2)}
                onChange={setTemperature}
              />

              <div
                className="rounded-lg p-3"
                style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
              >
                <p className="font-mono text-[0.6875rem] leading-[1.6]" style={{ color: "var(--text-muted)" }}>
                  {temperature < 0.3
                    ? "低温：输出确定性强，适合代码生成、事实问答"
                    : temperature < 0.8
                      ? "中温：平衡创意与准确，适合对话与摘要"
                      : temperature < 1.2
                        ? "中高温：更多随机性，适合创意写作"
                        : "高温：高度随机，输出可能不连贯"}
                </p>
              </div>

              {/* Max Tokens */}
              <Slider
                id="max-tokens"
                label="Max Tokens"
                value={maxTokens}
                min={64}
                max={4096}
                step={64}
                format={(v) => v.toLocaleString()}
                onChange={setMaxTokens}
              />

              {/* Info panel */}
              <div
                className="rounded-lg p-3 flex flex-col gap-2"
                style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
              >
                <p
                  className="font-mono text-[0.6875rem] uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  参数说明
                </p>
                <div className="flex flex-col gap-1.5">
                  {[
                    ["temperature", "输出随机性 (0~2)"],
                    ["max_tokens", "最大输出长度"],
                    ["top_p", "核采样（与 temp 二选一）"],
                    ["stream", "true / 启用流式"],
                  ].map(([param, desc]) => (
                    <div key={param} className="flex items-start justify-between gap-2">
                      <code
                        className="font-mono text-[0.625rem] px-1 py-0.5 rounded shrink-0"
                        style={{
                          backgroundColor: "var(--surface-2)",
                          color: "var(--track-agent)",
                        }}
                      >
                        {param}
                      </code>
                      <span className="font-mono text-[0.625rem] text-right" style={{ color: "var(--text-muted)" }}>
                        {desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note */}
              <p className="font-mono text-[0.6875rem] leading-[1.6]" style={{ color: "var(--text-muted)" }}>
                * 此工具为教学演示，响应为预设内容以模拟流式效果。输入与温度参数变化不影响实际输出。
              </p>
            </div>
          </div>

          {/* Related chapter */}
          <div className="mt-10 flex items-center gap-4 py-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <span className="font-mono text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
              相关章节
            </span>
            <a
              href="/learn/js-ts-toolchain"
              className="font-mono text-xs transition-colors"
              style={{ color: "var(--text-secondary)", textDecoration: "none" }}
            >
              <span className="mr-2" style={{ color: "var(--track-ts)" }}>
                02
              </span>
              JavaScript / TypeScript AI 工具链 →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
