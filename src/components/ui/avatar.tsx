import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'away' | 'busy'
  statusPosition?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left'
  border?: boolean
  borderColor?: string
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({
  className,
  size = 'md',
  status,
  statusPosition = 'bottom-right',
  border = false,
  borderColor,
  ...props
}, ref) => {
  // Size variants
  const sizeVariants = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-16 w-16 text-xl"
  }

  // Status colors
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    away: "bg-yellow-500",
    busy: "bg-red-500"
  }

  // Status position
  const statusPositions = {
    'top-right': "top-0 right-0",
    'bottom-right': "bottom-0 right-0",
    'bottom-left': "bottom-0 left-0",
    'top-left': "top-0 left-0"
  }

  return (
    <div className="relative inline-block">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          sizeVariants[size],
          border && "ring-2 ring-offset-2",
          border && borderColor ? `ring-${borderColor}` : "ring-white",
          className
        )}
        {...props}
      />

      {status && (
        <span
          className={cn(
            "absolute block rounded-full ring-2 ring-white",
            statusColors[status],
            statusPositions[statusPosition],
            size === 'xs' ? "h-1.5 w-1.5" :
            size === 'sm' ? "h-2 w-2" :
            size === 'md' ? "h-2.5 w-2.5" :
            size === 'lg' ? "h-3 w-3" : "h-3.5 w-3.5"
          )}
        />
      )}
    </div>
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

interface AvatarImageProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
  onLoadingStatusChange?: (status: 'loading' | 'loaded' | 'error') => void
}

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, onLoadingStatusChange, ...props }, ref) => {
  const [loadingStatus, setLoadingStatus] = React.useState<'loading' | 'loaded' | 'error'>('loading')

  const handleLoad = React.useCallback(() => {
    setLoadingStatus('loaded')
    onLoadingStatusChange?.('loaded')
  }, [onLoadingStatusChange])

  const handleError = React.useCallback(() => {
    setLoadingStatus('error')
    onLoadingStatusChange?.('error')
  }, [onLoadingStatusChange])

  React.useEffect(() => {
    onLoadingStatusChange?.('loading')
  }, [props.src, onLoadingStatusChange])

  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn(
        "aspect-square h-full w-full",
        loadingStatus === 'loading' && "animate-pulse",
        className
      )}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  )
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  name?: string
  variant?: 'muted' | 'primary' | 'ats-blue' | 'ats-purple' | 'random'
  delayMs?: number
}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, name, variant = 'muted', delayMs, children, ...props }, ref) => {
  // Generate initials from name if provided
  const initials = React.useMemo(() => {
    if (!name) return null

    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }, [name])

  // Variant styles
  const variantStyles = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary text-primary-foreground",
    'ats-blue': "bg-blue-500 text-white",
    'ats-purple': "bg-purple-500 text-white",
    random: ""
  }

  // Generate a random color based on the name (for consistent colors per name)
  const getRandomColor = React.useCallback(() => {
    if (!name) return ""

    // Generate a hash from the name
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }

    // Generate colors based on the hash
    const hue = Math.abs(hash % 360)
    return `hsl(${hue}, 65%, 55%)`
  }, [name])

  // Style for random variant
  const randomStyle = React.useMemo(() => {
    if (variant !== 'random' || !name) return {}

    const bgColor = getRandomColor()
    return {
      backgroundColor: bgColor,
      color: 'white'
    }
  }, [variant, name, getRandomColor])

  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full font-semibold",
        variant !== 'random' && variantStyles[variant],
        className
      )}
      style={variant === 'random' ? randomStyle : undefined}
      delayMs={delayMs}
      {...props}
    >
      {children || initials}
    </AvatarPrimitive.Fallback>
  )
})
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// Create a composite component for easy use with name
interface CandidateAvatarProps extends AvatarProps {
  name: string
  src?: string
  fallbackVariant?: AvatarFallbackProps['variant']
  delayMs?: number
  onLoadingStatusChange?: (status: 'loading' | 'loaded' | 'error') => void
}

const CandidateAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  CandidateAvatarProps
>(({
  name,
  src,
  fallbackVariant = 'ats-blue',
  delayMs = 600,
  onLoadingStatusChange,
  ...props
}, ref) => {
  return (
    <Avatar ref={ref} {...props}>
      {src && (
        <AvatarImage
          src={src}
          alt={`${name}'s profile picture`}
          onLoadingStatusChange={onLoadingStatusChange}
        />
      )}
      <AvatarFallback
        name={name}
        variant={fallbackVariant}
        delayMs={src ? delayMs : 0}
      />
    </Avatar>
  )
})
CandidateAvatar.displayName = "CandidateAvatar"

// Create a component for team members/interviewers
interface TeamMemberAvatarProps extends AvatarProps {
  name: string
  src?: string
  role?: string
  department?: string
  fallbackVariant?: AvatarFallbackProps['variant']
  showInfo?: boolean
  interactive?: boolean
  onClick?: () => void
}

const TeamMemberAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  TeamMemberAvatarProps
>(({
  name,
  src,
  role,
  department,
  fallbackVariant = 'ats-purple',
  showInfo = false,
  interactive = false,
  onClick,
  ...props
}, ref) => {
  return (
    <div className={cn(
      "inline-flex flex-col items-center",
      interactive && "cursor-pointer hover:opacity-90 transition-opacity",
      showInfo ? "gap-1" : ""
    )} onClick={interactive ? onClick : undefined}>
      <Avatar
        ref={ref}
        border={interactive}
        borderColor="ats-purple"
        {...props}
      >
        {src && (
          <AvatarImage
            src={src}
            alt={`${name}'s profile picture`}
          />
        )}
        <AvatarFallback
          name={name}
          variant={fallbackVariant}
        />
      </Avatar>

      {showInfo && (
        <div className="text-center">
          <p className="text-sm font-medium">{name}</p>
          {role && <p className="text-xs text-muted-foreground">{role}</p>}
          {department && <p className="text-xs text-purple-500">{department}</p>}
        </div>
      )}
    </div>
  )
})
TeamMemberAvatar.displayName = "TeamMemberAvatar"

// Create a group component for displaying multiple avatars
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: Array<{
    name: string
    src?: string
    status?: AvatarProps['status']
  }>
  max?: number
  size?: AvatarProps['size']
  fallbackVariant?: AvatarFallbackProps['variant']
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 5,
  size = 'md',
  fallbackVariant = 'random',
  className,
  ...props
}) => {
  const displayAvatars = avatars.slice(0, max)
  const remainingCount = avatars.length - max

  return (
    <div
      className={cn("flex -space-x-2", className)}
      {...props}
    >
      {displayAvatars.map((avatar, index) => (
        <CandidateAvatar
          key={`${avatar.name}-${index}`}
          name={avatar.name}
          src={avatar.src}
          status={avatar.status}
          size={size}
          fallbackVariant={fallbackVariant}
          className="border-2 border-background"
        />
      ))}

      {remainingCount > 0 && (
        <div className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full border-2 border-background bg-muted",
          size === 'xs' ? "h-6 w-6 text-xs" :
          size === 'sm' ? "h-8 w-8 text-xs" :
          size === 'md' ? "h-10 w-10 text-sm" :
          size === 'lg' ? "h-12 w-12 text-base" : "h-16 w-16 text-lg",
          "flex items-center justify-center font-medium text-muted-foreground"
        )}>
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  CandidateAvatar,
  TeamMemberAvatar,
  AvatarGroup
}
