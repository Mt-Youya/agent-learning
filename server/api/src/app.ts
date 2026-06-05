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
