/**
 * Chat Controller — HTTP ↔ Service bridge.
 *
 * Body is already Zod-validated by the route-level middleware.
 * Controller casts ctx.request.body to ChatBody (safe, schema is authoritative).
 *
 * Does NOT contain AI/model logic (that lives in services/).
 * Does NOT declare routes or validation (that lives in routes/).
 */

import type { Context } from "koa"
import { Readable } from "stream"
import { streamChat } from "../services/chat.service.js"
import type { ChatBody } from "../schemas/chat.schema.js"

/* ── POST /api/chat ─────────────────────────────────── */
export async function chatCompletion(ctx: Context): Promise<void> {
  /* Body already validated + coerced by validateBody(ChatBodySchema).
     Pass directly to service — no need to destructure/re-spread.     */
  const result = streamChat(ctx.request.body as ChatBody)
  /* ai v6: toDataStreamResponse was renamed toTextStreamResponse.
     Returns a Web API Response with text/plain; charset=utf-8.
     Compatible with EventSource on the frontend, and with the
     `useChat` hook when paired with the matching client transport. */
  const response = result.toTextStreamResponse()

  ctx.status = response.status
  /* Iterate headers without implicit-any forEach callback */
  for (const [key, value] of response.headers) {
    ctx.set(key, value)
  }

  /* Convert Web ReadableStream → Node.js Readable (Node 18+) */
  ctx.body = Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0])
}

/* ── GET /api/health ────────────────────────────────── */
export function health(ctx: Context): void {
  ctx.body = {
    ok: true,
    service: "@agent-learning/chat",
    timestamp: new Date().toISOString(),
  }
}
