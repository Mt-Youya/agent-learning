"use client"

import * as React from "react"

import type { LoaderProps } from "./types"
import { SpinnerLoader } from "./spinner"
import { DotsLoader } from "./dots"
import { PulseLoader } from "./pulse"
import { OrbitLoader } from "./orbit"
import { BarsLoader } from "./bars"
import { RippleLoader } from "./ripple"

export type PreLoaderVariant = "spinner" | "dots" | "pulse" | "orbit" | "bars" | "ripple"

export interface PreLoaderProps extends LoaderProps {
  /** Which animation style to render */
  variant?: PreLoaderVariant
}

const VARIANT_MAP: Record<PreLoaderVariant, React.ComponentType<LoaderProps>> = {
  spinner: SpinnerLoader,
  dots: DotsLoader,
  pulse: PulseLoader,
  orbit: OrbitLoader,
  bars: BarsLoader,
  ripple: RippleLoader,
}

/**
 * PreLoader — animated loading indicator with six visual variants.
 *
 * @example
 * <PreLoader variant="spinner" size="md" />
 * <PreLoader variant="dots" size="lg" className="text-emerald-500" />
 */
function PreLoader({ variant = "spinner", size = "md", className, label = "Loading" }: PreLoaderProps) {
  const Loader = VARIANT_MAP[variant]
  return <Loader size={size} className={className} label={label} />
}

export { PreLoader }

/* Named variant exports — allows tree-shaking when only one is needed */
export { SpinnerLoader, DotsLoader, PulseLoader, OrbitLoader, BarsLoader, RippleLoader }
export type { LoaderProps }
