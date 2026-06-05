/**
 * POST /api/chat — AI streaming chat endpoint.
 *
 * This is the Next.js Route Handler equivalent of server/chat.
 * Uses the AI SDK directly — no separate Koa process needed for
 * the web frontend.
 *
 * Request body (sent by useChat from @ai-sdk/react):
 *   { messages: UIMessage[], id?: string }
 *
 * Response: UIMessageStream — consumed by useChat on the client.
 * Uses result.toUIMessageStreamResponse() so the hook receives
 * properly-typed UIMessage updates (text parts, tool calls, etc.).
 */

import { streamText, convertToModelMessages } from "ai"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { type NextRequest } from "next/server"

function selectModel(modelId: string) {
  if (modelId.startsWith("claude-")) return anthropic(modelId)
  return openai(modelId)
}

export async function POST(req: NextRequest) {
  const {
    messages,
    model = process.env["DEFAULT_MODEL"] ?? "gpt-4o-mini",
    system,
    maxTokens,
  } = (await req.json()) as {
    messages: unknown[]
    model?: string
    system?: string
    maxTokens?: number
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages required" }, { status: 400 })
  }

  /* convertToModelMessages is async (file attachments need URL resolution) */
  const modelMessages = await convertToModelMessages(messages as Parameters<typeof convertToModelMessages>[0])

  const result = streamText({
    model: selectModel(model),
    messages: modelMessages,
    ...(system ? { system } : {}),
    ...(maxTokens ? { maxTokens } : {}),
  })

  /* toUIMessageStreamResponse() returns the UIMessageStream format
     that @ai-sdk/react's useChat expects. It carries text chunks,
     finish events, and (optionally) tool call data.             */
  return result.toUIMessageStreamResponse()
}
