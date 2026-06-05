"use client"

/**
 * Experts Section - "关注大佬"
 *
 * Horizontal scroll strip of developer thought leaders.
 * Real Picsum photos (descriptive seeds for consistent generation).
 * No generic avatars, no "Jane Doe" names, no category labels under photos.
 * No eyebrow on this section (at page limit).
 *
 * A11y: scroll region has role="region" + aria-label.
 *       Each card is a list item with semantic structure.
 */

import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { IconArrowRight } from "@tabler/icons-react"
import Image from "next/image"

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface Expert {
  name: string
  role: string
  org: string
  href: string
  imgSeed: string /* Picsum seed — consistent across renders */
}

const EXPERTS: Expert[] = [
  {
    name: "Andrej Karpathy",
    role: "AI 教育者",
    org: "前 OpenAI / Tesla",
    href: "https://karpathy.ai",
    imgSeed: "karpathy-ai-researcher",
  },
  {
    name: "Simon Willison",
    role: "LLM 研究员",
    org: "Datasette 作者",
    href: "https://simonwillison.net",
    imgSeed: "simon-willison-developer",
  },
  {
    name: "张磊",
    role: "AI 工程化专家",
    org: "前端 + LLM 布道者",
    href: "#",
    imgSeed: "zhang-lei-frontend-ai",
  },
  {
    name: "李晓明",
    role: "全栈 + Agent 开发",
    org: "LangChain 贡献者",
    href: "#",
    imgSeed: "li-xiaoming-agent-dev",
  },
  {
    name: "陈建国",
    role: "系统架构师",
    org: "Multi-Agent 系统设计",
    href: "#",
    imgSeed: "chen-jianguo-system-arch",
  },
  {
    name: "王芳",
    role: "前端 AI 工具链",
    org: "Vercel / Next.js 专家",
    href: "#",
    imgSeed: "wang-fang-frontend-tools",
  },
]

function ExpertCard({ expert, delay }: { expert: Expert; delay: number }) {
  const liRef = useRef<HTMLLIElement>(null)

  useGSAP(
    () => {
      if (!liRef.current) return
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      gsap.from(liRef.current, {
        opacity: 0,
        y: 16,
        duration: 0.5,
        delay,
        ease: "expo.out",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: liRef.current, start: "top 85%", once: true },
      })
    },
    { scope: liRef }
  )

  return (
    <li ref={liRef} className="flex-shrink-0 w-52">
      <a
        href={expert.href}
        target={expert.href.startsWith("http") ? "_blank" : undefined}
        rel={expert.href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="flex flex-col gap-3 group"
        style={{ textDecoration: "none" }}
        aria-label={`查看 ${expert.name} 的主页`}
      >
        {/* Photo — real Picsum image */}
        <div className="overflow-hidden rounded-lg" style={{ aspectRatio: "1 / 1", border: "1px solid var(--border)" }}>
          <Image
            src={`https://picsum.photos/seed/${expert.imgSeed}/208/208`}
            alt={expert.name}
            width={208}
            height={208}
            className="w-full h-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
            loading="lazy"
          />
        </div>

        {/* Info — no category label below role */}
        <div>
          <p className="font-sans text-sm font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
            {expert.name}
          </p>
          <p className="font-mono text-xs mt-0.5 leading-snug" style={{ color: "var(--text-secondary)" }}>
            {expert.role}
          </p>
          <p className="font-mono text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {expert.org}
          </p>
        </div>
      </a>
    </li>
  )
}

export function ExpertsSection() {
  return (
    <section
      aria-labelledby="experts-heading"
      className="py-24 px-6 max-w-7xl mx-auto"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      {/* Section header — no eyebrow (at page limit) */}
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <h2
            id="experts-heading"
            className="text-balance text-[1.875rem] font-light tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            关注这些大佬
          </h2>
          <p
            className="text-pretty font-mono text-sm mt-3"
            style={{ color: "var(--text-secondary)", maxWidth: "52ch" }}
          >
            帮助你建立 AI 工程化知识体系的思想领袖，值得持续关注。
          </p>
        </div>
        <a href="/experts" className="link-arrow shrink-0 self-end flex items-center gap-1.5">
          全部
          <IconArrowRight size={14} stroke={1.5} aria-hidden="true" />
        </a>
      </div>

      {/* Horizontal scroll strip */}
      <div className="overflow-x-auto -mx-6 px-6 pb-2" role="region" aria-label="大佬列表（横向滚动）">
        <ul className="flex gap-5 list-none m-0 p-0" style={{ width: "max-content" }}>
          {EXPERTS.map((expert, i) => (
            <ExpertCard key={expert.imgSeed} expert={expert} delay={i * 0.06} />
          ))}
        </ul>
      </div>
    </section>
  )
}
