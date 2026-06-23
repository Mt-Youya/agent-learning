# Agent 开发实战示例

《Agent 开发实战指南》各章节的可运行代码演示。

## 准备

```bash
# 在项目根目录安装依赖（examples 已加入 workspace）
pnpm install

# 设置 API Key
export ANTHROPIC_API_KEY=sk-ant-...
```

## 运行

```bash
# 在 examples/ 目录下
cd examples

pnpm run 01   # 或直接 pnpm tsx 01-model-cascade.ts
```

---

## 文件对照表

| 文件 | 对应章节 | 核心概念 |
|------|---------|---------|
| `01-model-cascade.ts` | 第一章 1.2 | Haiku 路由 → Sonnet 执行，按复杂度分层选模型 |
| `02-tool-design.ts` | 第五章 | 工具设计黄金法则：description 三要素、精简返回值、结构化错误 |
| `03-agent-loop-sdk.ts` | 第六章 6.1 | AI SDK 内置 Loop：`stopWhen: stepCountIs(N)` + `onStepFinish` 熔断 |
| `04-agent-loop-raw.ts` | 第六章 6.2 | 手写 Agent Loop：理解框架本质，手动管理 messages 数组 |
| `05-context-compress.ts` | 第七章 7.1 | 滑动窗口 / 摘要压缩 / 外部状态三种 Context 管理策略 |
| `06-error-retry.ts` | 第八章 | `withRetry` 指数退避、错误分类矩阵、优雅降级 |
| `07-eval.ts` | 第十章 | 端到端 Eval + LLM-as-Judge 翻译质量评估 |
| `08-minimal-agent.ts` | 第十四章 | 完整字幕翻译 Agent，体现第十四章所有关键实践 |

---

## AI SDK v6 关键变化速查

文档示例基于 v4/v5 写法，本项目使用 **AI SDK v6**，主要差异：

| v5 写法 | v6 实际 API |
|---------|------------|
| `tool({ parameters: z.object(...) })` | `tool({ inputSchema: jsonSchema(...) })` |
| `generateText({ maxSteps: 10 })` | `generateText({ stopWhen: stepCountIs(10) })` |
| `generateText({ maxTokens: 500 })` | `generateText({ maxOutputTokens: 500 })` |

---

## 逐步学习路径

```
从这里开始：
  08-minimal-agent.ts   ← 先跑通这个，理解完整流程
  ↓
按需深入：
  03 / 04               ← 理解 Loop 原理
  02                    ← 工具设计规范
  06                    ← 错误处理
  07                    ← 建立 Eval（上线前必须）
```
