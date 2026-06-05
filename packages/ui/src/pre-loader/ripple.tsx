"use client"

import { motion } from "framer-motion"

import { cn } from "../lib/utils"
import type { LoaderProps } from "./types"

const SIZE_MAP = { sm: 20, md: 32, lg: 48, xl: 72 }

/* Two ripple rings staggered by half the duration */
const RINGS = [{ delay: 0 }, { delay: 0.7 }]

export function RippleLoader({ size = "md", className, label = "Loading" }: LoaderProps) {
  const px = SIZE_MAP[size]
  const coreRadius = px * 0.15

  return (
    <span
      role="status"
      aria-label={label}
      className={cn("relative inline-flex items-center justify-center text-primary", className)}
      style={{ width: px, height: px }}
    >
      {RINGS.map((ring, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-current"
          style={{ inset: 0 }}
          initial={{ scale: 0.1, opacity: 0.8 }}
          animate={{ scale: 1.05, opacity: 0 }}
          transition={{
            duration: 1.4,
            delay: ring.delay,
            repeat: Infinity,
            ease: [0.2, 0.6, 0.4, 1],
          }}
        />
      ))}
      {/* Core */}
      <span className="relative rounded-full bg-current" style={{ width: coreRadius * 2, height: coreRadius * 2 }} />
    </span>
  )
}
