"use client"

import { useState } from "react"
import type { Chapter } from "@/lib/chapters"

interface MobileSidebarTriggerProps {
  chapters: Chapter[]
  currentSlug: string
}

export function MobileSidebarTrigger({ chapters, currentSlug }: MobileSidebarTriggerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col gap-[5px] w-5 h-5 justify-center bg-transparent p-0 cursor-pointer"
        style={{ border: "none" }}
        aria-label="打开章节导航"
        aria-expanded={open}
        aria-controls="mobile-chapter-nav"
      >
        {[20, 20, 14].map((w, i) => (
          <span
            key={i}
            className="block h-px"
            style={{
              width: `${w}px`,
              backgroundColor: "var(--text-secondary)",
            }}
          />
        ))}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="章节导航"
          id="mobile-chapter-nav"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "oklch(8% 0.005 248 / 0.72)" }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            className="relative w-72 flex flex-col overflow-hidden"
            style={{
              backgroundColor: "var(--surface-1)",
              borderLeft: "1px solid var(--border-subtle)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3.5 shrink-0"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <p className="font-mono text-xs tracking-[0.16em] uppercase" style={{ color: "var(--text-muted)" }}>
                学习路线
              </p>
              <button
                onClick={() => setOpen(false)}
                className="font-mono text-sm bg-transparent p-1 cursor-pointer"
                style={{ border: "none", color: "var(--text-muted)" }}
                aria-label="关闭导航"
              >
                ✕
              </button>
            </div>

            {/* Chapter list */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ol className="flex flex-col gap-0.5 list-none m-0 p-0">
                {chapters.map((chapter) => {
                  const isActive = chapter.slug === currentSlug
                  return (
                    <li key={chapter.slug}>
                      <a
                        href={`/learn/${chapter.slug}`}
                        aria-current={isActive ? "page" : undefined}
                        className="flex items-start gap-2.5 px-2 py-2.5 rounded-lg"
                        style={{
                          backgroundColor: isActive ? "var(--accent-subtle)" : "transparent",
                          textDecoration: "none",
                        }}
                        onClick={() => setOpen(false)}
                      >
                        <span
                          className="font-mono text-xs tabular-nums pt-px shrink-0"
                          style={{
                            color: isActive ? "var(--accent)" : "var(--text-muted)",
                          }}
                          aria-hidden="true"
                        >
                          {String(chapter.order).padStart(2, "0")}
                        </span>
                        <span
                          className="font-mono text-sm leading-snug"
                          style={{
                            color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                          }}
                        >
                          {chapter.title}
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ol>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
