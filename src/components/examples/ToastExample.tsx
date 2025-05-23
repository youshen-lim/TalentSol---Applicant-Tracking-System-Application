import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

/**
 * Example component demonstrating the enhanced Toast component
 * for the TalentSol ATS application
 */
export function ToastExample() {
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-ats-dark-blue">Toast Examples</h2>
      <p className="text-muted-foreground mb-4">
        Demonstrates the enhanced toast notifications with ATS-specific styling
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Default toast */}
        <Button
          onClick={() => {
            toast({
              title: "Default Toast",
              description: "This is a default toast notification",
            });
          }}
        >
          Default Toast
        </Button>

        {/* Destructive toast */}
        <Button
          variant="destructive"
          onClick={() => {
            toast({
              variant: "destructive",
              title: "Error",
              description: "There was a problem with your request.",
            });
          }}
        >
          Destructive Toast
        </Button>

        {/* ATS Blue toast */}
        <Button
          variant="ats-blue"
          onClick={() => {
            toast.atsBlue({
              title: "Candidate Added",
              description: "New candidate has been added to the pipeline",
            });
          }}
        >
          ATS Blue Toast
        </Button>

        {/* ATS Purple toast */}
        <Button
          variant="ats-purple"
          onClick={() => {
            toast.atsPurple({
              title: "Interview Scheduled",
              description: "Interview has been scheduled successfully",
            });
          }}
        >
          ATS Purple Toast
        </Button>

        {/* Toast with action */}
        <Button
          variant="ats-blue"
          onClick={() => {
            toast({
              variant: "ats-blue",
              title: "New Application",
              description: "A new application has been received",
              action: (
                <Button
                  variant="ats-blue-subtle"
                  size="sm"
                  onClick={() => console.log("Action clicked")}
                  className="mt-2"
                >
                  View Details
                </Button>
              ),
            });
          }}
        >
          Toast with Action
        </Button>
      </div>
    </div>
  );
}
