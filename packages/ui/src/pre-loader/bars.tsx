"use client"

import { motion } from "framer-motion"

import { cn } from "../lib/utils"
import type { LoaderProps } from "./types"

/* Height of the container in px, bar width scales with it */
const SIZE_MAP = { sm: 14, md: 22, lg: 32, xl: 48 }

const DELAYS = [0, 0.14, 0.28, 0.42, 0.14]

export function BarsLoader({ size = "md", className, label = "Loading" }: LoaderProps) {
  const h = SIZE_MAP[size]
  const barW = Math.max(2, Math.round(h * 0.18))
  const gap = Math.max(1, Math.round(h * 0.12))

  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-flex items-end text-primary", className)}
      style={{ height: h, gap }}
    >
      {DELAYS.map((delay, i) => (
        <motion.span
          key={i}
          className="block rounded-sm bg-current"
          style={{ width: barW, height: h, transformOrigin: "bottom" }}
          animate={{ scaleY: [0.25, 1, 0.25], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 0.8,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  )
}
