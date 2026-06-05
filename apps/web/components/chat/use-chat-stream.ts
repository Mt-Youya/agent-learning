"use client"

/**
 * useChatStream — thin wrapper around @ai-sdk/react's useChat.
 *
 * Points at the local Next.js route handler /api/chat instead of
 * an external Koa service — no CORS, no port 4000, no env var.
 *
 * The raw hook returns UIMessage[] (parts-based). This wrapper
 * exposes a simplified interface for the chat panel:
 *   - text(message) → string  (extract plain text from parts)
 *   - isStreaming            (true while a response is generating)
 */

export type { UIMessage } from "ai"

export { useChat } from "@ai-sdk/react"
