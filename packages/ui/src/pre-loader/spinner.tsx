"use client"

import { motion } from "framer-motion"

import { cn } from "../lib/utils"
import type { LoaderProps } from "./types"

const SIZE_MAP = { sm: 20, md: 32, lg: 48, xl: 72 }

const RADIUS = 45
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const ARC = CIRCUMFERENCE * 0.72 // 72% arc — leaves a visible gap for the "chasing" effect

export function SpinnerLoader({ size = "md", className, label = "Loading" }: LoaderProps) {
  const px = SIZE_MAP[size]

  return (
    <motion.svg
      role="status"
      aria-label={label}
      width={px}
      height={px}
      viewBox="0 0 100 100"
      fill="none"
      className={cn("text-primary", className)}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
    >
      {/* Track */}
      <circle cx="50" cy="50" r={RADIUS} stroke="currentColor" strokeWidth="10" className="opacity-10" />
      {/* Arc */}
      <circle
        cx="50"
        cy="50"
        r={RADIUS}
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${ARC} ${CIRCUMFERENCE}`}
        strokeDashoffset={0}
      />
    </motion.svg>
  )
}
