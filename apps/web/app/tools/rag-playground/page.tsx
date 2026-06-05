"use client"

import { useCallback, useState } from "react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Button } from "@agent-learning/ui"

/* ─── Types ─────────────────────────────────────────── */
interface Chunk {
  id: number
  text: string
  score: number
  tokens: number
}

/* ─── Sample documents ──────────────────────────────── */
const SAMPLE_DOC = `Agent 是一个能够自主感知环境、作出决策并采取行动的 AI 系统。与传统的问答模型不同，Agent 拥有工具调用能力，可以与外部系统交互。

ReAct 模式（Reasoning + Acting）是目前最流行的 Agent 执行框架。它让模型交替进行推理（Thought）和行动（Action），通过工具调用获取观察结果（Observation），然后继续推理，直到给出最终答案。

Tool Use 是 Agent 的核心能力。通过 Function Calling，LLM 可以请求调用预定义的工具，例如搜索引擎、代码解释器、数据库查询接口等。工具返回的结果被注入上下文，影响下一步决策。

Memory 系统让 Agent 能够跨会话记住信息。短期记忆存在上下文窗口中，长期记忆需要外部存储（如向量数据库）支持。

Planning 能力让 Agent 在执行前分解任务。复杂目标会被拆解为子任务序列，每个子任务通过单独的 LLM 调用或工具调用完成。

Multi-Agent 系统由多个专业化的 Agent 协作完成复杂任务。Orchestrator Agent 负责任务分配，Worker Agent 负责具体执行，各 Agent 通过消息传递协同工作。

LangGraph.js 提供了一种图结构来编排 Agent 工作流。节点（Node）代表处理步骤，边（Edge）代表流转条件。状态（State）在图中流转，每个节点可以读写状态。`

/* ─── Chunking simulation ────────────────────────────── */
function chunkDocument(text: string, chunkSize = 120): string[] {
  const sentences = text.split(/(?<=[。！？\n])/).filter(Boolean)
  const chunks: string[] = []
  let current = ""
  for (const s of sentences) {
    if ((current + s).length > chunkSize && current.length > 0) {
      chunks.push(current.trim())
      current = s
    } else {
      current += s
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks.filter((c) => c.length > 10)
}

/* ─── Keyword relevance scoring ─────────────────────── */
function scoreChunk(chunk: string, query: string): number {
  const queryWords = query
    .toLowerCase()
    .split(/[\s，。！？,. ]+/)
    .filter((w) => w.length > 1)
  const chunkLower = chunk.toLowerCase()
  let score = 0
  for (const word of queryWords) {
    if (chunkLower.includes(word)) score += 0.15 + Math.random() * 0.1
  }
  return Math.min(0.98, 0.55 + score + Math.random() * 0.05)
}

/* ─── Pipeline step ──────────────────────────────────── */
type Step = "idle" | "chunking" | "embedding" | "searching" | "reranking" | "done"

const STEP_LABELS: Record<Step, string> = {
  idle: "等待查询",
  chunking: "文档切片中...",
  embedding: "生成向量中...",
  searching: "向量检索中...",
  reranking: "重排序中...",
  done: "检索完成",
}

const STEP_ORDER: Step[] = ["chunking", "embedding", "searching", "reranking", "done"]

/* ─── Page ──────────────────────────────────────────── */
export default function RAGPlaygroundPage() {
  const [docText, setDocText] = useState(SAMPLE_DOC)
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"doc" | "result">("doc")
  const [step, setStep] = useState<Step>("idle")
  const [chunks, setChunks] = useState<Chunk[]>([])
  const [results, setResults] = useState<Chunk[]>([])
  const [chunkSize] = useState(120)

  const runSearch = useCallback(async () => {
    if (!query.trim() || step !== "idle") return
    const rawChunks = chunkDocument(docText, chunkSize)

    for (const s of STEP_ORDER) {
      setStep(s)
      await new Promise<void>((r) => setTimeout(r, s === "reranking" ? 600 : 450))
    }

    const scored: Chunk[] = rawChunks.map((text, i) => ({
      id: i,
      text,
      score: scoreChunk(text, query),
      tokens: Math.round(text.length * 0.8),
    }))
    const sorted = [...scored].sort((a, b) => b.score - a.score)
    setChunks(scored)
    setResults(sorted.slice(0, 3))
    setActiveTab("result")
    setStep("idle")
  }, [query, step, docText, chunkSize])

  const reset = useCallback(() => {
    setChunks([])
    setResults([])
    setStep("idle")
    setActiveTab("doc")
  }, [])

  const isRunning = step !== "idle"
  const allChunks = chunkDocument(docText, chunkSize)

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
            <span style={{ color: "var(--text-secondary)" }}>RAG 检索</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-[clamp(1.5rem,3.5vw,2.125rem)] font-light tracking-tight mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              RAG 检索
            </h1>
            <p className="font-mono text-sm" style={{ color: "var(--text-secondary)", maxWidth: "62ch" }}>
              体验检索增强生成（Retrieval-Augmented Generation）的完整流程： 文档切片、向量化、相似度检索、Rerank
              排序。对应第五章 Multi-Agent 系统。
            </p>
          </div>

          {/* Pipeline steps */}
          <div
            className="flex flex-wrap items-center gap-0 mb-8 rounded-lg overflow-hidden"
            style={{ border: "1px solid var(--border-subtle)" }}
            aria-label="RAG 流水线步骤"
          >
            {(["chunking", "embedding", "searching", "reranking"] as const).map((s, i) => {
              const labels = ["文档切片", "Embedding", "向量检索", "Rerank"]
              const isActive = step === s
              const isDone = step !== "idle" && STEP_ORDER.indexOf(step) > STEP_ORDER.indexOf(s)
              const completed = results.length > 0

              return (
                <div
                  key={s}
                  className="flex items-center flex-1 px-3 py-2.5"
                  style={{
                    backgroundColor: isActive
                      ? "var(--accent-subtle)"
                      : isDone || completed
                        ? "var(--surface-1)"
                        : "transparent",
                    borderRight: i < 3 ? "1px solid var(--border-subtle)" : "none",
                    transition: "background-color 300ms",
                  }}
                  role="listitem"
                  aria-current={isActive ? "step" : undefined}
                >
                  <span className="font-mono text-xs tabular-nums mr-2 shrink-0" style={{ color: "var(--text-muted)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="font-mono text-xs"
                    style={{
                      color: isActive
                        ? "var(--accent)"
                        : isDone || completed
                          ? "var(--text-secondary)"
                          : "var(--text-muted)",
                    }}
                  >
                    {labels[i]}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        style={{ animation: "dot-pulse 1.2s ease-in-out infinite", display: "inline-block" }}
                      >
                        …
                      </span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Left: document + results */}
            <div className="flex flex-col gap-4">
              {/* Tab bar */}
              <div className="flex gap-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {(["doc", "result"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="font-mono text-xs px-4 py-2.5 border-b-2"
                    style={{
                      borderColor: activeTab === tab ? "var(--accent)" : "transparent",
                      color: activeTab === tab ? "var(--text-primary)" : "var(--text-muted)",
                      background: "none",
                      cursor: "pointer",
                      transition: "color 150ms",
                    }}
                  >
                    {tab === "doc" ? "文档内容" : `检索结果 ${results.length ? `(${results.length})` : ""}`}
                  </button>
                ))}
              </div>

              {activeTab === "doc" ? (
                <textarea
                  value={docText}
                  onChange={(e) => {
                    setDocText(e.target.value)
                    reset()
                  }}
                  className="w-full font-mono text-sm leading-[1.7] p-4 rounded-lg resize-y"
                  style={{
                    backgroundColor: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    outline: "none",
                    minHeight: "360px",
                    maxHeight: "560px",
                    caretColor: "var(--accent)",
                  }}
                  placeholder="粘贴任意文本文档……"
                  spellCheck={false}
                  aria-label="文档内容"
                />
              ) : (
                <div className="flex flex-col gap-3" role="list" aria-label="检索结果">
                  {results.length === 0 ? (
                    <div
                      className="rounded-lg p-6 flex items-center justify-center"
                      style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border)" }}
                    >
                      <p className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>
                        输入查询内容并点击检索
                      </p>
                    </div>
                  ) : (
                    results.map((chunk, i) => (
                      <div
                        key={chunk.id}
                        className="rounded-lg p-4"
                        style={{
                          backgroundColor: "var(--surface-1)",
                          border: "1px solid var(--border)",
                        }}
                        role="listitem"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                            排名 {i + 1} / 片段 #{chunk.id + 1}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                              {chunk.tokens} tokens
                            </span>
                            <span
                              className="font-mono text-xs tabular-nums font-medium"
                              style={{
                                color:
                                  chunk.score > 0.8
                                    ? "var(--track-ts)"
                                    : chunk.score > 0.7
                                      ? "var(--accent)"
                                      : "var(--text-muted)",
                              }}
                            >
                              {(chunk.score * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        {/* Score bar */}
                        <div
                          className="mb-3 rounded-full overflow-hidden"
                          style={{ height: "3px", backgroundColor: "var(--surface-2)" }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${chunk.score * 100}%`,
                              backgroundColor:
                                chunk.score > 0.8
                                  ? "var(--track-ts)"
                                  : chunk.score > 0.7
                                    ? "var(--accent)"
                                    : "var(--text-muted)",
                              borderRadius: "inherit",
                            }}
                          />
                        </div>
                        <p className="font-mono text-xs leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
                          {chunk.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Doc stats */}
              {activeTab === "doc" && (
                <div
                  className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span>
                    <span style={{ color: "var(--text-secondary)" }}>{allChunks.length}</span> 个片段
                  </span>
                  <span style={{ color: "var(--border)" }} aria-hidden="true">
                    ·
                  </span>
                  <span>
                    <span style={{ color: "var(--text-secondary)" }}>{Math.round(docText.length * 0.8)}</span> tokens
                  </span>
                  <span style={{ color: "var(--border)" }} aria-hidden="true">
                    ·
                  </span>
                  <span>chunk 大小约 {chunkSize} 字符</span>
                </div>
              )}
            </div>

            {/* Right: query + settings */}
            <div className="flex flex-col gap-5">
              {/* Query input */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="rag-query" className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  查询内容
                </label>
                <textarea
                  id="rag-query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full font-mono text-sm leading-[1.65] p-3 rounded-lg resize-none"
                  style={{
                    backgroundColor: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    outline: "none",
                    minHeight: "80px",
                    caretColor: "var(--accent)",
                  }}
                  placeholder="例如：ReAct 循环是什么？"
                  spellCheck={false}
                  aria-label="查询内容"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={runSearch} disabled={!query.trim() || isRunning} className="w-full font-mono">
                  {isRunning ? STEP_LABELS[step] : "开始检索"}
                </Button>
                {results.length > 0 && (
                  <button
                    onClick={reset}
                    className="w-full font-mono text-xs py-2 rounded-lg"
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                    }}
                  >
                    重置
                  </button>
                )}
              </div>

              {/* Concept explanation */}
              <div
                className="rounded-lg p-4 flex flex-col gap-3"
                style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
              >
                <p
                  className="font-mono text-[0.6875rem] uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  流程说明
                </p>
                {[
                  ["文档切片", "将长文档拆分为固定大小的片段（Chunk），保留语义连续性"],
                  ["Embedding", "用向量模型将每个 Chunk 转换为高维向量，捕获语义信息"],
                  ["向量检索", "计算查询向量与所有 Chunk 向量的余弦相似度，找出最相关片段"],
                  ["Rerank", "用更强的模型对候选片段重新排序，提升检索精度"],
                ].map(([title, desc]) => (
                  <div key={title} className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      {title}
                    </span>
                    <span className="font-mono text-[0.625rem] leading-[1.6]" style={{ color: "var(--text-muted)" }}>
                      {desc}
                    </span>
                  </div>
                ))}
              </div>

              <p className="font-mono text-[0.6875rem] leading-[1.6]" style={{ color: "var(--text-muted)" }}>
                * 此工具为教学演示，相似度使用关键词匹配模拟，非真实向量计算。
              </p>
            </div>
          </div>

          {/* Related chapter */}
          <div className="mt-10 flex items-center gap-4 py-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <span className="font-mono text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
              相关章节
            </span>
            <a
              href="/learn/multi-agent"
              className="font-mono text-xs"
              style={{ color: "var(--text-secondary)", textDecoration: "none" }}
            >
              <span className="mr-2" style={{ color: "var(--track-multi)" }}>
                05
              </span>
              Multi-Agent 系统设计: RAG 检索增强 →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
