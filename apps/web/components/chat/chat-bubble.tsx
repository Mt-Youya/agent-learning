"use client"

/**
 * ChatBubble — floating trigger button.
 *
 * GSAP: magnetic hover scale + icon crossfade on open/close.
 * Renders a green dot when there are unread/unseen messages.
 */

import { useRef } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { IconMessageCircle2, IconX } from "@tabler/icons-react"

gsap.registerPlugin(useGSAP)

interface ChatBubbleProps {
  isOpen: boolean
  hasMessages: boolean
  onToggle: () => void
}

export function ChatBubble({ isOpen, hasMessages, onToggle }: ChatBubbleProps) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const msgIconRef = useRef<HTMLSpanElement>(null)
  const closeIconRef = useRef<HTMLSpanElement>(null)

  /* Animate icon crossfade when open state changes */
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

      const outEl = isOpen ? msgIconRef.current : closeIconRef.current
      const inEl = isOpen ? closeIconRef.current : msgIconRef.current

      gsap.to(outEl, { rotate: 80, opacity: 0, duration: 0.2, ease: "power2.in" })
      gsap.fromTo(
        inEl,
        { rotate: -80, opacity: 0 },
        { rotate: 0, opacity: 1, duration: 0.3, ease: "expo.out", delay: 0.05 }
      )
    },
    { dependencies: [isOpen] }
  )

  function onMouseEnter() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    gsap.to(btnRef.current, {
      scale: 1.1,
      duration: 0.25,
      ease: "back.out(1.7)",
    })
  }

  function onMouseLeave() {
    gsap.to(btnRef.current, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    })
  }

  function onMouseDown() {
    gsap.to(btnRef.current, {
      scale: 0.93,
      duration: 0.08,
      ease: "power2.in",
    })
  }

  function onMouseUp() {
    gsap.to(btnRef.current, {
      scale: 1.05,
      duration: 0.25,
      ease: "back.out(1.7)",
    })
  }

  return (
    <button
      ref={btnRef}
      onClick={onToggle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: 52,
        height: 52,
        backgroundColor: "var(--accent)",
        color: "white",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 4px 24px oklch(50% 0.22 248 / 0.35)",
        flexShrink: 0,
      }}
      aria-label={isOpen ? "关闭 AI 助手" : "打开 AI 助手"}
      aria-expanded={isOpen}
    >
      {/* Both icons stacked; GSAP crossfades between them */}
      <span
        ref={msgIconRef}
        className="absolute flex items-center justify-center"
        style={{ opacity: isOpen ? 0 : 1 }}
        aria-hidden="true"
      >
        <IconMessageCircle2 size={22} stroke={2} />
      </span>

      <span
        ref={closeIconRef}
        className="absolute flex items-center justify-center"
        style={{ opacity: isOpen ? 1 : 0 }}
        aria-hidden="true"
      >
        <IconX size={22} stroke={2} />
      </span>

      {/* Unread dot — shown when panel is closed and there are messages */}
      {!isOpen && hasMessages && (
        <span
          className="absolute rounded-full"
          style={{
            top: 3,
            right: 3,
            width: 10,
            height: 10,
            backgroundColor: "oklch(67% 0.09 152)" /* track-ts green */,
            border: "2px solid var(--base)",
          }}
          aria-hidden="true"
        />
      )}
    </button>
  )
}
