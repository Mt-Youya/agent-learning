/* Server Component */
import type { Chapter } from "@/lib/chapters"

interface ChapterSidebarProps {
  chapters: Chapter[]
  currentSlug: string
}

export function ChapterSidebar({ chapters, currentSlug }: ChapterSidebarProps) {
  return (
    <nav
      aria-label="课程章节导航"
      style={{
        position: "sticky",
        top: "56px",
        height: "calc(100vh - 56px)",
        overflowY: "auto",
      }}
    >
      <div className="py-6 px-4">
        <p className="font-mono text-xs tracking-[0.16em] uppercase px-2 mb-4" style={{ color: "var(--text-muted)" }}>
          学习路线
        </p>

        <ol className="flex flex-col gap-0.5 list-none m-0 p-0">
          {chapters.map((chapter) => {
            const isActive = chapter.slug === currentSlug

            return (
              <li key={chapter.slug}>
                <a
                  href={`/learn/${chapter.slug}`}
                  aria-current={isActive ? "page" : undefined}
                  className="flex items-start gap-2.5 px-2 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: isActive ? "var(--accent-subtle)" : "transparent",
                    textDecoration: "none",
                  }}
                >
                  {/* Sequence number */}
                  <span
                    className="font-mono text-xs tabular-nums pt-px shrink-0"
                    style={{
                      color: isActive ? "var(--accent)" : "var(--text-muted)",
                    }}
                    aria-hidden="true"
                  >
                    {String(chapter.order).padStart(2, "0")}
                  </span>

                  {/* Title */}
                  <span
                    className="font-mono text-xs leading-snug flex-1 min-w-0"
                    style={{
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    }}
                  >
                    {chapter.title}
                  </span>

                  {/* Active indicator */}
                  {isActive && (
                    <span
                      className="shrink-0 mt-1.5"
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        backgroundColor: "var(--accent)",
                        display: "block",
                      }}
                      aria-hidden="true"
                    />
                  )}
                </a>
              </li>
            )
          })}
        </ol>

        {/* Back link */}
        <div className="mt-6 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <a href="/learn" className="flex items-center gap-2 px-2 link-arrow">
            <span aria-hidden="true">←</span>
            <span className="font-mono text-xs">返回课程列表</span>
          </a>
        </div>
      </div>
    </nav>
  )
}
