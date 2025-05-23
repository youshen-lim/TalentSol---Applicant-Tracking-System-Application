import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Enhanced Textarea component for TalentSol ATS application
 * Includes ATS-specific variants and improved styling
 */

const textareaVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "focus-visible:ring-ring focus:border-input",
        "ats-blue": "focus-visible:ring-ats-blue focus:border-ats-blue",
        "ats-purple": "focus-visible:ring-ats-purple focus:border-ats-purple",
        "ats-blue-subtle": "bg-ats-blue/5 border-ats-blue/20 focus-visible:ring-ats-blue focus:border-ats-blue",
        "ats-purple-subtle": "bg-ats-purple/5 border-ats-purple/20 focus-visible:ring-ats-purple focus:border-ats-purple",
      },
      size: {
        default: "min-h-[80px]",
        sm: "min-h-[60px] text-xs",
        md: "min-h-[80px]",
        lg: "min-h-[120px]",
        xl: "min-h-[160px]",
      },
      resize: {
        none: "resize-none",
        y: "resize-y",
        x: "resize-x",
        both: "resize",
      },
      error: {
        true: "border-destructive focus-visible:ring-destructive",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      resize: "y",
      error: false,
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, resize, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, size, resize, error }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

/**
 * Textarea with label and optional error message
 */
interface TextareaWithLabelProps extends TextareaProps {
  label?: string;
  description?: string;
  errorMessage?: string;
  required?: boolean;
}

const TextareaWithLabel = React.forwardRef<HTMLTextAreaElement, TextareaWithLabelProps>(
  ({ label, description, errorMessage, required, className, variant, size, resize, error, ...props }, ref) => {
    // Determine label color based on variant
    const getLabelClass = () => {
      if (error) return "text-destructive";

      switch (variant) {
        case "ats-blue":
        case "ats-blue-subtle":
          return "text-ats-dark-blue";
        case "ats-purple":
        case "ats-purple-subtle":
          return "text-ats-dark-purple";
        default:
          return "text-foreground";
      }
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className={cn("text-sm font-medium leading-none", getLabelClass())}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        <Textarea
          ref={ref}
          variant={variant}
          size={size}
          resize={resize}
          error={error || !!errorMessage}
          aria-invalid={error || !!errorMessage}
          aria-required={required}
          className={className}
          {...props}
        />
        {errorMessage && (
          <p className="text-xs text-destructive">{errorMessage}</p>
        )}
      </div>
    )
  }
)
TextareaWithLabel.displayName = "TextareaWithLabel"

export { Textarea, TextareaWithLabel, textareaVariants }
