import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { cn } from "@/lib/utils"
import { FloatingChat } from "@/components/chat/floating-chat"
import "./globals.css"

export const metadata: Metadata = {
  title: "AgentLab — AI Agent 工程化学习平台",
  description: "面向前端工程师的 AI Agent 系统学习平台。五个模块，真实代码，JS/TS 全程，无 Python 依赖。",
  icons: { icon: "/logo.svg" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /*
      suppressHydrationWarning: the theme script below mutates className
      synchronously before hydration; React would otherwise warn about
      server/client mismatch. This is the standard next-themes pattern.
    */
    <html lang="zh-CN" className={cn(GeistSans.variable, GeistMono.variable)} suppressHydrationWarning>
      <head>
        {/*
          Anti-flash theme script — runs synchronously before first paint.
          Reads localStorage to restore the user's last preference.
          Default: dark (matches brand). 'light' must be explicitly saved.
          Also applies no-theme-transition for the initial paint to prevent
          the CSS transition from firing on page load.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  var cl = document.documentElement.classList;
  cl.add('no-theme-transition');
  var t = localStorage.getItem('theme');
  if (t === 'light') { cl.remove('dark'); } else { cl.add('dark'); }
  requestAnimationFrame(function(){ cl.remove('no-theme-transition'); });
})();`,
          }}
        />
      </head>
      <body className="font-sans">
        {children}
        <FloatingChat />
        {/* impeccable-live-start */}
        <script src="http://localhost:8400/live.js"></script>
        {/* impeccable-live-end */}
      </body>
    </html>
  )
}
