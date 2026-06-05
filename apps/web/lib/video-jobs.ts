export type StepKey = "script" | "voice" | "scenes" | "video" | "published"
export type StepStatus = "pending" | "running" | "done" | "failed"
export type OverallStatus = "done" | "running" | "failed" | "pending"

export interface PipelineStep {
  key: StepKey
  label: string
  labelZh: string
  status: StepStatus
  completedAt?: string /* ISO-8601 */
  durationMs?: number
}

export interface VideoJob {
  chapterSlug: string
  chapterTitle: string
  chapterOrder: number
  steps: PipelineStep[]
  updatedAt: string /* ISO-8601 */
  videoUrl?: string
}

/* ─── Derived status ────────────────────────────────── */
export function getOverallStatus(job: VideoJob): OverallStatus {
  if (job.steps.some((s) => s.status === "failed")) return "failed"
  if (job.steps.some((s) => s.status === "running")) return "running"
  if (job.steps.every((s) => s.status === "done")) return "done"
  return "pending"
}

/* ─── Step metadata ─────────────────────────────────── */
export const STEP_DEFS: {
  key: StepKey
  label: string
  labelZh: string
}[] = [
  { key: "script", label: "Script", labelZh: "脚本生成" },
  { key: "voice", label: "Voice", labelZh: "TTS 旁白" },
  { key: "scenes", label: "Scenes", labelZh: "画面生成" },
  { key: "video", label: "Video", labelZh: "视频合成" },
  { key: "published", label: "Published", labelZh: "发布" },
]

const TYPICAL_DURATIONS: Record<StepKey, number> = {
  script: 8_000,
  voice: 42_000,
  scenes: 120_000,
  video: 95_000,
  published: 3_000,
}

function makeSteps(statuses: StepStatus[]): PipelineStep[] {
  return STEP_DEFS.map((def, i) => ({
    ...def,
    status: statuses[i] ?? "pending",
    completedAt: statuses[i] === "done" ? new Date(Date.now() - (5 - i) * 3_600_000).toISOString() : undefined,
    durationMs: statuses[i] === "done" ? TYPICAL_DURATIONS[def.key] : undefined,
  }))
}

/* ─── Mock initial data ─────────────────────────────── */
export const INITIAL_JOBS: VideoJob[] = [
  {
    chapterSlug: "llm-basics",
    chapterTitle: "LLM 基础认知",
    chapterOrder: 1,
    steps: makeSteps(["done", "done", "done", "done", "done"]),
    updatedAt: new Date(Date.now() - 3 * 3_600_000).toISOString(),
    videoUrl: "/videos/llm-basics.mp4",
  },
  {
    chapterSlug: "js-ts-toolchain",
    chapterTitle: "JavaScript / TypeScript AI 工具链",
    chapterOrder: 2,
    steps: makeSteps(["done", "done", "running", "pending", "pending"]),
    updatedAt: new Date(Date.now() - 15 * 60_000).toISOString(),
  },
  {
    chapterSlug: "agent-core",
    chapterTitle: "Agent 核心概念",
    chapterOrder: 3,
    steps: makeSteps(["done", "done", "done", "failed", "pending"]),
    updatedAt: new Date(Date.now() - 45 * 60_000).toISOString(),
  },
  {
    chapterSlug: "agent-frameworks",
    chapterTitle: "Agent 框架实战",
    chapterOrder: 4,
    steps: makeSteps(["pending", "pending", "pending", "pending", "pending"]),
    updatedAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
  {
    chapterSlug: "multi-agent",
    chapterTitle: "Multi-Agent 系统设计",
    chapterOrder: 5,
    steps: makeSteps(["done", "done", "done", "done", "done"]),
    updatedAt: new Date(Date.now() - 1 * 3_600_000).toISOString(),
    videoUrl: "/videos/multi-agent.mp4",
  },
]

/* ─── Log line templates ─────────────────────────────── */
export const STEP_LOGS: Record<StepKey, string[]> = {
  script: [
    "读取章节内容: {slug}.mdx",
    "解析 frontmatter 和正文结构...",
    "发现 3 个代码块, 2 个 Callout 元素",
    "调用 LLM 生成讲解大纲 (gpt-4o-mini)...",
    "生成口播脚本 (约 840 字)...",
    "✓ 写入: content/generated/{slug}/script.md",
    "✓ 写入: content/generated/{slug}/storyboard.json",
  ],
  voice: [
    "加载脚本文件 (script.md)...",
    "调用 TTS API: openai/tts-1-hd (voice: nova)...",
    "合成旁白音频 (估算时长: 4:32)...",
    "生成时间戳对齐数据 (word-level)...",
    "写入字幕: content/generated/{slug}/subtitles.zh.srt",
    "✓ 写入: content/generated/{slug}/voice.mp3 (8.4 MB)",
  ],
  scenes: [
    "加载 storyboard.json (12 scenes)...",
    "[1/12] intro · title-card",
    "[2/12] concept · animated-diagram",
    "[3/12] code · syntax-highlight",
    "[4/12] concept · flow-chart",
    "[5/12] code · diff-view",
    "[6/12] callout · warning-box",
    "[7/12] concept · comparison-table",
    "[8/12] code · live-run",
    "[9/12] recap · bullet-list",
    "[10/12] callout · tip-box",
    "[11/12] outro · next-chapter",
    "[12/12] end · fade-out",
    "✓ 写入: content/generated/{slug}/scenes/ (12 files)",
  ],
  video: [
    "加载音频轨道 (voice.mp3 · 4:32)...",
    "加载画面素材 (12 scenes)...",
    "FFmpeg 合成开始 (codec: h264, fps: 30, res: 1920×1080)...",
    "Pass 1/2 · analyzing...",
    "Pass 2/2 · encoding...",
    "叠加字幕轨道 (SRT → ASS)...",
    "✓ 写入: public/videos/{slug}.mp4 (128.4 MB · 4:32)",
  ],
  published: [
    "校验视频文件完整性 (MD5)...",
    "更新章节元数据 (lib/chapters.ts)...",
    "写入 videoUrl: /videos/{slug}.mp4",
    "写入 videoDuration: 272 (seconds)",
    "✓ 已发布: /learn/{slug} 现在显示视频播放器",
  ],
}
