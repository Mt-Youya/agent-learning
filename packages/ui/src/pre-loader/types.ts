export interface LoaderProps {
  /** Visual size of the loader */
  size?: "sm" | "md" | "lg" | "xl"
  /** Additional Tailwind classes — use `text-*` to tint the loader */
  className?: string
  /** Accessible label for screen readers */
  label?: string
}
