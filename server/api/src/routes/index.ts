import Router from "@koa/router"
import { chaptersRouter } from "./chapters.route.js"

export const rootRouter = new Router()

/* Mount domain routers */
rootRouter.use("/api", chaptersRouter.routes(), chaptersRouter.allowedMethods())

/* Health — outside /api so gateway can probe without body parsing */
rootRouter.get("/health", (ctx) => {
  ctx.body = {
    ok: true,
    service: "@agent-learning/api",
    timestamp: new Date().toISOString(),
  }
})
