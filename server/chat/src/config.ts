/**
 * Type-safe environment config for server/chat.
 * Fails fast at startup if required variables are missing.
 */

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback
}

export const config = {
  port: Number(optional("PORT", "4000")),
  nodeEnv: optional("NODE_ENV", "development"),
  /** Comma-separated list, e.g. "http://localhost:3000,https://agentlab.dev" */
  allowedOrigins: optional("ALLOWED_ORIGINS", "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  openai: {
    apiKey: optional("OPENAI_API_KEY", ""),
  },
  anthropic: {
    apiKey: optional("ANTHROPIC_API_KEY", ""),
  },

  /** Default model used when client doesn't specify one */
  defaultModel: optional("DEFAULT_MODEL", "gpt-4o-mini"),
  maxTokens: Number(optional("MAX_TOKENS", "2048")),
} as const

export type Config = typeof config
