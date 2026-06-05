/**
 * Chat routes — URL patterns + Zod validation only.
 * No business logic. Controllers own that.
 */

import Router from "@koa/router"
import { validateBody } from "@agent-learning/server-shared"
import { chatCompletion, health } from "../controllers/chat.controller.js"
import { ChatBodySchema } from "../schemas/chat.schema.js"

export const chatRouter = new Router()

chatRouter.post("/chat", validateBody(ChatBodySchema), chatCompletion)
chatRouter.get("/health", health)
