import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gray-900 text-white",
        secondary: "border-transparent bg-gray-100 text-gray-800",
        destructive: "border-transparent bg-red-100 text-red-700",
        outline: "text-gray-700 border-gray-200",
        violet: "border-transparent bg-violet-50 text-violet-700",
        blue: "border-transparent bg-blue-50 text-blue-700",
        emerald: "border-transparent bg-emerald-50 text-emerald-700",
        orange: "border-transparent bg-orange-50 text-orange-700",
        amber: "border-transparent bg-amber-50 text-amber-700",
        pink: "border-transparent bg-pink-50 text-pink-700",
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
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
