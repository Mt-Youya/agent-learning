---
name: AI Agent Learning Platform
description: Structured AI Agent curriculum for frontend engineers, built in JS/TS.
colors:
  # Surfaces — cold zinc, consistent blue-gray tint (hue 248) throughout
  base: "oklch(12% 0.008 248)"
  surface-1: "oklch(16.5% 0.008 248)"
  surface-2: "oklch(21% 0.008 248)"
  border: "oklch(28% 0.007 248)"
  border-subtle: "oklch(21% 0.006 248)"
  # Accent — Focused Steel Blue, single voice
  accent: "oklch(62% 0.16 248)"
  accent-dim: "oklch(56% 0.14 248)"
  accent-subtle: "oklch(18% 0.05 248)"
  # Text
  text-primary: "oklch(93% 0.005 248)"
  text-secondary: "oklch(60% 0.008 248)"
  text-muted: "oklch(40% 0.007 248)"
  # Track colors — curriculum data labels, low chroma, never compete with accent
  track-llm: "oklch(72% 0.09 75)"
  track-ts: "oklch(67% 0.09 152)"
  track-agent: "oklch(65% 0.08 285)"
  track-fw: "oklch(67% 0.09 205)"
  track-multi: "oklch(65% 0.08 15)"
  # Callout surfaces
  surface-info: "oklch(17% 0.05 248)"
  surface-tip: "oklch(16% 0.05 152)"
  surface-warn: "oklch(16% 0.05 75)"
typography:
  display:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "clamp(3.25rem, 7.5vw, 5.5rem)"
    fontWeight: 300
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 300
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.72
  label:
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.05em"
rounded:
  sm: "2px"
spacing:
  section-y: "96px"
  container: "24px"
  gap-sm: "16px"
  gap-md: "24px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.base}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.accent-dim}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.sm}"
    padding: "6px 16px"
  button-outline-hover:
    textColor: "{colors.accent}"
---

# Design System: AI Agent Learning Platform

## 1. Overview

**Creative North Star: "The Executable Document"**

This platform's thesis is that code and explanation are the same thing. The typographic system takes that literally: body prose is monospaced (Geist Mono), code is monospaced, and the learner reads both without a register shift. The interface is not a classroom with a projector. It is a document that runs.

The aesthetic is cold and precisely engineered. Near-black zinc throughout, one steel-blue accent used at restraint, surfaces differentiated only by tonal layering. The references are the tools these engineers already live inside: Raycast's density without its warmth, Zed's editing-environment focus, Clerk Docs' navigational structure. None of them perform for the user. This platform does not either.

Display typography is large, light-weighted, and tightly tracked: the headline asserts without shouting. Motion is choreographed as pipeline execution: one node resolves, then the next. Every animation can be justified by "hierarchy" or "state transition" in one sentence; nothing animates for decoration.

**Key Characteristics:**

- Near-black cold zinc base. No warm neutrals anywhere.
- Monospaced body type. Prose and code share spatial DNA; no "reading mode" vs "code mode".
- Single steel-blue accent on ≤10% of any screen. Track tag colors are data labels, not accents.
- Large display numbers as typographic anchors in the learning roadmap.
- Zero gamification: no star ratings, XP bars, achievement badges.

## 2. Colors

Restrained cold zinc system. One accent for all interactions. Five semantic track hues as data identifiers only.

### Primary

- **Focused Steel Blue** (`oklch(62% 0.16 248)`): All interactive elements, focus rings, primary buttons, active states. Appears on ≤10% of any screen. Low-to-mid chroma: precise, not neon.
- **Focused Steel Blue (dim)** (`oklch(56% 0.14 248)`): Hover state for primary button.
- **Accent Subtle** (`oklch(18% 0.05 248)`): Low-opacity tint for active/selected backgrounds.

### Neutral

- **Zinc Base** (`oklch(12% 0.008 248)`): Main page background. Never pure `#000`.
- **Zinc Surface-1** (`oklch(16.5% 0.008 248)`): Card fills, code block backgrounds, sidebar panels.
- **Zinc Surface-2** (`oklch(21% 0.008 248)`): Hover backgrounds, active states, form inputs.
- **Zinc Border** (`oklch(28% 0.007 248)`): Card outlines, input borders at rest.
- **Zinc Border Subtle** (`oklch(21% 0.006 248)`): Section dividers, hairline separators.
- **Text Primary** (`oklch(93% 0.005 248)`): Headings and primary body. Never pure `#fff`.
- **Text Secondary** (`oklch(60% 0.008 248)`): Descriptions, secondary labels.
- **Text Muted** (`oklch(40% 0.007 248)`): Timestamps, placeholders, eyebrow labels.

### Track Colors (data roles only)

Five low-chroma hues for the five curriculum tracks. Each used only on difficulty badges and video status indicators. None compete with Focused Steel Blue.

- **Amber** (`oklch(72% 0.09 75)`): LLM Fundamentals track.
- **Green** (`oklch(67% 0.09 152)`): JS/TS Toolchain track.
- **Violet** (`oklch(65% 0.08 285)`): Agent Core Concepts track.
- **Cyan** (`oklch(67% 0.09 205)`): Agent Frameworks track.
- **Rose** (`oklch(65% 0.08 15)`): Multi-Agent System Design track.

### Named Rules

**The One Accent Rule.** Focused Steel Blue is the only accent on any screen. If it appears on more than 10% of a surface, something is wrong.

**The Cold Cast Rule.** Every neutral carries hue 248 (blue-gray). Warm neutrals (sand, taupe, cream) are banned. When in doubt, shift toward blue, never yellow or red.

**The No-Decoration-Color Rule.** Color does not appear as atmospheric decoration. Every colored element answers "what does this mean?" If it means nothing, remove the color.

## 3. Typography

**Display Font:** Geist (via `next/font`, variable: `--font-geist-sans`)
**Body Font:** Geist Mono (via `next/font`, variable: `--font-geist-mono`)

**Character:** The pairing bets entirely on monospace for prose. A learner building their first ReAct agent reads the explanation in the same typeface as the code. This is intentional friction that reinforces the platform's thesis. Display headlines use Geist Sans at large scale with tight tracking; they assert, not shout.

### Hierarchy

- **Display** (weight 300, `clamp(3.25rem, 7.5vw, 5.5rem)`, line-height 1.02, tracking -0.025em): Homepage hero only. One per route. Sparse.
- **Headline** (weight 300, 1.875rem, line-height 1.15, tracking -0.01em): Section headings on homepage and marketing surfaces.
- **Title** (weight 500, 1.0625rem, line-height 1.3): Card titles, sidebar labels, navigation text.
- **Body** (weight 400, 0.9375rem, line-height 1.72): ALL prose text. Geist Mono. Hard cap: 68ch max-width.
- **Label** (weight 500, 0.75rem, tracking 0.05em, uppercase): Track badges, status indicators, code block language labels. Geist Mono.

### Named Rules

**The Mono-Prose Rule.** All body text uses Geist Mono. No switching to proportional type for readability. If mono prose feels uncomfortable, adjust line-length or leading, not the typeface.

**The Display Scale Rule.** Display headlines exist only on marketing surfaces (homepage hero). Chapter headings use Headline scale, not Display. One Display element per route maximum.

## 4. Elevation

Flat by default. Depth communicated through background tint progression: Base → Surface-1 → Surface-2. No shadows at rest.

Exception: interactive execution panels (demo runners, video players, token counter) use a single cold-hued ambient shadow (`0 0 40px 0 oklch(62% 0.16 248 / 0.08)`) to signal active/running state.

### Named Rules

**The Flat-Until-Active Rule.** Nothing casts a shadow at rest. Shadows signal execution context only. Hover transitions use background tint shift (Surface-1 → Surface-2), not shadow introduction.

## 5. Components

### Buttons

- **Primary** (`btn-primary`): `oklch(62% 0.16 248)` fill, Zinc Base text, 2px radius, 10px/20px padding, Geist Mono 0.8125rem. Hover: dim to `oklch(56% 0.14 248)`. Active: `scale(0.97) translateY(1px)`. Motion INTENSITY ≥ 7: magnetic spring on hover using `useMotionValue`.
- **Ghost** (`btn-ghost`): Transparent, Text Secondary, transitions to Text Primary on hover. Geist Mono.
- **Outline** (`btn-outline`): 1px Border, Text Secondary. Hover: Border → Accent, color → Accent. Active: `scale(0.97)`.

### Code Panel (Base UI Tabs)

Radix API replaced with `@base-ui/react` Tabs. `Tabs.Root` / `Tabs.List` / `Tabs.Tab` / `Tabs.Panel`. Arrow-key navigation, roving tabIndex, `role="tabpanel"` auto-generated. Surface-1 background, 1px Border, 2px radius. Tab trigger: bottom-border indicator in Accent when active.

### Roadmap Row

Full-width row with typographic number anchor. Number: Geist Mono, `clamp(3rem, 7vw, 5rem)`, weight 300, Text Muted. Content: Title + description (mono prose) + inline meta badges + outline CTA. Mobile: single column, number above content. Hover: Border transitions to Border (slightly lighter) via `transition`.

### Difficulty Badge

`font-mono text-xs font-medium px-2 py-0.5 rounded-sm`. Background: Surface-2. Color and border: corresponding track color. No fill, no opacity.

### Video Status Badge

Icon (Tabler, 12px, stroke 1.5) + label text, font-mono text-xs. Colors: track-ts for ready, track-llm for generating, text-muted for pending.

### Navigation

Fixed, 56px height, Zinc Base background, 1px Border Subtle bottom. Logo: AgentLab + accent dot. Links: Geist Mono 0.8125rem, Text Secondary default, Text Primary on active/hover. Active: 1px Accent underline via `::after`. CTA: `btn-primary`. Mobile: hamburger opens full-panel menu.

### Tech Stack Marquee

CSS `@keyframes` scroll (no JS frames). IntersectionObserver pauses when off-screen. `aria-hidden="true"`. Pills: Surface-1 fill, Border Subtle outline, Text Muted, rounded-sm.

## 6. Do's and Don'ts

### Do:

- **Do** use Geist Mono for all body prose, everywhere.
- **Do** use the number-as-typographic-anchor pattern for ordered sequences. Numbers at 3-5rem, Text Muted, font-light, are design, not decoration.
- **Do** differentiate surfaces with tint only: Base → Surface-1 → Surface-2.
- **Do** gate all motion behind `prefers-reduced-motion`. Static fallback required for every sequence.
- **Do** use `useMotionValue` for continuous input tracking (hover physics). Never `useState`.
- **Do** cold-tint every neutral to hue 248. Never let surfaces go warm.
- **Do** treat track colors as data identifiers: five hues, low chroma, equal visual weight.

### Don't:

- **Don't** use generic SaaS aesthetics: cream backgrounds, rounded hero cards, gradient CTAs, stock illustrations.
- **Don't** use Udemy/Coursera patterns: star ratings, XP bars, gamified micro-interactions, thumbnail-dominant layouts.
- **Don't** use neon cyberpunk aesthetics: purple/cyan glows, pitch-black backgrounds, multiple competing saturated accents.
- **Don't** use warm neutrals anywhere in the neutral scale.
- **Don't** use gradient text (`background-clip: text`). Emphasis through weight and size only.
- **Don't** use glassmorphism decoratively. Backdrop blur only on modals/popovers with functional justification.
- **Don't** use identical card grids. ChapterRow uses typographic numbers to differentiate entries without card boxes.
- **Don't** place any shadow at rest. Shadows signal execution state only.
- **Don't** use em-dashes (`—`) anywhere. Commas, colons, or periods instead.
