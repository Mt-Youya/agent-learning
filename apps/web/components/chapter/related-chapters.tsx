/* Server Component */
import type { Chapter } from "@/lib/chapters"

interface RelatedChaptersProps {
  chapters: Chapter[]
}

export function RelatedChapters({ chapters }: RelatedChaptersProps) {
  if (chapters.length === 0) return null

  return (
    <section className="mt-12 pt-8" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <p className="font-mono text-xs tracking-[0.16em] uppercase mb-5" style={{ color: "var(--text-muted)" }}>
        相关章节
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {chapters.map((chapter) => (
          <a
            key={chapter.slug}
            href={`/learn/${chapter.slug}`}
            className="flex-1 flex items-start gap-3 p-4 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--surface-1)",
              border: "1px solid var(--border)",
              textDecoration: "none",
            }}
          >
            {/* Order number */}
            <span
              className="font-mono text-xs tabular-nums pt-0.5 shrink-0"
              style={{ color: "var(--text-muted)" }}
              aria-hidden="true"
            >
              {String(chapter.order).padStart(2, "0")}
            </span>

            {/* Content */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <span className="font-mono text-sm font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
                {chapter.title}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: chapter.trackColor }}>
                  {chapter.level}
                </span>
                <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  {chapter.duration}
                </span>
              </div>
            </div>

            {/* Arrow */}
            <span
              className="font-mono text-sm self-center shrink-0"
              style={{ color: "var(--text-muted)" }}
              aria-hidden="true"
            >
              →
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
