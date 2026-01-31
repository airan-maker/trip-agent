"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  )
}

function SheetContent({
  className,
  children,
  side = "bottom",
  onClose,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "top" | "bottom" | "left" | "right"
  onClose?: () => void
}) {
  const sideStyles = {
    bottom: "inset-x-0 bottom-0 rounded-t-2xl max-h-[85vh]",
    top: "inset-x-0 top-0 rounded-b-2xl max-h-[85vh]",
    left: "inset-y-0 left-0 w-3/4 max-w-sm",
    right: "inset-y-0 right-0 w-3/4 max-w-sm",
  }

  return (
    <div
      className={cn(
        "fixed z-50 bg-white shadow-xl flex flex-col overflow-auto",
        sideStyles[side],
        className
      )}
      {...props}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-2 p-4 pb-0", className)} {...props} />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-lg font-semibold", className)} {...props} />
  )
}

export { Sheet, SheetContent, SheetHeader, SheetTitle }
