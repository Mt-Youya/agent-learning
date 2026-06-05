/**
 * Chat Service — pure business logic, no HTTP knowledge.
 *
 * Responsibilities:
 *   - Select the correct AI provider based on model prefix
 *   - Call streamText with validated parameters
 *   - Return the AI SDK result object (caller owns response piping)
 *
 * Does NOT know about Koa context, HTTP status codes, or streams.
 */

import { streamText, type ModelMessage } from "ai"
import { openai, createOpenAI } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { AppError } from "@agent-learning/server-shared"
import { config } from "../config.js"

const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: config.deepseek.apiKey,
})

/* ── Model registry ────────────────────────────────────
   Add new providers here without touching controllers.  */
function resolveModel(modelId: string) {
  if (modelId.startsWith("claude-")) {
    if (!config.anthropic.apiKey) {
      throw new AppError("ANTHROPIC_API_KEY not configured", 503, "PROVIDER_UNAVAILABLE")
    }
    return anthropic(modelId)
  }
  if (modelId.startsWith("deepseek-")) {
    if (!config.deepseek.apiKey) {
      throw new AppError("DEEPSEEK_API_KEY not configured", 503, "PROVIDER_UNAVAILABLE")
    }
    return deepseek(modelId)
  }
  if (modelId.startsWith("gpt-") || modelId.startsWith("o1-") || modelId.startsWith("o3-")) {
    if (!config.openai.apiKey) {
      throw new AppError("OPENAI_API_KEY not configured", 503, "PROVIDER_UNAVAILABLE")
    }
    return openai(modelId)
  }
  throw AppError.badRequest(`Unsupported model: "${modelId}"`, "UNSUPPORTED_MODEL")
}

/* ── Request shape ─────────────────────────────────────  */
export interface ChatParams {
  messages: ModelMessage[]
  model?: string
  system?: string
  maxTokens?: number
  temperature?: number
}

/* ── Service method ────────────────────────────────────  */
export function streamChat(params: ChatParams) {
  const { messages, model = config.defaultModel, system, maxTokens = config.maxTokens, temperature } = params

  return streamText({
    model: resolveModel(model),
    messages,
    ...(system !== undefined ? { system } : {}),
    ...(maxTokens !== undefined ? { maxTokens } : {}),
    ...(temperature !== undefined ? { temperature } : {}),
  })
}
