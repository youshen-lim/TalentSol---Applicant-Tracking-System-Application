import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info, AlertCircle, Check, X } from "lucide-react";

/**
 * Example component demonstrating the enhanced Tooltip component
 * for the TalentSol ATS application
 */
export function TooltipExample() {
  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-ats-dark-blue">Tooltip Examples</h2>
      <p className="text-muted-foreground mb-4">
        Demonstrates the enhanced tooltip component with ATS-specific styling
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium text-ats-dark-blue">Default Variants</h3>
          
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Default Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is the default tooltip style</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    With Icon
                  </Button>
                </TooltipTrigger>
                <TooltipContent variant="primary">
                  <p>This uses the primary variant</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium text-ats-dark-blue">ATS Blue Variants</h3>
          
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ats-blue">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent variant="ats-blue">
                  <p>ATS Blue tooltip</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ats-blue-subtle">Subtle Blue</Button>
                </TooltipTrigger>
                <TooltipContent variant="ats-blue-subtle">
                  <p>ATS Blue Subtle tooltip</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium text-ats-dark-blue">ATS Purple Variants</h3>
          
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ats-purple">
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent variant="ats-purple">
                  <p>ATS Purple tooltip</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ats-purple-subtle">Subtle Purple</Button>
                </TooltipTrigger>
                <TooltipContent variant="ats-purple-subtle">
                  <p>ATS Purple Subtle tooltip</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium text-ats-dark-blue">Size Variants</h3>
          
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    Small
                  </Button>
                </TooltipTrigger>
                <TooltipContent size="sm" variant="ats-blue">
                  <p>Small tooltip</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="lg">
                    <X className="h-4 w-4 mr-2" />
                    Large
                  </Button>
                </TooltipTrigger>
                <TooltipContent size="lg" variant="ats-purple">
                  <p>Large tooltip with more content</p>
                  <p className="mt-1 text-xs opacity-80">Additional details can go here</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
