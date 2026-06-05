"use client"

/**
 * AIChatPanel — chat interface rendered inside the floating window.
 *
 * Messages are UIMessage[] from @ai-sdk/react's useChat.
 * Text content lives in message.parts — use isTextUIPart() to filter.
 */

import { useRef, useEffect, useState, type KeyboardEvent } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { isTextUIPart } from "ai"
import type { UIMessage } from "ai"
import { IconSend, IconRotate, IconX } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP)

/* ── Props ──────────────────────────────────────────── */
interface AIChatPanelProps {
  messages: UIMessage[]
  isStreaming: boolean
  error: string | null
  onSend: (text: string) => void
  onReset: () => void
  onClose: () => void
}

/* ── Panel ──────────────────────────────────────────── */
export function AIChatPanel({ messages, isStreaming, error, onSend, onReset, onClose }: AIChatPanelProps) {
  const [input, setInput] = useState("")
  const panelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      gsap.from(panelRef.current, {
        y: 16,
        opacity: 0,
        scale: 0.97,
        duration: 0.32,
        ease: "expo.out",
        clearProps: "transform,opacity",
      })
    },
    { scope: panelRef }
  )

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 96)}px`
  }, [input])

  function handleSend() {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput("")
    onSend(text)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const lastId = messages.at(-1)?.id

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="AgentLab AI 助手"
      className="flex flex-col overflow-hidden"
      style={{
        width: "min(360px, calc(100vw - 48px))",
        height: 500,
        borderRadius: "var(--radius-xl)",
        backgroundColor: "var(--base)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 8px 40px oklch(0% 0 0 / 0.30), 0 0 0 1px oklch(100% 0 0 / 0.04) inset",
      }}
    >
      {/* ── Header ────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="rounded-full flex-shrink-0"
            style={{
              width: 8,
              height: 8,
              backgroundColor: isStreaming ? "var(--track-llm)" : "var(--track-ts)",
              boxShadow: isStreaming ? "0 0 6px var(--track-llm)" : "0 0 4px var(--track-ts)",
              transition: "background-color 400ms ease, box-shadow 400ms ease",
            }}
            aria-hidden="true"
          />
          <span className="font-mono text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            AgentLab AI
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          {messages.length > 0 && (
            <button
              onClick={onReset}
              disabled={isStreaming}
              aria-label="清空对话"
              style={{
                width: 28,
                height: 28,
                color: "var(--text-muted)",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconRotate size={13} stroke={1.5} />
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="关闭"
            style={{
              width: 28,
              height: 28,
              color: "var(--text-muted)",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconX size={14} stroke={1.5} />
          </button>
        </div>
      </div>

      {/* ── Message list ──────────────────────────────── */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5"
        style={{ overscrollBehavior: "contain" }}
      >
        {messages.length === 0 && !error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--accent-subtle)" }}
            >
              <span style={{ fontSize: "1.2rem" }} aria-hidden="true">
                ✦
              </span>
            </div>
            <p
              className="font-mono text-xs text-center leading-[1.7]"
              style={{ color: "var(--text-muted)", maxWidth: "26ch" }}
            >
              问我任何 AI Agent 开发的问题。
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={msg.role === "assistant" && msg.id === lastId && isStreaming}
          />
        ))}

        {error && (
          <div
            className="font-mono text-xs p-3 rounded-xl"
            style={{
              backgroundColor: "oklch(14% 0.05 15)",
              color: "oklch(70% 0.12 15)",
              border: "1px solid oklch(20% 0.08 15)",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* ── Input ─────────────────────────────────────── */}
      <div className="flex-shrink-0 p-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="flex items-end gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: "var(--surface-1)" }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="问点什么…"
            rows={1}
            className="flex-1 resize-none bg-transparent font-mono text-xs outline-none"
            style={{
              color: "var(--text-primary)",
              lineHeight: 1.6,
              padding: "2px 0",
              maxHeight: 96,
              border: "none",
            }}
            aria-label="消息输入框"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            aria-label="发送"
            className="flex-shrink-0 flex items-center justify-center rounded-lg transition-all disabled:opacity-30"
            style={{
              width: 30,
              height: 30,
              backgroundColor: "var(--accent)",
              color: "white",
              border: "none",
              cursor: input.trim() && !isStreaming ? "pointer" : "not-allowed",
            }}
          >
            <IconSend size={13} stroke={2} />
          </button>
        </div>
        <p className="font-mono mt-1.5 text-center" style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>
          Enter 发送 &middot; Shift+Enter 换行
        </p>
      </div>
    </div>
  )
}

/* ── MessageBubble ──────────────────────────────────── */
function MessageBubble({ message, isStreaming }: { message: UIMessage; isStreaming: boolean }) {
  const bubbleRef = useRef<HTMLDivElement>(null)
  const isUser = message.role === "user"

  /* Extract plain text from UIMessage parts */
  const text = message.parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join("")

  useGSAP(
    () => {
      if (!bubbleRef.current) return
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      gsap.from(bubbleRef.current, {
        y: 8,
        opacity: 0,
        duration: 0.28,
        ease: "expo.out",
        clearProps: "transform,opacity",
      })
    },
    { scope: bubbleRef }
  )

  return (
    <div ref={bubbleRef} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className="font-mono text-xs leading-[1.7]"
        style={{
          padding: "8px 12px",
          maxWidth: "84%",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          backgroundColor: isUser ? "var(--accent)" : "var(--surface-1)",
          color: isUser ? "white" : "var(--text-secondary)",
          borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
        }}
      >
        {isStreaming && text.length === 0 ? <span style={{ color: "var(--text-muted)" }}>思考中…</span> : text}

        {isStreaming && text.length > 0 && (
          <span
            className="inline-block w-px h-3 ml-0.5 align-middle"
            style={{
              backgroundColor: "var(--text-secondary)",
              animation: "blink-cursor 0.9s step-end infinite",
            }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  )
}
