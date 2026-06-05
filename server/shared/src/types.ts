/**
 * Shared types used across all server packages.
 * Import via: import type { ... } from "@agent-learning/server-shared/types"
 */

/* ── Standard JSON response envelope ─────────────────── */
export interface ApiOk<T = unknown> {
  ok: true
  data: T
}

export interface ApiError {
  ok: false
  error: string
  code?: string // machine-readable code, e.g. "VALIDATION_ERROR"
  details?: unknown // extra context in dev mode
}

export type ApiResponse<T = unknown> = ApiOk<T> | ApiError

/* ── Custom error class ───────────────────────────────── */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500,
    public readonly code?: string
  ) {
    super(message)
    this.name = "AppError"
  }

  static badRequest(message: string, code?: string): AppError {
    return new AppError(message, 400, code ?? "BAD_REQUEST")
  }

  static unauthorized(message = "Unauthorized"): AppError {
    return new AppError(message, 401, "UNAUTHORIZED")
  }

  static notFound(resource: string): AppError {
    return new AppError(`${resource} not found`, 404, "NOT_FOUND")
  }

  static unprocessable(message: string): AppError {
    return new AppError(message, 422, "VALIDATION_ERROR")
  }
}

/* ── Koa state extensions ──────────────────────────────
   Extend in each service if needed:
   declare module "@koa/router" { interface RouterParamContext { user?: ... } }  */
