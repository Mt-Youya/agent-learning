"use client"

import { useEffect, useState } from "react"

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function update() {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? Math.min((scrolled / total) * 100, 100) : 0)
    }

    window.addEventListener("scroll", update, { passive: true })
    update()
    return () => window.removeEventListener("scroll", update)
  }, [])

  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "2px",
        width: `${progress}%`,
        backgroundColor: "var(--accent)",
        zIndex: 60,
        transition: "width 80ms linear",
        pointerEvents: "none",
      }}
    />
  )
}
