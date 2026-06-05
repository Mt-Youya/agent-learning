/* Server Component */
import type { ReactNode } from "react"

type CalloutType = "info" | "tip" | "warning"

const CONFIG: Record<CalloutType, { icon: string; label: string; bg: string; border: string; iconColor: string }> = {
  info: {
    icon: "ℹ",
    label: "提示",
    bg: "var(--surface-info)",
    border: "var(--accent-dim)",
    iconColor: "var(--accent)",
  },
  tip: {
    icon: "✦",
    label: "技巧",
    bg: "var(--surface-tip)",
    border: "var(--track-ts)",
    iconColor: "var(--track-ts)",
  },
  warning: {
    icon: "⚠",
    label: "注意",
    bg: "var(--surface-warn)",
    border: "var(--track-llm)",
    iconColor: "var(--track-llm)",
  },
}

interface CalloutProps {
  type?: CalloutType
  children: ReactNode
}

export function Callout({ type = "info", children }: CalloutProps) {
  const cfg = CONFIG[type]

  return (
    <aside
      className="my-6 px-4 py-3.5 rounded-lg"
      style={{
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
      aria-label={cfg.label}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-sm mt-0.5 shrink-0 select-none" style={{ color: cfg.iconColor }} aria-hidden="true">
          {cfg.icon}
        </span>
        <div
          className="font-mono text-[0.875rem] leading-[1.65] flex-1 min-w-0"
          style={{ color: "var(--text-secondary)" }}
        >
          {children}
        </div>
      </div>
    </aside>
  )
}
