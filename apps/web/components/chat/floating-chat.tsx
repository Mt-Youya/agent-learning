"use client"

/**
 * FloatingChat — coordinator component.
 *
 * Uses @ai-sdk/react's useChat which connects to /api/chat
 * (a Next.js Route Handler using streamText).
 * No external service, no CORS, no env vars.
 */

import { useState, useRef, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { gsap } from "gsap"
import { AIChatPanel } from "./ai-chat-panel"
import { ChatBubble } from "./chat-bubble"

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  /* ai v6: transport-based config — DefaultChatTransport handles the
     UIMessageStream protocol that /api/chat returns.                 */
  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const isStreaming = status === "streaming" || status === "submitted"
  const errorMsg = error?.message ?? null

  const closePanel = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsOpen(false)
      return
    }
    gsap.to(panelRef.current, {
      y: 12,
      opacity: 0,
      scale: 0.97,
      duration: 0.22,
      ease: "power2.in",
      onComplete: () => setIsOpen(false),
    })
  }, [])

  const handleToggle = useCallback(() => {
    if (isOpen) closePanel()
    else setIsOpen(true)
  }, [isOpen, closePanel])

  /* ai v6: sendMessage takes { text } not a plain string */
  const handleSend = useCallback(
    (text: string) => {
      sendMessage({ text })
    },
    [sendMessage]
  )

  const handleReset = useCallback(() => {
    setMessages([])
  }, [setMessages])

  return (
    <div
      className="fixed z-[200]"
      style={{
        bottom: "max(24px, env(safe-area-inset-bottom, 24px))",
        right: "max(24px, env(safe-area-inset-right, 24px))",
      }}
    >
      {isOpen && (
        <div ref={panelRef} className="absolute" style={{ bottom: 64, right: 0 }}>
          <AIChatPanel
            messages={messages}
            isStreaming={isStreaming}
            error={errorMsg}
            onSend={handleSend}
            onReset={handleReset}
            onClose={closePanel}
          />
        </div>
      )}

      <ChatBubble isOpen={isOpen} hasMessages={messages.length > 0} onToggle={handleToggle} />
    </div>
  )
}
