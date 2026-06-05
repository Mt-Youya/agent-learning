import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        serif: ["var(--font-geist-sans)", "system-ui", "sans-serif"] /* redirect serif → sans */,
      },

      /* ── shadcn/ui semantic color tokens ────────────────────────────────
         These match the CSS variable names used by shadcn components.
         Values are resolved at runtime from globals.css :root overrides.  */
      colors: {
        /* shadcn semantic */
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          /* alpha-value template enables bg-primary/80 in Tailwind v3 */
          DEFAULT: "oklch(62% 0.16 248 / <alpha-value>)",
          foreground: "oklch(12% 0.008 248)",
        },
        secondary: {
          DEFAULT: "oklch(21% 0.008 248 / <alpha-value>)",
          foreground: "oklch(93% 0.005 248)",
        },
        muted: {
          DEFAULT: "oklch(16.5% 0.008 248 / <alpha-value>)",
          foreground: "oklch(60% 0.008 248)",
        },
        accent: {
          /* accent alpha-value enables bg-accent/N utilities */
          DEFAULT: "oklch(62% 0.16 248 / <alpha-value>)",
          foreground: "oklch(93% 0.005 248)",
        },
        destructive: {
          /* Uses alpha-value template so ring-destructive/20 works in Tailwind v3 */
          DEFAULT: "oklch(0.577 0.245 27.325 / <alpha-value>)",
          foreground: "oklch(0.97 0.014 254.604)",
        },
        border: "var(--border)",
        input: "var(--input)",
        /* ring uses alpha-value template so outline-ring/50 works in Tailwind v3 */
        ring: "oklch(62% 0.16 248 / <alpha-value>)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },

        /* ── Our custom design tokens (keep for existing components) ── */
        base: "var(--base)",
        surface: "var(--surface-1)",
        "surface-2": "var(--surface-2)",
        "zn-border": "var(--border)",
        "zn-border-subtle": "var(--border-subtle)",
        "accent-dim": "var(--accent-dim)",
        hi: "var(--text-primary)",
        lo: "var(--text-secondary)",
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      maxWidth: {
        prose: "68ch",
      },

      /* Fixed z-index scale — no arbitrary z-[n] values allowed */
      zIndex: {
        base: "0",
        raised: "10",
        sticky: "20",
        dropdown: "30",
        nav: "40",
        overlay: "50",
        progress: "55",
        skip: "60",
        modal: "70",
        tooltip: "80",
      },
    },
  },
  plugins: [],
}

export default config
