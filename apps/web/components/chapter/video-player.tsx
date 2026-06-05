"use client"

import { useEffect, useRef, useState } from "react"
import type { TranscriptLine } from "@/lib/chapters"

interface VideoPlayerProps {
  videoUrl?: string
  transcript: TranscriptLine[]
  defaultOpen?: boolean
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function VideoPlayer({ videoUrl, transcript, defaultOpen = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [transcriptOpen, setTranscriptOpen] = useState(defaultOpen)
  const [currentTime, setCurrentTime] = useState(0)
  const activeLineRef = useRef<HTMLButtonElement>(null)

  /* Track playback position */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const handler = () => setCurrentTime(video.currentTime)
    video.addEventListener("timeupdate", handler, { passive: true })
    return () => video.removeEventListener("timeupdate", handler)
  }, [])

  /* Keep active transcript line in view */
  useEffect(() => {
    if (transcriptOpen && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      })
    }
  }, [currentTime, transcriptOpen])

  /* Find the currently playing transcript line */
  const activeIndex = transcript.reduce<number>((acc, line, i) => {
    return currentTime >= line.time ? i : acc
  }, -1)

  function seekTo(time: number) {
    const video = videoRef.current
    if (!video) return
    video.currentTime = time
    video.play().catch(() => {
      /* Autoplay may be blocked — user must interact first */
    })
  }

  return (
    <div className="overflow-hidden rounded-lg" style={{ border: "1px solid var(--border)" }}>
      {/* ── Video ────────────────────────────────────── */}
      <div
        style={{
          aspectRatio: "16 / 9",
          backgroundColor: "var(--surface-2)",
          position: "relative",
        }}
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            preload="metadata"
            style={{ display: "block", width: "100%", height: "100%" }}
            aria-label="章节视频讲解"
          />
        ) : (
          /* Placeholder while video is being generated */
          <div className="flex flex-col items-center justify-center w-full h-full gap-2" aria-label="视频生成中">
            <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              ▷ 视频讲解
            </span>
            <span className="font-mono text-[0.6875rem]" style={{ color: "var(--text-muted)" }}>
              生成中 ·&thinsp;coming soon
            </span>
          </div>
        )}
      </div>

      {/* ── Transcript toggle ─────────────────────── */}
      <button
        onClick={() => setTranscriptOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 transition-colors"
        style={{
          backgroundColor: "var(--surface-1)",
          borderTop: "1px solid var(--border-subtle)",
          border: "none",
          cursor: "pointer",
        }}
        aria-expanded={transcriptOpen}
        aria-controls="transcript-panel"
      >
        <span className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
          视频文稿
        </span>
        <span
          className="font-mono text-xs"
          style={{
            color: "var(--text-muted)",
            display: "inline-block",
            transform: transcriptOpen ? "rotate(180deg)" : "none",
            transition: "transform 200ms ease",
          }}
          aria-hidden="true"
        >
          ↓
        </span>
      </button>

      {/* ── Transcript panel ──────────────────────── */}
      {transcriptOpen && (
        <div
          id="transcript-panel"
          style={{
            maxHeight: "220px",
            overflowY: "auto",
            backgroundColor: "var(--surface-1)",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <ol className="p-2 flex flex-col list-none m-0">
            {transcript.map((line, i) => {
              const isActive = i === activeIndex
              return (
                <li key={i}>
                  <button
                    ref={isActive ? activeLineRef : null}
                    onClick={() => seekTo(line.time)}
                    className="w-full text-left flex items-start gap-2.5 px-2 py-1.5 rounded-lg transition-colors"
                    style={{
                      backgroundColor: isActive ? "var(--accent-subtle)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                    aria-label={`跳转到 ${formatTime(line.time)}: ${line.text}`}
                  >
                    <span
                      className="font-mono text-[0.625rem] tabular-nums shrink-0 pt-px"
                      style={{
                        color: isActive ? "var(--accent)" : "var(--text-muted)",
                        minWidth: "2.5rem",
                      }}
                      aria-hidden="true"
                    >
                      {formatTime(line.time)}
                    </span>
                    <span
                      className="font-mono text-xs leading-[1.6]"
                      style={{
                        color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                      }}
                    >
                      {line.text}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </div>
  )
}
