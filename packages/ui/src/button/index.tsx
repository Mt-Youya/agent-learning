import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils"

/*
 * Border strategy: no global `border border-transparent` on the base class.
 * In Tailwind v4, preflight sets `border-color: currentColor` globally.
 * Combined with any inherited border-width, this leaks visible borders onto
 * ghost / default / secondary variants. Only `outline` gets an explicit
 * border; all other variants are border-free.
 */
const buttonVariants = cva(
  "group/button py-2 inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/60 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/85 active:bg-primary/90",
        outline:
          "border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 gap-1.5 px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-md px-2.5 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-3",
        icon: "size-8",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-md",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton = true,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      nativeButton={nativeButton}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
