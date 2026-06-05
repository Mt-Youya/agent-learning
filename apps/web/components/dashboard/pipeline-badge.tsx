/* Pure display — no "use client" needed */
import type { PipelineStep } from "@/lib/video-jobs"

interface PipelineBadgeProps {
  steps: PipelineStep[]
  size?: "sm" | "md"
}

const STATUS_COLORS: Record<string, string> = {
  done: "var(--track-ts)",
  running: "var(--accent)",
  failed: "var(--track-multi)",
  pending: "var(--border)",
}

export function PipelineBadge({ steps, size = "sm" }: PipelineBadgeProps) {
  const dotSize = size === "sm" ? 7 : 9
  const lineWidth = size === "sm" ? 12 : 16

  return (
    <div className="flex items-center" role="img" aria-label={steps.map((s) => `${s.labelZh}: ${s.status}`).join(", ")}>
      {steps.map((step, i) => (
        <span key={step.key} className="flex items-center">
          {/* Dot */}
          <span
            data-status={step.status}
            title={`${step.labelZh}: ${step.status}`}
            style={{
              display: "inline-block",
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              borderRadius: "50%",
              flexShrink: 0,
              backgroundColor: STATUS_COLORS[step.status] ?? "var(--border)",
              animation: step.status === "running" ? "dot-pulse 1.2s ease-in-out infinite" : "none",
            }}
          />
          {/* Connector */}
          {i < steps.length - 1 && (
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: `${lineWidth}px`,
                height: "1px",
                flexShrink: 0,
                backgroundColor: "var(--border)",
              }}
            />
          )}
        </span>
      ))}
    </div>
  )
}
