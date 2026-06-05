"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { splitIntoTokens, countTokens, wordCount } from "@/lib/tokenizer"
import { Button } from "@agent-learning/ui"

/* ─── Model registry ────────────────────────────────── */
type TokenizerKind = "gpt" | "approx"

interface ModelConfig {
  label: string
  provider: "openai" | "anthropic"
  inputPer1M: number
  outputPer1M: number
  tokenizer: TokenizerKind
}

const MODELS: Record<string, ModelConfig> = {
  "gpt-4o": {
    label: "GPT-4o",
    provider: "openai",
    inputPer1M: 2.5,
    outputPer1M: 10.0,
    tokenizer: "gpt",
  },
  "gpt-4o-mini": {
    label: "GPT-4o Mini",
    provider: "openai",
    inputPer1M: 0.15,
    outputPer1M: 0.6,
    tokenizer: "gpt",
  },
  "gpt-3.5-turbo": {
    label: "GPT-3.5 Turbo",
    provider: "openai",
    inputPer1M: 0.5,
    outputPer1M: 1.5,
    tokenizer: "gpt",
  },
  "claude-3-5-sonnet": {
    label: "Claude 3.5 Sonnet",
    provider: "anthropic",
    inputPer1M: 3.0,
    outputPer1M: 15.0,
    tokenizer: "approx",
  },
  "claude-3-haiku": {
    label: "Claude 3 Haiku",
    provider: "anthropic",
    inputPer1M: 0.25,
    outputPer1M: 1.25,
    tokenizer: "approx",
  },
}

/* ─── Helpers ───────────────────────────────────────── */
function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

function formatCost(tokens: number, per1M: number): string {
  const cost = (tokens / 1_000_000) * per1M
  if (cost === 0) return "$0"
  if (cost < 0.0001) return `$${cost.toFixed(7)}`
  if (cost < 0.01) return `$${cost.toFixed(6)}`
  if (cost < 1) return `$${cost.toFixed(4)}`
  return `$${cost.toFixed(2)}`
}

/* ─── Default sample text ───────────────────────────── */
const DEFAULT_TEXT = `Token 是大语言模型处理文本的基本单位。

对于英文，一个常见单词通常是 1 个 Token。
对于中文，一个汉字通常对应 1–2 个 Token。
代码和符号的切分方式与自然语言不同。

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";`

/* ─── Token span component ──────────────────────────── */
function TokenSpan({ text, index }: { text: string; index: number }) {
  const isWhitespace = text !== "" && text.trim() === ""
  /* Show newlines as visible symbol */
  const display = text.replace(/\n/g, "↵\n")

  return (
    <span
      title={`Token ${index + 1}: "${text.replace(/\n/g, "\\n").replace(/\t/g, "\\t")}"`}
      style={{
        display: "inline",
        backgroundColor: index % 2 === 0 ? "oklch(18.5% 0.008 248)" : "oklch(22% 0.008 248)",
        outline: "1px solid var(--border-subtle)",
        outlineOffset: "-1px",
        borderRadius: "var(--radius)",
        padding: "0 1px",
        color: isWhitespace ? "var(--track-agent)" : "var(--text-primary)",
        whiteSpace: "pre",
        cursor: "default",
        fontFamily: "inherit",
      }}
    >
      {isWhitespace ? display.replace(/ /g, "·") : display}
    </span>
  )
}

/* ─── Page ──────────────────────────────────────────── */
export default function TokenCounterPage() {
  const [text, setText] = useState(DEFAULT_TEXT)
  const [modelId, setModelId] = useState("gpt-4o-mini")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const debouncedText = useDebounce(text, 150)
  const model = MODELS[modelId] ?? MODELS["gpt-4o-mini"]

  /* Tokenize */
  const tokenSpans = useMemo(
    () => (model.tokenizer === "gpt" ? splitIntoTokens(debouncedText) : []),
    [debouncedText, model.tokenizer]
  )
  const tokenCount = useMemo(() => countTokens(debouncedText, model.tokenizer), [debouncedText, model.tokenizer])
  const charCount = text.length
  const words = wordCount(text)
  const inputCost = formatCost(tokenCount, model.inputPer1M)

  /* Context window sizes for reference */
  const CONTEXTS = [
    { label: "GPT-4o", limit: 128_000 },
    { label: "GPT-4o Mini", limit: 128_000 },
    { label: "Claude 3.5", limit: 200_000 },
  ]

  return (
    <>
      <Nav />
      <main id="main-content" tabIndex={-1}>
        <div className="pt-28 pb-24 px-6 max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 font-mono text-xs" aria-label="面包屑导航">
            <a href="/tools" className="link-arrow" style={{ fontSize: "0.75rem" }}>
              工具箱
            </a>
            <span style={{ color: "var(--text-muted)" }} aria-hidden="true">
              /
            </span>
            <span style={{ color: "var(--text-secondary)" }}>Token 计数器</span>
          </nav>

          {/* Page header */}
          <div className="mb-8">
            <h1
              className="text-[clamp(1.5rem,3.5vw,2.125rem)] font-light tracking-tight mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Token 计数器
            </h1>
            <p className="font-mono text-sm" style={{ color: "var(--text-secondary)", maxWidth: "58ch" }}>
              实时分析文本的 Token 组成，可视化 Token 边界。 Token 是大模型处理文本的基本单位，理解它是写出高效 Prompt
              的基础。
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <label htmlFor="model-select" className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                模型
              </label>
              <select
                id="model-select"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="font-mono text-xs px-3 py-1.5 rounded-lg appearance-none"
                style={{
                  backgroundColor: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  outline: "none",
                  minWidth: "160px",
                }}
              >
                <optgroup label="OpenAI">
                  {Object.entries(MODELS)
                    .filter(([, m]) => m.provider === "openai")
                    .map(([id, m]) => (
                      <option key={id} value={id} style={{ backgroundColor: "var(--surface-1)" }}>
                        {m.label}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Anthropic">
                  {Object.entries(MODELS)
                    .filter(([, m]) => m.provider === "anthropic")
                    .map(([id, m]) => (
                      <option key={id} value={id} style={{ backgroundColor: "var(--surface-1)" }}>
                        {m.label}
                      </option>
                    ))}
                </optgroup>
              </select>

              {model.tokenizer === "approx" && (
                <span
                  className="font-mono text-[0.625rem] px-1.5 py-0.5 rounded-lg"
                  style={{
                    backgroundColor: "var(--surface-warn)",
                    color: "var(--track-llm)",
                    border: "1px solid var(--track-llm)",
                  }}
                  title="Claude 无公开 Tokenizer，使用字符级近似算法"
                >
                  ≈ 估算
                </span>
              )}
            </div>

            {/* shadcn ghost Button — inherits our token bridge */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setText("")
                textareaRef.current?.focus()
              }}
              aria-label="清空输入"
              className="font-mono text-xs h-7"
            >
              清空
            </Button>
          </div>

          {/* Textarea */}
          <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <textarea
              ref={textareaRef}
              id="token-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full font-mono text-[0.875rem] leading-[1.7] p-4 resize-y"
              style={{
                backgroundColor: "var(--surface-1)",
                color: "var(--text-primary)",
                border: "none",
                outline: "none",
                minHeight: "200px",
                maxHeight: "480px",
                caretColor: "var(--accent)",
              }}
              placeholder="在这里粘贴任意文本、代码或 Prompt……"
              aria-label="输入文本以分析 Token"
              aria-describedby="token-stats"
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          {/* Stats bar */}
          <div
            id="token-stats"
            className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1.5"
            aria-live="polite"
            aria-label={`${tokenCount} tokens, ${charCount} 字符, ${words} 词`}
          >
            <span className="flex items-baseline gap-1.5">
              <strong className="font-mono text-xl tabular-nums font-medium" style={{ color: "var(--text-primary)" }}>
                {tokenCount.toLocaleString()}
              </strong>
              <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                tokens
              </span>
            </span>

            <span className="font-mono text-xs" style={{ color: "var(--border)" }} aria-hidden="true">
              ·
            </span>

            <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              <span style={{ color: "var(--text-secondary)" }}>{charCount.toLocaleString()}</span> 字符
            </span>

            <span className="font-mono text-xs" style={{ color: "var(--border)" }} aria-hidden="true">
              ·
            </span>

            <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              <span style={{ color: "var(--text-secondary)" }}>{words.toLocaleString()}</span> 词
            </span>

            <span className="font-mono text-xs" style={{ color: "var(--border)" }} aria-hidden="true">
              ·
            </span>

            <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              输入预估 <span style={{ color: "var(--text-secondary)" }}>{inputCost}</span>{" "}
              <span style={{ color: "var(--text-muted)" }}>(${model.inputPer1M}/1M)</span>
            </span>
          </div>

          {/* Token visualization (GPT models only) */}
          {model.tokenizer === "gpt" && tokenSpans.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2.5">
                <p
                  className="font-mono text-[0.6875rem] uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Token 可视化
                </p>
                <p className="font-mono text-[0.6875rem]" style={{ color: "var(--text-muted)" }}>
                  悬停查看原始 token 文本 · <span style={{ color: "var(--track-agent)" }}>紫色</span> = 空白 token
                </p>
              </div>

              <div
                className="rounded-lg overflow-y-auto p-4"
                style={{
                  backgroundColor: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  maxHeight: "280px",
                }}
                role="region"
                aria-label="Token 边界可视化"
              >
                <div
                  className="leading-[2] break-words"
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "0.8125rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {tokenSpans.map((span, i) => (
                    <TokenSpan key={i} text={span} index={i} />
                  ))}
                </div>
              </div>

              <p className="font-mono text-[0.6875rem] mt-2" style={{ color: "var(--text-muted)" }}>
                使用 cl100k_base 分割模式（GPT-4 / GPT-3.5 使用相同词表）。Token 数为近似值。
              </p>
            </div>
          )}

          {/* Claude approx note */}
          {model.tokenizer === "approx" && tokenCount > 0 && (
            <div
              className="mt-6 p-4 rounded-lg"
              style={{
                backgroundColor: "var(--surface-warn)",
                border: "1px solid var(--track-llm)",
              }}
            >
              <p className="font-mono text-xs" style={{ color: "var(--track-llm)" }}>
                ⚠ Claude 的 Tokenizer 未公开。此处使用字符级近似算法：CJK 字符 ≈ 1 token，其他字符 ≈ 0.25 token。 实际
                Token 数可能有 10–20% 偏差。
              </p>
            </div>
          )}

          {/* Context window reference */}
          {tokenCount > 0 && (
            <div
              className="mt-6 p-4 rounded-lg"
              style={{
                backgroundColor: "var(--surface-1)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                className="font-mono text-[0.6875rem] uppercase tracking-wider mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                Context Window 占用参考
              </p>
              <div className="flex flex-col gap-3">
                {CONTEXTS.map(({ label, limit }) => {
                  const pct = Math.min((tokenCount / limit) * 100, 100)
                  const isCritical = pct >= 80
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className="font-mono text-xs w-24 shrink-0" style={{ color: "var(--text-muted)" }}>
                        {label}
                      </span>
                      {/* Custom progress bar — shadcn Progress uses bg-primary only;
                          we need dynamic color (accent → critical rose) so we keep
                          the custom implementation here.                            */}
                      <div
                        className="flex-1 overflow-hidden rounded-full"
                        style={{ height: "4px", backgroundColor: "var(--surface-2)" }}
                        role="progressbar"
                        aria-valuenow={Math.round(pct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${label} context 占用 ${pct.toFixed(1)}%`}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            backgroundColor: isCritical ? "var(--track-multi)" : "var(--accent)",
                            transition: "width 200ms ease",
                            borderRadius: "inherit",
                          }}
                        />
                      </div>
                      <span
                        className="font-mono text-[0.6875rem] w-14 text-right shrink-0 tabular-nums"
                        style={{ color: isCritical ? "var(--track-multi)" : "var(--text-muted)" }}
                      >
                        {pct < 0.1 ? "<0.1" : pct.toFixed(1)}%
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="font-mono text-[0.6875rem] mt-3" style={{ color: "var(--text-muted)" }}>
                系统提示词 + 对话历史 + 用户输入共用同一个 Context Window。
                超出限制的内容会被截断，通常从最早的消息开始。
              </p>
            </div>
          )}

          {/* Related chapter */}
          <div className="mt-8 flex items-center gap-4 py-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <span className="font-mono text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
              相关章节
            </span>
            <a
              href="/learn/llm-basics"
              className="font-mono text-xs transition-colors"
              style={{ color: "var(--text-secondary)", textDecoration: "none" }}
            >
              <span className="mr-2" style={{ color: "var(--track-llm)" }}>
                01
              </span>
              LLM 基础认知: Token 与 Context Window →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
