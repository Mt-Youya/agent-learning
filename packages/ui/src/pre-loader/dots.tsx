"use client"

import { motion } from "framer-motion"

import { cn } from "../lib/utils"
import type { LoaderProps } from "./types"

const SIZE_MAP = { sm: 4, md: 6, lg: 10, xl: 14 }
const GAP_MAP = { sm: 5, md: 7, lg: 12, xl: 16 }

export function DotsLoader({ size = "md", className, label = "Loading" }: LoaderProps) {
  const dotPx = SIZE_MAP[size]
  const gap = GAP_MAP[size]

  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center text-primary", className)}
      style={{ gap }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block rounded-full bg-current"
          style={{ width: dotPx, height: dotPx }}
          animate={{ y: [0, -(dotPx * 1.4), 0], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 0.7,
            delay: i * 0.12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  )
}
