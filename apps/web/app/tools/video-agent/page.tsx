"use client"

import { useMemo, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { CHAPTERS } from "@/lib/chapters"
import type { StepKey } from "@/lib/video-jobs"

// ============ Pipeline 步骤展示配置 ============

interface StepDisplay {
  key: StepKey
  labelZh: string
  /** 对应 Agent 调用的工具名（v6 part.toolName） */
  toolName: string
  icon: string
}

const STEP_DISPLAYS: StepDisplay[] = [
  { key: "script", labelZh: "脚本生成", toolName: "generateScript", icon: "✍" },
  { key: "voice", labelZh: "TTS 语音", toolName: "synthesizeVoice", icon: "🔊" },
  { key: "scenes", labelZh: "场景渲染", toolName: "renderScenes", icon: "🎨" },
  { key: "video", labelZh: "视频合成", toolName: "composeVideo", icon: "🎬" },
  { key: "published", labelZh: "发布完成", toolName: "composeVideo", icon: "✅" },
]

type UIStatus = "pending" | "running" | "done" | "failed"

// ============ 主页面 ============

export default function VideoAgentPage() {
  // 用 ref 跟踪当前选中的 slug，避免 transport useMemo 频繁重建
  const slugRef = useRef("agent-core")

  // AI SDK v6: useChat 接受 ChatInit，通过 DefaultChatTransport 指定 API
  // transport 在 slug ref 上稳定，prepareSendMessagesRequest 在每次发送时读取最新 slug
  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: useMemo(
      () =>
        new DefaultChatTransport({
          api: "/api/video-agent",
          prepareSendMessagesRequest: () => ({
            body: {
              chapterSlug: slugRef.current,
            },
          }),
        }),
      [], // 只创建一次
    ),
  })

  // AI SDK v6: 没有 isLoading，从 status 派生
  const isLoading = status === "submitted" || status === "streaming"
  const hasResult = status === "ready" && messages.length > 0

  // 从 messages 中解析工具调用状态
  // AI SDK v6: 工具调用的 part.type === 'dynamic-tool'
  const stepStatuses = useMemo<Record<string, UIStatus>>(() => {
    const map: Record<string, UIStatus> = {}

    for (const message of messages) {
      if (!message.parts) continue
      for (const part of message.parts) {
        // v6: 工具部分的 type 是 `tool-${toolName}` 或 `dynamic-tool`
        if (part.type !== "dynamic-tool") continue
        const { toolName, state: invState } = part as {
          type: "dynamic-tool"
          toolName: string
          state: string
          output?: unknown
        }
        if (invState === "input-streaming" || invState === "input-available") {
          map[toolName] = "running"
        } else if (invState === "output-available") {
          const out = (part as { output?: { error?: boolean } }).output
          map[toolName] = out?.error ? "failed" : "done"
        } else if (invState === "output-error") {
          map[toolName] = "failed"
        }
      }
    }

    // published 与 composeVideo 同步
    if (map["composeVideo"] === "done") {
      map["__published__"] = "done"
    }

    return map
  }, [messages])

  function getStepStatus(step: StepDisplay): UIStatus {
    if (step.key === "published") return (stepStatuses["__published__"] as UIStatus) ?? "pending"
    return (stepStatuses[step.toolName] as UIStatus) ?? "pending"
  }

  // 最终文本输出（最后一条 assistant 消息的 text parts）
  const finalReport = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant")
    if (!last?.parts) return ""
    return last.parts
      .filter((p) => p.type === "text")
      .map((p) => ("text" in p ? (p.text as string) : ""))
      .join("")
  }, [messages])

  function handleRun(slug: string) {
    if (isLoading) return
    slugRef.current = slug
    setMessages([])
    sendMessage({ text: `生成章节 "${slug}" 的视频` })
  }

  function handleReset() {
    setMessages([])
  }

  return (
    <>
      <Nav />
      <main id="main-content" tabIndex={-1}>
        <div className="pt-28 pb-24 px-6 max-w-5xl mx-auto">
          {/* 面包屑 */}
          <nav className="mb-8 flex items-center gap-2 font-mono text-xs" aria-label="面包屑导航">
            <a href="/tools" className="link-arrow" style={{ fontSize: "0.75rem" }}>
              工具箱
            </a>
            <span style={{ color: "var(--text-muted)" }} aria-hidden="true">
              /
            </span>
            <span style={{ color: "var(--text-secondary)" }}>Video Agent</span>
          </nav>

          {/* 标题区 */}
          <div className="mb-8">
            <h1
              className="text-[clamp(1.5rem,3.5vw,2.125rem)] font-light tracking-tight mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              TubePilot Video Agent
            </h1>
            <p className="font-mono text-sm" style={{ color: "var(--text-secondary)", maxWidth: "64ch" }}>
              真实的 Agent Loop 演示——选择章节，观察 Claude 自主调用 5 个工具完成视频生成 Pipeline。
              对应《Agent 开发实战》第十四章。
            </p>
          </div>

          {/* 控制区（独立组件防止 slug 状态导致整页重渲） */}
          <PipelineControls
            isLoading={isLoading}
            hasResult={hasResult}
            onRun={handleRun}
            onReset={handleReset}
          />

          {/* 错误提示 */}
          {error && (
            <div
              className="mb-6 px-4 py-3 rounded-lg font-mono text-xs"
              style={{ backgroundColor: "oklch(18% 0.015 15)", border: "1px solid var(--track-multi)" }}
            >
              <span style={{ color: "var(--track-multi)" }}>错误：</span>
              <span style={{ color: "var(--text-secondary)" }}>{error.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            {/* 左：Pipeline 步骤 + Agent 输出 */}
            <div className="flex flex-col gap-5">
              {/* Pipeline 步骤卡片 */}
              <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                <div
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
                >
                  <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                    Pipeline 执行状态
                  </span>
                  {isLoading && (
                    <span
                      className="font-mono text-xs"
                      style={{ color: "var(--accent)", animation: "dot-pulse 1.2s ease-in-out infinite" }}
                    >
                      Agent 运行中
                    </span>
                  )}
                  {hasResult && (
                    <span className="font-mono text-xs" style={{ color: "var(--track-ts)" }}>
                      ✓ 完成
                    </span>
                  )}
                </div>

                <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                  {STEP_DISPLAYS.map((step) => (
                    <StepRow key={step.key} step={step} status={getStepStatus(step)} />
                  ))}
                </div>
              </div>

              {/* Agent 最终输出 */}
              {finalReport && (
                <div
                  className="rounded-lg p-4"
                  style={{ border: "1px solid var(--border-subtle)", backgroundColor: "var(--surface-1)" }}
                >
                  <p
                    className="font-mono text-[0.6875rem] uppercase tracking-wider mb-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Agent 报告
                  </p>
                  <pre
                    className="font-mono text-xs leading-[1.75] whitespace-pre-wrap"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {finalReport}
                  </pre>
                </div>
              )}

              {/* 空状态 */}
              {!isLoading && messages.length === 0 && (
                <div
                  className="rounded-lg flex flex-col items-center justify-center py-16"
                  style={{ border: "1px dashed var(--border)", minHeight: "200px" }}
                >
                  <p className="font-mono text-sm mb-2" style={{ color: "var(--text-muted)" }}>
                    选择一个章节，点击「启动 Pipeline」
                  </p>
                  <p className="font-mono text-xs" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
                    Agent 将自主调用 5 个工具完成视频生成
                  </p>
                </div>
              )}
            </div>

            {/* 右：上下文信息 */}
            <InfoPanel />
          </div>

          {/* 底部相关章节 */}
          <div
            className="mt-10 flex items-center gap-4 py-4"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <span className="font-mono text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
              相关章节
            </span>
            <a
              href="/learn/agent-frameworks"
              className="font-mono text-xs"
              style={{ color: "var(--text-secondary)", textDecoration: "none" }}
            >
              <span className="mr-2" style={{ color: "var(--track-fw)" }}>
                04
              </span>
              Agent 框架实战: 构建真实 Agent →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

// ============ 控制区子组件（隔离 slug 状态） ============

function PipelineControls({
  isLoading,
  hasResult,
  onRun,
  onReset,
}: {
  isLoading: boolean
  hasResult: boolean
  onRun: (slug: string) => void
  onReset: () => void
}) {
  const [slug, setSlug] = useState("agent-core")

  return (
    <div className="flex flex-wrap items-end gap-3 mb-8">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="chapter-select" className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
          选择章节
        </label>
        <select
          id="chapter-select"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          disabled={isLoading}
          className="font-mono text-sm px-3 py-2 rounded-lg"
          style={{
            backgroundColor: "var(--surface-1)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            cursor: "pointer",
            minWidth: "220px",
          }}
        >
          {CHAPTERS.map((c) => (
            <option key={c.slug} value={c.slug}>
              {String(c.order).padStart(2, "0")}. {c.title}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onRun(slug)}
          disabled={isLoading}
          className="font-mono text-sm px-4 py-2 rounded-lg"
          style={{
            backgroundColor: isLoading ? "var(--surface-2)" : "var(--accent)",
            color: isLoading ? "var(--text-muted)" : "var(--bg)",
            cursor: isLoading ? "not-allowed" : "pointer",
            border: "none",
          }}
        >
          {isLoading ? "Pipeline 运行中…" : "▷ 启动 Pipeline"}
        </button>
        {hasResult && (
          <button
            onClick={onReset}
            className="font-mono text-sm px-3 py-2 rounded-lg"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)", background: "none", cursor: "pointer" }}
          >
            重置
          </button>
        )}
      </div>
    </div>
  )
}

// ============ Step 行组件 ============

const STATUS_CONFIG = {
  pending: { icon: "○", color: "var(--text-muted)", bg: "transparent", label: "等待" },
  running: { icon: "◉", color: "var(--accent)", bg: "var(--accent-subtle)", label: "运行中" },
  done: { icon: "●", color: "var(--track-ts)", bg: "oklch(16% 0.012 152)", label: "完成" },
  failed: { icon: "✕", color: "var(--track-multi)", bg: "oklch(18% 0.008 15)", label: "失败" },
} as const

function StepRow({ step, status }: { step: StepDisplay; status: UIStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{ backgroundColor: cfg.bg, transition: "background-color 300ms" }}
    >
      <span
        className="font-mono text-sm w-4 text-center shrink-0"
        style={{ color: cfg.color, animation: status === "running" ? "dot-pulse 1.2s ease-in-out infinite" : "none" }}
      >
        {cfg.icon}
      </span>
      <span className="text-sm shrink-0">{step.icon}</span>
      <div className="flex-1 min-w-0">
        <span className="font-mono text-xs" style={{ color: status === "pending" ? "var(--text-muted)" : "var(--text-secondary)" }}>
          {step.labelZh}
        </span>
        <code className="font-mono text-[0.5625rem] block" style={{ color: "var(--text-muted)", opacity: 0.7 }}>
          {step.toolName}()
        </code>
      </div>
      <span
        className="font-mono text-[0.5625rem] px-1.5 py-0.5 rounded shrink-0"
        style={{ color: cfg.color, border: `1px solid ${cfg.color}40`, backgroundColor: `${cfg.color}10` }}
      >
        {cfg.label}
      </span>
    </div>
  )
}

// ============ 右侧信息面板 ============

function InfoPanel() {
  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-lg p-4 flex flex-col gap-3"
        style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
      >
        <p className="font-mono text-[0.6875rem] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Agent 架构
        </p>
        <pre className="font-mono text-[0.625rem] leading-[1.8]" style={{ color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
          {`模型: claude-haiku-4-5
工具数: 5 个
stopWhen: stepCountIs(12)
Token 预算: 120K

模式: 单 Agent + 工具集
状态: 外置（不占 Context）
重试: 每工具最多 2 次`}
        </pre>
      </div>

      <div
        className="rounded-lg p-4 flex flex-col gap-2"
        style={{ backgroundColor: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
      >
        <p className="font-mono text-[0.6875rem] uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
          工具清单
        </p>
        {[
          ["readChapter", "只读"],
          ["generateScript", "写 · LLM"],
          ["synthesizeVoice", "写 · 模拟"],
          ["renderScenes", "写 · 模拟"],
          ["composeVideo", "写 · 模拟"],
        ].map(([name, badge]) => (
          <div key={name} className="flex items-center justify-between">
            <code className="font-mono text-[0.6875rem]" style={{ color: "var(--text-secondary)" }}>
              {name}
            </code>
            <span
              className="font-mono text-[0.5625rem] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
            >
              {badge}
            </span>
          </div>
        ))}
      </div>

      <p className="font-mono text-[0.625rem] leading-[1.7]" style={{ color: "var(--text-muted)" }}>
        * 语音合成、场景渲染、视频合成为模拟实现。脚本生成调用真实 Claude API。参考《Agent 开发实战》第十四章。
      </p>
    </div>
  )
}
