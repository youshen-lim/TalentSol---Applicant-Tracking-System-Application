import * as React from "react"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: "default" | "search" | "ats"
  }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Filled background (#f3f3f5 via --color-input-background), subtle border, indigo focus ring
          "flex h-10 w-full rounded-md border bg-input-background px-3 py-2 text-sm text-gray-900",
          "placeholder:text-gray-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-300",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-900",
          "transition-colors",
          // Search variant with icon padding
          variant === "search" && "pl-9",
          className
        )}
        style={{ borderColor: 'var(--color-border)' }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// Search input with icon
const SearchInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "variant">>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          variant="search"
          className={className}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { Input, SearchInput }
