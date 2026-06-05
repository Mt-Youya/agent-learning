/**
 * Chapters Controller.
 * Params are Zod-validated by route-level middleware before this runs.
 */

import type { Context } from "koa"
import { listChapters, getChapter } from "../services/chapters.service.js"

export function list(ctx: Context): void {
  ctx.body = { ok: true, data: listChapters() }
}

export function show(ctx: Context): void {
  /* slug already validated by validateParams(SlugParamsSchema) */
  const { slug } = ctx.params as { slug: string }
  ctx.body = { ok: true, data: getChapter(slug) }
}
