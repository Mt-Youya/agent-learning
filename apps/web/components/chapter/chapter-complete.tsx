"use client"

import { useEffect, useState } from "react"
import { Button } from "@agent-learning/ui"

const STORAGE_KEY = "agentlab:completed"

function getCompleted(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function saveCompleted(slug: string, done: boolean): void {
  const set = getCompleted()
  if (done) {
    set.add(slug)
  } else {
    set.delete(slug)
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
  } catch {
    /* localStorage may be unavailable */
  }
}

interface ChapterCompleteProps {
  chapterSlug: string
  variant?: "default" | "compact"
}

export function ChapterComplete({ chapterSlug, variant = "default" }: ChapterCompleteProps) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDone(getCompleted().has(chapterSlug))
  }, [chapterSlug])

  function toggle() {
    const next = !done
    setDone(next)
    saveCompleted(chapterSlug, next)
  }

  /* ── Compact variant (right sidebar) ── */
  if (variant === "compact") {
    return (
      <Button
        variant={done ? "secondary" : "outline"}
        size="sm"
        onClick={toggle}
        aria-pressed={done}
        className="w-full font-mono text-xs"
      >
        <span aria-hidden="true">{done ? "✓" : "○"}</span>
        {done ? "已完成" : "标记完成"}
      </Button>
    )
  }

  /* ── Default variant (bottom of content) ── */
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="font-mono text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {done ? "本章已完成" : "完成本章学习"}
        </p>
        <p className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {done ? "进度已记录在本地。继续下一章。" : "标记完成后，进度将保存在本地浏览器中。"}
        </p>
      </div>

      <Button variant={done ? "outline" : "default"} onClick={toggle} aria-pressed={done} className="font-mono">
        {done ? "✓ 已完成" : "标记本章完成"}
      </Button>
    </div>
  )
}
