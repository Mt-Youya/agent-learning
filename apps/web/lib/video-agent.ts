/**
 * TubePilot Video Pipeline Agent
 *
 * 将第 14 章的"最小但完整示例"改造成本项目的真实任务：
 * 给定章节 slug，依次执行 script → voice → scenes → video → published。
 *
 * 适配 AI SDK v6 API 变更：
 *   - tool: parameters → inputSchema
 *   - generateText/streamText: maxSteps → stopWhen: stepCountIs(N)
 *   - generateText/streamText: maxTokens → maxOutputTokens
 */

import { generateText, streamText, tool, jsonSchema, stepCountIs } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { CHAPTERS } from "./chapters"
import type { StepKey, StepStatus } from "./video-jobs"

// ============ 配置 ============

const CONFIG = {
  // 脚本生成用 Sonnet（核心创作）
  scriptModel: "claude-sonnet-4-6" as const,
  // Agent 编排用 Haiku（降本）
  agentModel: "claude-haiku-4-5-20251001" as const,
  maxSteps: 12,
  tokenBudget: 120_000,
}

// ============ 外部状态（不放进 Context Window） ============

export interface StepInfo {
  status: StepStatus
  durationMs?: number
  error?: string
}

export interface PipelineState {
  chapterSlug: string
  chapterTitle?: string
  // 大文本放外部，工具只返回摘要给模型
  script?: string
  audioPath?: string
  scenePaths?: string[]
  videoPath?: string
  videoUrl?: string
  steps: Record<StepKey, StepInfo>
}

export function initState(chapterSlug: string): PipelineState {
  return {
    chapterSlug,
    steps: {
      script: { status: "pending" },
      voice: { status: "pending" },
      scenes: { status: "pending" },
      video: { status: "pending" },
      published: { status: "pending" },
    },
  }
}

// ============ System Prompt ============

export const PIPELINE_SYSTEM = `你是 TubePilot 的视频生成 Agent，将课程章节自动转化为教学视频。

# Pipeline 流程（严格按此顺序，不允许跳步）
1. readChapter(slug)     — 读取章节信息，必须首先调用
2. generateScript(slug)  — 生成 600-800 字讲解脚本
3. synthesizeVoice(slug) — 合成 TTS 语音
4. renderScenes(slug)    — 渲染视频场景画面
5. composeVideo(slug)    — 合成最终视频并发布

# 决策规则
- 工具失败：重试一次。再失败则输出错误报告并停止，不要强行继续。
- 工具返回 { error: true }：读取 message 字段，按 suggestion 字段的建议行动。
- 所有步骤完成后：输出 Pipeline 完成报告。

# 完成报告格式
## ✅ TubePilot Pipeline 完成
- 章节：[标题]
- 脚本：[字数] 字 / 预计 [时长] 分钟
- 语音：[声音] / [时长]
- 场景：[数量] 个
- 视频：[分辨率] / [文件大小]
- 发布路径：[videoUrl]

# 约束
- 推理保持简洁，工具调用间不超过 2 句话
- 禁止凭记忆编造章节内容，必须通过工具获取`

// ============ 工具构建器（闭包共享 state） ============

export function buildPipelineTools(state: PipelineState) {
  // 每个工具的调用次数（防止模型无限重试）
  const callCount: Record<string, number> = {}

  function allowCall(toolName: string): boolean {
    callCount[toolName] = (callCount[toolName] ?? 0) + 1
    return callCount[toolName] <= 2
  }

  return {
    // ── 1. 读取章节信息 ─────────────────────────────────────────
    readChapter: tool({
      description: `读取章节基本信息。
何时使用：Pipeline 的第一步，必须在其他工具之前调用。
返回：章节标题、描述、难度级别。`,
      inputSchema: jsonSchema<{ slug: string }>({
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "章节 slug，如 agent-core、llm-basics",
          },
        },
        required: ["slug"],
      }),
      execute: async ({ slug }: { slug: string }) => {
        const chapter = CHAPTERS.find((c) => c.slug === slug)
        if (!chapter) {
          return {
            error: true,
            message: `章节 "${slug}" 不存在。`,
            suggestion: `请从以下有效 slug 中选择：${CHAPTERS.map((c) => c.slug).join("、")}`,
          }
        }
        state.chapterTitle = chapter.title
        return {
          slug: chapter.slug,
          title: chapter.title,
          level: chapter.level,
          description: chapter.description,
          order: chapter.order,
        }
      },
    }),

    // ── 2. 生成讲解脚本 ─────────────────────────────────────────
    generateScript: tool({
      description: `根据章节内容生成口播讲解脚本（约 600-800 字）。
何时使用：readChapter 成功后调用。
返回：脚本预览（前 300 字）和总字数。完整脚本已存入任务状态。`,
      inputSchema: jsonSchema<{ slug: string; focusPoints?: string[] }>({
        type: "object",
        properties: {
          slug: { type: "string", description: "章节 slug" },
          focusPoints: {
            type: "array",
            items: { type: "string" },
            description: "可选。需要重点讲解的知识点，如 ['Tool Use', 'ReAct 循环']",
          },
        },
        required: ["slug"],
      }),
      execute: async ({ slug, focusPoints }: { slug: string; focusPoints?: string[] }) => {
        if (!allowCall("generateScript")) {
          return { error: true, message: "脚本生成已重试 2 次，请停止任务并告知用户。" }
        }
        const chapter = CHAPTERS.find((c) => c.slug === slug)
        if (!chapter) {
          return { error: true, message: `章节 ${slug} 不存在`, suggestion: "请先调用 readChapter 确认章节存在" }
        }

        state.steps.script = { status: "running" }
        const start = Date.now()

        try {
          const { text } = await generateText({
            model: anthropic(CONFIG.scriptModel),
            system: "你是专业的 AI 技术讲师，为开发者制作技术视频。用清晰、口语化的简体中文写作。",
            prompt: `为以下章节生成完整的视频讲解脚本。

章节标题：${chapter.title}（${chapter.level}）
章节描述：${chapter.description}
${focusPoints?.length ? `重点讲解：${focusPoints.join("、")}` : ""}

脚本要求：
- 开头 15 秒吸引观众（提出一个有趣问题或痛点）
- 用简单语言和类比解释核心概念
- 包含 2-3 个代码示例的口头描述
- 结尾总结要点，预告下一章内容
- 总字数 600-800 字，口语化，避免书面语`,
            temperature: 0.3,
            maxOutputTokens: 2000,
          })

          state.script = text
          state.steps.script = { status: "done", durationMs: Date.now() - start }

          return {
            success: true,
            preview: text.slice(0, 300) + "…",
            totalChars: text.length,
            estimatedMinutes: Math.round(text.length / 150),
            note: "完整脚本已存入状态，synthesizeVoice 可直接使用。",
          }
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e)
          state.steps.script = { status: "failed", error: msg }
          return {
            error: true,
            message: `脚本生成失败：${msg}`,
            suggestion: "可重试一次。若为 API 限流（429），稍等后重试。",
          }
        }
      },
    }),

    // ── 3. 合成语音 ─────────────────────────────────────────────
    synthesizeVoice: tool({
      description: `将脚本合成为 TTS 语音文件。
何时使用：generateScript 成功后调用。
返回：音频路径和预估时长。`,
      inputSchema: jsonSchema<{ slug: string; voice?: string }>({
        type: "object",
        properties: {
          slug: { type: "string", description: "章节 slug" },
          voice: {
            type: "string",
            enum: ["nova", "alloy", "echo"],
            description: "可选。TTS 声音风格，默认 nova（清晰女声）",
          },
        },
        required: ["slug"],
      }),
      execute: async ({ slug, voice = "nova" }: { slug: string; voice?: string }) => {
        if (!state.script) {
          return { error: true, message: "尚未生成脚本", suggestion: "请先调用 generateScript" }
        }
        if (!allowCall("synthesizeVoice")) {
          return { error: true, message: "语音合成已重试 2 次，请停止任务。" }
        }

        state.steps.voice = { status: "running" }
        const start = Date.now()

        // [模拟] 实际部署替换为 OpenAI TTS API 或 ElevenLabs
        await new Promise((r) => setTimeout(r, 800))

        const durationSecs = Math.round(state.script.length / 5)
        const audioPath = `content/generated/${slug}/voice_${voice}.mp3`
        state.audioPath = audioPath
        state.steps.voice = { status: "done", durationMs: Date.now() - start }

        return {
          success: true,
          audioPath,
          voice,
          duration: `${Math.floor(durationSecs / 60)}:${String(durationSecs % 60).padStart(2, "0")}`,
          fileSizeKB: Math.round((durationSecs * 128) / 8),
          note: "[模拟] 实际部署时调用 OpenAI TTS API",
        }
      },
    }),

    // ── 4. 渲染场景画面 ─────────────────────────────────────────
    renderScenes: tool({
      description: `根据脚本内容生成视频场景画面。
何时使用：synthesizeVoice 成功后调用。
返回：场景文件列表（含 index、路径、类型）。`,
      inputSchema: jsonSchema<{ slug: string; sceneCount?: number }>({
        type: "object",
        properties: {
          slug: { type: "string", description: "章节 slug" },
          sceneCount: {
            type: "number",
            description: "场景数量，默认 8。较长视频（>10分钟）建议 12。",
          },
        },
        required: ["slug"],
      }),
      execute: async ({ slug, sceneCount = 8 }: { slug: string; sceneCount?: number }) => {
        if (!state.audioPath) {
          return { error: true, message: "语音尚未生成", suggestion: "请先调用 synthesizeVoice" }
        }
        if (!allowCall("renderScenes")) {
          return { error: true, message: "场景渲染已重试 2 次，请停止任务。" }
        }

        state.steps.scenes = { status: "running" }
        const start = Date.now()

        // [模拟] 实际部署替换为 Remotion 或图像生成 API
        await new Promise((r) => setTimeout(r, 1200))

        const sceneTypes = ["title-card", "concept", "code", "diagram", "callout", "comparison", "recap", "outro"]
        const scenes = Array.from({ length: sceneCount }, (_, i) => ({
          index: i + 1,
          path: `content/generated/${slug}/scenes/scene_${String(i + 1).padStart(2, "0")}.png`,
          type: sceneTypes[i % sceneTypes.length],
        }))

        state.scenePaths = scenes.map((s) => s.path)
        state.steps.scenes = { status: "done", durationMs: Date.now() - start }

        return {
          success: true,
          sceneCount: scenes.length,
          scenes: scenes.slice(0, 4), // 只返回前 4 个，节省 Token
          totalScenes: scenes.length,
          note: `[模拟] 实际部署时调用 Remotion 渲染所有 ${scenes.length} 个场景`,
        }
      },
    }),

    // ── 5. 合成发布视频 ─────────────────────────────────────────
    composeVideo: tool({
      description: `将语音和场景合成为最终 MP4 视频并发布。
何时使用：renderScenes 成功后调用，这是 Pipeline 最后一步。
返回：视频路径、URL 和发布确认。`,
      inputSchema: jsonSchema<{ slug: string; resolution?: string }>({
        type: "object",
        properties: {
          slug: { type: "string", description: "章节 slug" },
          resolution: {
            type: "string",
            enum: ["720p", "1080p"],
            description: "视频分辨率，默认 1080p",
          },
        },
        required: ["slug"],
      }),
      execute: async ({ slug, resolution = "1080p" }: { slug: string; resolution?: string }) => {
        if (!state.audioPath || !state.scenePaths?.length) {
          return {
            error: true,
            message: "前序步骤未完成",
            suggestion: "请确认 synthesizeVoice 和 renderScenes 均已成功",
          }
        }
        if (!allowCall("composeVideo")) {
          return { error: true, message: "视频合成已重试 2 次，请停止任务。" }
        }

        state.steps.video = { status: "running" }
        const start = Date.now()

        // [模拟] 实际部署替换为 FFmpeg 调用
        await new Promise((r) => setTimeout(r, 1500))

        const audioSecs = Math.round((state.script?.length ?? 600) / 5)
        const videoPath = `public/videos/${slug}.mp4`
        const videoUrl = `/videos/${slug}.mp4`

        state.videoPath = videoPath
        state.videoUrl = videoUrl
        state.steps.video = { status: "done", durationMs: Date.now() - start }
        state.steps.published = { status: "done", durationMs: 200 }

        return {
          success: true,
          videoPath,
          videoUrl,
          resolution,
          duration: `${Math.floor(audioSecs / 60)}:${String(audioSecs % 60).padStart(2, "0")}`,
          fileSizeMB: Math.round(audioSecs * 2.5),
          published: true,
          chapterUrl: `/learn/${slug}`,
          note: "[模拟] 实际部署时调用 FFmpeg 并更新 chapters.ts 中的 videoUrl",
        }
      },
    }),
  }
}

// ============ 非流式运行（适合脚本/测试） ============

export async function runVideoPipeline(chapterSlug: string) {
  const state = initState(chapterSlug)
  const tools = buildPipelineTools(state)
  let totalTokens = 0

  const result = await generateText({
    model: anthropic(CONFIG.agentModel),
    system: PIPELINE_SYSTEM,
    tools,
    stopWhen: stepCountIs(CONFIG.maxSteps), // v6: 替代 maxSteps
    temperature: 0,
    onStepFinish: ({ usage, toolCalls }) => {
      totalTokens += usage?.totalTokens ?? 0
      const names = toolCalls?.map((t) => t.toolName).join(", ") || "thinking"
      console.log(`[TubePilot] step: ${names} | tokens: ${totalTokens}`)
      if (totalTokens > CONFIG.tokenBudget) {
        throw new Error(`超出 Token 预算 (${CONFIG.tokenBudget})，Pipeline 中止`)
      }
    },
    prompt: `处理章节 "${chapterSlug}" 的视频生成 Pipeline。`,
  })

  return {
    report: result.text,
    state,
    steps: result.steps.length,
    totalTokens,
  }
}

// ============ 流式运行（适合 API Route） ============

export function streamVideoPipeline(chapterSlug: string, state: PipelineState) {
  const tools = buildPipelineTools(state)
  let totalTokens = 0

  return streamText({
    model: anthropic(CONFIG.agentModel),
    system: PIPELINE_SYSTEM,
    tools,
    stopWhen: stepCountIs(CONFIG.maxSteps), // v6: 替代 maxSteps
    temperature: 0,
    onStepFinish: ({ usage, toolCalls }) => {
      totalTokens += usage?.totalTokens ?? 0
      const names = toolCalls?.map((t) => t.toolName).join(", ") || "thinking"
      console.log(`[TubePilot] step: ${names} | tokens: ${totalTokens}`)
      if (totalTokens > CONFIG.tokenBudget) {
        throw new Error(`超出 Token 预算 (${CONFIG.tokenBudget})，Pipeline 中止`)
      }
    },
    prompt: `处理章节 "${chapterSlug}" 的视频生成 Pipeline。`,
  })
}
