import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    variant?: "default" | "blue" | "purple" | "success" | "warning" | "danger"
  }
>(({ className, value, variant = "default", ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-all",
        variant === "default" && "bg-primary",
        variant === "blue" && "bg-ats-blue",
        variant === "purple" && "bg-ats-purple",
        variant === "success" && "bg-green-500",
        variant === "warning" && "bg-yellow-500",
        variant === "danger" && "bg-red-500"
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

// Enhanced progress bar with label and percentage
interface ProgressWithLabelProps extends React.ComponentPropsWithoutRef<typeof Progress> {
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
}

const ProgressWithLabel = React.forwardRef<
  React.ElementRef<typeof Progress>,
  ProgressWithLabelProps
>(({
  className,
  value,
  label,
  showPercentage = true,
  size = "md",
  ...props
}, ref) => {
  const percentage = value || 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && <p className="text-sm font-medium text-ats-dark-blue">{label}</p>}
          {showPercentage && <p className="text-sm text-muted-foreground">{Math.round(percentage)}%</p>}
        </div>
      )}
      <Progress
        ref={ref}
        value={percentage}
        className={cn(
          size === "sm" && "h-2",
          size === "md" && "h-3",
          size === "lg" && "h-4"
        )}
        {...props}
      />
    </div>
  );
});
ProgressWithLabel.displayName = "ProgressWithLabel";

// Specialized component for application progress tracking
interface ApplicationProgressProps {
  className?: string;
  currentStage: number;
  totalStages?: number;
  stages?: string[];
  variant?: "default" | "blue" | "purple";
}

const ApplicationProgress = ({
  className,
  currentStage,
  totalStages = 5,
  stages = ["Applied", "Screening", "Interview", "Assessment", "Offer"],
  variant = "blue",
}: ApplicationProgressProps) => {
  // Calculate percentage based on current stage
  const percentage = ((currentStage - 1) / (totalStages - 1)) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      <ProgressWithLabel
        value={percentage}
        variant={variant}
        size="md"
        showPercentage={false}
      />
      <div className="flex justify-between">
        {stages.map((stage, index) => (
          <div
            key={stage}
            className={cn(
              "flex flex-col items-center",
              index === 0 && "items-start",
              index === stages.length - 1 && "items-end"
            )}
          >
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                index + 1 < currentStage &&
                  (variant === "blue" ? "bg-ats-blue text-white" :
                   variant === "purple" ? "bg-ats-purple text-white" :
                   "bg-primary text-primary-foreground"),
                index + 1 === currentStage &&
                  (variant === "blue" ? "border-2 border-ats-blue text-ats-blue" :
                   variant === "purple" ? "border-2 border-ats-purple text-ats-purple" :
                   "border-2 border-primary text-primary"),
                index + 1 > currentStage && "border border-input bg-background"
              )}
            >
              {index + 1}
            </div>
            <span
              className={cn(
                "mt-1.5 text-xs",
                index + 1 <= currentStage ? "font-medium text-ats-dark-blue" : "text-muted-foreground"
              )}
            >
              {stage}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
ApplicationProgress.displayName = "ApplicationProgress";

export { Progress, ProgressWithLabel, ApplicationProgress }
