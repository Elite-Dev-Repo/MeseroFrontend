"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
  onValueChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onValueChange?.(e.target.value)
      props.onChange?.(e)
    }

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-ink-900 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            onChange={handleChange}
            className={cn(
              "flex h-10 w-full appearance-none rounded-lg border border-ink-200 bg-white px-3 py-2 pr-10 text-sm text-ink-900",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-ink-50",
              "hover:border-ink-300",
              error && "border-crimson-300 focus:ring-crimson-500",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && <p className="mt-1.5 text-sm text-crimson-600">{error}</p>}
      </div>
    )
  }
)
Select.displayName = "Select"

const SelectTrigger = Select
const SelectValue = Select
const SelectContent = Select
const SelectItem = Select

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }