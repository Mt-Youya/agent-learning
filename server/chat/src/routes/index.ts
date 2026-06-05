/**
 * Route aggregator — mounts all domain routers under /api.
 * Add new domain routers here; app.ts stays unchanged.
 */

import Router from "@koa/router"
import { chatRouter } from "./chat.route.js"

export const rootRouter = new Router()

rootRouter.use("/api", chatRouter.routes(), chatRouter.allowedMethods())
