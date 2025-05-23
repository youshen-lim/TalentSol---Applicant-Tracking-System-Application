import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Monitor, MoveVertical } from "lucide-react";

/**
 * Example component demonstrating the enhanced useIsMobile hook
 * for the TalentSol ATS application
 */
export function MobileDetectionExample() {
  // Default breakpoint (768px)
  const isMobile = useIsMobile();

  // Custom breakpoint for tablets (1024px)
  const isTablet = useIsMobile(1024);

  // State to track window size
  const [windowSize, setWindowSize] = React.useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  // Update window size on resize
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardHeader className={isMobile ? "bg-ats-purple/10" : "bg-ats-blue/10"}>
        <CardTitle className="flex items-center gap-2">
          {isMobile ? (
            <>
              <Smartphone className="h-5 w-5 text-ats-purple" />
              <span className="text-ats-dark-purple">Mobile Detection</span>
            </>
          ) : (
            <>
              <Monitor className="h-5 w-5 text-ats-blue" />
              <span className="text-ats-dark-blue">Desktop Detection</span>
            </>
          )}
        </CardTitle>
        <CardDescription>
          Demonstrates the enhanced useIsMobile hook with customizable breakpoints
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium">Current Window Size:</div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <MoveVertical className="h-4 w-4 text-muted-foreground" />
              {windowSize.width} × {windowSize.height} pixels
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${isMobile ? "bg-ats-purple/5 border-ats-purple/20" : "bg-gray-50 border-gray-200"}`}>
              <div className="font-medium mb-2">Default Breakpoint (768px):</div>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${isMobile ? "bg-ats-purple" : "bg-gray-300"}`}></div>
                <span>{isMobile ? "Mobile View" : "Desktop View"}</span>
              </div>
              <div className="mt-4">
                <Button
                  variant={isMobile ? "ats-purple" : "outline"}
                  size="sm"
                  className="w-full"
                >
                  {isMobile ? "Optimized for Mobile" : "Standard Desktop View"}
                </Button>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${isTablet ? "bg-ats-blue/5 border-ats-blue/20" : "bg-gray-50 border-gray-200"}`}>
              <div className="font-medium mb-2">Tablet Breakpoint (1024px):</div>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${isTablet ? "bg-ats-blue" : "bg-gray-300"}`}></div>
                <span>{isTablet ? "Tablet/Mobile View" : "Large Desktop View"}</span>
              </div>
              <div className="mt-4">
                <Button
                  variant={isTablet ? "ats-blue" : "outline"}
                  size="sm"
                  className="w-full"
                >
                  {isTablet ? "Optimized for Tablet" : "Large Screen Layout"}
                </Button>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>The useIsMobile hook uses matchMedia for better performance and accuracy.</p>
            <p>Try resizing your browser window to see the detection in action!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
