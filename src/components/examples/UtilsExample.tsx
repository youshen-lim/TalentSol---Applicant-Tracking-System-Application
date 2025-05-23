import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  formatDate, 
  truncateString, 
  getInitials, 
  formatCurrency, 
  formatNumber,
  generateId,
  isEmpty,
  capitalizeWords,
  formatPhoneNumber,
  atsColors,
  cn
} from "@/lib/utils";

/**
 * Example component demonstrating the enhanced utility functions
 * for the TalentSol ATS application
 */
export function UtilsExample() {
  // State for interactive examples
  const [text, setText] = useState("John Smith is a software engineer with 5+ years of experience");
  const [name, setName] = useState("John Smith");
  const [phone, setPhone] = useState("1234567890");
  const [amount, setAmount] = useState(1250.75);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Generate a random ID when the component mounts
  const [randomId] = useState(generateId());

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-ats-blue/5 to-ats-purple/5">
        <CardTitle>Utility Functions</CardTitle>
        <CardDescription>
          Demonstrates the enhanced utility functions for the TalentSol ATS application
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs defaultValue="formatting">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="formatting">Text Formatting</TabsTrigger>
            <TabsTrigger value="data">Data Formatting</TabsTrigger>
            <TabsTrigger value="styling">Styling Utilities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="formatting" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Text Truncation */}
              <div className="space-y-3">
                <Label htmlFor="text-input">Text Truncation</Label>
                <Input
                  id="text-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text to truncate"
                />
                <div className="p-3 bg-gray-50 rounded-md border">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Original:</div>
                  <div className="text-sm">{text}</div>
                  
                  <div className="text-sm font-medium text-muted-foreground mt-3 mb-1">Truncated (20 chars):</div>
                  <div className="text-sm">{truncateString(text, 20)}</div>
                </div>
              </div>
              
              {/* Name Initials */}
              <div className="space-y-3">
                <Label htmlFor="name-input">Name Initials</Label>
                <Input
                  id="name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                />
                <div className="p-3 bg-gray-50 rounded-md border">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Name:</div>
                  <div className="text-sm">{name}</div>
                  
                  <div className="text-sm font-medium text-muted-foreground mt-3 mb-1">Initials:</div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-ats-blue/10 text-ats-blue font-medium">
                      {getInitials(name)}
                    </div>
                    <div className="text-sm">{getInitials(name)}</div>
                  </div>
                </div>
              </div>
              
              {/* Capitalization */}
              <div className="space-y-3">
                <Label htmlFor="cap-input">Capitalization</Label>
                <Input
                  id="cap-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text to capitalize"
                />
                <div className="p-3 bg-gray-50 rounded-md border">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Original:</div>
                  <div className="text-sm">{text}</div>
                  
                  <div className="text-sm font-medium text-muted-foreground mt-3 mb-1">Capitalized:</div>
                  <div className="text-sm">{capitalizeWords(text)}</div>
                </div>
              </div>
              
              {/* Phone Formatting */}
              <div className="space-y-3">
                <Label htmlFor="phone-input">Phone Formatting</Label>
                <Input
                  id="phone-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
                <div className="p-3 bg-gray-50 rounded-md border">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Raw:</div>
                  <div className="text-sm">{phone}</div>
                  
                  <div className="text-sm font-medium text-muted-foreground mt-3 mb-1">Formatted:</div>
                  <div className="text-sm">{formatPhoneNumber(phone)}</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Currency Formatting */}
              <div className="space-y-3">
                <Label htmlFor="amount-input">Currency Formatting</Label>
                <Input
                  id="amount-input"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  placeholder="Enter amount"
                />
                <div className="p-3 bg-gray-50 rounded-md border">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Raw:</div>
                  <div className="text-sm">{amount}</div>
                  
                  <div className="text-sm font-medium text-muted-foreground mt-3 mb-1">Formatted:</div>
                  <div className="text-sm">{formatCurrency(amount)}</div>
                  
                  <div className="text-sm font-medium text-muted-foreground mt-3 mb-1">Euro:</div>
                  <div className="text-sm">{formatCurrency(amount, 'EUR')}</div>
                </div>
              </div>
              
              {/* Number Formatting */}
              <div className="space-y-3">
                <Label htmlFor="number-input">Number Formatting</Label>
                <Input
                  id="number-input"
                  type="number"
                  value={amount * 1000}
                  onChange={(e) => setAmount(parseFloat(e.target.value) / 1000)}
                  placeholder="Enter number"
                />
                <div className="p-3 bg-gray-50 rounded-md border">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Raw:</div>
                  <div className="text-sm">{amount * 1000}</div>
                  
                  <div className="text-sm font-medium text-muted-foreground mt-3 mb-1">Formatted:</div>
                  <div className="text-sm">{formatNumber(amount * 1000)}</div>
                </div>
              </div>
              
              {/* Date Formatting */}
              <div className="space-y-3">
                <Label htmlFor="date-input">Date Formatting</Label>
                <Input
                  id="date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <div className="p-3 bg-gray-50 rounded-md border">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Raw:</div>
                  <div className="text-sm">{date}</div>
                  
                  <div className="text-sm font-medium text-muted-foreground mt-3 mb-1">Formatted (Default):</div>
                  <div className="text-sm">{formatDate(date)}</div>
                  
                  <div className="text-sm font-medium text-muted-foreground mt-3 mb-1">Formatted (Long):</div>
                  <div className="text-sm">{formatDate(date, { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</div>
                </div>
              </div>
              
              {/* ID Generation */}
              <div className="space-y-3">
                <Label>ID Generation</Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Generated ID:</div>
                  <div className="text-sm font-mono">{randomId}</div>
                  
                  <div className="text-sm font-medium text-muted-foreground mt-3 mb-1">Generate New ID:</div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const newId = generateId();
                      // We can't update the state directly since we want to show a new ID each time
                      const element = document.getElementById('generated-id');
                      if (element) element.textContent = newId;
                    }}
                  >
                    Generate
                  </Button>
                  <div id="generated-id" className="text-sm font-mono mt-2"></div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="styling" className="space-y-6">
            <div className="space-y-6">
              {/* ATS Colors */}
              <div>
                <h3 className="text-sm font-medium mb-3">ATS Color Utilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className={cn("p-3 rounded-md border", atsColors.blue.light)}>
                    Blue Light
                  </div>
                  <div className={cn("p-3 rounded-md border", atsColors.blue.medium)}>
                    Blue Medium
                  </div>
                  <div className={cn("p-3 rounded-md border", atsColors.blue.solid)}>
                    Blue Solid
                  </div>
                  
                  <div className={cn("p-3 rounded-md border", atsColors.purple.light)}>
                    Purple Light
                  </div>
                  <div className={cn("p-3 rounded-md border", atsColors.purple.medium)}>
                    Purple Medium
                  </div>
                  <div className={cn("p-3 rounded-md border", atsColors.purple.solid)}>
                    Purple Solid
                  </div>
                </div>
              </div>
              
              {/* Status Colors */}
              <div>
                <h3 className="text-sm font-medium mb-3">Status Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className={cn("p-3 rounded-md border", atsColors.status.active)}>
                    Active
                  </div>
                  <div className={cn("p-3 rounded-md border", atsColors.status.pending)}>
                    Pending
                  </div>
                  <div className={cn("p-3 rounded-md border", atsColors.status.inactive)}>
                    Inactive
                  </div>
                  <div className={cn("p-3 rounded-md border", atsColors.status.rejected)}>
                    Rejected
                  </div>
                </div>
              </div>
              
              {/* Class Name Utility */}
              <div>
                <h3 className="text-sm font-medium mb-3">Class Name Utility (cn)</h3>
                <div className="space-y-3">
                  <div className={cn(
                    "p-3 rounded-md border",
                    "bg-white",
                    "hover:bg-gray-50",
                    true && "text-ats-blue",
                    false && "text-red-500"
                  )}>
                    Conditional Classes
                  </div>
                  <div className="text-sm text-muted-foreground">
                    The cn utility combines multiple class names and handles conditional classes.
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
