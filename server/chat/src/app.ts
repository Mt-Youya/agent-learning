/**
 * Koa application factory for server/chat.
 *
 * Middleware stack (in order):
 *   1. errorMiddleware  — catch-all error → JSON response
 *   2. loggerMiddleware — request/response timing
 *   3. cors             — CORS headers from config.allowedOrigins
 *   4. koaBody          — JSON body parser
 *   5. rootRouter       — /api/* routes
 */

import Koa from "koa"
import cors from "@koa/cors"
import { koaBody } from "koa-body"
import { errorMiddleware, loggerMiddleware } from "@agent-learning/server-shared"
import { rootRouter } from "./routes/index.js"
import { config } from "./config.js"
import type { Context } from "koa"

function buildCorsOrigin(): cors.Options["origin"] {
  const allowed = new Set(config.allowedOrigins)
  return (ctx: Context) => {
    const origin = ctx.get("Origin")
    return allowed.has(origin) ? origin : ""
  }
}

export function createApp(): Koa {
  const app = new Koa()
  app.proxy = true

  app
    .use(errorMiddleware)
    .use(loggerMiddleware)
    .use(cors({ origin: buildCorsOrigin(), credentials: true }))
    .use(koaBody())
    .use(rootRouter.routes())
    .use(rootRouter.allowedMethods())

  return app
}
