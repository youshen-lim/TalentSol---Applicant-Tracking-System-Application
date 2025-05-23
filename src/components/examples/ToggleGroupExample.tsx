import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";

/**
 * Example component demonstrating the enhanced ToggleGroup component
 * for the TalentSol ATS application
 */
export function ToggleGroupExample() {
  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-ats-dark-blue">Toggle Group Examples</h2>
      <p className="text-muted-foreground mb-4">
        Demonstrates the enhanced toggle group component with ATS-specific styling
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium text-ats-dark-blue">Default Variant</h3>
          
          <div className="flex flex-col gap-4">
            <ToggleGroup type="single" defaultValue="center">
              <ToggleGroupItem value="left" aria-label="Align left">
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center">
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="justify" aria-label="Justify">
                <AlignJustify className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            <ToggleGroup type="multiple">
              <ToggleGroupItem value="bold" aria-label="Bold">
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Italic">
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Underline">
                <Underline className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium text-ats-dark-blue">ATS Blue Variant</h3>
          
          <div className="flex flex-col gap-4">
            <ToggleGroup type="single" variant="ats-blue" defaultValue="center">
              <ToggleGroupItem value="left" aria-label="Align left">
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center">
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            <ToggleGroup type="multiple" variant="ats-blue-subtle">
              <ToggleGroupItem value="bold" aria-label="Bold">
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Italic">
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Underline">
                <Underline className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium text-ats-dark-blue">ATS Purple Variant</h3>
          
          <div className="flex flex-col gap-4">
            <ToggleGroup type="single" variant="ats-purple" defaultValue="center">
              <ToggleGroupItem value="left" aria-label="Align left">
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center">
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            <ToggleGroup type="multiple" variant="ats-purple-subtle">
              <ToggleGroupItem value="bold" aria-label="Bold">
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Italic">
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Underline">
                <Underline className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium text-ats-dark-blue">Size Variants</h3>
          
          <div className="flex flex-col gap-4">
            <ToggleGroup type="single" variant="ats-blue" size="sm" defaultValue="center">
              <ToggleGroupItem value="left" aria-label="Align left">
                <AlignLeft className="h-3 w-3" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center">
                <AlignCenter className="h-3 w-3" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                <AlignRight className="h-3 w-3" />
              </ToggleGroupItem>
            </ToggleGroup>

            <ToggleGroup type="single" variant="ats-purple" size="lg" defaultValue="center">
              <ToggleGroupItem value="left" aria-label="Align left">
                <AlignLeft className="h-5 w-5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center">
                <AlignCenter className="h-5 w-5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                <AlignRight className="h-5 w-5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
