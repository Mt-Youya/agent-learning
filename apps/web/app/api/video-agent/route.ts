/**
 * POST /api/video-agent
 *
 * 接受章节 slug，启动 TubePilot Video Pipeline Agent。
 *
 * 兼容 @ai-sdk/react useChat hook：
 *   body = { messages: UIMessage[], chapterSlug: string }
 *
 * 以 UIMessageStream 格式流式返回 Agent 的文本输出，
 * 供前端 useChat 消费。
 */

import { type NextRequest } from "next/server"
import { initState, streamVideoPipeline } from "@/lib/video-agent"

export async function POST(req: NextRequest) {
  // useChat 会发 messages 数组，我们只需要 chapterSlug
  const body = (await req.json()) as {
    messages?: unknown[]
    chapterSlug?: string
  }

  const chapterSlug = body.chapterSlug
  if (!chapterSlug || typeof chapterSlug !== "string") {
    return Response.json({ error: "chapterSlug is required" }, { status: 400 })
  }

  const state = initState(chapterSlug)

  try {
    const result = streamVideoPipeline(chapterSlug, state)
    return result.toUIMessageStreamResponse()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return Response.json({ error: msg }, { status: 500 })
  }
}
