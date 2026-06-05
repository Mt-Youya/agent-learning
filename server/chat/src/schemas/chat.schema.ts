/**
 * Zod schemas for the chat endpoint.
 * Single source of truth: runtime validation + TypeScript types.
 *
 * Uses the official `modelMessageSchema` from the `ai` package so the
 * validated array is typed exactly as `ModelMessage[]`.
 *
 * NOTE: Written for Zod v4. The `invalid_type_error` / `required_error`
 * options from Zod v3 do not exist in v4; use `.check()` or `.refine()`.
 */

import { z } from "zod"
import { modelMessageSchema } from "ai"

export const ChatBodySchema = z.object({
  /** Conversation history — at least one message required */
  messages: z.array(modelMessageSchema).min(1, "messages must contain at least one entry"),

  /** Model ID. Default resolved in config (see config.ts). */
  model: z
    .string()
    .min(1)
    .regex(/^[\w.-]+$/, "invalid model ID")
    .optional(),

  /** System prompt override (separate from messages) */
  system: z.string().max(8_000, "system prompt too long (max 8 000 chars)").optional(),

  /** Max tokens to generate (inclusive upper bound) */
  maxTokens: z
    .number()
    .int("maxTokens must be an integer")
    .positive("maxTokens must be > 0")
    .max(32_768, "maxTokens too large (max 32 768)")
    .optional(),

  /** Sampling temperature: 0 = deterministic, 2 = very random */
  temperature: z.number().min(0, "temperature must be ≥ 0").max(2, "temperature must be ≤ 2").optional(),
})

export type ChatBody = z.infer<typeof ChatBodySchema>
