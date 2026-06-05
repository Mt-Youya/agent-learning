# 前端工程师学习 AI Agent 完全指南

> 专为 React / Vue / TypeScript 前端工程师设计的 AI Agent 学习路线，包含 Python 速学、工具链配置、框架实战、Multi-Agent 架构设计全部细节。

---

## 目录

- [写在前面：为什么前端工程师有独特优势](#写在前面为什么前端工程师有独特优势)
- [整体学习路线图](#整体学习路线图)
- [阶段一：LLM 基础认知（1–2 周）](#阶段一llm-基础认知12-周)
- [阶段二：JS/TS 工具链（2–3 周）](#阶段二jsts-工具链23-周)
- [阶段三：Agent 核心概念（2–4 周）](#阶段三agent-核心概念24-周)
- [阶段四：Agent 框架实战（1–2 个月）](#阶段四agent-框架实战12-个月)
- [阶段五：Multi-Agent 进阶（持续学习）](#阶段五multi-agent-进阶持续学习)
- [Python 速学指南（给 JS 开发者）](#python-速学指南给-js-开发者)
- [开发环境配置](#开发环境配置)
- [推荐学习资源](#推荐学习资源)
- [值得关注的人](#值得关注的人)
- [实战项目推荐](#实战项目推荐)
- [常见误区与陷阱](#常见误区与陷阱)
- [附录：术语速查表](#附录术语速查表)

---

## 写在前面：为什么前端工程师有独特优势

很多人以为学 AI Agent 需要先补深度学习数学、学 Python、理解 Transformer 原理。**这是误解。** 前端工程师其实有几个天然优势：

| 你已经掌握的                     | 在 Agent 中的对应         |
| -------------------------------- | ------------------------- |
| 异步编程（async/await, Promise） | Agent Loop 的异步 I/O     |
| 事件驱动思维                     | Tool Use 的回调机制       |
| 状态管理（Redux, Zustand）       | Agent 的 State 管理       |
| API 调用与错误处理               | LLM API 调用              |
| 组件化/模块化思维                | Subagent 拆分             |
| TypeScript 类型系统              | Pydantic / Zod 结构化输出 |
| React 的单向数据流               | LangGraph 的状态流转      |

**你不需要**：深度学习数学、GPU 编程、训练模型、理解 Transformer 内部结构。

**你只需要**：理解 LLM 的 API 使用方式、掌握 Tool Use 机制、学会用框架编排 Agent。

---

## 整体学习路线图

```
阶段 1           阶段 2           阶段 3           阶段 4           阶段 5
[LLM 基础]  →  [JS 工具链]  →  [Agent 概念]  →  [框架实战]  →  [Multi-Agent]
 1–2 周          2–3 周          2–4 周          1–2 月          持续学习

Token/Context   Vercel AI SDK   Tool Use        LangGraph.js    Orchestrator
Prompt Eng.     generateObject  ReAct Loop      Mastra          RAG Pipeline
Temperature     streamText      Memory Types    MCP Server      Observability
消息结构         useChat         Planning        LangChain.js    Evals
```

**核心原则**：不要等学完一个阶段再进入下一个。阶段 1–2 可以并行，阶段 3 开始就应该有真实代码在跑。**边做边学永远比先学后做效率高。**

---

## 阶段一：LLM 基础认知（1–2 周）

### 1.1 Token 与分词

LLM 处理的最小单位不是字符，而是 **Token**。理解 Token 是理解计费、Context 限制、性能优化的基础。

**Token 数量参考：**

| 内容类型             | 大约 Token 数    |
| -------------------- | ---------------- |
| 1 个英文单词         | 1–2 tokens       |
| 1 个汉字             | 1–2 tokens       |
| 1 个标点符号         | 1 token          |
| 100 个汉字           | ~150 tokens      |
| 1000 个英文单词      | ~1300 tokens     |
| 一页 A4 文档（中文） | ~800–1200 tokens |

**工具**：[OpenAI Tokenizer](https://platform.openai.com/tokenizer) 可以可视化任意文本的 Token 分割。

**为什么重要**：

- API 按 Token 数量计费（输入 + 输出分开计）
- 每个模型有最大 Context Window 限制
- Agent 的所有"记忆"都在 Context Window 里，超出就被截断

### 1.2 Context Window

Context Window 是模型一次能处理的最大 Token 数，相当于模型的**工作记忆**。

| 模型              | Context Window             |
| ----------------- | -------------------------- |
| Claude 3.5 Sonnet | 200,000 tokens ≈ 15 万汉字 |
| Claude 3 Opus     | 200,000 tokens             |
| GPT-4o            | 128,000 tokens             |
| Gemini 1.5 Pro    | 1,000,000 tokens           |

**前端类比**：把 Context Window 想成 React 的 `state`。所有运行时信息（对话历史、工具调用记录、文档内容）都在这里。超出限制就像内存溢出——早期数据被丢弃。

**实际影响**：

- Agent 执行多步任务时，每步的工具调用结果都会累积在 Context 里
- 对话轮次越多，Context 越长，成本越高，延迟越大
- 长任务需要考虑 **Context 压缩**策略（总结历史、滑动窗口）

### 1.3 Temperature 与采样参数

| 参数          | 作用                                   | 推荐值（Agent） |
| ------------- | -------------------------------------- | --------------- |
| `temperature` | 控制随机性。0 = 完全确定，2 = 极度随机 | 0–0.3           |
| `top_p`       | 控制候选词范围（与 temperature 配合）  | 默认即可        |
| `max_tokens`  | 限制单次输出最大 Token 数              | 根据任务设置    |
| `stop`        | 遇到特定字符串时停止生成               | 结构化任务可用  |

**实际建议**：

- 代码生成、结构化数据提取、Tool Use → `temperature: 0`
- 内容创作、创意写作 → `temperature: 0.7–1.0`
- Agent 推理步骤 → `temperature: 0–0.3`（需要可重现性）

### 1.4 消息结构（Messages API）

所有现代 LLM 都使用统一的 **Chat Completion** 格式：

```typescript
const messages = [
  {
    role: "system", // 全局行为定义，相当于 CSS 全局变量
    content: "你是 TubePilot 的 AI 助手，专门处理 YouTube 视频内容。",
  },
  {
    role: "user", // 用户输入
    content: "帮我分析这个视频的主要内容",
  },
  {
    role: "assistant", // 模型的历史输出（用于保持对话连贯性）
    content: "好的，请提供视频 ID 或字幕内容...",
  },
  {
    role: "user",
    content: "视频 ID: dQw4w9WgXcQ",
  },
]
```

**三种角色的职责**：

- **system**：定义 Agent 的性格、能力边界、输出格式要求。这里写得越详细，模型表现越稳定。
- **user**：每次用户的输入。
- **assistant**：模型的历史输出。你需要把之前的对话历史完整地传入，模型才能"记住"上下文（因为模型本身是无状态的）。

### 1.5 Prompt Engineering 核心技巧

#### Zero-shot（直接描述）

```
将以下 YouTube 视频字幕翻译成简体中文，保持原意，语句通顺。
```

适合：简单明确的任务。

#### Few-shot（给示例）

```
将以下字幕翻译成中文。示例：

原文：The quick brown fox jumps over the lazy dog.
译文：那只敏捷的棕色狐狸跳过了那只懒狗。

原文：She sells seashells by the seashore.
译文：她在海边卖贝壳。

现在翻译：
原文：[待翻译内容]
```

适合：需要特定风格或格式的任务。Few-shot 是提升输出稳定性的最有效方法之一。

#### Chain-of-Thought（思维链）

```
请先分析这段字幕的主题和语气，然后再进行翻译。
分析：[让模型先推理]
翻译：[再输出结果]
```

适合：复杂任务、需要推理的场景。研究表明，让模型先"想"再"说"能显著提升准确率。

#### XML 标签结构化（Claude 效果特别好）

```xml
请处理以下视频字幕：

<subtitle>
  <original_lang>English</original_lang>
  <content>
    [字幕内容]
  </content>
</subtitle>

要求：
<requirements>
  1. 翻译成简体中文
  2. 保留时间码格式
  3. 每行不超过 30 个汉字
</requirements>

输出格式：
<output>
  <translated_subtitle>[翻译结果]</translated_subtitle>
  <quality_score>[0-10 分]</quality_score>
</output>
```

适合：多输入多输出的复杂任务，Claude 对 XML 标签的理解能力特别强。

#### 负例提示（告诉模型不要做什么）

```
翻译以下字幕，注意：
- 不要使用机器翻译腔（不要逐字对应）
- 不要省略任何信息
- 不要添加原文没有的内容
- 不要使用繁体字
```

适合：有明确禁忌的场景，往往比只写正面要求更有效。

### 1.6 阶段一自测清单

- [ ] 能解释 100 个汉字大约消耗多少 Token，以及为什么 Context 越长成本越高
- [ ] 能在 Anthropic Console 里写一个 System Prompt，让模型扮演特定角色
- [ ] 知道 temperature: 0 和 temperature: 1 的适用场景区别
- [ ] 能写一个 Few-shot Prompt，让模型稳定输出 JSON 格式的数据
- [ ] 理解为什么要把历史消息完整传入 API（模型本身无状态）

---

## 阶段二：JS/TS 工具链（2–3 周）

### 2.1 Vercel AI SDK — 前端首选

Vercel AI SDK 是目前最适合前端工程师的 AI 开发工具，提供统一接口支持多个 LLM 提供商。

**安装：**

```bash
pnpm add ai @ai-sdk/anthropic @ai-sdk/openai zod
```

#### 2.1.1 `generateText` — 基础文本生成

```typescript
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

const { text, usage } = await generateText({
  model: anthropic("claude-sonnet-4-20250514"),
  system: "你是 TubePilot 的内容分析助手。",
  prompt: "请总结这段视频的核心内容：[字幕内容]",
  temperature: 0,
  maxTokens: 500,
})

console.log(text) // 生成的文本
console.log(usage.totalTokens) // 本次消耗的 Token 数
```

#### 2.1.2 `streamText` — 流式输出（聊天界面必用）

```typescript
import { streamText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

// 在 Next.js App Router 的 Route Handler 中
export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: "你是 TubePilot 的智能助手。",
    messages, // 完整对话历史
  })

  return result.toDataStreamResponse()
}
```

#### 2.1.3 `generateObject` — 结构化数据提取（重点！）

这是前端工程师最常用的功能之一。结合 Zod 实现完全类型安全的输出：

```typescript
import { generateObject } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"

// 定义期望的输出结构（和定义 Zod schema 完全一样）
const VideoMetadataSchema = z.object({
  titleZh: z.string().describe("视频标题（简体中文版）"),
  titleEn: z.string().describe("原英文标题"),
  tags: z.array(z.string()).max(5).describe("相关标签，最多 5 个"),
  summary: z.string().max(200).describe("150 字以内的视频摘要"),
  sentiment: z.enum(["positive", "neutral", "negative"]).describe("视频整体情感倾向"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).describe("内容难度"),
  keyPoints: z
    .array(
      z.object({
        point: z.string().describe("要点内容"),
        timestamp: z.string().optional().describe("对应时间戳，如 02:30"),
      })
    )
    .max(5)
    .describe("最多 5 个核心要点"),
})

type VideoMetadata = z.infer<typeof VideoMetadataSchema>

async function extractVideoMetadata(transcript: string): Promise<VideoMetadata> {
  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-20250514"),
    schema: VideoMetadataSchema,
    system: "你是视频内容分析专家，擅长从字幕中提取结构化信息。",
    prompt: `请分析以下视频字幕并提取元数据：\n\n${transcript}`,
    temperature: 0,
  })

  // object 完全类型安全，无需任何类型断言
  return object
}

// 使用示例
const metadata = await extractVideoMetadata(subtitleContent)
console.log(metadata.titleZh) // string
console.log(metadata.tags) // string[]（最多 5 个）
console.log(metadata.keyPoints) // { point: string, timestamp?: string }[]
```

#### 2.1.4 `useChat` — React 聊天 Hook

```tsx
"use client"
import { useChat } from "ai/react"

export default function ChatPage() {
  const {
    messages, // 完整消息历史
    input, // 当前输入框内容
    handleSubmit, // 提交处理函数
    setInput, // 更新输入框
    isLoading, // 是否正在生成
    error, // 错误信息
    reload, // 重新生成最后一条消息
    stop, // 停止生成
  } = useChat({
    api: "/api/chat", // 后端 Route Handler 路径
    initialMessages: [], // 初始消息
    onFinish: (message) => {
      // 生成完成回调
      console.log("生成完成:", message)
    },
    onError: (error) => {
      // 错误回调
      console.error("出错了:", error)
    },
  })

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-2xl p-3 rounded-lg ${
                message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-gray-400">AI 正在思考...</div>}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
          disabled={isLoading}
          className="flex-1 p-2 border rounded"
        />
        <button type="submit" disabled={isLoading}>
          发送
        </button>
        {isLoading && (
          <button type="button" onClick={stop}>
            停止
          </button>
        )}
      </form>
    </div>
  )
}
```

#### 2.1.5 多模型切换（统一接口）

```typescript
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { openai } from "@ai-sdk/openai"
import { google } from "@ai-sdk/google"

// 只需修改这一行就能切换模型
const MODEL = anthropic("claude-sonnet-4-20250514")
// const MODEL = openai('gpt-4o')
// const MODEL = google('gemini-1.5-pro')

const { text } = await generateText({
  model: MODEL, // 业务代码完全不用改
  prompt: "...",
})
```

### 2.2 直接使用 Anthropic SDK

如果不用 Vercel AI SDK，也可以直接用 Anthropic 官方 SDK：

```typescript
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// 基础调用
const message = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  system: "你是视频处理助手。",
  messages: [{ role: "user", content: "分析这段字幕..." }],
})

console.log(message.content[0].type === "text" ? message.content[0].text : "")

// 流式输出
const stream = client.messages.stream({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [{ role: "user", content: "..." }],
})

for await (const chunk of stream) {
  if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
    process.stdout.write(chunk.delta.text)
  }
}
```

### 2.3 环境变量配置

```bash
# .env.local（Next.js 项目）
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxx

# .gitignore 确保不提交
.env.local
.env*.local
```

```typescript
// 在代码里安全地访问（Next.js 服务端）
const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set")
```

### 2.4 错误处理最佳实践

```typescript
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { APICallError, RetryError } from "ai"

async function safeGenerate(prompt: string) {
  try {
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      prompt,
      maxRetries: 3, // AI SDK 内置重试
    })
    return { success: true, text }
  } catch (error) {
    if (error instanceof APICallError) {
      console.error("API 调用失败:", error.statusCode, error.message)
      // 429 = 限流，503 = 服务不可用
    } else if (error instanceof RetryError) {
      console.error("重试耗尽:", error.message)
    }
    return { success: false, text: null }
  }
}
```

### 2.5 阶段二自测清单

- [ ] 能在 Next.js App Router 中实现流式聊天界面（Server Action + useChat）
- [ ] 能用 `generateObject` + Zod 从字幕中提取类型安全的结构化数据
- [ ] 能在一段代码里切换 Claude / GPT-4o 两种模型，只改一行参数
- [ ] 了解 `usage` 对象，知道如何记录每次调用的 Token 消耗
- [ ] 能正确处理 API 限流错误（429）和服务不可用错误（503）

---

## 阶段三：Agent 核心概念（2–4 周）

### 3.1 什么是 AI Agent

**Agent 的最简定义**：一个能感知环境、做决策、采取行动的 AI 系统。

更具体的工程定义：**Agent = LLM + Tools + Loop**

```
User Input
    ↓
[LLM 推理] → 决定下一步
    ↓
需要信息/操作 → 调用工具
    ↓
[Tool 执行] → 返回结果
    ↓
[LLM 继续推理] → 基于新信息决策
    ↓
... 循环直到任务完成
    ↓
Final Answer → 返回给用户
```

**关键认知**：Agent 不是"更聪明的 ChatGPT"，而是一个**带有 AI 大脑的自动化脚本**。LLM 是循环中的推理引擎，工具调用是 I/O，你作为开发者定义工具的实现和边界。

### 3.2 Tool Use / Function Calling

Tool Use（也叫 Function Calling）是 Agent 能力的核心机制。

#### 3.2.1 完整调用流程

```
① 你定义工具
   → 工具名称、参数 schema、功能描述、执行函数

② LLM 读取工具清单
   → 理解每个工具能做什么、何时该用

③ LLM 决定调用哪个工具
   → 输出包含 tool_use 块的响应

④ 你的代码执行工具
   → 调用实际 API、数据库、文件系统等

⑤ 工具结果返回给 LLM
   → 作为 tool_result 消息加入对话历史

⑥ LLM 继续推理
   → 基于工具结果决定下一步，或给出最终答案

⑦ 重复 ③–⑥ 直到 LLM 认为任务完成
```

#### 3.2.2 用 Vercel AI SDK 实现 Tool Use

```typescript
import { generateText, tool } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"

const { text, steps } = await generateText({
  model: anthropic("claude-sonnet-4-20250514"),
  system: `你是 TubePilot 的内容处理 Agent。
你可以使用以下工具完成任务：
- getVideoInfo: 获取 YouTube 视频信息
- getSubtitles: 获取视频字幕
- translateText: 翻译文本
- checkQuality: 检查翻译质量

请根据用户需求，按需调用工具完成任务。`,

  tools: {
    // 工具 1：获取视频信息
    getVideoInfo: tool({
      description: "通过 YouTube 视频 ID 获取视频标题、描述、时长等基本信息",
      parameters: z.object({
        videoId: z.string().describe("YouTube 视频 ID，例如 dQw4w9WgXcQ"),
      }),
      execute: async ({ videoId }) => {
        // 实际调用你的业务逻辑
        const info = await fetchYouTubeVideoInfo(videoId)
        return {
          title: info.title,
          description: info.description,
          duration: info.duration,
          channelName: info.channelName,
        }
      },
    }),

    // 工具 2：获取字幕
    getSubtitles: tool({
      description: "获取 YouTube 视频的字幕内容，支持多种语言",
      parameters: z.object({
        videoId: z.string().describe("YouTube 视频 ID"),
        language: z.enum(["en", "zh-Hans", "zh-Hant", "ja", "ko"]).describe("字幕语言代码"),
      }),
      execute: async ({ videoId, language }) => {
        const subtitles = await fetchYouTubeSubtitles(videoId, language)
        return {
          content: subtitles.text,
          segments: subtitles.segments, // 带时间戳的分段
          language,
        }
      },
    }),

    // 工具 3：翻译文本
    translateText: tool({
      description: "将文本翻译成目标语言",
      parameters: z.object({
        text: z.string().describe("要翻译的文本内容"),
        targetLanguage: z.enum(["zh-Hans", "zh-Hant", "en", "ja"]).describe("目标语言"),
        style: z
          .enum(["formal", "casual", "subtitle"])
          .describe("翻译风格：formal=正式, casual=口语, subtitle=字幕风格"),
      }),
      execute: async ({ text, targetLanguage, style }) => {
        const translated = await callTranslationService(text, targetLanguage, style)
        return { translated, wordCount: translated.length }
      },
    }),

    // 工具 4：质量检查
    checkQuality: tool({
      description: "检查翻译质量，返回评分和改进建议",
      parameters: z.object({
        original: z.string().describe("原文"),
        translated: z.string().describe("译文"),
      }),
      execute: async ({ original, translated }) => {
        const result = await evaluateTranslationQuality(original, translated)
        return {
          score: result.score, // 0–10 分
          issues: result.issues, // 问题列表
          suggestions: result.suggestions, // 改进建议
        }
      },
    }),
  },

  maxSteps: 10, // Agent 最多运行 10 步（防止无限循环）
  prompt: "请处理视频 dQw4w9WgXcQ：获取视频信息和英文字幕，翻译成中文（字幕风格），并检查翻译质量。",
})

// steps 记录了 Agent 的完整运行轨迹，可用于调试
console.log(`Agent 共运行了 ${steps.length} 步`)
steps.forEach((step, i) => {
  if (step.toolCalls?.length > 0) {
    console.log(`Step ${i + 1}: 调用工具 ${step.toolCalls[0].toolName}`)
    console.log("  参数:", step.toolCalls[0].args)
    console.log("  结果:", step.toolResults?.[0]?.result)
  }
})
```

#### 3.2.3 工具描述的重要性

**工具的 `description` 字段是 Agent 性能的关键**。LLM 通过描述来决定何时调用工具、传什么参数。

```typescript
// ❌ 差的描述 — 模型不知道何时用、传什么
getSubtitles: tool({
  description: '获取字幕',
  parameters: z.object({ id: z.string() }),
  execute: async ({ id }) => { ... }
})

// ✅ 好的描述 — 清晰的触发条件、参数说明、返回内容
getSubtitles: tool({
  description: `从 YouTube 获取指定视频的字幕文本。

  使用场景：当用户需要翻译视频、分析视频内容、生成摘要时，首先调用此工具获取原始字幕。

  注意：如果视频没有字幕，此工具会返回错误，此时应告知用户并停止处理。
  返回格式：包含完整字幕文本和带时间戳的分段列表。`,
  parameters: z.object({
    videoId: z.string().describe('YouTube 视频 ID，从 URL 中提取，例如 youtube.com/watch?v=dQw4w9WgXcQ 中的 dQw4w9WgXcQ'),
    language: z.enum(['en', 'zh-Hans']).describe('字幕语言。优先使用 en（英文原版），如果原视频是中文则使用 zh-Hans'),
  }),
  execute: async ({ videoId, language }) => { ... }
})
```

### 3.3 ReAct 范式（Reason + Act）

ReAct 是目前最主流的 Agent 模式，LangChain 默认使用。

**核心循环：**

```
思考（Thought）：分析当前状态，决定下一步行动
行动（Action）：调用某个工具，传入参数
观察（Observation）：接收工具返回的结果
...重复...
最终答案（Final Answer）：任务完成，输出结果
```

**实际示例（模型的推理过程）**：

```
用户：处理视频 dQw4w9WgXcQ，翻译字幕。

Thought: 用户要处理视频，我需要先获取视频信息，了解基本内容。
Action: getVideoInfo(videoId="dQw4w9WgXcQ")
Observation: {title: "Never Gonna Give You Up", duration: "3:32", channel: "Rick Astley"}

Thought: 已获取视频信息，是一首 1987 年的英文歌曲。现在需要获取英文字幕。
Action: getSubtitles(videoId="dQw4w9WgXcQ", language="en")
Observation: {content: "We're no strangers to love...", segments: [...]}

Thought: 获取到字幕了。现在翻译成中文，歌词应该用 casual 风格。
Action: translateText(text="We're no strangers to love...", targetLanguage="zh-Hans", style="casual")
Observation: {translated: "我们对爱情并不陌生...", wordCount: 156}

Thought: 翻译完成。检查一下质量。
Action: checkQuality(original="We're no strangers...", translated="我们对爱情并不陌生...")
Observation: {score: 8.5, issues: [], suggestions: ["可将'爱情'改为'爱'使歌词更简洁"]}

Thought: 质量评分 8.5，还不错。任务完成，返回结果。
Final Answer: 视频《Never Gonna Give You Up》字幕翻译完成，质量评分 8.5/10。译文：我们对爱情并不陌生...
```

### 3.4 三种记忆类型

| 记忆类型     | 存储位置                                | 特点                                     | 适用场景                   |
| ------------ | --------------------------------------- | ---------------------------------------- | -------------------------- |
| **短期记忆** | Context Window                          | 当前对话历史，会话结束就消失             | 单次任务、对话状态         |
| **长期记忆** | 向量数据库（Supabase Vector, Pinecone） | 持久化，可语义检索                       | 用户偏好、历史记录、知识库 |
| **工作记忆** | 程序变量 / LangGraph State              | 当前任务的中间结果，任务完成后可选持久化 | 多步骤任务的中间状态       |

**什么时候需要引入向量数据库（长期记忆）**：

- 用户有大量历史处理记录，需要跨会话查询
- 有超过 Context Window 限制的文档需要检索
- 需要"记住"用户偏好（翻译风格、格式要求等）
- 知识库问答场景（RAG）

### 3.5 规划策略

#### 直接执行（Zero-shot）

```
"把这段字幕翻译成中文"
→ 直接调用翻译工具
```

适合：单步、目标明确的简单任务。

#### Plan-then-Execute（先规划再执行）

```
"处理这 50 个视频"
→ 第一步：LLM 生成处理计划
  [获取视频1字幕, 翻译视频1, 获取视频2字幕, ...]
→ 第二步：按计划逐步执行
```

适合：任务数量多、步骤可预测、需要并行处理的场景。

#### ReAct（边推理边行动，推荐）

```
"处理视频，确保质量达到 8 分以上"
→ 获取字幕 → 翻译 → 检查质量 → 如果低于 8 分则重新翻译 → 直到达标
```

适合：需要根据中间结果动态调整的复杂任务，适应性最强。

### 3.6 `maxSteps` 与无限循环防护

```typescript
// ❌ 危险：没有步数限制
const { text } = await generateText({
  model: anthropic('claude-sonnet-4-20250514'),
  tools: { ... },
  prompt: '...',
  // 没有 maxSteps！模型可能陷入循环，产生大量 Token 费用
})

// ✅ 安全：设置合理的步数上限
const { text } = await generateText({
  model: anthropic('claude-sonnet-4-20250514'),
  tools: { ... },
  prompt: '...',
  maxSteps: 10,  // 最多 10 步，超出则抛出错误

  // 可选：每步完成时的回调，用于监控和日志
  onStepFinish: ({ stepType, toolCalls, toolResults, finishReason, usage }) => {
    console.log(`步骤完成: ${stepType}, 原因: ${finishReason}`)
    console.log(`本步 Token: ${usage.totalTokens}`)
  },
})
```

**`maxSteps` 如何选择**：

- 简单 Agent（1–2 个工具）：`maxSteps: 5`
- 中等复杂度：`maxSteps: 10–15`
- 复杂多步骤任务：`maxSteps: 20–30`
- 超过 30 步要认真考虑是否需要拆分成子 Agent

### 3.7 阶段三自测清单

- [ ] 能徒手画出 Tool Use 的完整调用流程图
- [ ] 能用 Vercel AI SDK 实现一个带 2–3 个工具的 Agent，并通过 `steps` 调试
- [ ] 能写出高质量的工具 `description`，让模型准确判断调用时机
- [ ] 能解释短期/长期/工作记忆的区别和适用场景
- [ ] 能解释 `maxSteps` 的必要性，以及 Agent 陷入无限循环的常见原因

---

## 阶段四：Agent 框架实战（1–2 个月）

### 4.1 框架选型指南

| 需求场景                           | 推荐框架                      |
| ---------------------------------- | ----------------------------- |
| 简单 Agent，工具调用为主           | Vercel AI SDK（已掌握）       |
| 复杂工作流，需要条件分支/重试      | **LangGraph.js**              |
| 新项目，追求现代 TypeScript 体验   | **Mastra**                    |
| 扩展 Claude Code 能力              | **自定义 MCP Server**         |
| 学习 Agent 概念（可以接受 Python） | LangChain/LangGraph Python 版 |

### 4.2 LangGraph.js — 状态机式 Agent

LangGraph 把 Agent 的执行过程建模为**有向图**，解决了 Vercel AI SDK 无法处理的复杂场景：条件分支、循环重试、并行执行、状态持久化。

**安装：**

```bash
pnpm add @langchain/langgraph @langchain/core @langchain/anthropic
```

#### 4.2.1 核心概念

| 概念                 | 含义                            | 类比                  |
| -------------------- | ------------------------------- | --------------------- |
| **State**            | 在整个图中流转的共享数据        | React 的 global state |
| **Node**             | 处理节点（执行 LLM 调用或工具） | React 组件            |
| **Edge**             | 节点间的连接关系                | 组件间的数据流        |
| **Conditional Edge** | 根据状态决定走哪条路            | 条件渲染              |
| **Checkpoint**       | 状态快照，支持暂停和恢复        | Redux Persist         |

#### 4.2.2 完整示例：TubePilot 字幕处理工作流

```typescript
import { StateGraph, Annotation, END, START } from "@langchain/langgraph"
import { ChatAnthropic } from "@langchain/anthropic"
import { HumanMessage, AIMessage } from "@langchain/core/messages"

// ① 定义 State 结构（整个流程共享的数据）
const SubtitleWorkflowState = Annotation.Root({
  // 输入
  videoId: Annotation<string>(),
  targetLanguage: Annotation<string>({ default: () => "zh-Hans" }),

  // 中间状态
  videoInfo: Annotation<Record<string, string> | null>({ default: () => null }),
  originalSubtitles: Annotation<string | null>({ default: () => null }),
  translatedSubtitles: Annotation<string | null>({ default: () => null }),
  qualityScore: Annotation<number>({ default: () => 0 }),
  qualityIssues: Annotation<string[]>({ default: () => [] }),

  // 控制流
  retryCount: Annotation<number>({ default: () => 0 }),
  maxRetries: Annotation<number>({ default: () => 3 }),
  error: Annotation<string | null>({ default: () => null }),

  // 输出
  isComplete: Annotation<boolean>({ default: () => false }),
})

type WorkflowState = typeof SubtitleWorkflowState.State

// ② 定义节点函数（每个节点接收完整 state，返回部分 state）

// 节点 1：获取视频信息
async function fetchVideoInfo(state: WorkflowState): Promise<Partial<WorkflowState>> {
  try {
    const info = await getYouTubeVideoInfo(state.videoId)
    console.log(`✅ 获取视频信息成功: ${info.title}`)
    return { videoInfo: info }
  } catch (err) {
    return { error: `获取视频信息失败: ${err.message}` }
  }
}

// 节点 2：获取字幕
async function fetchSubtitles(state: WorkflowState): Promise<Partial<WorkflowState>> {
  try {
    const subtitles = await getYouTubeSubtitles(state.videoId, "en")
    console.log(`✅ 获取字幕成功，共 ${subtitles.length} 字符`)
    return { originalSubtitles: subtitles }
  } catch (err) {
    return { error: `获取字幕失败: ${err.message}` }
  }
}

// 节点 3：翻译字幕
async function translateSubtitles(state: WorkflowState): Promise<Partial<WorkflowState>> {
  if (!state.originalSubtitles) {
    return { error: "没有字幕可翻译" }
  }

  try {
    const model = new ChatAnthropic({ model: "claude-sonnet-4-20250514" })
    const response = await model.invoke([
      new HumanMessage(
        `请将以下英文字幕翻译成${state.targetLanguage === "zh-Hans" ? "简体中文" : state.targetLanguage}。
        要求：自然流畅，符合字幕风格，保留时间码格式。
        
        如果之前的翻译有以下问题，请改正：${state.qualityIssues.join("；")}
        
        字幕内容：
        ${state.originalSubtitles}`
      ),
    ])

    const translated = response.content as string
    console.log(`✅ 翻译完成（第 ${state.retryCount + 1} 次），共 ${translated.length} 字符`)
    return {
      translatedSubtitles: translated,
      retryCount: state.retryCount + 1,
    }
  } catch (err) {
    return { error: `翻译失败: ${err.message}` }
  }
}

// 节点 4：质量检查
async function checkTranslationQuality(state: WorkflowState): Promise<Partial<WorkflowState>> {
  if (!state.originalSubtitles || !state.translatedSubtitles) {
    return { error: "缺少原文或译文" }
  }

  const result = await evaluateTranslation(state.originalSubtitles, state.translatedSubtitles)
  console.log(`📊 质量评分: ${result.score}/10，问题: ${result.issues.join("；") || "无"}`)

  return {
    qualityScore: result.score,
    qualityIssues: result.issues,
  }
}

// 节点 5：发布（示例）
async function publishToBilibili(state: WorkflowState): Promise<Partial<WorkflowState>> {
  await uploadSubtitlesToBilibili(state.videoId, state.translatedSubtitles!)
  console.log(`🚀 发布成功！`)
  return { isComplete: true }
}

// 节点 6：错误处理
async function handleError(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.error(`❌ 工作流出错: ${state.error}`)
  // 可以在这里发送通知、记录日志等
  return { isComplete: true }
}

// ③ 定义条件路由函数

// 路由：发生错误时
function routeOnError(state: WorkflowState): string {
  if (state.error) return "error"
  return "continue"
}

// 路由：质量检查后的决策
function routeAfterQualityCheck(state: WorkflowState): string {
  if (state.error) return "error"
  if (state.qualityScore >= 8.0) return "publish" // 质量达标 → 发布
  if (state.retryCount < state.maxRetries) return "translate" // 未达标且有重试次数 → 重新翻译
  return "publish" // 达到最大重试次数 → 强制发布（或可改为 'error'）
}

// ④ 构建工作流图
const workflow = new StateGraph(SubtitleWorkflowState)
  // 添加节点
  .addNode("fetchVideoInfo", fetchVideoInfo)
  .addNode("fetchSubtitles", fetchSubtitles)
  .addNode("translate", translateSubtitles)
  .addNode("qualityCheck", checkTranslationQuality)
  .addNode("publish", publishToBilibili)
  .addNode("error", handleError)

  // 添加边（执行顺序）
  .addEdge(START, "fetchVideoInfo")
  .addConditionalEdges("fetchVideoInfo", routeOnError, {
    error: "error",
    continue: "fetchSubtitles",
  })
  .addConditionalEdges("fetchSubtitles", routeOnError, {
    error: "error",
    continue: "translate",
  })
  .addEdge("translate", "qualityCheck")
  .addConditionalEdges("qualityCheck", routeAfterQualityCheck, {
    publish: "publish",
    translate: "translate", // 循环回翻译节点！
    error: "error",
  })
  .addEdge("publish", END)
  .addEdge("error", END)

  // 编译
  .compile()

// ⑤ 运行工作流
async function processVideo(videoId: string) {
  const result = await workflow.invoke({
    videoId,
    targetLanguage: "zh-Hans",
    maxRetries: 3,
  })

  if (result.isComplete && !result.error) {
    console.log("✅ 处理成功！")
    return result.translatedSubtitles
  } else {
    console.error("❌ 处理失败:", result.error)
    return null
  }
}

// 运行
await processVideo("dQw4w9WgXcQ")
```

#### 4.2.3 Human-in-the-Loop（人工介入）

LangGraph 内置支持人工审批步骤：

```typescript
import { interrupt } from "@langchain/langgraph"

// 在发布节点中加入人工确认
async function publishWithHumanApproval(state: WorkflowState): Promise<Partial<WorkflowState>> {
  // interrupt() 会暂停工作流，等待外部输入
  const humanDecision = interrupt({
    message: "请审查以下翻译并决定是否发布",
    videoId: state.videoId,
    translatedSubtitles: state.translatedSubtitles,
    qualityScore: state.qualityScore,
  })

  if (humanDecision.approved) {
    await uploadSubtitlesToBilibili(state.videoId, state.translatedSubtitles!)
    return { isComplete: true }
  } else {
    return { error: "人工审核未通过", isComplete: true }
  }
}
```

### 4.3 Mastra — 现代 TypeScript Agent 框架

Mastra 是 2024 年快速崛起的 TypeScript-native Agent 框架，比 LangChain.js 更轻量，更贴合现代 TypeScript 习惯。

**安装与初始化：**

```bash
npm create mastra@latest
# 或
pnpm add @mastra/core
```

**基础 Agent：**

```typescript
import { Mastra, Agent, createTool } from "@mastra/core"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"

// 创建工具
const getSubtitlesTool = createTool({
  id: "getSubtitles",
  description: "获取 YouTube 视频字幕",
  inputSchema: z.object({
    videoId: z.string(),
    language: z.enum(["en", "zh-Hans"]),
  }),
  outputSchema: z.object({
    content: z.string(),
    wordCount: z.number(),
  }),
  execute: async ({ context }) => {
    const subtitles = await fetchYouTubeSubtitles(context.videoId, context.language)
    return { content: subtitles, wordCount: subtitles.length }
  },
})

// 创建 Agent
const subtitleAgent = new Agent({
  name: "SubtitleAgent",
  instructions: `你是 TubePilot 的字幕处理专家。
  任务：获取视频字幕并进行高质量翻译。
  原则：准确性优先，保持原意，符合字幕阅读习惯。`,
  model: anthropic("claude-sonnet-4-20250514"),
  tools: { getSubtitlesTool },
})

// 初始化 Mastra
const mastra = new Mastra({
  agents: { subtitleAgent },
})

// 运行 Agent
const result = await mastra.getAgent("subtitleAgent").generate("处理视频 dQw4w9WgXcQ，获取英文字幕并翻译成中文。")
console.log(result.text)
```

### 4.4 MCP Server 开发

Model Context Protocol（MCP）是 Anthropic 开发的工具标准化协议。你已经在用 Claude Code 通过 MCP 调用工具——现在是时候自己写 MCP Server 了。

**安装：**

```bash
pnpm add @modelcontextprotocol/sdk
```

**完整 MCP Server 示例（TubePilot 专用）：**

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"

// 创建 MCP Server
const server = new Server(
  {
    name: "tubepilot-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

// 注册工具列表
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_video_info",
      description: "获取 YouTube 视频的基本信息（标题、描述、时长、频道名等）",
      inputSchema: {
        type: "object",
        properties: {
          videoId: {
            type: "string",
            description: "YouTube 视频 ID（从 URL 中提取）",
          },
        },
        required: ["videoId"],
      },
    },
    {
      name: "get_subtitles",
      description: "获取 YouTube 视频的字幕内容",
      inputSchema: {
        type: "object",
        properties: {
          videoId: { type: "string", description: "YouTube 视频 ID" },
          language: {
            type: "string",
            enum: ["en", "zh-Hans", "ja", "ko"],
            description: "字幕语言",
          },
        },
        required: ["videoId"],
      },
    },
    {
      name: "publish_to_bilibili",
      description: "将处理完成的视频和字幕发布到 Bilibili",
      inputSchema: {
        type: "object",
        properties: {
          videoId: { type: "string", description: "YouTube 视频 ID" },
          title: { type: "string", description: "Bilibili 标题（中文）" },
          subtitles: { type: "string", description: "中文字幕内容" },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "视频标签",
          },
        },
        required: ["videoId", "title", "subtitles"],
      },
    },
    {
      name: "check_download_status",
      description: "检查视频下载任务的进度",
      inputSchema: {
        type: "object",
        properties: {
          taskId: { type: "string", description: "下载任务 ID" },
        },
        required: ["taskId"],
      },
    },
  ],
}))

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case "get_video_info": {
        const info = await fetchYouTubeVideoInfo(args.videoId as string)
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(info, null, 2),
            },
          ],
        }
      }

      case "get_subtitles": {
        const subtitles = await fetchYouTubeSubtitles(args.videoId as string, (args.language as string) || "en")
        return {
          content: [
            {
              type: "text",
              text: subtitles,
            },
          ],
        }
      }

      case "publish_to_bilibili": {
        const result = await publishToBilibili({
          videoId: args.videoId as string,
          title: args.title as string,
          subtitles: args.subtitles as string,
          tags: (args.tags as string[]) || [],
        })
        return {
          content: [
            {
              type: "text",
              text: `发布成功！Bilibili BV 号：${result.bvid}，链接：${result.url}`,
            },
          ],
        }
      }

      case "check_download_status": {
        const status = await checkDownloadTask(args.taskId as string)
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(status, null, 2),
            },
          ],
        }
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `未知工具: ${name}`)
    }
  } catch (error) {
    if (error instanceof McpError) throw error
    throw new McpError(ErrorCode.InternalError, `工具执行失败: ${error.message}`)
  }
})

// 启动 Server
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("TubePilot MCP Server 已启动")
}

main().catch(console.error)
```

**在 Claude Desktop / Claude Code 中配置：**

```json
// ~/.claude.json 或 Claude Desktop 配置文件
{
  "mcpServers": {
    "tubepilot": {
      "command": "node",
      "args": ["/path/to/tubepilot-mcp/dist/index.js"],
      "env": {
        "YOUTUBE_API_KEY": "your-api-key",
        "BILIBILI_COOKIE": "your-cookie"
      }
    }
  }
}
```

### 4.5 阶段四自测清单

- [ ] 能用 LangGraph.js 构建有条件分支的工作流（如：质量检查失败则重试，最多 3 次）
- [ ] 理解 State、Node、Edge、Conditional Edge 四个概念及其关系
- [ ] 能写一个自定义 MCP Server 并让 Claude Code 成功调用
- [ ] 能处理 Agent 常见错误：工具调用超时、模型输出格式错误、超出 maxSteps
- [ ] 能在 TubePilot 中实现至少一个 LangGraph 工作流节点并稳定运行

---

## 阶段五：Multi-Agent 进阶（持续学习）

### 5.1 Orchestrator / Subagent 架构

#### 5.1.1 为什么需要多 Agent？

单个 Agent 的限制：

- Context Window 有限，长任务会超出
- 单个 Agent 承担太多职责，System Prompt 变得复杂
- 无法并行处理多个子任务
- 不同任务可能需要不同的模型（成本/能力权衡）

#### 5.1.2 拆分原则

**何时拆分 Agent**：

1. 任务专业度差异大（字幕处理 vs 发布审核 → 完全不同的工具集）
2. 可以并行执行（同时处理多个视频）
3. 需要不同模型（内容生成用 Claude，代码审查用 GPT-4o）
4. 单 Agent Context 超过 50K Token

**TubePilot Multi-Agent 架构示例：**

```typescript
// Orchestrator：总调度者
const orchestrator = new Agent({
  name: "TubePilot Orchestrator",
  model: anthropic("claude-sonnet-4-20250514"),
  instructions: `你是 TubePilot 的总调度 Agent。
  
  收到用户的视频处理请求后，你需要：
  1. 解析用户需求（哪些视频，目标语言，质量要求）
  2. 协调各专职 Agent 完成任务
  3. 汇总结果，向用户报告处理状态
  
  可用的专职 Agent：
  - subtitleAgent: 负责获取和处理字幕
  - translationAgent: 负责高质量翻译
  - qualityAgent: 负责翻译质量评估（使用更强的模型）
  - publishAgent: 负责发布到各平台
  
  执行原则：
  - 字幕获取和视频信息可以并行获取
  - 翻译必须在字幕获取后进行
  - 质量检查必须在翻译后进行，评分低于 8 分时通知用户
  - 发布前必须等待人工确认`,
  tools: {
    delegateToSubtitleAgent, // 调用字幕 Agent
    delegateToTranslationAgent, // 调用翻译 Agent
    delegateToQualityAgent, // 调用质量检查 Agent
    delegateToPublishAgent, // 调用发布 Agent（含人工确认）
    notifyUser, // 发送进度通知
  },
})

// Subagent 1：字幕处理（专注字幕，工具集精简）
const subtitleAgent = new Agent({
  name: "Subtitle Agent",
  model: anthropic("claude-haiku-4-5-20251001"), // 用便宜快速的模型处理简单任务
  instructions: "你只负责获取视频字幕，不做翻译或其他处理。",
  tools: { fetchYouTubeSubtitles, extractTimecodes, cleanSubtitleText },
})

// Subagent 2：翻译 Agent
const translationAgent = new Agent({
  name: "Translation Agent",
  model: anthropic("claude-sonnet-4-20250514"),
  instructions: `你是专业的视频字幕翻译专家。
  翻译原则：准确性第一，流畅性第二，符合字幕阅读习惯。
  如果质量 Agent 指出问题，请在重新翻译时改正。`,
  tools: { translateSubtitles, lookupTerminology },
})

// Subagent 3：质量评估（用更强模型提升判断准确性）
const qualityAgent = new Agent({
  name: "Quality Agent",
  model: openai("o3"), // 推理能力强的模型更适合评估
  instructions: "你是翻译质量评审专家，严格评估翻译准确性、流畅性和字幕适配性。",
  tools: { evaluateTranslation, compareWithReference },
})

// Subagent 4：发布 Agent（含危险操作保护）
const publishAgent = new Agent({
  name: "Publish Agent",
  model: anthropic("claude-sonnet-4-20250514"),
  instructions: `你负责将处理完成的内容发布到各平台。
  重要：发布是不可逆操作，执行前必须确认所有信息正确。`,
  tools: { publishToBilibili, publishToYouTube, schedulePost },
})
```

### 5.2 RAG — 检索增强生成

RAG 解决两个核心问题：

1. LLM 训练数据有截止日期（知识过时）
2. 私有数据无法进入 LLM（业务文档、历史记录）

#### 5.2.1 RAG 完整流程

```
【索引阶段（一次性）】
文档 → 分块（Chunking） → 向量化（Embedding） → 存储到向量数据库

【查询阶段（每次请求）】
用户问题 → 向量化 → 相似度检索 → 获取相关文档块 → 注入 Context → LLM 生成回答
```

#### 5.2.2 用 Supabase pgvector 实现 RAG

```typescript
// 1. 在 Supabase 中启用 pgvector
// SQL: CREATE EXTENSION IF NOT EXISTS vector;

// 2. 创建向量存储表
// SQL:
// CREATE TABLE documents (
//   id BIGSERIAL PRIMARY KEY,
//   content TEXT NOT NULL,
//   metadata JSONB,
//   embedding VECTOR(1536)  -- OpenAI text-embedding-3-small 维度
// );

import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
const openai = new OpenAI()

// 索引文档
async function indexDocument(content: string, metadata: Record<string, unknown>) {
  // 1. 生成 embedding
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: content,
  })
  const embedding = embeddingResponse.data[0].embedding

  // 2. 存储到 Supabase
  const { error } = await supabase.from("documents").insert({
    content,
    metadata,
    embedding,
  })

  if (error) throw error
}

// 检索相关文档
async function searchDocuments(query: string, limit = 5): Promise<string[]> {
  // 1. 将查询向量化
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  })
  const queryEmbedding = embeddingResponse.data[0].embedding

  // 2. 向量相似度检索（余弦相似度）
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_threshold: 0.7, // 相似度阈值
    match_count: limit, // 返回最相似的 N 条
  })

  if (error) throw error
  return (data as { content: string }[]).map((d) => d.content)
}

// RAG 完整流程
async function ragQuery(question: string): Promise<string> {
  // 1. 检索相关文档
  const relevantDocs = await searchDocuments(question)

  // 2. 构建带上下文的 Prompt
  const context = relevantDocs.join("\n\n---\n\n")

  // 3. 调用 LLM
  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `你是 TubePilot 的知识库助手。
请基于以下参考资料回答用户问题。
如果参考资料中没有相关信息，请明确说明，不要编造。

参考资料：
${context}`,
    prompt: question,
    temperature: 0,
  })

  return text
}
```

### 5.3 可观测性（Observability）

**没有可观测性就无法调试 Agent。** 这是生产 Agent 最容易被忽视的环节。

你需要记录的信息：

- 每次 LLM 调用的输入和输出
- 工具调用的参数和结果
- 每步的 Token 消耗和费用
- 总执行时间和各节点耗时
- 错误信息和堆栈

#### 5.3.1 Langfuse 接入（推荐，开源可自托管）

```bash
pnpm add langfuse
```

```typescript
import { Langfuse } from "langfuse"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
  secretKey: process.env.LANGFUSE_SECRET_KEY!,
  baseUrl: process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com",
})

// 带可观测性的 Agent 执行
async function tracedAgentExecution(videoId: string, userId: string) {
  // 创建一个 Trace（代表一次完整的用户请求）
  const trace = langfuse.trace({
    name: "video-processing",
    userId,
    metadata: { videoId },
    tags: ["production"],
  })

  try {
    // 创建 Span（代表一个步骤）
    const subtitleSpan = trace.span({
      name: "fetch-subtitles",
      input: { videoId },
    })

    const subtitles = await fetchYouTubeSubtitles(videoId)
    subtitleSpan.end({ output: { length: subtitles.length } })

    // 记录 LLM 调用
    const translationGeneration = trace.generation({
      name: "translate-subtitles",
      model: "claude-sonnet-4-20250514",
      input: subtitles,
    })

    const { text, usage } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      prompt: `翻译以下字幕：${subtitles}`,
    })

    translationGeneration.end({
      output: text,
      usage: {
        input: usage.promptTokens,
        output: usage.completionTokens,
      },
    })

    // 记录评分（用于 Eval）
    trace.score({
      name: "translation-quality",
      value: 8.5,
      comment: "翻译流畅，保留了原意",
    })

    return text
  } catch (error) {
    trace.update({ status: "ERROR", statusMessage: error.message })
    throw error
  } finally {
    await langfuse.flushAsync()
  }
}
```

### 5.4 Agent 评估体系（Evals）

**没有 Evals 就无法系统性改进 Agent 质量。**

#### 5.4.1 LLM-as-Judge（最常用）

```typescript
import { generateObject } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"

const EvalResultSchema = z.object({
  score: z.number().min(0).max(10).describe("综合评分"),
  accuracy: z.number().min(0).max(10).describe("准确性：翻译是否忠实于原文"),
  fluency: z.number().min(0).max(10).describe("流畅性：译文是否自然"),
  appropriateness: z.number().min(0).max(10).describe("适配性：是否符合字幕风格"),
  issues: z.array(z.string()).describe("具体问题列表"),
  verdict: z.enum(["excellent", "good", "needs-improvement", "poor"]),
  reasoning: z.string().describe("评判理由"),
})

async function evaluateWithLLM(
  original: string,
  translated: string,
  reference?: string // 可选的人工标注参考译文
): Promise<z.infer<typeof EvalResultSchema>> {
  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-20250514"), // 用较强模型做评判
    schema: EvalResultSchema,
    system: `你是专业的字幕翻译评审员。
    评判标准：
    - 准确性（40%）：译文是否完整传达原文意思，无遗漏、无错误
    - 流畅性（30%）：译文是否自然流畅，符合中文表达习惯
    - 适配性（30%）：是否符合字幕特点（简洁、易读、时间匹配）
    
    请严格评判，不要给出虚高评分。`,
    prompt: `请评估以下字幕翻译：
    
    原文：
    ${original}
    
    译文：
    ${translated}
    
    ${reference ? `参考译文（专业翻译人员提供）：\n${reference}` : ""}`,
    temperature: 0,
  })

  return object
}
```

#### 5.4.2 批量 Eval Pipeline

```typescript
interface EvalCase {
  id: string
  original: string
  modelTranslation: string
  humanReference?: string
}

async function runBatchEval(cases: EvalCase[]) {
  const results = await Promise.all(
    cases.map(async (c) => {
      const result = await evaluateWithLLM(c.original, c.modelTranslation, c.humanReference)
      return { id: c.id, ...result }
    })
  )

  // 汇总统计
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length
  const distribution = results.reduce(
    (acc, r) => {
      acc[r.verdict] = (acc[r.verdict] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  console.log(`📊 Eval 结果汇总：`)
  console.log(`平均分：${avgScore.toFixed(2)}/10`)
  console.log(`分布：`, distribution)
  console.log(`常见问题：`, getMostCommonIssues(results))

  return results
}
```

### 5.5 生产级 Agent 的关键考量

#### 5.5.1 Token 成本控制

```typescript
// 策略 1：用便宜的小模型做预处理，贵的大模型做核心任务
const cheapModel = anthropic("claude-haiku-4-5-20251001") // 更快更便宜
const powerfulModel = anthropic("claude-sonnet-4-20250514") // 更强

// 策略 2：设置 Token Budget，超出时触发降级
const { text, usage } = await generateText({
  model: powerfulModel,
  prompt: "...",
  maxTokens: 2000, // 硬限制
})

if (usage.promptTokens > 50000) {
  console.warn("Context 过长，考虑压缩历史记录")
}

// 策略 3：Context 压缩（对超长对话进行摘要）
async function compressContext(messages: Message[]): Promise<Message[]> {
  if (calculateTokens(messages) < 50000) return messages

  const { text: summary } = await generateText({
    model: cheapModel,
    prompt: `请将以下对话历史压缩成简洁摘要（保留关键信息）：
${messages
  .slice(0, -10)
  .map((m) => `${m.role}: ${m.content}`)
  .join("\n")}`,
  })

  return [
    { role: "system", content: `历史对话摘要：${summary}` },
    ...messages.slice(-10), // 保留最近 10 条原始消息
  ]
}
```

#### 5.5.2 超时与流式进度反馈

```typescript
// 长时间 Agent 任务需要实时反馈进度
async function* runAgentWithProgress(videoId: string) {
  yield { status: "started", message: "开始处理视频..." }

  const info = await fetchVideoInfo(videoId)
  yield { status: "progress", message: `获取视频信息完成：${info.title}` }

  const subtitles = await fetchSubtitles(videoId)
  yield { status: "progress", message: `字幕获取完成，共 ${subtitles.length} 字符` }

  const translated = await translateSubtitles(subtitles)
  yield { status: "progress", message: "翻译完成，正在进行质量检查..." }

  const quality = await checkQuality(subtitles, translated)
  yield { status: "progress", message: `质量评分：${quality.score}/10` }

  yield { status: "completed", result: translated }
}

// 在 API 中使用 ReadableStream
export async function POST(req: Request) {
  const { videoId } = await req.json()

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const update of runAgentWithProgress(videoId)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`))
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  })
}
```

#### 5.5.3 幂等性（防止重复执行）

```typescript
// 发布到 Bilibili 是不可逆操作，必须防止重复
async function publishWithIdempotency(videoId: string, subtitles: string) {
  const idempotencyKey = `publish:${videoId}:${hashContent(subtitles)}`

  // 检查是否已经发布过
  const existing = await redis.get(idempotencyKey)
  if (existing) {
    console.log("此视频已发布，跳过重复操作")
    return JSON.parse(existing)
  }

  // 执行发布
  const result = await uploadToBilibili(videoId, subtitles)

  // 记录发布结果（设置 24 小时过期）
  await redis.setex(idempotencyKey, 86400, JSON.stringify(result))

  return result
}
```

### 5.6 阶段五自测清单

- [ ] 能设计 TubePilot 的 Multi-Agent 方案，明确每个 Subagent 的职责和工具集
- [ ] 能接入 Langfuse，在 Dashboard 看到每次 Agent 的完整调用链路和 Token 消耗
- [ ] 能用 Supabase pgvector 构建基础 RAG Pipeline，实现文档向量化和相似度检索
- [ ] 能实现 LLM-as-Judge 的自动化 Eval，对翻译质量进行批量评分
- [ ] 能解释并实现 Human-in-the-loop，在危险操作（发布）前等待人工确认
- [ ] 理解幂等性的必要性，在发布类工具中实现防重复保护

---

## Python 速学指南（给 JS 开发者）

> 有 TypeScript 基础，Python 语法 **1 周内**可达到"能看懂、能写基本代码"水平。

### 6.1 关键心理建设

**不要先"学完 Python 再学 AI"**。这会浪费 1–2 个月时间。正确做法是：

1. 用 30 分钟扫一遍语法对照（本章）
2. 配好环境（下一章，15 分钟）
3. 直接开始 DeepLearning.AI 课程
4. 遇到不懂的 Python 语法就问 Claude：**"这段 Python 怎么用 TypeScript 写？"**

### 6.2 最关键的语法差异

#### 6.2.1 变量与类型

```python
# Python（没有 const/let/var）
name = "Jay"                    # JS: const name = "Jay"
count = 10
is_active = True                # 注意首字母大写！JS 是 true
nothing = None                  # JS 的 null/undefined → Python 的 None

# f-string（等价模板字符串）
msg = f"Hello, {name}!"        # JS: `Hello, ${name}!`

# 类型注解（可选，但强烈建议写）
name: str = "Jay"
count: int = 10
is_active: bool = True
```

**关键差异**：

- `True`/`False` 首字母大写（JS 是小写）
- `None` 替代 `null`/`undefined`
- 命名用 `snake_case`（JS 用 `camelCase`）

#### 6.2.2 函数

```python
# 基础函数（用 def，没有 function 关键字）
def greet(name: str) -> str:
    return f"Hello, {name}"

# 默认参数（和 JS 一样）
def connect(host: str, port: int = 8080) -> str:
    return f"{host}:{port}"

# Lambda（比 JS 箭头函数限制多，只能单行表达式）
double = lambda x: x * 2       # JS: const double = x => x * 2

# *args（可变参数）
def sum_all(*nums: int) -> int:
    return sum(nums)            # 内置 sum 函数

# **kwargs（关键字参数，类似 JS 对象解构）
def create_config(**options) -> dict:
    return {"model": "claude", **options}

# 调用时可以用关键字参数
result = create_config(temperature=0, max_tokens=1000)
```

**关键差异**：

- 缩进（4 个空格）代替花括号 `{}`，缩进不对就报错
- `lambda` 只能单行，复杂逻辑必须用 `def`

#### 6.2.3 列表操作（前端最陌生的部分）

```python
nums = [1, 2, 3, 4, 5]

# 列表推导式（Python 特色，非常常用！）
doubled = [x * 2 for x in nums]          # JS: nums.map(x => x * 2)
evens = [x for x in nums if x % 2 == 0]  # JS: nums.filter(x => x % 2 === 0)
squares_of_evens = [x**2 for x in nums if x % 2 == 0]  # map + filter 合并

# 内置函数
total = sum(nums)                          # 比 reduce 简洁
maximum = max(nums)
minimum = min(nums)
length = len(nums)                         # JS: nums.length

# 切片（Python 特色，极其强大）
part = nums[1:3]      # [2, 3]，等价 JS: nums.slice(1, 3)
last_two = nums[-2:]  # [4, 5]，从倒数第 2 个到末尾
reversed_list = nums[::-1]  # [5, 4, 3, 2, 1]，反转

# 合并
merged = [*nums, 6, 7]      # JS: [...nums, 6, 7]

# 检查元素存在
has_3 = 3 in nums           # JS: nums.includes(3)

# find 等价
found = next((x for x in nums if x > 3), None)  # JS: nums.find(x => x > 3)

# append / pop
nums.append(6)              # JS: nums.push(6)
nums.pop()                  # JS: nums.pop()

# 排序
nums.sort()                 # 原地排序
sorted_nums = sorted(nums)  # 返回新列表
sorted_desc = sorted(nums, reverse=True)  # 降序
```

#### 6.2.4 字典（对象）

```python
# 字典字面量（键必须加引号）
config = {
    "model": "claude",
    "temperature": 0,
    "max_tokens": 1000,
}

# 访问（不能用点号！）
model = config["model"]          # JS: config.model
model = config.get("model")      # 安全访问，不存在时返回 None
model = config.get("model", "claude")  # 指定默认值

# 新增/修改
config["max_tokens"] = 2000

# 检查键
if "model" in config:            # JS: "model" in config
    print("有 model 键")

# 遍历
for key, value in config.items():   # JS: Object.entries(config)
    print(f"{key}: {value}")

# 遍历键/值
for key in config.keys():       # JS: Object.keys(config)
for value in config.values():   # JS: Object.values(config)

# 合并
merged = {**config, "stream": True}  # JS: {...config, stream: true}

# 字典推导式
squared = {k: v**2 for k, v in {"a": 2, "b": 3}.items()}
# 结果: {"a": 4, "b": 9}
```

**关键差异**：

- `dict["key"]` 不能用点号访问，要用方括号
- `.get(key, default)` 是安全访问的推荐方式

#### 6.2.5 类

```python
class Agent:
    # 类变量（所有实例共享）
    instance_count = 0

    def __init__(self, name: str, model: str = "claude"):
        # 构造函数（等价 constructor）
        self.name = name          # self 等价 JS 的 this
        self.model = model
        self._steps: list = []    # 单下划线 = 约定私有
        self.__id = id(self)      # 双下划线 = 强制私有（名称修饰）
        Agent.instance_count += 1

    @property
    def info(self) -> str:
        # @property 装饰器创建 getter
        return f"{self.name}({self.model})"

    @info.setter
    def info(self, value: str):
        # setter
        self.name = value.split("(")[0]

    def add_step(self, step: str) -> "Agent":
        # 返回 self 支持链式调用
        self._steps.append(step)
        return self

    @staticmethod
    def create(name: str) -> "Agent":
        # 静态方法，不接收 self
        return Agent(name)

    @classmethod
    def from_config(cls, config: dict) -> "Agent":
        # 类方法，接收 cls（类本身）
        return cls(config["name"], config.get("model", "claude"))

    def __repr__(self) -> str:
        # 等价 toString()
        return f"Agent(name={self.name!r})"

    def __len__(self) -> int:
        # 让 len(agent) 可用
        return len(self._steps)

# 继承
class MultiModalAgent(Agent):
    def __init__(self, name: str, supports_vision: bool = False):
        super().__init__(name)   # 调用父类构造函数
        self.supports_vision = supports_vision

# 使用（注意：Python 不需要 new）
agent = Agent("TubePilot")
agent.add_step("fetch").add_step("translate")  # 链式调用
print(agent.info)    # TubePilot(claude)
print(len(agent))    # 2
```

**关键差异**：

- 不需要 `new` 关键字，直接 `Agent("name")`
- 构造函数是 `__init__`，不是 `constructor`
- 所有实例方法第一个参数必须是 `self`

#### 6.2.6 Async/Await（和 JS 几乎一样！）

```python
import asyncio
import httpx  # pip install httpx

# async def（和 JS 完全一样的语法！）
async def fetch_data(url: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()

# 并行执行（等价 Promise.all）
async def fetch_multiple():
    results = await asyncio.gather(
        fetch_data("https://api.example.com/a"),
        fetch_data("https://api.example.com/b"),
        fetch_data("https://api.example.com/c"),
    )
    a, b, c = results  # 解包
    return a, b, c

# try/except（catch → except）
async def safe_fetch(url: str):
    try:
        data = await fetch_data(url)
        return data
    except httpx.TimeoutException as e:
        print(f"超时: {e}")
    except httpx.HTTPStatusError as e:
        print(f"HTTP 错误 {e.response.status_code}: {e}")
    except Exception as e:
        raise  # 裸 raise 重新抛出，保留原始堆栈

# 启动事件循环（等价 top-level await）
async def main():
    result = await safe_fetch("https://api.example.com/data")
    print(result)

# 在普通 .py 文件中运行
if __name__ == "__main__":
    asyncio.run(main())

# 在 Jupyter Notebook 中可以直接 await
# await main()  # Notebook 支持 top-level await
```

**关键差异**：

- `except` 而不是 `catch`
- 需要 `asyncio.run(main())` 启动事件循环（Notebook 里可以直接 `await`）

#### 6.2.7 类型系统（TypeScript vs Python）

```python
from typing import Optional, Union, Literal, Any
from typing import TypedDict  # 类似 TS 的 interface

# TypedDict（轻量，只有类型提示，无运行时验证）
class MessageDict(TypedDict):
    role: Literal["user", "assistant", "system"]
    content: str

# Pydantic BaseModel（强大，有运行时验证）
from pydantic import BaseModel, Field, validator

class Message(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str = Field(..., min_length=1, description="消息内容")

    class Config:
        # Pydantic v1 配置（v2 用 model_config = ConfigDict(...)）
        extra = "forbid"  # 禁止额外字段

class AgentConfig(BaseModel):
    model: str = "claude-sonnet-4-20250514"
    temperature: float = Field(0.0, ge=0.0, le=2.0)  # >= 0, <= 2
    max_tokens: int = Field(1000, gt=0)
    system_prompt: Optional[str] = None
    tools: list[str] = []

# 运行时验证（等价 Zod.parse）
try:
    config = AgentConfig.model_validate({
        "model": "claude-sonnet-4-20250514",
        "temperature": 0.5,
        "max_tokens": 2000,
    })
    print(config.temperature)  # float，完全类型安全
except ValueError as e:
    print(f"验证失败: {e}")

# Optional（等价 T | undefined）
def process(data: Optional[str] = None) -> str:
    return data or "default"

# Union（等价 T | U）
def handle(value: Union[str, int]) -> str:
    if isinstance(value, int):
        return str(value)
    return value

# Python 3.10+ 简化语法
def handle_new(value: str | int | None) -> str:
    match value:
        case str():    return value
        case int():    return str(value)
        case None:     return ""
```

#### 6.2.8 错误处理

```python
# try/except/finally
try:
    result = risky_operation()
except ValueError as e:           # 捕获特定错误类型
    print(f"值错误: {e}")
except (TypeError, KeyError) as e: # 捕获多种类型
    print(f"类型/键错误: {e}")
except Exception as e:             # 捕获所有异常
    raise                          # 裸 raise 重新抛出（保留堆栈）
else:
    # try 成功执行后运行（JS 没有对应）
    print("成功！")
finally:
    cleanup()

# 自定义异常
class AgentError(Exception):
    def __init__(self, message: str, step: str, retry_count: int = 0):
        super().__init__(message)
        self.step = step
        self.retry_count = retry_count

class ToolExecutionError(AgentError):
    def __init__(self, tool_name: str, details: str):
        super().__init__(f"工具 {tool_name} 执行失败：{details}", step="tool_execution")
        self.tool_name = tool_name

# 使用
try:
    result = execute_tool("search", query="Python")
except ToolExecutionError as e:
    print(f"工具 {e.tool_name} 失败，当前步骤：{e.step}")
    raise AgentError("工作流中断", step="main") from e  # 链式异常

# with 语句（等价 try/finally，用于资源管理）
with open("subtitles.txt", "r", encoding="utf-8") as f:
    content = f.read()
# f 在 with 块结束后自动关闭，无需 finally
```

### 6.3 Python 特色（JS 没有对应的）

#### 列表推导式（必须掌握）

```python
# 基础
squares = [x**2 for x in range(10)]

# 带条件
even_squares = [x**2 for x in range(10) if x % 2 == 0]

# 嵌套（等价双重 for）
matrix = [[i * j for j in range(5)] for i in range(5)]

# 字典推导式
word_lengths = {word: len(word) for word in ["hello", "world", "python"]}

# 集合推导式
unique_lengths = {len(word) for word in ["hello", "world", "python"]}

# 生成器表达式（惰性求值，节省内存）
gen = (x**2 for x in range(1_000_000))  # 不立即计算
first_10 = [next(gen) for _ in range(10)]
```

#### 装饰器（Decorator）

```python
import functools
import time

# 创建装饰器
def timing(func):
    @functools.wraps(func)  # 保留原函数的元信息
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} 耗时：{elapsed:.3f}s")
        return result
    return wrapper

# 使用装饰器
@timing
def slow_function():
    time.sleep(1)
    return "done"

slow_function()  # 打印：slow_function 耗时：1.001s

# 异步装饰器
def async_timing(func):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = await func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} 耗时：{elapsed:.3f}s")
        return result
    return wrapper

@async_timing
async def async_fetch():
    await asyncio.sleep(0.5)
    return "fetched"
```

#### 上下文管理器（with 语句）

```python
# 实现自己的上下文管理器
from contextlib import contextmanager, asynccontextmanager

@contextmanager
def agent_session(name: str):
    print(f"Agent {name} 开始")
    try:
        yield  # 这里返回给 with 块
    finally:
        print(f"Agent {name} 结束，清理资源")

with agent_session("TubePilot"):
    # 在这里运行 Agent 任务
    process_video("dQw4w9WgXcQ")

# 异步版本
@asynccontextmanager
async def async_db_connection(url: str):
    conn = await connect_to_db(url)
    try:
        yield conn
    finally:
        await conn.close()

async def query():
    async with async_db_connection("postgresql://...") as db:
        return await db.fetch("SELECT * FROM videos")
```

---

## 开发环境配置

### 7.1 JavaScript/TypeScript 环境（AI 开发首选）

```bash
# 确认 Node.js 版本（推荐 18+）
node --version

# 新建 Next.js 项目（最快的 Agent 开发起点）
pnpm create next-app my-agent-app --typescript --tailwind --app

# 安装 AI 相关依赖
cd my-agent-app
pnpm add ai @ai-sdk/anthropic @ai-sdk/openai zod
pnpm add @langchain/langgraph @langchain/anthropic @langchain/core
pnpm add langfuse  # 可观测性

# 环境变量
cp .env.example .env.local
# 填入：ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 7.2 Python 环境配置

```bash
# 安装 uv（Python 的 pnpm）
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows PowerShell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# 验证
uv --version  # 应显示 uv 0.x.x

# 创建 Python AI 项目
uv init my-python-agent
cd my-python-agent

# 安装 AI 必备包
uv add anthropic langchain langgraph langchain-anthropic
uv add pydantic python-dotenv httpx
uv add --dev jupyter ruff pytest

# 运行 Jupyter Notebook（用于实验）
uv run jupyter notebook

# 运行脚本
uv run python main.py
```

**pyproject.toml 参考配置（等价 package.json）：**

```toml
[project]
name = "my-python-agent"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "anthropic>=0.40.0",
    "langchain>=0.3.0",
    "langgraph>=0.2.0",
    "langchain-anthropic>=0.2.0",
    "pydantic>=2.0.0",
    "python-dotenv>=1.0.0",
    "httpx>=0.27.0",
]

[tool.uv]
dev-dependencies = [
    "jupyter>=1.0.0",
    "ruff>=0.8.0",
    "pytest>=8.0.0",
    "pytest-asyncio>=0.24.0",
]

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
```

### 7.3 VS Code 推荐扩展

```json
// .vscode/extensions.json
{
  "recommendations": [
    // TypeScript/JS
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "biomejs.biome",

    // Python
    "ms-python.python",
    "ms-python.vscode-pylance",
    "charliermarsh.ruff",
    "ms-toolsai.jupyter",

    // AI 开发
    "anthropics.claude-code", // Claude Code 扩展
    "github.copilot"
  ]
}
```

---

## 推荐学习资源

### 必读/必看（按优先级排序）

| 资源                                                                                                                   | 类型     | 时长  | 价格 | 优先级     |
| ---------------------------------------------------------------------------------------------------------------------- | -------- | ----- | ---- | ---------- |
| [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) | 文档     | 2–3h  | 免费 | ⭐⭐⭐⭐⭐ |
| [DeepLearning.AI: AI Agents in LangGraph](https://deeplearning.ai/short-courses/ai-agents-in-langgraph/)               | 视频课程 | 5h    | 免费 | ⭐⭐⭐⭐⭐ |
| [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)                                                                       | 文档     | 按需  | 免费 | ⭐⭐⭐⭐⭐ |
| [Karpathy: Intro to LLMs](https://www.youtube.com/watch?v=zjkBMFhNj_g)                                                 | 视频     | 1h    | 免费 | ⭐⭐⭐⭐⭐ |
| [Anthropic: Tool Use 文档](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)                              | 文档     | 1h    | 免费 | ⭐⭐⭐⭐⭐ |
| [DeepLearning.AI: Multi AI Agent Systems](https://deeplearning.ai/short-courses/multi-ai-agent-systems-with-crewai/)   | 视频课程 | 4h    | 免费 | ⭐⭐⭐⭐   |
| [LangGraph.js 官方文档](https://langchain-ai.github.io/langgraphjs/)                                                   | 文档     | 按需  | 免费 | ⭐⭐⭐⭐   |
| [Anthropic: Agentic Systems 指南](https://docs.anthropic.com/en/docs/build-with-claude/agentic-systems)                | 文档     | 30min | 免费 | ⭐⭐⭐⭐   |
| [Mastra 官方文档](https://mastra.ai/docs)                                                                              | 文档     | 2h    | 免费 | ⭐⭐⭐     |
| [MCP 协议文档](https://modelcontextprotocol.io/quickstart/server)                                                      | 文档     | 1h    | 免费 | ⭐⭐⭐     |
| [Langfuse 文档](https://langfuse.com/docs)                                                                             | 文档     | 1h    | 免费 | ⭐⭐⭐     |
| [Supabase pgvector 文档](https://supabase.com/docs/guides/ai/vector-embeddings)                                        | 文档     | 1h    | 免费 | ⭐⭐⭐     |

### Python 专项（给 JS 开发者）

| 资源                                                                      | 特点                           |
| ------------------------------------------------------------------------- | ------------------------------ |
| [Learn X in Y Minutes: Python](https://learnxinyminutes.com/docs/python/) | 30 分钟速览全部语法            |
| [Python 官方 Tutorial 第 3–9 章](https://docs.python.org/3/tutorial/)     | 有 JS 基础只需选读这几章       |
| [Pydantic v2 文档](https://docs.pydantic.dev/latest/)                     | 重点看 Models 章节             |
| [uv 官方文档](https://docs.astral.sh/uv/)                                 | Python 包管理，15 分钟上手     |
| [Real Python](https://realpython.com/)                                    | 高质量 Python 教程，搜具体主题 |

### 论文（选读，理解原理用）

| 论文                                                                                                      | 重点阅读                         | 价值                       |
| --------------------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------- |
| [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)            | Introduction + Figure 1（15min） | 理解 Agent Loop 的理论基础 |
| [Toolformer: Language Models Can Teach Themselves to Use Tools](https://arxiv.org/abs/2302.04761)         | Abstract + Figure 1（10min）     | Tool Use 的开创性工作      |
| [Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/abs/2201.11903) | Figure 1（5min）                 | 理解为什么 CoT 有效        |

---

## 值得关注的人

| 人物                 | 平台                                  | 内容特点                             |
| -------------------- | ------------------------------------- | ------------------------------------ |
| **吴恩达 Andrew Ng** | Twitter: @AndrewYNg / deeplearning.ai | AI 教育权威，Agent 课程质量最高      |
| **宝玉**             | Twitter: @dotey                       | 中文 AI 内容翻译第一人，及时跟进前沿 |
| **Andrej Karpathy**  | Twitter: @karpathy / YouTube          | LLM 原理最清晰的讲解者，工程师视角   |
| **Simon Willison**   | simonwillison.net                     | LLM 工程实践，MCP/Tool Use 深度内容  |
| **Harrison Chase**   | Twitter: @hwchase17                   | LangChain 创始人，Agent 框架设计前沿 |
| **歸藏**             | Twitter: @op7418                      | 国内 AI 产品动态跟踪，效率工具       |
| **林德熙**           | 个人博客                              | 国内 AI 工程实践分享                 |

---

## 实战项目推荐

### 按难度排序

#### 🟢 入门级（阶段 2–3 完成后可做）

**1. 视频字幕结构化提取器**

- 输入：YouTube 视频字幕文本
- 输出：标题、标签、摘要、情感、难度等级（JSON）
- 技术：`generateObject` + Zod Schema
- 预计时间：半天
- 适合：第一个 AI 功能练手

**2. 流式 AI 聊天界面**

- 功能：基于 Anthropic API 的聊天界面，支持流式输出
- 技术：Next.js + `streamText` + `useChat`
- 预计时间：1 天
- 适合：熟悉 Vercel AI SDK 全部核心 API

**3. 文档问答 Bot**

- 功能：上传 PDF/文档，AI 回答相关问题
- 技术：文件解析 + RAG（Supabase pgvector）+ 流式输出
- 预计时间：3 天

#### 🟡 中级（阶段 3–4 完成后可做）

**4. TubePilot 字幕 Agent（推荐！）**

- 功能：输入 YouTube URL，自动获取字幕、翻译、质量检查
- 技术：Vercel AI SDK Tool Use + 3 个工具
- 特点：结合现有项目，学习效果最佳
- 预计时间：3–5 天

**5. GitHub PR Review Agent**

- 功能：读取 PR diff，自动生成代码审查意见
- 技术：GitHub API + Tool Use + LangGraph.js
- 预计时间：1 周

**6. 个人知识库问答系统**

- 功能：把 Obsidian/Notion 笔记向量化，自然语言查询
- 技术：文档索引 + pgvector + RAG + Tool Use
- 预计时间：1–2 周

#### 🔴 高级（阶段 5 完成后可做）

**7. TubePilot Multi-Agent Pipeline（终极目标）**

- 功能：完整的 YouTube → Bilibili 自动化流程
- 架构：Orchestrator + 字幕 Agent + 翻译 Agent + 质量 Agent + 发布 Agent
- 特点：Human-in-the-loop 确认发布，Langfuse 监控，自动化 Eval
- 技术：LangGraph.js + MCP Server + Langfuse + Supabase Vector
- 预计时间：1–2 个月

**8. 自定义 MCP Server 套件**

- 功能：为 Claude Code 扩展一套自定义工具（Bilibili API、yt-dlp 控制、本地文件管理）
- 技术：MCP SDK + TypeScript
- 预计时间：1–2 周

---

## 常见误区与陷阱

### ❌ 误区 1：等"学完"基础再开始做

**错误做法**：花 2 个月系统学 Python/LLM 原理/数学，再开始做 Agent。

**正确做法**：1 周基础后直接上手，边做边查，遇到不懂的问 Claude。Agent 工程 90% 是工程问题，不是学术问题。

---

### ❌ 误区 2：忽视工具的 description

```typescript
// ❌ 模糊的描述导致模型调用失误
getSubtitles: tool({
  description: '获取字幕',  // 太简短！
  ...
})

// ✅ 详细的描述让模型准确决策
getSubtitles: tool({
  description: `从 YouTube 获取视频字幕。
  使用场景：需要翻译、分析或处理视频内容时。
  注意：如果视频无字幕会返回错误，请提前检查。`,
  ...
})
```

---

### ❌ 误区 3：没有设置 maxSteps

```typescript
// ❌ 危险！模型可能陷入循环
const { text } = await generateText({
  model: ...,
  tools: { ... },
  prompt: '...',
  // 忘记设置 maxSteps！
})

// ✅ 始终设置合理上限
const { text } = await generateText({
  model: ...,
  tools: { ... },
  prompt: '...',
  maxSteps: 10,
})
```

---

### ❌ 误区 4：把所有逻辑都塞给 Agent

不是所有任务都需要 Agent。Agent 适合**目标明确但路径不确定**的任务。

| 场景                     | 推荐方案                        |
| ------------------------ | ------------------------------- |
| 固定格式的数据提取       | `generateObject` 足够           |
| 确定步骤的自动化流程     | 普通 TypeScript 代码 + LLM 辅助 |
| 需要动态决策的复杂任务   | Agent（Tool Use + Loop）        |
| 需要根据中间结果调整路径 | LangGraph 工作流                |

---

### ❌ 误区 5：忽视可观测性

Agent 的调试比普通代码难 10 倍。没有可观测性就像盲人摸象。**在第一个生产 Agent 上线前，必须先接入 Langfuse 或 LangSmith。**

---

### ❌ 误区 6：不做 Evals 就修改 Prompt

```
错误流程：
发现翻译质量差 → 修改 System Prompt → "感觉好了一些" → 上线

正确流程：
发现翻译质量差 → 建立 Eval 数据集（50–100 个样本）→
修改 System Prompt → 跑 Eval 对比分数 → 确认提升后上线
```

没有 Eval，Prompt Engineering 就是玄学。

---

### ❌ 误区 7：发布类操作没有幂等性保护

```typescript
// ❌ 危险：重试时可能重复发布
async function publish(videoId: string, subtitles: string) {
  await uploadToBilibili(videoId, subtitles)
}

// ✅ 安全：检查幂等键，防止重复
async function safePublish(videoId: string, subtitles: string) {
  const key = `published:${videoId}`
  if (await cache.exists(key)) {
    return { status: "already_published" }
  }
  const result = await uploadToBilibili(videoId, subtitles)
  await cache.set(key, result, 86400)
  return result
}
```

---

## 附录：术语速查表

| 术语                  | 解释                                   | 前端类比         |
| --------------------- | -------------------------------------- | ---------------- |
| **Token**             | LLM 处理的最小单位                     | —                |
| **Context Window**    | 模型一次能处理的最大 Token 数          | React state 大小 |
| **Temperature**       | 控制输出随机性的参数（0–2）            | —                |
| **Prompt**            | 给模型的输入指令                       | HTML 模板        |
| **System Prompt**     | 定义 Agent 全局行为的特殊 Prompt       | CSS 全局变量     |
| **Completion**        | 模型根据 Prompt 生成的输出             | API 响应体       |
| **Embedding**         | 文本的向量表示，用于相似度计算         | —                |
| **Tool Use**          | 模型调用外部函数的能力                 | 调用 API         |
| **Agent**             | 能自主决策、调用工具的 AI 系统         | 自动化脚本       |
| **Agent Loop**        | Tool Use 的循环执行过程                | Event Loop       |
| **ReAct**             | Reason + Act，最主流的 Agent 范式      | —                |
| **RAG**               | 检索增强生成，给模型补充外部知识       | 动态数据注入     |
| **Vector DB**         | 向量数据库，用于语义检索               | 全文搜索引擎     |
| **Orchestrator**      | 协调多个 Subagent 的主 Agent           | 路由层/网关      |
| **Subagent**          | 执行特定子任务的专职 Agent             | 微服务           |
| **Human-in-the-loop** | 需要人工确认才能继续的机制             | 二次确认弹框     |
| **Eval**              | 评估 Agent 输出质量的系统              | 单元测试         |
| **LLM-as-Judge**      | 用 LLM 评估另一个 LLM 输出的方法       | 代码 Review      |
| **Langfuse**          | 开源 LLM 可观测性平台                  | Datadog/Sentry   |
| **MCP**               | Model Context Protocol，工具标准化协议 | OpenAPI 规范     |
| **Checkpoint**        | LangGraph 的状态快照，支持暂停恢复     | Redux Persist    |
| **Pydantic**          | Python 的运行时类型验证库              | Zod              |
| **uv**                | 现代 Python 包管理器                   | pnpm             |

---

## 更新日志

| 日期       | 更新内容                    |
| ---------- | --------------------------- |
| 2025-06-05 | 初始版本，覆盖全部 5 个阶段 |

---

## License

MIT License — 自由使用、修改、分发。

---

> 🚀 **开始行动吧！** 最好的学习方式是立刻打开 [Anthropic Console](https://console.anthropic.com) 开始试验第一个 Prompt，而不是把这份文档读完再说。
