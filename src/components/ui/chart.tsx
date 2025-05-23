import * as React from "react"
import * as RechartsPrimitive from "recharts"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Enhanced Chart components for TalentSol ATS application
 * Supports ATS-specific styling and customization options
 */

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

// ATS-specific color configurations
export const ATS_CHART_COLORS = {
  blue: {
    primary: "#3B82F6", // ats-blue
    secondary: "#60A5FA", // ats-light-blue
    tertiary: "#2563EB", // ats-dark-blue
  },
  purple: {
    primary: "#8A70D6", // ats-purple
    secondary: "#9b87f5", // ats-light-purple
    tertiary: "#6046b6", // ats-dark-purple
  },
  mixed: {
    primary: "#3B82F6", // ats-blue
    secondary: "#8A70D6", // ats-purple
    tertiary: "#60A5FA", // ats-light-blue
    quaternary: "#9b87f5", // ats-light-purple
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
    variant?: "default" | "ats-blue" | "ats-purple"
  }
>(({ id, className, children, config, variant = "default", ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  // Apply variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case "ats-blue":
        return "border border-ats-blue/20 rounded-lg p-1 [&_.recharts-cartesian-axis-tick_text]:fill-ats-blue [&_.recharts-line]:stroke-ats-blue"
      case "ats-purple":
        return "border border-ats-purple/20 rounded-lg p-1 [&_.recharts-cartesian-axis-tick_text]:fill-ats-purple [&_.recharts-line]:stroke-ats-purple"
      default:
        return ""
    }
  }

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          getVariantStyles(),
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
      variant?: "default" | "ats-blue" | "ats-purple"
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
      variant = "default",
    },
    ref
  ) => {
    const { config } = useChart()

    // Apply variant-specific styling
    const getVariantStyles = () => {
      switch (variant) {
        case "ats-blue":
          return "border-ats-blue/20 bg-ats-blue/5 text-ats-blue"
        case "ats-purple":
          return "border-ats-purple/20 bg-ats-purple/5 text-ats-purple"
        default:
          return "border-border/50 bg-background"
      }
    }

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
          getVariantStyles(),
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
      variant?: "default" | "ats-blue" | "ats-purple"
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey, variant = "default" },
    ref
  ) => {
    const { config } = useChart()

    // Apply variant-specific styling
    const getVariantStyles = () => {
      switch (variant) {
        case "ats-blue":
          return "text-ats-blue"
        case "ats-purple":
          return "text-ats-purple"
        default:
          return ""
      }
    }

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          getVariantStyles(),
          className
        )}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegend"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

// Original Chart component for backward compatibility
interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  data: any[]
  categories?: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  yAxisWidth?: number
  variant?: "default" | "ats-blue" | "ats-purple"
}

export function Chart({
  title,
  description,
  data,
  categories = ["value"],
  colors = ["#2563eb"],
  valueFormatter = (value: number) => `${value}`,
  yAxisWidth = 56,
  className,
  variant = "default",
  ...props
}: ChartProps) {
  // Get ATS-specific colors based on variant
  const getChartColors = () => {
    switch (variant) {
      case "ats-blue":
        return Object.values(ATS_CHART_COLORS.blue)
      case "ats-purple":
        return Object.values(ATS_CHART_COLORS.purple)
      default:
        return colors
    }
  }

  const chartColors = getChartColors()

  return (
    <Card className={cn("w-full", className)} {...props} variant={variant === "default" ? "default" : variant}>
      {title && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={data}
              margin={{
                top: 16,
                right: 16,
                bottom: 16,
                left: 16,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
              />
              <YAxis
                width={yAxisWidth}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={valueFormatter}
                className="text-xs"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className={cn(
                        "rounded-lg border p-2 shadow-sm",
                        variant === "ats-blue" ? "border-ats-blue/20 bg-ats-blue/5" :
                        variant === "ats-purple" ? "border-ats-purple/20 bg-ats-purple/5" :
                        "bg-background"
                      )}>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {payload[0].name}
                            </span>
                            <span className={cn(
                              "font-bold",
                              variant === "ats-blue" ? "text-ats-blue" :
                              variant === "ats-purple" ? "text-ats-purple" :
                              "text-muted-foreground"
                            )}>
                              {valueFormatter(
                                payload[0].value as unknown as number
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return null
                }}
              />
              {categories.map((category, i) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={chartColors[i % chartColors.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 6,
                    style: { fill: chartColors[i % chartColors.length] },
                  }}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ATS_CHART_COLORS
}