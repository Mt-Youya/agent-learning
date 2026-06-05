/**
 * Zod-based validation middleware factories.
 *
 * Usage:
 *   import { validateBody, validateParams } from "@agent-learning/server-shared";
 *
 *   router.post("/chat", validateBody(ChatBodySchema), chatCompletion);
 *   router.get("/:slug",  validateParams(SlugSchema),   showChapter);
 *
 * On success:
 *   - ctx.request.body is replaced with result.data (Zod-coerced values)
 *   - ctx.params      is replaced with result.data  (params)
 *
 * On failure:
 *   - Throws AppError 422 (body) or 400 (params/query) with the first
 *     validation issue formatted as a human-readable string.
 */

import type { Context, Next } from "koa"
import { z } from "zod"
import { AppError } from "../types.js"

/* ── Error formatter ────────────────────────────────── */
function formatError(err: z.ZodError): string {
  return err.issues
    .map((issue) => {
      const path = issue.path.length ? issue.path.join(".") + ": " : ""
      return `${path}${issue.message}`
    })
    .join("; ")
}

/* ── Factory helpers ────────────────────────────────── */

/** Validates ctx.request.body. Throws 422 on failure. */
export function validateBody<T>(schema: z.ZodType<T>) {
  return async (ctx: Context, next: Next): Promise<void> => {
    /* ctx.request.body is augmented by koa-body; cast through unknown for portability */
    const raw = (ctx.request as unknown as { body: unknown }).body
    const result = schema.safeParse(raw)
    if (!result.success) {
      throw AppError.unprocessable(formatError(result.error))
    }
    /* Replace body with Zod-coerced data (default values, type coercions, etc.) */
    ;(ctx.request as unknown as { body: unknown }).body = result.data
    await next()
  }
}

/** Validates ctx.params (URL path segments). Throws 400 on failure. */
export function validateParams<T>(schema: z.ZodType<T>) {
  return async (ctx: Context, next: Next): Promise<void> => {
    const result = schema.safeParse(ctx.params)
    if (!result.success) {
      throw AppError.badRequest(formatError(result.error))
    }
    await next()
  }
}

/** Validates ctx.query (URL query string). Throws 400 on failure. */
export function validateQuery<T>(schema: z.ZodType<T>) {
  return async (ctx: Context, next: Next): Promise<void> => {
    const result = schema.safeParse(ctx.query)
    if (!result.success) {
      throw AppError.badRequest(formatError(result.error))
    }
    await next()
  }
}
