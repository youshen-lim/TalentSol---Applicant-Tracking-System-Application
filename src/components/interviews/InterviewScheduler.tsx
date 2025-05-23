import React, { useState } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Users, MapPin, Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define types for our interfaces
type Interviewer = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
};

type InterviewType = {
  id: string;
  name: string;
  duration: number; // in minutes
  description: string;
};

type TimeSlot = {
  id: string;
  start: string; // Format: "HH:MM"
  end: string; // Format: "HH:MM"
};

// Define the interview schema for the form
const interviewFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  candidateId: z.string({
    required_error: "Please select a candidate.",
  }),
  interviewers: z.array(z.string()).min(1, {
    message: "Please select at least one interviewer.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  startTime: z.string({
    required_error: "Please select a start time.",
  }),
  endTime: z.string({
    required_error: "Please select an end time.",
  }),
  location: z.string().optional(),
  type: z.enum(["in-person", "phone", "video"], {
    required_error: "Please select an interview type.",
  }),
  notes: z.string().optional(),
});

type InterviewFormValues = z.infer<typeof interviewFormSchema>;

// Mock data for candidates and interviewers
const mockCandidates = [
  { id: "1", name: "John Doe", position: "Frontend Developer" },
  { id: "2", name: "Jane Smith", position: "UX Designer" },
  { id: "3", name: "Mike Johnson", position: "Product Manager" },
];

const mockInterviewers: Interviewer[] = [
  { id: "1", name: "Alex Brown", role: "Engineering Manager" },
  { id: "2", name: "Sarah Wilson", role: "Senior Developer" },
  { id: "3", name: "David Lee", role: "CTO" },
  { id: "4", name: "Emily Chen", role: "HR Manager" },
];

// Mock interview types
const mockInterviewTypes: InterviewType[] = [
  {
    id: "1",
    name: "Technical Interview",
    duration: 60,
    description: "In-depth technical assessment focusing on coding skills and problem-solving abilities."
  },
  {
    id: "2",
    name: "Behavioral Interview",
    duration: 45,
    description: "Assessment of soft skills, cultural fit, and past experiences."
  },
  {
    id: "3",
    name: "Portfolio Review",
    duration: 60,
    description: "Review and discussion of candidate's previous work and projects."
  },
  {
    id: "4",
    name: "Initial Screening",
    duration: 30,
    description: "Brief introduction and basic qualification verification."
  },
];

// Mock available time slots
const mockTimeSlots: Record<string, TimeSlot[]> = {
  [format(new Date(), 'yyyy-MM-dd')]: [
    { id: "1", start: "09:00", end: "10:00" },
    { id: "2", start: "10:30", end: "11:30" },
    { id: "3", start: "13:00", end: "14:00" },
    { id: "4", start: "15:00", end: "16:00" },
  ],
  [format(addDays(new Date(), 1), 'yyyy-MM-dd')]: [
    { id: "5", start: "09:30", end: "10:30" },
    { id: "6", start: "11:00", end: "12:00" },
    { id: "7", start: "14:00", end: "15:00" },
  ],
  [format(addDays(new Date(), 2), 'yyyy-MM-dd')]: [
    { id: "8", start: "10:00", end: "11:00" },
    { id: "9", start: "13:30", end: "14:30" },
    { id: "10", start: "16:00", end: "17:00" },
  ],
};

// Mock scheduled interviews
const mockScheduledInterviews = [
  {
    id: "1",
    title: "Frontend Technical Interview",
    candidateId: "1",
    candidateName: "John Doe",
    interviewers: ["1", "2"],
    date: new Date(),
    startTime: "10:00",
    endTime: "11:00",
    location: "Conference Room A",
    type: "in-person",
    notes: "Focus on React and TypeScript skills",
  },
  {
    id: "2",
    title: "UX Portfolio Review",
    candidateId: "2",
    candidateName: "Jane Smith",
    interviewers: ["3", "4"],
    date: addDays(new Date(), 1),
    startTime: "14:00",
    endTime: "15:00",
    location: "Zoom",
    type: "video",
    notes: "Review portfolio and discuss design process",
  },
];

// Props for the component
interface InterviewSchedulerProps {
  onInterviewScheduled?: (interview: any) => void;
  className?: string;
  interviewers?: Interviewer[];
  interviewTypes?: InterviewType[];
  availableTimeSlots?: Record<string, TimeSlot[]>;
}

export function InterviewScheduler({
  onInterviewScheduled,
  className,
  interviewers = mockInterviewers,
  interviewTypes = mockInterviewTypes,
  availableTimeSlots = mockTimeSlots
}: InterviewSchedulerProps) {
  // State for the calendar view
  const [date, setDate] = useState<Date>(new Date());
  const [isAddingInterview, setIsAddingInterview] = useState(false);
  const [scheduledInterviews, setScheduledInterviews] = useState(mockScheduledInterviews);

  // State for the tabbed interface
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>();
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);
  const [selectedInterviewType, setSelectedInterviewType] = useState<string | undefined>();

  // Initialize form with react-hook-form
  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      title: "",
      candidateId: "",
      interviewers: [],
      date: new Date(),
      startTime: "09:00",
      endTime: "10:00",
      location: "",
      type: "video",
      notes: "",
    },
  });

  // Filter interviews for the selected date
  const interviewsForSelectedDate = scheduledInterviews.filter((interview) =>
    isSameDay(interview.date, date)
  );

  // Format date to string to use as key for availableTimeSlots
  const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const timeSlots = formattedDate ? availableTimeSlots[formattedDate] || [] : [];

  const handleInterviewerToggle = (interviewerId: string) => {
    setSelectedInterviewers((prev) =>
      prev.includes(interviewerId)
        ? prev.filter((id) => id !== interviewerId)
        : [...prev, interviewerId]
    );
  };

  const getSelectedInterviewType = () => {
    return interviewTypes.find((type) => type.id === selectedInterviewType);
  };

  const isFormComplete = () => {
    return (
      selectedDate &&
      selectedTimeSlot &&
      selectedInterviewers.length > 0 &&
      selectedInterviewType
    );
  };

  const handleSchedule = () => {
    if (selectedDate && selectedTimeSlot && selectedInterviewType) {
      const selectedSlot = timeSlots.find(slot => slot.id === selectedTimeSlot);

      if (selectedSlot) {
        const newInterview = {
          id: `${scheduledInterviews.length + 1}`,
          title: `${getSelectedInterviewType()?.name || "Interview"}`,
          candidateId: "1", // Default candidate for now
          candidateName: "New Candidate",
          interviewers: selectedInterviewers,
          date: selectedDate,
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          location: "To be determined",
          type: "video",
          notes: getSelectedInterviewType()?.description || "",
        };

        // Add to scheduled interviews
        setScheduledInterviews([...scheduledInterviews, newInterview]);

        // Call the callback if provided
        if (onInterviewScheduled) {
          onInterviewScheduled(newInterview);
        }

        // Show success toast
        toast({
          title: "Interview scheduled",
          description: `${newInterview.title} has been scheduled for ${format(selectedDate, 'PPP')} at ${selectedSlot.start}.`,
        });

        // Reset form
        setSelectedDate(new Date());
        setSelectedTimeSlot(undefined);
        setSelectedInterviewers([]);
        setSelectedInterviewType(undefined);
      }
    }
  };

  // Handle form submission for the original form
  function onSubmit(data: InterviewFormValues) {
    // Create a new interview object
    const newInterview = {
      id: `${scheduledInterviews.length + 1}`,
      ...data,
      candidateName: mockCandidates.find(c => c.id === data.candidateId)?.name || "",
    };

    // Add to scheduled interviews
    setScheduledInterviews([...scheduledInterviews, newInterview]);

    // Call the callback if provided
    if (onInterviewScheduled) {
      onInterviewScheduled(newInterview);
    }

    // Show success toast
    toast({
      title: "Interview scheduled",
      description: `${newInterview.title} has been scheduled for ${format(data.date, 'PPP')} at ${data.startTime}.`,
    });

    // Close the dialog and reset form
    setIsAddingInterview(false);
    form.reset();
  }

  // Render the new tabbed interface component
  const renderTabbedScheduler = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Schedule Interview</CardTitle>
          <CardDescription>
            Select a date, time, interviewers, and interview type to schedule an interview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="date" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="date">Date & Time</TabsTrigger>
              <TabsTrigger value="interviewers">Interviewers</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="date">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Select Date</h3>
                  <div className="border rounded-md">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md p-3 pointer-events-auto"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Select Time</h3>
                  {timeSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          variant={selectedTimeSlot === slot.id ? "default" : "outline"}
                          className={cn("justify-start",
                            selectedTimeSlot === slot.id ? "border-ats-blue bg-ats-blue text-white" : ""
                          )}
                          onClick={() => setSelectedTimeSlot(slot.id)}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {slot.start} - {slot.end}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 border border-dashed rounded-md">
                      <p className="text-gray-500">
                        {selectedDate
                          ? "No available time slots for the selected date"
                          : "Please select a date first"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="interviewers">
              <div className="pt-4">
                <h3 className="text-sm font-medium mb-3">Select Interviewers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {interviewers.map((interviewer) => (
                    <div
                      key={interviewer.id}
                      className={cn(
                        "flex items-center space-x-3 p-3 border rounded-md cursor-pointer",
                        selectedInterviewers.includes(interviewer.id)
                          ? "border-ats-blue bg-ats-blue/5"
                          : "hover:border-gray-300"
                      )}
                      onClick={() => handleInterviewerToggle(interviewer.id)}
                    >
                      <div className="flex-shrink-0">
                        {interviewer.avatar ? (
                          <img
                            src={interviewer.avatar}
                            alt={interviewer.name}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-ats-blue/10 text-ats-blue rounded-full flex items-center justify-center">
                            {interviewer.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{interviewer.name}</div>
                        <div className="text-xs text-gray-500">
                          {interviewer.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedInterviewers.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <div className="text-sm font-medium mb-2">
                      Selected ({selectedInterviewers.length}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedInterviewers.map((id) => {
                        const interviewer = interviewers.find(
                          (i) => i.id === id
                        );
                        return (
                          interviewer && (
                            <div
                              key={id}
                              className="bg-white px-2 py-1 rounded-full border text-sm flex items-center"
                            >
                              {interviewer.name}
                              <button
                                className="ml-1 text-gray-500 hover:text-gray-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInterviewerToggle(id);
                                }}
                              >
                                ×
                              </button>
                            </div>
                          )
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="details">
              <div className="space-y-4 pt-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Interview Type</h3>
                  <Select
                    value={selectedInterviewType}
                    onValueChange={setSelectedInterviewType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interview type" />
                    </SelectTrigger>
                    <SelectContent>
                      {interviewTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} ({type.duration} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedInterviewType && (
                    <p className="mt-2 text-xs text-gray-500">
                      {getSelectedInterviewType()?.description}
                    </p>
                  )}
                </div>

                <div className="rounded-md border p-4">
                  <h3 className="font-medium text-sm mb-3">Interview Summary</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                      <div>
                        <div className="text-sm font-medium">Date & Time</div>
                        <div className="text-sm text-gray-500">
                          {selectedDate
                            ? format(selectedDate, "EEEE, MMMM d, yyyy")
                            : "Not selected"}{" "}
                          •{" "}
                          {selectedTimeSlot
                            ? timeSlots.find((slot) => slot.id === selectedTimeSlot)
                                ?.start +
                              " - " +
                              timeSlots.find((slot) => slot.id === selectedTimeSlot)
                                ?.end
                            : "Not selected"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Users className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                      <div>
                        <div className="text-sm font-medium">Interviewers</div>
                        <div className="text-sm text-gray-500">
                          {selectedInterviewers.length > 0
                            ? interviewers
                                .filter((i) => selectedInterviewers.includes(i.id))
                                .map((i) => i.name)
                                .join(", ")
                            : "Not selected"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Clock className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                      <div>
                        <div className="text-sm font-medium">Interview Type</div>
                        <div className="text-sm text-gray-500">
                          {selectedInterviewType
                            ? getSelectedInterviewType()?.name +
                              " (" +
                              getSelectedInterviewType()?.duration +
                              " min)"
                            : "Not selected"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSchedule}
              disabled={!isFormComplete()}
              className="bg-ats-blue hover:bg-ats-dark-blue"
            >
              Schedule Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Return the component with both interfaces
  return (
    <div className={cn("space-y-8", className)}>
      {/* New tabbed interface */}
      {renderTabbedScheduler()}

      {/* Original calendar view */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Interview Calendar</h2>
          <Button onClick={() => setIsAddingInterview(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Interview
          </Button>
        </div>

        <Dialog open={isAddingInterview} onOpenChange={setIsAddingInterview}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Schedule New Interview</DialogTitle>
              <DialogDescription>
                Fill out the form below to schedule a new interview.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interview Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Technical Interview" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="candidateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Candidate</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select candidate" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockCandidates.map((candidate) => (
                              <SelectItem key={candidate.id} value={candidate.id}>
                                {candidate.name} - {candidate.position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interview Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in-person">In-Person</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Conference Room A or Zoom Link" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interviewers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interviewers</FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap gap-2">
                          {interviewers.map((interviewer) => (
                            <div key={interviewer.id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`interviewer-${interviewer.id}`}
                                value={interviewer.id}
                                checked={field.value.includes(interviewer.id)}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const newValue = e.target.checked
                                    ? [...field.value, value]
                                    : field.value.filter((v: string) => v !== value);
                                  field.onChange(newValue);
                                }}
                                className="mr-2"
                              />
                              <label htmlFor={`interviewer-${interviewer.id}`} className="text-sm">
                                {interviewer.name} ({interviewer.role})
                              </label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes or preparation instructions"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddingInterview(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-ats-blue hover:bg-ats-dark-blue">Schedule Interview</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Select a date to view scheduled interviews</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate: Date | undefined) => newDate && setDate(newDate)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                Interviews for {format(date, 'MMMM d, yyyy')}
              </CardTitle>
              <CardDescription>
                {interviewsForSelectedDate.length === 0
                  ? "No interviews scheduled for this date"
                  : `${interviewsForSelectedDate.length} interview(s) scheduled`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interviewsForSelectedDate.map((interview) => (
                  <Card key={interview.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{interview.title}</CardTitle>
                          <CardDescription>{interview.candidateName}</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {interview.startTime} - {interview.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{interview.location || "No location specified"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {interview.interviewers
                              .map(
                                (id) =>
                                  interviewers.find((i) => i.id === id)?.name || ""
                              )
                              .join(", ")}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default InterviewScheduler;
