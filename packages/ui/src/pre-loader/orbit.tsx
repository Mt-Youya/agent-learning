"use client"

import { motion } from "framer-motion"

import { cn } from "../lib/utils"
import type { LoaderProps } from "./types"

const SIZE_MAP = { sm: 20, md: 32, lg: 48, xl: 72 }

export function OrbitLoader({ size = "md", className, label = "Loading" }: LoaderProps) {
  const px = SIZE_MAP[size]

  return (
    <svg
      role="status"
      aria-label={label}
      width={px}
      height={px}
      viewBox="0 0 100 100"
      fill="currentColor"
      className={cn("text-primary", className)}
    >
      {/* Center dot */}
      <circle cx="50" cy="50" r="7" />

      {/* Outer orbit — clockwise, large dot */}
      <motion.g
        style={{ transformOrigin: "50px 50px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="50" cy="12" r="6" />
      </motion.g>

      {/* Mid orbit — counter-clockwise, medium dot */}
      <motion.g
        style={{ transformOrigin: "50px 50px" }}
        animate={{ rotate: -360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="50" cy="20" r="4.5" opacity={0.65} />
      </motion.g>

      {/* Inner orbit — clockwise (slower), small dot */}
      <motion.g
        style={{ transformOrigin: "50px 50px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="78" cy="50" r="3" opacity={0.35} />
      </motion.g>
    </svg>
  )
}
