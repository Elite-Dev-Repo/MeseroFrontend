"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps {
  defaultValue: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function Tabs({ defaultValue, onValueChange, children, className }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue)

  const context = React.useMemo(() => ({ value, setValue: (v: string) => { setValue(v); onValueChange?.(v) } }), [value, onValueChange])

  return (
    <TabsContext.Provider value={context}>
      <div className={cn("", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

const TabsContext = React.createContext<{ value: string; setValue: (value: string) => void } | null>(null)

function useTabs() {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("Tabs components must be used within Tabs")
  return context
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-lg bg-ink-100 p-1 text-ink-600", className)} role="tablist">
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className, disabled }: TabsTriggerProps) {
  const { value: currentValue, setValue } = useTabs()
  const isActive = currentValue === value

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabs-content-${value}`}
      id={`tabs-trigger-${value}`}
      onClick={() => !disabled && setValue(value)}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-white text-crimson-700 shadow-sm" : "text-ink-600 hover:text-ink-900",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: currentValue } = useTabs()
  const isActive = currentValue === value

  if (!isActive) return null

  return (
    <div
      role="tabpanel"
      id={`tabs-content-${value}`}
      aria-labelledby={`tabs-trigger-${value}`}
      className={cn("mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-500 focus-visible:ring-offset-2", className)}
    >
      {children}
    </div>
  )
}