import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Calendar, 
  User, 
  FileText,
  Clock
} from "lucide-react";

/**
 * Example component demonstrating the enhanced toast functionality
 * for the TalentSol ATS application
 */
export function EnhancedToastExample() {
  const { toast } = useToast();

  // Helper function to create a toast with a timestamp
  const createTimestampedToast = (toastFn: any, options: any) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    toastFn({
      ...options,
      description: (
        <div className="flex flex-col gap-1">
          <div>{options.description}</div>
          <div className="text-xs opacity-70 flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3" />
            {timestamp}
          </div>
        </div>
      )
    });
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-ats-blue/10 to-ats-purple/10">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-ats-blue" />
          Enhanced Toast Notifications
        </CardTitle>
        <CardDescription>
          Demonstrates the enhanced toast functionality with ATS-specific styling
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Notification Types</h3>
            
            {/* Default toast */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                createTimestampedToast(toast, {
                  title: "Notification",
                  description: "This is a standard notification",
                });
              }}
            >
              <Info className="h-4 w-4 mr-2 text-ats-blue" />
              Default Notification
            </Button>

            {/* Success toast */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                createTimestampedToast(toast, {
                  variant: "default",
                  title: (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Success</span>
                    </div>
                  ),
                  description: "Operation completed successfully",
                });
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Success Notification
            </Button>

            {/* Error toast */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                createTimestampedToast(toast, {
                  variant: "destructive",
                  title: "Error",
                  description: "There was a problem with your request",
                });
              }}
            >
              <AlertCircle className="h-4 w-4 mr-2 text-destructive" />
              Error Notification
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">ATS-Specific Variants</h3>
            
            {/* ATS Blue toast */}
            <Button
              variant="ats-blue"
              className="w-full justify-start"
              onClick={() => {
                createTimestampedToast(toast.atsBlue, {
                  title: (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Candidate Update</span>
                    </div>
                  ),
                  description: "New candidate profile has been created",
                });
              }}
            >
              <User className="h-4 w-4 mr-2" />
              ATS Blue Notification
            </Button>

            {/* ATS Purple toast */}
            <Button
              variant="ats-purple"
              className="w-full justify-start"
              onClick={() => {
                createTimestampedToast(toast.atsPurple, {
                  title: (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Interview Scheduled</span>
                    </div>
                  ),
                  description: "Technical interview scheduled for tomorrow at 2:00 PM",
                });
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              ATS Purple Notification
            </Button>

            {/* Toast with action */}
            <Button
              variant="ats-blue-subtle"
              className="w-full justify-start"
              onClick={() => {
                createTimestampedToast(toast, {
                  variant: "ats-blue",
                  title: (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Document Received</span>
                    </div>
                  ),
                  description: "Resume received from John Smith",
                  action: (
                    <Button
                      variant="ats-blue"
                      size="sm"
                      onClick={() => console.log("View document clicked")}
                      className="mt-2"
                    >
                      View Document
                    </Button>
                  ),
                });
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Notification with Action
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
