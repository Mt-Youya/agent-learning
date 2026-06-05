import { HeroSection } from "@/components/home/hero-section"
import { TechStackMarquee } from "@/components/home/tech-stack-marquee"
import { RoadmapSection } from "@/components/home/roadmap-section"
import { ToolsSection } from "@/components/home/tools-section"
import { FrontendAdvantageSection } from "@/components/home/frontend-advantage-section"
import { FooterSection } from "@/components/home/footer-section"
import { Nav } from "@/components/nav"

export default function HomePage() {
  return (
    <>
      {/* Skip-nav: hidden until focused, slides in on Tab */}
      <a
        href="#main-content"
        className="fixed top-3 left-4 z-skip font-mono text-xs font-medium px-4 py-2 rounded-lg
                   transition-transform duration-150 -translate-y-[calc(100%+12px)] focus:translate-y-0"
        style={{ backgroundColor: "var(--accent)", color: "var(--base)" }}
      >
        跳转到主内容
      </a>

      <Nav />

      <main id="main-content" tabIndex={-1}>
        <HeroSection />

        {/*
          Tech stack marquee between hero and roadmap.
          Motivation: names the concrete tools before the learner
          clicks into chapters — prevents the roadmap from feeling abstract.
          ONE marquee per page (design-taste-frontend §5).
        */}
        <TechStackMarquee />

        <RoadmapSection />
        <ToolsSection />
        <FrontendAdvantageSection />
      </main>

      <FooterSection />
    </>
  )
}
