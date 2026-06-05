"use client"

import { useCallback, useState } from "react"
import type { ReactNode } from "react"

/* ─── Syntax tokenizer (no runtime deps) ────────────── */
type TokenType = "keyword" | "string" | "comment" | "default"

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
  "interface",
  "class",
  "extends",
  "implements",
])

const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: "var(--track-agent)",
  string: "var(--track-ts)",
  comment: "var(--text-muted)",
  default: "var(--text-primary)",
}

function renderCode(code: string): ReactNode[] {
  const pattern =
    /(\/\/[^\n]*)|(["'`][^"'`\n]*["'`])|(\b(?:import|export|from|async|function|const|let|var|return|await|new|type|interface|class|extends|implements)\b)/g

  const nodes: ReactNode[] = []
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(code)) !== null) {
    if (match.index > cursor) {
      nodes.push(
        <span key={`t${cursor}`} style={{ color: TOKEN_COLORS.default }}>
          {code.slice(cursor, match.index)}
        </span>
      )
    }

    const [full, comment, str, kw] = match
    let type: TokenType = "default"
    if (comment) type = "comment"
    else if (str) type = "string"
    else if (kw && KW.has(kw)) type = "keyword"

    nodes.push(
      <span key={`m${match.index}`} style={{ color: TOKEN_COLORS[type] }}>
        {full}
      </span>
    )
    cursor = match.index + full.length
  }

  if (cursor < code.length) {
    nodes.push(
      <span key="tail" style={{ color: TOKEN_COLORS.default }}>
        {code.slice(cursor)}
      </span>
    )
  }

  return nodes
}

/* ─── Component ─────────────────────────────────────── */
interface CodeBlockProps {
  lang?: string
  filename?: string
  children: string
}

export function CodeBlock({ lang = "typescript", filename, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* Clipboard unavailable in some contexts */
    }
  }, [children])

  const label = filename ?? lang.toUpperCase()

  return (
    <div
      className="relative group my-6 rounded-lg overflow-hidden"
      style={{
        backgroundColor: "var(--surface-1)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <span className="font-mono text-[0.6875rem] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>

        {/* Copy button: always visible on touch, hover-visible on pointer devices */}
        <button
          onClick={copy}
          className="font-mono text-[0.6875rem] px-2 py-0.5 rounded-lg transition-all
                     opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
          style={{
            backgroundColor: copied ? "var(--accent-subtle)" : "var(--surface-2)",
            color: copied ? "var(--accent)" : "var(--text-muted)",
            border: `1px solid ${copied ? "var(--accent-dim)" : "var(--border)"}`,
            cursor: "pointer",
            transition: "opacity 140ms ease, background-color 140ms ease",
          }}
          aria-label={copied ? "已复制" : "复制代码"}
        >
          {copied ? "✓ 已复制" : "复制"}
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <pre
          className="m-0 p-4 font-mono text-[0.8125rem] leading-[1.7]"
          tabIndex={0}
          aria-label={`代码示例: ${label}`}
        >
          <code>{renderCode(children)}</code>
        </pre>
      </div>
    </div>
  )
}
