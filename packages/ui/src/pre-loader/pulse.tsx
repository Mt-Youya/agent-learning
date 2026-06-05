"use client"

import { motion } from "framer-motion"

import { cn } from "../lib/utils"
import type { LoaderProps } from "./types"

const SIZE_MAP = { sm: 20, md: 32, lg: 48, xl: 72 }

const RINGS = [
  { delay: 0, duration: 1.8 },
  { delay: 0.6, duration: 1.8 },
  { delay: 1.2, duration: 1.8 },
]

export function PulseLoader({ size = "md", className, label = "Loading" }: LoaderProps) {
  const px = SIZE_MAP[size]
  const center = px / 2
  const coreRadius = px * 0.18

  return (
    <span
      role="status"
      aria-label={label}
      className={cn("relative inline-flex items-center justify-center text-primary", className)}
      style={{ width: px, height: px }}
    >
      {/* Expanding rings */}
      {RINGS.map((ring, i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border-2 border-current"
          initial={{ scale: 0.2, opacity: 0.7 }}
          animate={{ scale: 1.1, opacity: 0 }}
          transition={{
            duration: ring.duration,
            delay: ring.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
      {/* Solid core */}
      <span className="rounded-full bg-current" style={{ width: coreRadius * 2, height: coreRadius * 2 }} />
    </span>
  )
}
