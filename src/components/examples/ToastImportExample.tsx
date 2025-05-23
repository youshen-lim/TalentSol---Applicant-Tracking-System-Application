import React from "react";
import { Button } from "@/components/ui/button";
// Import from the hooks directory
import { useToast } from "@/hooks/use-toast";

/**
 * Example component demonstrating the toast functionality
 * imported from the hooks directory
 */
export function ToastImportExample() {
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-ats-dark-blue">Toast Import Example</h2>
      <p className="text-muted-foreground mb-4">
        Demonstrates importing toast from @/hooks/use-toast
      </p>

      <div className="flex gap-4">
        <Button
          variant="ats-blue"
          onClick={() => {
            toast({
              title: "Imported from hooks",
              description: "This toast was imported from @/hooks/use-toast",
              variant: "ats-blue"
            });
          }}
        >
          Show Toast
        </Button>
      </div>
    </div>
  );
}
