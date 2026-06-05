/**
 * API Gateway — unified entry point for all server services.
 *
 * Routes:
 *   /api/chat      → @agent-learning/chat   (localhost:4000)
 *   /api/*         → @agent-learning/api    (localhost:4001)
 *   /health        → aggregated health check
 *
 * Frontend only needs to know about one URL: http://localhost:8080
 * In production, Nginx or a cloud load balancer replaces this.
 *
 * Why http-proxy over a Koa middleware proxy?
 *   http-proxy preserves request streaming end-to-end.
 *   The /api/chat endpoint returns a DataStream (SSE); a body-buffering
 *   Koa proxy would break it. http-proxy pipes at the TCP level.
 */

import "dotenv/config"
import http from "http"
import Koa from "koa"
import Router from "@koa/router"
import cors from "@koa/cors"
import httpProxy from "http-proxy"
import { loggerMiddleware } from "@agent-learning/server-shared"
import type { Context } from "koa"

/* ── Config ────────────────────────────────────────── */
const PORT = Number(process.env["PORT"] ?? 8080)
const CHAT_ORIGIN = process.env["CHAT_SERVICE_URL"] ?? "http://localhost:4000"
const API_ORIGIN = process.env["API_SERVICE_URL"] ?? "http://localhost:4001"
const ALLOWED_ORIGINS = (process.env["ALLOWED_ORIGINS"] ?? "http://localhost:3000").split(",").map((o) => o.trim())

/* ── Proxy instances ────────────────────────────────
   One proxy per upstream so error handling is isolated. */
const chatProxy = httpProxy.createProxyServer({
  target: CHAT_ORIGIN,
  changeOrigin: true,
  selfHandleResponse: false, // stream directly — critical for SSE
})

const apiProxy = httpProxy.createProxyServer({
  target: API_ORIGIN,
  changeOrigin: true,
})

function attachProxyErrors(proxy: httpProxy, name: string): void {
  proxy.on("error", (err, _req, res) => {
    console.error(`[gateway] proxy error (${name}):`, err.message)
    if (res instanceof http.ServerResponse && !res.headersSent) {
      res.writeHead(502)
      res.end(JSON.stringify({ ok: false, error: `${name} unavailable`, code: "BAD_GATEWAY" }))
    }
  })
}

attachProxyErrors(chatProxy, "chat")
attachProxyErrors(apiProxy, "api")

/* ── Koa app ────────────────────────────────────────
   Only sets up CORS, logging, and the router.
   Actual proxying happens via Node's http.Server
   `upgrade` + `request` events, bypassing Koa body parsing. */
const app = new Koa()
const router = new Router()

app.use(loggerMiddleware)
app.use(
  cors({
    origin: (ctx: Context) => {
      const o = ctx.get("Origin")
      return ALLOWED_ORIGINS.includes(o) ? o : ""
    },
    credentials: true,
  })
)

/* ── Aggregated health check ────────────────────────  */
router.get("/health", async (ctx) => {
  async function probe(name: string, url: string): Promise<{ name: string; ok: boolean }> {
    try {
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(2000) })
      return { name, ok: res.ok }
    } catch {
      return { name, ok: false }
    }
  }

  const [chatHealth, apiHealth] = await Promise.all([probe("chat", CHAT_ORIGIN), probe("api", API_ORIGIN)])

  const allOk = chatHealth.ok && apiHealth.ok
  ctx.status = allOk ? 200 : 503
  ctx.body = {
    ok: allOk,
    service: "@agent-learning/gateway",
    upstreams: [chatHealth, apiHealth],
    timestamp: new Date().toISOString(),
  }
})

app.use(router.routes()).use(router.allowedMethods())

/* ── HTTP server — proxy routing at request level ───
   We intercept before Koa reads the body so streaming
   requests are not buffered.                          */
const server = http.createServer(app.callback())

server.on("request", (req, res) => {
  const url = req.url ?? "/"

  /* /api/chat* and /api/health handled by Koa router;
     everything else is proxied to the correct upstream. */
  if (url.startsWith("/api/chat")) {
    chatProxy.web(req, res)
    return
  }
  if (url.startsWith("/api/")) {
    apiProxy.web(req, res)
    return
  }

  /* Let Koa handle /health and unknown routes */
  app.callback()(req, res)
})

/* Forward WebSocket upgrades (future) */
server.on("upgrade", (req, socket, head) => {
  const url = req.url ?? "/"
  if (url.startsWith("/api/chat")) {
    chatProxy.ws(req, socket, head)
  }
})

/* ── Boot ───────────────────────────────────────────  */
server.listen(PORT, () => {
  console.log(`[@agent-learning/gateway] http://localhost:${PORT}`)
  console.log(`  /api/chat  → ${CHAT_ORIGIN}`)
  console.log(`  /api/*     → ${API_ORIGIN}`)
  console.log(`  /health    → aggregated`)
})
