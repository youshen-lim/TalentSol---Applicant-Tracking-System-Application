import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * Enhanced Calendar component for TalentSol ATS application
 * Supports ATS-specific styling and customization options
 */
export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  variant?: "default" | "ats-blue" | "ats-purple"
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  variant = "default",
  ...props
}: CalendarProps) {
  // Apply variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case "ats-blue":
        return {
          day_selected: "bg-ats-blue text-white hover:bg-ats-dark-blue hover:text-white focus:bg-ats-dark-blue focus:text-white",
          nav_button: cn(
            buttonVariants({ variant: "ats-outline-blue" }),
            "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
          ),
          day_today: "bg-ats-blue/10 text-ats-blue font-medium border border-ats-blue/30"
        }
      case "ats-purple":
        return {
          day_selected: "bg-ats-purple text-white hover:bg-ats-dark-purple hover:text-white focus:bg-ats-dark-purple focus:text-white",
          nav_button: cn(
            buttonVariants({ variant: "ats-outline-purple" }),
            "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
          ),
          day_today: "bg-ats-purple/10 text-ats-purple font-medium border border-ats-purple/30"
        }
      default:
        return {
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          day_today: "bg-accent text-accent-foreground"
        }
    }
  }

  const variantStyles = getVariantStyles()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: variantStyles.nav_button,
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected: variantStyles.day_selected,
        day_today: variantStyles.day_today,
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
