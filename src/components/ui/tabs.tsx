"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div data-slot="tabs" className={className} data-value={value}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            _value: value,
            _onValueChange: onValueChange,
          })
        }
        return child
      })}
    </div>
  )
}

function TabsList({
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { _value?: string; _onValueChange?: (v: string) => void }) {
  const { _value, _onValueChange, ...rest } = props
  return (
    <div
      data-slot="tabs-list"
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-gray-100 p-1 text-gray-500",
        className
      )}
      {...rest}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            _value,
            _onValueChange,
          })
        }
        return child
      })}
    </div>
  )
}

interface TabsTriggerProps extends React.ComponentProps<"button"> {
  value: string
  _value?: string
  _onValueChange?: (value: string) => void
}

function TabsTrigger({ className, value, _value, _onValueChange, ...props }: TabsTriggerProps) {
  const isActive = _value === value
  return (
    <button
      data-slot="tabs-trigger"
      data-state={isActive ? "active" : "inactive"}
      onClick={() => _onValueChange?.(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
        isActive
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-500 hover:text-gray-700",
        className
      )}
      {...props}
    />
  )
}

interface TabsContentProps extends React.ComponentProps<"div"> {
  value: string
  _value?: string
  _onValueChange?: (v: string) => void
}

function TabsContent({ className, value, _value, _onValueChange: _, ...props }: TabsContentProps) {
  if (_value !== value) return null
  return (
    <div
      data-slot="tabs-content"
      className={cn("mt-2", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
