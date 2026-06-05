"use client"

import * as motion from "motion/react-client"
import { Button } from ".."
import { VariantProps } from "../type"

export default function TapAnimationButton({ text = "Tap me", children }: VariantProps) {
  return (
    <Button
      render={<motion.button whileTap={{ scale: 0.85 }} />}
      className="transition-none active:translate-y-0"
      nativeButton={true}
    >
      {children || text}
    </Button>
  )
}
