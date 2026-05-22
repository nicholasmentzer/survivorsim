import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        muted: "border-stone-700 bg-stone-900/60 text-stone-300",
        idol: "border-amber-400/40 bg-amber-500/15 text-amber-200",
        extraVote: "border-sky-400/40 bg-sky-500/15 text-sky-200",
        stealVote: "border-rose-400/40 bg-rose-500/15 text-rose-200",
        success: "border-emerald-400/50 bg-emerald-900/40 text-emerald-200",
        danger: "border-rose-400/50 bg-rose-900/40 text-rose-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
