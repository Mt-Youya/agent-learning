import Router from "@koa/router"
import { validateParams } from "@agent-learning/server-shared"
import { list, show } from "../controllers/chapters.controller.js"
import { SlugParamsSchema } from "../schemas/chapters.schema.js"

export const chaptersRouter = new Router()

chaptersRouter.get("/chapters", list)
chaptersRouter.get("/chapters/:slug", validateParams(SlugParamsSchema), show)
