import { Button } from ".."
import { VariantProps } from "../type"

export default function ShineHoverButton({ text = "Hover me", children }: VariantProps) {
  return (
    <Button className="relative inline-flex h-10 shrink-0 rounded-xl bg-linear-to-r from-transparent via-white/50 to-transparent bg-size-[200%_100%] bg-left hover:bg-right transition-all duration-500">
      {children || text}
    </Button>
  )
}
