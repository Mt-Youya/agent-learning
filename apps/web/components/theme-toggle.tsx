"use client"

/**
 * ThemeToggle — Dark / Light switcher
 *
 * Icon animation: GSAP rotate + fade crossfade between Sun and Moon.
 * Theme state: localStorage "theme" key ("dark" | "light"), default dark.
 * Anti-flash: coordinated with layout.tsx inline script that sets
 *   html.dark before first paint.
 */

import { useRef, useState, useEffect, useCallback } from "react"
import { gsap } from "gsap"
import { IconSun, IconMoon } from "@tabler/icons-react"
import { Button } from "@agent-learning/ui"

export function ThemeToggle() {
  /* null = not yet mounted (avoids hydration mismatch for icon state) */
  const [isDark, setIsDark] = useState<boolean | null>(null)
  const sunRef = useRef<HTMLSpanElement>(null)
  const moonRef = useRef<HTMLSpanElement>(null)

  /* Sync with the class that layout.tsx script already set */
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"))
  }, [])

  const toggle = useCallback(() => {
    const next = !isDark
    setIsDark(next)

    const html = document.documentElement
    if (next) {
      html.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      html.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }

    /* GSAP crossfade: outgoing spins out, incoming spins in
       Dark mode shows Sun (invite to switch to light → Moon comes in on light switch).
       next=true → switching to dark: Moon was showing → spin out Moon, spin in Sun
       next=false → switching to light: Sun was showing → spin out Sun, spin in Moon */
    const outEl = next ? moonRef.current : sunRef.current
    const inEl = next ? sunRef.current : moonRef.current

    gsap.to(outEl, {
      rotate: 80,
      opacity: 0,
      duration: 0.22,
      ease: "power2.in",
    })
    gsap.fromTo(
      inEl,
      { rotate: -80, opacity: 0 },
      { rotate: 0, opacity: 1, duration: 0.32, ease: "expo.out", delay: 0.08 }
    )
  }, [isDark])

  /* Before mount: render a placeholder the same size as Button icon */
  if (isDark === null) {
    return <span className="size-8 inline-block" aria-hidden="true" />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={isDark ? "切换到亮色模式" : "切换到暗色模式"}
      title={isDark ? "切换到亮色模式" : "切换到暗色模式"}
      className="relative text-[var(--text-secondary)]"
    >
      {/* Sun — visible in dark mode to signal "switch to light" */}
      <span
        ref={sunRef}
        className="absolute flex items-center justify-center"
        style={{ opacity: isDark ? 1 : 0 }}
        aria-hidden="true"
      >
        <IconSun size={16} stroke={1.5} />
      </span>

      {/* Moon — visible in light mode to signal "switch to dark" */}
      <span
        ref={moonRef}
        className="absolute flex items-center justify-center"
        style={{ opacity: isDark ? 0 : 1 }}
        aria-hidden="true"
      >
        <IconMoon size={16} stroke={1.5} />
      </span>
    </Button>
  )
}
