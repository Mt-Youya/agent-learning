# Product

## Register

product

<!-- Note: The homepage (/) is brand-facing; /learn/[chapter] and /tools/* are product surfaces.
     Default register is "product" — design serves the learning experience, not brand spectacle. -->

## Users

Frontend engineers (primarily Chinese-speaking, B站/YouTube as secondary) who already know JavaScript and TypeScript and want to move into AI application development. Professional habits: they use Linear, Raycast, Warp, Zed. They distrust platforms that talk down to them or dress up simple ideas in marketing language. They want to get from concept to running code as fast as possible, in a stack they already own.

Secondary: self-taught learners watching auto-generated chapter video explanations. They're motivated and quick to leave if the content feels low-effort or generic.

## Product Purpose

A structured learning platform for AI Agent development in JavaScript and TypeScript. Five tracks: LLM fundamentals, JS/TS toolchain (Vercel AI SDK, LangChain.js, Anthropic SDK), Agent core concepts (tool use, memory, ReAct), Agent frameworks (LangGraph.js, Mastra, MCP), and Multi-Agent system design.

Distinguishes itself: JS/TS-first (no Python required), interactive browser demos, auto-generated video explanations from MDX chapter content. Currently built: homepage, chapter detail pages, video generation dashboard, token counter tool.

## Brand Personality

Rigorous, Practical, Native.

Voice: the tone of a senior engineer who has shipped this, not a teacher explaining it. Precise, no hedging, no motivational filler. Code speaks; prose contextualizes. Chinese for audience-facing copy; English for all code identifiers.

## Anti-references

- Generic SaaS / Webflow templates: cream backgrounds, rounded hero cards, gradient CTAs, stock illustration sets.
- Udemy / Coursera style: star ratings, progress bar clutter, thumbnail-dominant course catalogs, gamified micro-interactions.
- Docs-as-design: bare GitBook / ReadTheDocs defaults with no visual identity.
- Neon-on-black cyberpunk: purple/cyan glows on pitch black, the saturated "hacker aesthetic" every dev tool already uses.
- freeCodeCamp earnestness: under-designed, certification-badge-forward, plain Wikipedia-like layout.

## Design Principles

1. **The medium matches the message.** A platform teaching developers to build tools should feel like a tool. Marketing page aesthetics undermine credibility with engineers.
2. **Show, don't explain.** Interactive browser demos are the curriculum. Every concept that can run, runs. Prose only does what code cannot.
3. **Structure is the design.** Clear learning progression, chapter-level hierarchy, and navigation affordances matter more than decoration. The learner always knows where they are.
4. **Earn every element.** If a UI element does not reduce friction, teach something, or signal progress, it should not exist.
5. **JS/TS-native from the first pixel.** The stack (Next.js, Tailwind, TypeScript) is not incidental. Design choices should reflect the tools these engineers already use and respect.

## Accessibility & Inclusion

- Mobile-first responsive layout required.
- Video subtitle support (Chinese primary, English optional) for hearing accessibility.
- Reduced motion: `prefers-reduced-motion` gates all animations.
- High contrast: WCAG AA minimum on dark theme; AAA target for hero copy.
- Keyboard navigation: code blocks have copy affordance, tab panels are arrow-key navigable.
- Target: WCAG 2.1 AA.
