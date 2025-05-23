import * as React from "react"

/**
 * Hook to detect if the current viewport is mobile-sized
 * Uses matchMedia for better performance and accuracy
 *
 * @param breakpoint - The breakpoint in pixels to consider as mobile (default: 768px)
 * @returns boolean indicating if the viewport is mobile-sized
 */
export function useIsMobile(breakpoint = 768) {
  // Initialize with undefined for SSR compatibility
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : undefined
  )

  React.useEffect(() => {
    // Return early if window is not available (SSR)
    if (typeof window === "undefined") return

    // Use matchMedia for better performance
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)

    const onChange = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Modern event listener approach
    mql.addEventListener("change", onChange)

    // Set initial value
    setIsMobile(window.innerWidth < breakpoint)

    // Clean up
    return () => mql.removeEventListener("change", onChange)
  }, [breakpoint])

  // Ensure we always return a boolean (not undefined)
  return !!isMobile
}
