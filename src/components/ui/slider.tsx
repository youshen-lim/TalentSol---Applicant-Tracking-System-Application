import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Enhanced Slider component for TalentSol ATS application
 * Includes ATS-specific variants and improved styling
 */

const sliderVariants = cva(
  "relative flex w-full touch-none select-none items-center",
  {
    variants: {
      variant: {
        default: "",
        "ats-blue": "",
        "ats-purple": "",
      },
      size: {
        default: "",
        sm: "gap-1",
        lg: "gap-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const trackVariants = cva(
  "relative grow overflow-hidden rounded-full",
  {
    variants: {
      variant: {
        default: "bg-secondary",
        "ats-blue": "bg-ats-blue/20",
        "ats-purple": "bg-ats-purple/20",
      },
      size: {
        default: "h-2 w-full",
        sm: "h-1.5 w-full",
        lg: "h-3 w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const rangeVariants = cva(
  "absolute h-full",
  {
    variants: {
      variant: {
        default: "bg-primary",
        "ats-blue": "bg-ats-blue",
        "ats-purple": "bg-ats-purple",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const thumbVariants = cva(
  "block rounded-full border-2 bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-primary",
        "ats-blue": "border-ats-blue",
        "ats-purple": "border-ats-purple",
      },
      size: {
        default: "h-5 w-5",
        sm: "h-4 w-4",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    VariantProps<typeof sliderVariants> {
  showTooltip?: boolean
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, variant = "default", size = "default", showTooltip = false, ...props }, ref) => {
  const [value, setValue] = React.useState<number[]>(props.defaultValue || [0])

  React.useEffect(() => {
    if (props.value) {
      setValue(Array.isArray(props.value) ? props.value : [props.value])
    }
  }, [props.value])

  const handleValueChange = (newValue: number[]) => {
    setValue(newValue)
    if (props.onValueChange) {
      props.onValueChange(newValue)
    }
  }

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(sliderVariants({ variant, size }), className)}
      onValueChange={handleValueChange}
      {...props}
    >
      <SliderPrimitive.Track className={cn(trackVariants({ variant, size }))}>
        <SliderPrimitive.Range className={cn(rangeVariants({ variant }))} />
      </SliderPrimitive.Track>
      {props.defaultValue?.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className={cn(thumbVariants({ variant, size }))}
          aria-label={`Thumb ${i + 1}`}
        >
          {showTooltip && (
            <div className={cn(
              "absolute -top-8 left-1/2 -translate-x-1/2 rounded px-2 py-1 text-xs font-semibold",
              variant === "ats-blue" ? "bg-ats-blue text-white" :
              variant === "ats-purple" ? "bg-ats-purple text-white" :
              "bg-primary text-primary-foreground"
            )}>
              {value[i]}
            </div>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider, sliderVariants, trackVariants, rangeVariants, thumbVariants }
