/**
 * Global error-handling middleware.
 *
 * Catches everything thrown by downstream middleware/controllers.
 * - AppError → use its status + code
 * - Any other Error → 500
 * - Unknown value → 500 "internal error"
 *
 * In production, 5xx error details are hidden; in dev they're exposed.
 */

import type { Context, Next } from "koa"
import { AppError } from "../types.js"

const IS_DEV = process.env["NODE_ENV"] !== "production"

export async function errorMiddleware(ctx: Context, next: Next): Promise<void> {
  try {
    await next()
  } catch (err: unknown) {
    const appErr = err instanceof AppError ? err : null
    const stdErr = err instanceof Error ? err : null
    const status = appErr?.status ?? 500
    const code = appErr?.code ?? (status >= 500 ? "INTERNAL_ERROR" : "ERROR")
    const message = appErr?.message ?? stdErr?.message ?? "An unexpected error occurred"

    ctx.status = status
    ctx.body = {
      ok: false,
      error: status >= 500 && !IS_DEV ? "Internal server error" : message,
      code,
      ...(IS_DEV && status >= 500 && stdErr ? { stack: stdErr.stack } : {}),
    }

    if (status >= 500) {
      console.error(`[error] ${ctx.method} ${ctx.path} → ${status}`, err)
    }
  }
}
