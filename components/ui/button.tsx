"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "ghost" | "destructive" | "outline" | "link"
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm"
  loading?: boolean
  asChild?: boolean
}

const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none"

const variantStyles = {
  default: "bg-ink-900 text-white hover:bg-ink-800 active:scale-[0.98] shadow-sm",
  primary: "bg-crimson-600 text-white hover:bg-crimson-700 active:scale-[0.98] shadow-sm shadow-crimson-200",
  secondary: "bg-surface text-ink-800 border border-ink-200 hover:bg-ink-50 active:scale-[0.98]",
  ghost: "text-ink-700 hover:bg-ink-100 hover:text-ink-900",
  destructive: "bg-crimson-600 text-white hover:bg-crimson-700 active:scale-[0.98]",
  outline: "border border-ink-300 bg-transparent text-ink-800 hover:bg-ink-50",
  link: "text-crimson-600 underline-offset-4 hover:underline p-0 h-auto",
}

const sizeStyles = {
  default: "h-10 px-4 py-2",
  sm: "h-8 px-3 text-xs",
  lg: "h-12 px-6 text-base",
  icon: "h-9 w-9",
  "icon-sm": "h-7 w-7",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading = false, asChild = false, children, ...props }, ref) => {
    // When asChild is true, we clone the child element and merge props
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<any>
      return React.cloneElement(child, {
        ...child.props,
        ...props,
        className: cn(baseStyles, variantStyles[variant], sizeStyles[size], child.props.className),
        disabled: loading || props.disabled || child.props.disabled,
        ref,
      }) as React.ReactElement
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }