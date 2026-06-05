/**
 * Pretty-printed request/response logger.
 *
 * Incoming:
 *   →  14:23:45.123  POST    /api/chat
 *
 * Outgoing:
 *   ←  14:23:45.168  POST    /api/chat         200   45ms
 *
 * Colour rules:
 *   Method   GET=cyan  POST=blue  PUT/PATCH=yellow  DELETE=red  *=white
 *   Status   2xx=green  3xx=cyan  4xx=yellow  5xx=red
 *   Duration <100ms=green  <500ms=yellow  ≥500ms=red
 *
 * /health paths are skipped to avoid noise.
 */

import type { Context, Next } from "koa"

/* ── ANSI helpers ───────────────────────────────────── */
const R = "\x1b[0m" // reset
const DIM = "\x1b[2m" // dim / gray
const B = "\x1b[1m" // bold

function dim(s: string) {
  return `${DIM}${s}${R}`
}
function bold(s: string) {
  return `${B}${s}${R}`
}
function color(code: number, s: string) {
  return `\x1b[${code}m${s}${R}`
}

const green = (s: string) => color(32, s)
const yellow = (s: string) => color(33, s)
const blue = (s: string) => color(34, s)
const cyan = (s: string) => color(36, s)
const red = (s: string) => color(31, s)
const white = (s: string) => color(37, s)

/* ── Formatters ─────────────────────────────────────── */
function fmtMethod(method: string): string {
  const pad = method.padEnd(6) // "POST  ", "GET   ", …
  switch (method) {
    case "GET":
      return bold(cyan(pad))
    case "POST":
      return bold(blue(pad))
    case "PUT":
    case "PATCH":
      return bold(yellow(pad))
    case "DELETE":
      return bold(red(pad))
    case "OPTIONS":
      return dim(pad)
    default:
      return bold(white(pad))
  }
}

function fmtStatus(status: number): string {
  const s = String(status)
  if (status >= 500) return bold(red(s))
  if (status >= 400) return bold(yellow(s))
  if (status >= 300) return cyan(s)
  return green(s)
}

function fmtDuration(ms: number): string {
  const label = ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
  if (ms < 100) return green(label)
  if (ms < 500) return yellow(label)
  return red(label)
}

/** HH:MM:SS.mmm — local time, tight format */
function fmtTime(): string {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, "0")
  const mm = String(now.getMinutes()).padStart(2, "0")
  const ss = String(now.getSeconds()).padStart(2, "0")
  const ms = String(now.getMilliseconds()).padStart(3, "0")
  return dim(`${hh}:${mm}:${ss}.${ms}`)
}

/** Truncate long paths for readability */
function fmtPath(path: string): string {
  return path.length > 60 ? `${path.slice(0, 57)}…` : path
}

/* ── Middleware ─────────────────────────────────────── */
const SKIP_PATHS = new Set(["/api/health", "/health"])

export async function loggerMiddleware(ctx: Context, next: Next): Promise<void> {
  if (SKIP_PATHS.has(ctx.path)) {
    await next()
    return
  }

  const time = fmtTime()
  const meth = fmtMethod(ctx.method)
  const path = fmtPath(ctx.path)

  process.stdout.write(`  ${dim("→")}  ${time}  ${meth}  ${path}\n`)

  const start = Date.now()
  await next()
  const ms = Date.now() - start

  /* Path padded to 42 chars so status column stays aligned */
  const pathPadded = path.padEnd(42)

  process.stdout.write(
    `  ${dim("←")}  ${fmtTime()}  ${meth}  ${pathPadded}  ${fmtStatus(ctx.status)}  ${fmtDuration(ms)}\n`
  )
}
