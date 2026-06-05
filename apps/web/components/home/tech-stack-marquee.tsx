"use client"

/**
 * Tech Stack Marquee
 *
 * Motivation: bridges the Hero code demo and the Roadmap section by
 * naming the concrete tools before the learner clicks into chapters.
 * One marquee per page — this is it.
 *
 * Motion: CSS @keyframes (no JS re-renders, compositor-only transform).
 * Paused when section exits viewport via IntersectionObserver.
 * Fully disabled under prefers-reduced-motion (CSS rule in globals.css).
 *
 * A11y: aria-hidden="true" — purely decorative; screen readers skip.
 */

import { useEffect, useRef } from "react"

const TOOLS = [
  "Vercel AI SDK",
  "LangChain.js",
  "LangGraph.js",
  "Mastra",
  "OpenAI SDK",
  "Anthropic SDK",
  "MCP",
  "Next.js",
  "TypeScript",
  "Vercel AI SDK",
  "LangChain.js",
  "LangGraph.js",
  "Mastra",
  "OpenAI SDK",
  "Anthropic SDK",
  "MCP",
  "Next.js",
  "TypeScript",
]

export function TechStackMarquee() {
  const trackRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  /* Pause animation when not in viewport */
  useEffect(() => {
    const wrap = wrapRef.current
    const track = trackRef.current
    if (!wrap || !track) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        track.dataset.paused = entry.isIntersecting ? "false" : "true"
      },
      { threshold: 0 }
    )

    observer.observe(wrap)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={wrapRef}
      className="overflow-hidden py-5"
      style={{
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
      aria-hidden="true"
    >
      <div
        ref={trackRef}
        className="marquee-track flex gap-0"
        /* width: two copies of the item list for seamless wrap */
        style={{ width: "max-content" }}
      >
        {/* Two identical copies — CSS translateX(-50%) creates seamless loop */}
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center gap-6 pr-6">
            {TOOLS.slice(0, 9).map((tool, i) => (
              /* Plain mono label — no border box, purely decorative */
              <span
                key={`${copy}-${i}`}
                className="font-mono text-xs whitespace-nowrap tabular-nums px-2 py-0.5 rounded-md"
                style={{
                  color: "var(--text-secondary)",
                  backgroundColor: "var(--surface-1)",
                }}
              >
                {tool}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
