function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback
}

export const config = {
  port: Number(optional("PORT", "4001")),
  nodeEnv: optional("NODE_ENV", "development"),
  allowedOrigins: optional("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8080")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
} as const
