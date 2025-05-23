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
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus:border-ats-blue",
          // Search variant with search icon padding
          variant === "search" && "pl-9",
          // ATS variant with blue focus and hover states
          variant === "ats" && "border-ats-border-gray hover:border-ats-light-blue focus:border-ats-blue focus:ring-ats-blue",
          className
        )}
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ats-blue" />
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
