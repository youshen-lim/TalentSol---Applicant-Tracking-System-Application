import * as React from "react"
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"
import { cn } from "@/lib/utils"

interface AspectRatioProps extends React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root> {
  className?: string
  containerClassName?: string
  fallbackSrc?: string
  alt?: string
}

/**
 * Enhanced AspectRatio component for TalentSol ATS
 *
 * Features:
 * - Supports all standard AspectRatio props
 * - Adds containerClassName for styling the outer container
 * - Adds fallbackSrc for image fallback support
 * - Adds alt text support for accessibility
 */
const AspectRatio = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  AspectRatioProps
>(({ className, containerClassName, fallbackSrc, alt, children, ...props }, ref) => {
  // If children is an img element and fallbackSrc is provided, handle image loading errors
  const childrenWithFallback = React.Children.map(children, child => {
    if (React.isValidElement(child) && child.type === 'img' && fallbackSrc) {
      return React.cloneElement(child as React.ReactElement<React.ImgHTMLAttributes<HTMLImageElement>>, {
        onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
          const target = e.target as HTMLImageElement
          target.src = fallbackSrc
        },
        alt: alt || child.props.alt || 'Image'
      })
    }
    return child
  })

  return (
    <div className={cn("overflow-hidden", containerClassName)}>
      <AspectRatioPrimitive.Root
        ref={ref}
        className={cn(className)}
        {...props}
      >
        {childrenWithFallback}
      </AspectRatioPrimitive.Root>
    </div>
  )
})
AspectRatio.displayName = "AspectRatio"

/**
 * CandidateImage component - specialized AspectRatio for candidate profile images
 *
 * Features:
 * - Fixed 1:1 aspect ratio for consistent display
 * - Built-in fallback to initials if image fails to load
 * - Rounded corners and border styling
 * - Hover effects for interactive elements
 */
interface CandidateImageProps extends Omit<AspectRatioProps, 'ratio'> {
  src: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
}

const CandidateImage = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  CandidateImageProps
>(({
  src,
  name,
  size = 'md',
  interactive = false,
  className,
  containerClassName,
  ...props
}, ref) => {
  // Generate initials from name
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  // Size classes
  const sizeClasses = {
    sm: { container: "w-8 h-8", font: "text-xs" },
    md: { container: "w-12 h-12", font: "text-sm" },
    lg: { container: "w-16 h-16", font: "text-base" },
    xl: { container: "w-24 h-24", font: "text-lg" }
  }

  // Create a data URL with initials as fallback
  const generateFallbackImage = () => {
    // Use a light blue background for the fallback (ATS brand color)
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#3b82f6' // ATS blue color
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'white'
      ctx.font = 'bold 40px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(initials, canvas.width / 2, canvas.height / 2)
      return canvas.toDataURL()
    }
    return ''
  }

  return (
    <div
      className={cn(
        sizeClasses[size].container,
        "rounded-full overflow-hidden border border-gray-200",
        interactive && "cursor-pointer hover:border-ats-blue hover:shadow-sm transition-all",
        containerClassName
      )}
    >
      <AspectRatio
        ratio={1}
        ref={ref}
        className={cn("bg-gray-100", className)}
        fallbackSrc={generateFallbackImage()}
        alt={`Profile picture of ${name}`}
        {...props}
      >
        <img
          src={src}
          alt={`Profile picture of ${name}`}
          className="object-cover w-full h-full"
        />
      </AspectRatio>
    </div>
  )
})
CandidateImage.displayName = "CandidateImage"

/**
 * JobImage component - specialized AspectRatio for job listing images
 *
 * Features:
 * - 16:9 aspect ratio for consistent display of company/job images
 * - Built-in company logo fallback
 * - Rounded corners and border styling
 * - Optional overlay for status indicators
 */
interface JobImageProps extends Omit<AspectRatioProps, 'ratio'> {
  src: string
  companyName: string
  status?: 'active' | 'closed' | 'draft' | 'paused'
  overlay?: React.ReactNode
}

const JobImage = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  JobImageProps
>(({
  src,
  companyName,
  status,
  overlay,
  className,
  containerClassName,
  ...props
}, ref) => {
  // Default company logo fallback
  const defaultFallback = '/company-placeholder.png'

  // Status indicator styles
  const statusStyles = {
    active: "bg-green-500",
    closed: "bg-gray-500",
    draft: "bg-yellow-500",
    paused: "bg-blue-500"
  }

  return (
    <div
      className={cn(
        "relative rounded-md overflow-hidden border border-gray-200",
        containerClassName
      )}
    >
      <AspectRatio
        ratio={16/9}
        ref={ref}
        className={cn("bg-gray-100", className)}
        fallbackSrc={defaultFallback}
        alt={`Image for ${companyName} job listing`}
        {...props}
      >
        <img
          src={src}
          alt={`Image for ${companyName} job listing`}
          className="object-cover w-full h-full"
        />

        {/* Optional overlay content */}
        {overlay && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            {overlay}
          </div>
        )}

        {/* Status indicator */}
        {status && (
          <div className="absolute top-2 right-2">
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium text-white",
              statusStyles[status]
            )}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>
        )}
      </AspectRatio>
    </div>
  )
})
JobImage.displayName = "JobImage"

export { AspectRatio, CandidateImage, JobImage }
