"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const DialogContext = React.createContext<{ isOpen: boolean; setIsOpen: (open: boolean) => void } | null>(null)

function useDialog() {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("Dialog components must be used within Dialog")
  return context
}

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  className?: string
  children: React.ReactNode
}

interface DialogTriggerProps {
  children: React.ReactElement
  asChild?: boolean
  onClick?: () => void
}

export function DialogTrigger({ children, asChild = false, onClick }: DialogTriggerProps) {
  const { setIsOpen } = useDialog()

  if (asChild) {
    const childElement = children as React.ReactElement<any>
    const childProps = childElement.props || {}

    return React.cloneElement(childElement, {
      ...childProps,
      onClick: (e: React.MouseEvent<any>) => {
        e.stopPropagation()
        setIsOpen(true)
        childProps.onClick?.(e)
      },
    })
  }

  return (
    <button
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        setIsOpen(true)
        onClick?.()
      }}
      type="button"
    >
      {children}
    </button>
  )
}

export function DialogContent({ className, children }: DialogContentProps) {
  const { isOpen, setIsOpen } = useDialog()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/80 animate-in fade-in-0"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative z-50 w-full max-w-lg bg-white rounded-xl border border-ink-200 shadow-lg animate-in fade-in-0 zoom-in-95",
          className
        )}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-sm p-1 text-ink-400 hover:text-ink-600 hover:bg-ink-100 transition-colors focus:outline-none focus:ring-2 focus:ring-crimson-500"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>{children}</div>
}

export function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>{children}</div>
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-lg font-display font-semibold leading-none tracking-tight text-ink-900", className)}>{children}</h2>
}

export function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm text-ink-500", className)}>{children}</p>
}

export function DialogClose({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} type="button">{children}</button>
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  const [isOpen, setIsOpen] = React.useState(open)

  React.useEffect(() => {
    setIsOpen(open)
  }, [open])

  const handleOpenChange = (value: boolean) => {
    setIsOpen(value)
    onOpenChange?.(value)
  }

  return (
    <DialogContext.Provider value={{ isOpen, setIsOpen: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  className?: string
  children: React.ReactNode
}

interface DialogTriggerProps {
  children: React.ReactElement
  asChild?: boolean
  onClick?: () => void
}