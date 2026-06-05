"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { PipelineBadge } from "@/components/dashboard/pipeline-badge"
import { Button } from "@agent-learning/ui"
import {
  INITIAL_JOBS,
  STEP_DEFS,
  STEP_LOGS,
  getOverallStatus,
  type OverallStatus,
  type PipelineStep,
  type StepKey,
  type VideoJob,
} from "@/lib/video-jobs"

/* ─── Helpers ───────────────────────────────────────── */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  const h = Math.floor(diff / 3_600_000)
  const d = Math.floor(diff / 86_400_000)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  if (m > 0) return `${m}m ago`
  return "just now"
}

function fmtDuration(ms: number): string {
  const s = Math.round(ms / 1000)
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
}

function timestamp(): string {
  return new Date().toTimeString().slice(0, 8)
}

/* ─── Status visual config ──────────────────────────── */
const OVERALL_CONFIG: Record<OverallStatus, { symbol: string; label: string; color: string }> = {
  done: { symbol: "●", label: "已完成", color: "var(--track-ts)" },
  running: { symbol: "◌", label: "生成中", color: "var(--accent)" },
  failed: { symbol: "✕", label: "失败", color: "var(--track-multi)" },
  pending: { symbol: "○", label: "等待", color: "var(--text-muted)" },
}

const STEP_STATUS_CONFIG: Record<string, { symbol: string; color: string }> = {
  done: { symbol: "●", color: "var(--track-ts)" },
  running: { symbol: "●", color: "var(--accent)" },
  failed: { symbol: "✕", color: "var(--track-multi)" },
  pending: { symbol: "○", color: "var(--text-muted)" },
}

/* ─── ChapterRow ────────────────────────────────────── */
function ChapterRow({ job, selected, onClick }: { job: VideoJob; selected: boolean; onClick: () => void }) {
  const overall = getOverallStatus(job)
  const cfg = OVERALL_CONFIG[overall]

  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className="w-full text-left flex items-start gap-3 px-5 py-4 transition-colors"
      style={{
        backgroundColor: selected ? "var(--accent-subtle)" : "transparent",
        border: "none",
        borderBottom: "1px solid var(--border-subtle)",
        cursor: "pointer",
      }}
    >
      {/* Chapter number */}
      <span className="font-mono text-xs tabular-nums pt-px shrink-0" style={{ color: cfg.color }} aria-hidden="true">
        {String(job.chapterOrder).padStart(2, "0")}
      </span>

      {/* Title + pipeline */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <span
          className="font-mono text-xs leading-snug"
          style={{
            color: selected ? "var(--text-primary)" : "var(--text-secondary)",
          }}
        >
          {job.chapterTitle}
        </span>
        <PipelineBadge steps={job.steps} size="sm" />
      </div>

      {/* Time + overall status */}
      <div className="shrink-0 flex flex-col items-end gap-1.5">
        <span className="font-mono text-[0.625rem]" style={{ color: "var(--text-muted)" }}>
          {timeAgo(job.updatedAt)}
        </span>
        <span className="font-mono text-[0.625rem]" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
      </div>
    </button>
  )
}

/* ─── StepRow (in detail panel) ────────────────────── */
function StepRow({ step, index }: { step: PipelineStep; index: number }) {
  const cfg = STEP_STATUS_CONFIG[step.status]
  return (
    <li className="flex items-start gap-3 py-2.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      {/* Index */}
      <span
        className="font-mono text-[0.625rem] tabular-nums pt-px shrink-0 w-4"
        style={{ color: "var(--text-muted)" }}
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Status dot */}
      <span
        className="mt-px shrink-0"
        style={{
          display: "inline-block",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: cfg.color,
          flexShrink: 0,
          animation: step.status === "running" ? "dot-pulse 1.2s ease-in-out infinite" : "none",
        }}
        aria-hidden="true"
      />

      {/* Step info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-mono text-xs font-medium" style={{ color: "var(--text-primary)" }}>
            {step.labelZh}
          </span>
          <span className="font-mono text-[0.625rem] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            {step.label}
          </span>
        </div>

        {step.completedAt && (
          <p className="font-mono text-[0.625rem] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {timeAgo(step.completedAt)}
            {step.durationMs != null && ` · ${fmtDuration(step.durationMs)}`}
          </p>
        )}

        {step.status === "running" && (
          <p className="font-mono text-[0.625rem] mt-0.5" style={{ color: "var(--accent)" }}>
            生成中…
          </p>
        )}

        {step.status === "failed" && (
          <p className="font-mono text-[0.625rem] mt-0.5" style={{ color: "var(--track-multi)" }}>
            生成失败
          </p>
        )}
      </div>

      {/* Status label */}
      <span className="font-mono text-[0.625rem] shrink-0 pt-px" style={{ color: cfg.color }}>
        {cfg.symbol}
      </span>
    </li>
  )
}

/* ─── JobDetail ─────────────────────────────────────── */
function JobDetail({
  job,
  regenerating,
  fromStep,
  onFromStepChange,
  onRegenerate,
  logs,
  logRef,
}: {
  job: VideoJob
  regenerating: boolean
  fromStep: StepKey
  onFromStepChange: (k: StepKey) => void
  onRegenerate: () => void
  logs: string[]
  logRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div className="flex flex-col gap-6 p-5">
      {/* ── Chapter header ───────────────────────── */}
      <div>
        <p className="font-mono text-xs tracking-[0.14em] uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>
          {String(job.chapterOrder).padStart(2, "0")} · 详情
        </p>
        <h2 className="text-base font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
          {job.chapterTitle}
        </h2>
      </div>

      {/* ── Video preview ────────────────────────── */}
      <div>
        <p className="font-mono text-[0.6875rem] uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
          视频预览
        </p>
        <div
          className="overflow-hidden rounded-lg"
          style={{
            aspectRatio: "16 / 9",
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
          }}
        >
          {job.videoUrl ? (
            <video
              src={job.videoUrl}
              controls
              preload="metadata"
              style={{ display: "block", width: "100%", height: "100%" }}
              aria-label={`${job.chapterTitle} 视频讲解`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full gap-1.5">
              <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                ▷ 尚未生成视频
              </span>
              <span className="font-mono text-[0.6875rem]" style={{ color: "var(--text-muted)" }}>
                {getOverallStatus(job) === "running" ? "生成中…" : "触发生成后此处显示预览"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Pipeline steps ───────────────────────── */}
      <div>
        <p className="font-mono text-[0.6875rem] uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
          生成流水线
        </p>
        <ol className="flex flex-col list-none m-0 p-0">
          {job.steps.map((step, i) => (
            <StepRow key={step.key} step={step} index={i} />
          ))}
        </ol>
      </div>

      {/* ── Regenerate form ──────────────────────── */}
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: "var(--surface-1)",
          border: "1px solid var(--border)",
        }}
      >
        <p className="font-mono text-[0.6875rem] uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
          重新生成
        </p>
        <div className="flex items-center gap-2">
          {/* Native select — styled to match design system */}
          <select
            value={fromStep}
            onChange={(e) => onFromStepChange(e.target.value as StepKey)}
            disabled={regenerating}
            className="font-mono text-xs flex-1 px-3 py-2 rounded-lg appearance-none"
            style={{
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: regenerating ? "var(--text-muted)" : "var(--text-secondary)",
              cursor: regenerating ? "not-allowed" : "pointer",
              outline: "none",
            }}
            aria-label="从哪步重新生成"
          >
            {STEP_DEFS.map((step) => (
              <option
                key={step.key}
                value={step.key}
                style={{
                  backgroundColor: "var(--surface-2)",
                  color: "var(--text-primary)",
                }}
              >
                从 {step.labelZh} ({step.label}) 开始
              </option>
            ))}
          </select>

          {/* Regenerate button */}
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="font-mono text-xs px-4 py-2 rounded-lg transition-colors shrink-0"
            style={{
              backgroundColor: regenerating ? "var(--surface-2)" : "var(--accent)",
              color: regenerating ? "var(--text-muted)" : "var(--base)",
              border: "none",
              cursor: regenerating ? "not-allowed" : "pointer",
              transition: "background-color 140ms ease",
            }}
            aria-busy={regenerating}
          >
            {regenerating ? "生成中…" : "↺ 重新生成"}
          </button>
        </div>
      </div>

      {/* ── Log stream ───────────────────────────── */}
      {logs.length > 0 && (
        <div>
          <p
            className="font-mono text-[0.6875rem] uppercase tracking-wider mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            运行日志{regenerating && " · 生成中…"}
          </p>
          <div
            ref={logRef as React.RefObject<HTMLDivElement>}
            className="overflow-y-auto rounded-lg p-3"
            style={{
              maxHeight: "200px",
              backgroundColor: "var(--surface-1)",
              border: "1px solid var(--border)",
            }}
            role="log"
            aria-live="polite"
            aria-label="生成日志"
          >
            {logs.map((line, i) => (
              <p
                key={i}
                className="font-mono text-[0.75rem] leading-[1.6] m-0"
                style={{
                  color: line.includes("✓") ? "var(--track-ts)" : "var(--text-secondary)",
                }}
              >
                {line}
              </p>
            ))}
            {regenerating && (
              <p className="font-mono text-[0.75rem] m-0" style={{ color: "var(--accent)" }}>
                ▌
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────── */
export default function VideoDashboard() {
  const [jobs, setJobs] = useState<VideoJob[]>(INITIAL_JOBS)
  const [selectedSlug, setSelectedSlug] = useState<string>(INITIAL_JOBS[0].chapterSlug)
  const [fromStep, setFromStep] = useState<StepKey>("script")
  const [regeneratingSlug, setRegeneratingSlug] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const logRef = useRef<HTMLDivElement>(null)

  /* Auto-scroll log panel */
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  /* Derived: selected job */
  const selectedJob = useMemo(() => jobs.find((j) => j.chapterSlug === selectedSlug) ?? jobs[0], [jobs, selectedSlug])

  /* Derived: summary counts */
  const counts = useMemo(() => {
    const statuses = jobs.map(getOverallStatus)
    return {
      total: jobs.length,
      done: statuses.filter((s) => s === "done").length,
      running: statuses.filter((s) => s === "running").length,
      failed: statuses.filter((s) => s === "failed").length,
      pending: statuses.filter((s) => s === "pending").length,
    }
  }, [jobs])

  /* Regenerate handler */
  const handleRegenerate = useCallback(() => {
    if (!selectedJob || regeneratingSlug) return

    const slug = selectedJob.chapterSlug
    const stepIndex = selectedJob.steps.findIndex((s) => s.key === fromStep)

    setRegeneratingSlug(slug)
    setLogs([])

    /* Update steps: running from fromStep, pending after */
    setJobs((prev) =>
      prev.map((job) => {
        if (job.chapterSlug !== slug) return job
        return {
          ...job,
          steps: job.steps.map((step, i) => ({
            ...step,
            status: i === stepIndex ? ("running" as const) : i > stepIndex ? ("pending" as const) : step.status,
            completedAt: i >= stepIndex ? undefined : step.completedAt,
          })),
          updatedAt: new Date().toISOString(),
        }
      })
    )

    /* Stream log lines */
    const lines = (STEP_LOGS[fromStep] ?? []).map((l) => l.replace(/{slug}/g, slug))
    let lineIndex = 0

    const interval = setInterval(() => {
      if (lineIndex < lines.length) {
        const line = `[${timestamp()}] ${lines[lineIndex]}`
        setLogs((prev) => [...prev, line])
        lineIndex++
      } else {
        clearInterval(interval)

        /* Mark step as done */
        setJobs((prev) =>
          prev.map((job) => {
            if (job.chapterSlug !== slug) return job
            return {
              ...job,
              steps: job.steps.map((step, i) => ({
                ...step,
                status: i === stepIndex ? ("done" as const) : step.status,
                completedAt: i === stepIndex ? new Date().toISOString() : step.completedAt,
                durationMs: i === stepIndex ? 8_000 + Math.random() * 30_000 : step.durationMs,
              })),
              updatedAt: new Date().toISOString(),
            }
          })
        )

        setRegeneratingSlug(null)
        setLogs((prev) => [...prev, `[${timestamp()}] ✓ 步骤完成`])
      }
    }, 110)
  }, [selectedJob, fromStep, regeneratingSlug])

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--base)" }}>
      {/* ── Dashboard header ────────────────────── */}
      <header style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <p
              className="font-mono text-[0.6875rem] tracking-[0.16em] uppercase mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              /dashboard/videos
            </p>
            <h1 className="text-lg font-light tracking-tight" style={{ color: "var(--text-primary)" }}>
              视频讲解生成
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setJobs(INITIAL_JOBS)
                setLogs([])
                setRegeneratingSlug(null)
              }}
              aria-label="刷新数据"
              className="font-mono"
            >
              ⟳ 刷新
            </Button>
            <Button size="sm" className="font-mono">
              ↺ 生成全部
            </Button>
          </div>
        </div>

        {/* Summary bar */}
        <div className="max-w-[1400px] mx-auto px-6 pb-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            {counts.total} 章
          </span>

          {(["done", "running", "failed", "pending"] as const).map((key) => {
            const cfg = OVERALL_CONFIG[key]
            const count = counts[key]
            if (count === 0) return null
            return (
              <span
                key={key}
                className="font-mono text-xs inline-flex items-center gap-1.5"
                style={{ color: cfg.color }}
              >
                <span aria-hidden="true">{cfg.symbol}</span>
                {count} {cfg.label}
              </span>
            )
          })}
        </div>
      </header>

      {/* ── Two-panel body ──────────────────────── */}
      <div className="max-w-[1400px] mx-auto md:grid" style={{ gridTemplateColumns: "400px 1fr" }}>
        {/* Left: chapter list */}
        <div className="md:border-r" style={{ borderColor: "var(--border-subtle)" }}>
          {/* List header */}
          <div
            className="px-5 py-2.5 flex items-center gap-2"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <p
              className="font-mono text-[0.6875rem] tracking-[0.14em] uppercase flex-1"
              style={{ color: "var(--text-muted)" }}
            >
              章节
            </p>
            <p
              className="font-mono text-[0.6875rem] tracking-[0.14em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              流水线
            </p>
          </div>

          {/* Chapter rows */}
          <nav aria-label="视频生成任务列表">
            {jobs.map((job) => (
              <ChapterRow
                key={job.chapterSlug}
                job={job}
                selected={job.chapterSlug === selectedSlug}
                onClick={() => {
                  setSelectedSlug(job.chapterSlug)
                  /* Reset fromStep when switching chapter */
                  const firstPendingOrFailed = job.steps.find((s) => s.status === "pending" || s.status === "failed")
                  if (firstPendingOrFailed) {
                    setFromStep(firstPendingOrFailed.key)
                  } else {
                    setFromStep("script")
                  }
                  /* Clear logs unless this chapter is currently generating */
                  if (regeneratingSlug !== job.chapterSlug) {
                    setLogs([])
                  }
                }}
              />
            ))}
          </nav>
        </div>

        {/* Right: detail panel (sticky) */}
        <div className="hidden md:block">
          <div
            className="sticky overflow-y-auto"
            style={{
              top: 0,
              maxHeight: "100vh",
            }}
          >
            {selectedJob ? (
              <JobDetail
                job={selectedJob}
                regenerating={regeneratingSlug === selectedJob.chapterSlug}
                fromStep={fromStep}
                onFromStepChange={setFromStep}
                onRegenerate={handleRegenerate}
                logs={
                  regeneratingSlug === selectedJob.chapterSlug || (logs.length > 0 && !regeneratingSlug) ? logs : []
                }
                logRef={logRef}
              />
            ) : (
              <div className="flex items-center justify-center h-48" style={{ color: "var(--text-muted)" }}>
                <p className="font-mono text-xs">选择章节查看详情</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile detail (below list) */}
      <div className="md:hidden">
        {selectedJob && (
          <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <JobDetail
              job={selectedJob}
              regenerating={regeneratingSlug === selectedJob.chapterSlug}
              fromStep={fromStep}
              onFromStepChange={setFromStep}
              onRegenerate={handleRegenerate}
              logs={regeneratingSlug === selectedJob.chapterSlug || (logs.length > 0 && !regeneratingSlug) ? logs : []}
              logRef={logRef}
            />
          </div>
        )}
      </div>
    </div>
  )
}
