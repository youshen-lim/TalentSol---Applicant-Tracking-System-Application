import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    variant?: "default" | "blue" | "purple"
  }
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "default" && "border-primary text-primary focus-visible:ring-ring",
        variant === "blue" && "border-ats-blue text-ats-blue focus-visible:ring-ats-blue",
        variant === "purple" && "border-ats-purple text-ats-purple focus-visible:ring-ats-purple",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

// Radio group with label and optional description
interface RadioGroupItemWithLabelProps extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupItem>, 'id'> {
  id: string;
  label: string;
  description?: string;
}

const RadioGroupItemWithLabel = React.forwardRef<
  React.ElementRef<typeof RadioGroupItem>,
  RadioGroupItemWithLabelProps
>(({ id, label, description, className, ...props }, ref) => {
  return (
    <div className="flex items-start space-x-2">
      <RadioGroupItem id={id} ref={ref} {...props} />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
});
RadioGroupItemWithLabel.displayName = "RadioGroupItemWithLabel";

// Card-style radio group for more visual options
interface RadioGroupCardProps extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>, 'className'> {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "blue" | "purple";
}

const RadioGroupCard = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupCardProps
>(({ label, description, icon, variant = "default", ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "relative rounded-md border border-input bg-background px-4 py-3 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-ats-light-blue/50 hover:bg-ats-light-blue/5",
        "data-[state=checked]:border-2",
        variant === "default" && "data-[state=checked]:border-primary",
        variant === "blue" && "data-[state=checked]:border-ats-blue",
        variant === "purple" && "data-[state=checked]:border-ats-purple"
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className={cn(
            "mt-0.5 text-muted-foreground",
            variant === "blue" && "data-[state=checked]:text-ats-blue",
            variant === "purple" && "data-[state=checked]:text-ats-purple",
            "peer-data-[state=checked]:text-foreground"
          )}>
            {icon}
          </div>
        )}
        <div>
          <div className={cn(
            "font-medium",
            variant === "blue" && "data-[state=checked]:text-ats-dark-blue",
            variant === "purple" && "data-[state=checked]:text-ats-purple",
          )}>
            {label}
          </div>
          {description && (
            <div className="text-xs text-muted-foreground">
              {description}
            </div>
          )}
        </div>
      </div>
      <RadioGroupPrimitive.Indicator className={cn(
        "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "blue" && "bg-ats-blue text-white",
        variant === "purple" && "bg-ats-purple text-white"
      )}>
        <Circle className="h-2.5 w-2.5 fill-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupCard.displayName = "RadioGroupCard";

export { RadioGroup, RadioGroupItem, RadioGroupItemWithLabel, RadioGroupCard }
