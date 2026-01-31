"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CollapsibleProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

function Collapsible({ open, onOpenChange, children, className }: CollapsibleProps) {
  return (
    <div data-slot="collapsible" data-state={open ? "open" : "closed"} className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            _open: open,
            _onOpenChange: onOpenChange,
          })
        }
        return child
      })}
    </div>
  )
}

function CollapsibleTrigger({
  className,
  children,
  _open,
  _onOpenChange,
  ...props
}: React.ComponentProps<"button"> & {
  _open?: boolean
  _onOpenChange?: (open: boolean) => void
}) {
  return (
    <button
      data-slot="collapsible-trigger"
      onClick={() => _onOpenChange?.(!_open)}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </button>
  )
}

function CollapsibleContent({
  className,
  _open,
  _onOpenChange: _,
  ...props
}: React.ComponentProps<"div"> & {
  _open?: boolean
  _onOpenChange?: (open: boolean) => void
}) {
  if (!_open) return null
  return (
    <div
      data-slot="collapsible-content"
      className={cn("overflow-hidden", className)}
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
