import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { Nav } from "@/components/nav"
import { ReadingProgress } from "@/components/chapter/reading-progress"
import { ChapterSidebar } from "@/components/chapter/chapter-sidebar"
import { MobileSidebarTrigger } from "@/components/chapter/mobile-sidebar"
import { VideoPlayer } from "@/components/chapter/video-player"
import { CodeBlock } from "@/components/chapter/code-block"
import { Callout } from "@/components/chapter/callout"
import { ChapterComplete } from "@/components/chapter/chapter-complete"
import { RelatedChapters } from "@/components/chapter/related-chapters"
import { CHAPTERS, LLM_BASICS_TRANSCRIPT, getChapter, getAdjacentChapters } from "@/lib/chapters"

/* ─── Static params ─────────────────────────────────── */
export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ chapter: c.slug }))
}

/* ─── Metadata ──────────────────────────────────────── */
export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }): Promise<Metadata> {
  const { chapter: slug } = await params
  const chapter = getChapter(slug)
  if (!chapter) return {}
  return {
    title: `${chapter.title} — AgentLab`,
    description: chapter.description,
  }
}

/* ─── Demo code content ─────────────────────────────── */
const STREAM_CODE = `import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages,
    // 系统提示词约束模型角色
    system: "你是一个专业的 AI 助手，用简洁的中文回答问题。",
  });

  // 转换为可流式传输的 Response 对象
  return result.toDataStreamResponse();
}`

/* ─── Page ──────────────────────────────────────────── */
export default async function ChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
  const { chapter: slug } = await params
  const chapter = getChapter(slug)
  if (!chapter) notFound()

  const { prev, next } = getAdjacentChapters(slug)

  const relatedChapters = CHAPTERS.filter((c) => c.slug === prev?.slug || c.slug === next?.slug).slice(0, 2)

  /* Use LLM basics transcript for demo; real pages would load per-chapter */
  const transcript = LLM_BASICS_TRANSCRIPT

  return (
    <>
      {/* Fixed reading progress bar (z-60, above nav) */}
      <ReadingProgress />

      {/* Persistent top nav */}
      <Nav />

      {/* ── Mobile chapter header ───────────────────── */}
      <div
        className="lg:hidden sticky z-40 px-5 h-11 flex items-center justify-between"
        style={{
          top: "56px",
          backgroundColor: "var(--base)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono text-xs shrink-0 tabular-nums" style={{ color: chapter.trackColor }}>
            {String(chapter.order).padStart(2, "0")}
          </span>
          <span className="font-mono text-xs truncate" style={{ color: "var(--text-secondary)" }}>
            {chapter.title}
          </span>
        </div>
        <MobileSidebarTrigger chapters={CHAPTERS} currentSlug={slug} />
      </div>

      {/* ── 3-column layout ─────────────────────────── */}
      {/*
          Desktop: 240px sidebar | flex-1 content | 320px video panel
          Mobile:  single column (sidebars hidden, video above content)
      */}
      <div className="lg:grid max-w-[1440px] mx-auto" style={{ gridTemplateColumns: "240px minmax(0, 1fr) 320px" }}>
        {/* ── Left: chapter navigation ────────────── */}
        <aside className="hidden lg:block" style={{ borderRight: "1px solid var(--border-subtle)" }}>
          <ChapterSidebar chapters={CHAPTERS} currentSlug={slug} />
        </aside>

        {/* ── Center: chapter content ──────────────── */}
        <main className="min-w-0 px-6 sm:px-10 lg:px-12 py-10 pb-28">
          {/* Chapter header */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5">
              <span className="font-mono text-xs font-medium" style={{ color: chapter.trackColor }}>
                {chapter.level}
              </span>
              <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                {chapter.duration}
              </span>
              <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                第 {chapter.order} 章 / 共 {CHAPTERS.length} 章
              </span>
            </div>

            <h1
              className="text-[clamp(1.625rem,4vw,2.375rem)] font-light tracking-tight leading-tight mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              {chapter.title}
            </h1>

            <p
              className="font-mono text-[0.9375rem] leading-[1.7]"
              style={{ color: "var(--text-secondary)", maxWidth: "58ch" }}
            >
              {chapter.description}
            </p>
          </header>

          {/* Mobile video (full-width, above content) */}
          <div className="lg:hidden mb-8">
            <VideoPlayer videoUrl={chapter.videoUrl} transcript={transcript} defaultOpen={false} />
          </div>

          {/* ── MDX content (simulated) ──────────── */}
          <article className="chapter-prose">
            <h2>你会学到什么</h2>
            <ul>
              <li>Token 是什么，如何影响 API 计费与模型行为</li>
              <li>Context Window 的限制及实际开发中的应对策略</li>
              <li>Temperature 参数的控制方式与适用场景</li>
              <li>Prompt Engineering 的基本方法论</li>
              <li>用 Vercel AI SDK 实现第一个流式对话接口</li>
            </ul>

            <h2>什么是 Token</h2>
            <p>
              Token 是模型处理文本时的最小计算单位。它不等同于字符、词语或汉字，而是经过 Tokenizer
              算法切分后的文本片段。
            </p>
            <p>
              对于英文，一个常见单词通常对应一个 Token。对于中文，一个汉字通常对应 1–2 个
              Token。空格、标点、换行符各自也会占用 Token。
            </p>

            <Callout type="info">
              <strong>前端类比：</strong>
              把 Token 理解为 CSS 的字节数。模型处理 Token 就像浏览器解析样式文件一样， 每个 Token
              都要经过计算才能生成输出。Token 数量决定了响应速度和 API 费用。
            </Callout>

            <h2>Context Window</h2>
            <p>
              Context Window 是模型在单次调用中能够读取的最大 Token 数量。
              输入（Prompt）和输出（Completion）共用同一个窗口。
            </p>
            <p>
              GPT-4o-mini 的 Context Window 是 128K Token，约等于一本 200 页的技术书籍。
              超出限制的内容会被截断，通常是截断最早的消息，保留最近的对话。
            </p>

            <Callout type="warning">
              在多轮对话中，消息数组会随着对话增长。不主动管理消息长度，最终会触达 Context Window
              上限并产生截断错误。这是生产环境中最常见的 bug 之一， 需要在 Agent 架构设计阶段就考虑清楚。
            </Callout>

            <h2>Chat Completion API 基本用法</h2>
            <p>
              Vercel AI SDK 的 <code>streamText</code> 函数封装了 Chat Completion API， 并支持流式响应。以下是最小实现：
            </p>

            <CodeBlock lang="typescript" filename="app/api/chat/route.ts">
              {STREAM_CODE}
            </CodeBlock>

            <Callout type="tip">
              <code>toDataStreamResponse()</code> 将流转换为符合 Vercel AI SDK 数据流协议的 <code>Response</code>{" "}
              对象。配合前端的 <code>useChat()</code> hook， 可以零配置处理流式输出、错误状态和加载状态。
            </Callout>

            <h2>Temperature 参数</h2>
            <p>Temperature 控制输出的随机程度，取值范围通常是 0–2。</p>
            <ul>
              <li>
                <strong>0</strong>：确定性输出。相同输入永远返回相同结果。 适合代码生成、数据提取、结构化输出。
              </li>
              <li>
                <strong>0.7</strong>：默认值。在准确性和创造性之间平衡。 适合一般对话和问答场景。
              </li>
              <li>
                <strong>1.0 以上</strong>：高随机性。适合创意写作， 但容易出现逻辑跳跃或无意义输出。
              </li>
            </ul>
          </article>

          {/* ── Chapter footer ───────────────────── */}
          <div className="mt-14 pt-8 flex flex-col gap-8" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            {/* Completion button */}
            <ChapterComplete chapterSlug={slug} variant="default" />

            {/* Prev / Next navigation */}
            {(prev || next) && (
              <nav className="flex justify-between gap-4" aria-label="章节前后导航">
                {prev ? (
                  <a
                    href={`/learn/${prev.slug}`}
                    className="flex flex-col gap-1 group"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                      ← 上一章
                    </span>
                    <span className="font-mono text-sm transition-colors" style={{ color: "var(--text-secondary)" }}>
                      {prev.title}
                    </span>
                  </a>
                ) : (
                  <div />
                )}

                {next && (
                  <a
                    href={`/learn/${next.slug}`}
                    className="flex flex-col items-end gap-1 group"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                      下一章 →
                    </span>
                    <span className="font-mono text-sm transition-colors" style={{ color: "var(--text-secondary)" }}>
                      {next.title}
                    </span>
                  </a>
                )}
              </nav>
            )}
          </div>

          {/* Related chapters */}
          <RelatedChapters chapters={relatedChapters} />
        </main>

        {/* ── Right: sticky video + progress ────────── */}
        <aside className="hidden lg:flex flex-col" style={{ borderLeft: "1px solid var(--border-subtle)" }}>
          <div className="sticky flex flex-col gap-4 p-4" style={{ top: "56px" }}>
            <VideoPlayer videoUrl={chapter.videoUrl} transcript={transcript} defaultOpen={false} />

            <ChapterComplete chapterSlug={slug} variant="compact" />

            {/* Chapter position hint */}
            <p className="font-mono text-[0.6875rem] text-center" style={{ color: "var(--text-muted)" }}>
              第 {chapter.order} 章 / 共 {CHAPTERS.length} 章
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
