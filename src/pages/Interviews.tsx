import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shadows } from "@/components/ui/shadow";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import InterviewScheduler from "@/components/interviews/InterviewScheduler";
import { toast } from "@/components/ui/use-toast";
import PageHeader from "@/components/layout/PageHeader";
import LoadingUI from "@/components/ui/loading";
import { useInterviews } from "@/hooks/useInterviews";

/**
 * Interviews page component
 * Displays interview schedule and allows for interview management
 */

// Mock data
const interviewers = [
  { id: "i1", name: "Jane Smith", role: "Engineering Manager", avatar: "" },
  { id: "i2", name: "John Johnson", role: "Senior Developer", avatar: "" },
  { id: "i3", name: "Emily Brown", role: "HR Specialist", avatar: "" },
  { id: "i4", name: "Michael Wilson", role: "Product Manager", avatar: "" },
  { id: "i5", name: "Sarah Lee", role: "UX Designer", avatar: "" },
];

const interviewTypes = [
  {
    id: "it1",
    name: "Technical Interview",
    duration: 60,
    description: "Technical skills assessment with coding exercises",
  },
  {
    id: "it2",
    name: "Cultural Fit",
    duration: 45,
    description: "Discussion about company values and team alignment",
  },
  {
    id: "it3",
    name: "Portfolio Review",
    duration: 60,
    description: "Review and discussion of candidate's previous work",
  },
  {
    id: "it4",
    name: "HR Screening",
    duration: 30,
    description: "Initial call to discuss experience and expectations",
  },
];

// Generate mock time slots for the next 7 days
const generateTimeSlots = () => {
  const slots: Record<string, { id: string; start: string; end: string }[]> = {};

  for (let i = 0; i < 7; i++) {
    const date = addDays(new Date(), i);
    const dateString = format(date, "yyyy-MM-dd");

    slots[dateString] = [
      { id: `${dateString}-1`, start: "09:00", end: "10:00" },
      { id: `${dateString}-2`, start: "10:30", end: "11:30" },
      { id: `${dateString}-3`, start: "13:00", end: "14:00" },
      { id: `${dateString}-4`, start: "14:30", end: "15:30" },
      { id: `${dateString}-5`, start: "16:00", end: "17:00" },
    ];
  }

  return slots;
};

const availableTimeSlots = generateTimeSlots();

const mockInterviews = [
  {
    id: "int1",
    candidateName: "Alex Rodriguez",
    position: "Frontend Developer",
    type: "Technical Interview",
    interviewers: ["Jane Smith", "John Johnson"],
    dateTime: new Date(new Date().setHours(10, 0, 0, 0)),
    status: "Scheduled",
  },
  {
    id: "int2",
    candidateName: "Maria Garcia",
    position: "UX Designer",
    type: "Portfolio Review",
    interviewers: ["Sarah Lee", "Michael Wilson"],
    dateTime: new Date(new Date().setHours(14, 30, 0, 0)),
    status: "Scheduled",
  },
  {
    id: "int3",
    candidateName: "James Wilson",
    position: "Product Manager",
    type: "Cultural Fit",
    interviewers: ["Emily Brown"],
    dateTime: addDays(new Date(), 1),
    status: "Scheduled",
  },
  {
    id: "int4",
    candidateName: "Jennifer Moore",
    position: "Backend Developer",
    type: "Technical Interview",
    interviewers: ["John Johnson"],
    dateTime: addDays(new Date(), 1),
    status: "Scheduled",
  },
  {
    id: "int5",
    candidateName: "Robert Zhang",
    position: "DevOps Engineer",
    type: "Technical Interview",
    interviewers: ["Jane Smith"],
    dateTime: addDays(new Date(), 2),
    status: "Scheduled",
  },
];

const getDayInterviews = (date: Date) => {
  return mockInterviews.filter(
    (interview) => format(interview.dateTime, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
  );
};

const Interviews = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // API Integration - Replace mock data with real data
  const { interviews, loading, error, refetch } = useInterviews();

  const nextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };

  const prevWeek = () => {
    setWeekStart(subWeeks(weekStart, 1));
  };

  const handleSchedule = (data: any) => {
    console.log("Scheduled interview:", data);
    toast.success("Interview scheduled successfully!");
  };

  // Generate week days from the week start date
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interviews"
        subtitle="Schedule and manage candidate interviews"
        icon={CalendarIcon}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-[280px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          <UserPlus className="mr-2 h-4 w-4" />
          Schedule Interview
        </Button>
      </PageHeader>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">
              {format(weekStart, "MMMM d")} - {format(addDays(weekStart, 6), "MMMM d, yyyy")}
            </h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={prevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
              >
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={nextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Week Calendar */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day, i) => (
              <div
                key={i}
                className="text-center py-2 border-b-2 font-medium"
                style={{
                  borderColor:
                    format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                      ? "#3B82F6"
                      : "transparent"
                }}
              >
                <div className="text-xs text-gray-500">{format(day, "EEE")}</div>
                <div>{format(day, "d")}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 mt-2">
            {weekDays.map((day, i) => (
              <div key={i} className="min-h-[300px] border rounded-md p-2">
                {getDayInterviews(day).length > 0 ? (
                  <div className="space-y-2">
                    {getDayInterviews(day).map((interview) => (
                      <Card key={interview.id} className={`${shadows.card} p-2 text-xs border-l-4 border-l-ats-blue`}>
                        <div className="font-medium">{format(interview.dateTime, "h:mm a")}</div>
                        <div>{interview.candidateName}</div>
                        <div className="text-gray-500">{interview.type}</div>
                        <div className="flex items-center mt-1 text-gray-500">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{interview.interviewers.join(", ")}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-xs text-gray-400">No interviews</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          {loading ? (
            <LoadingUI message="Loading interviews..." />
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-red-600 mb-2">
                <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium">Error loading interviews</h3>
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={refetch}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className={`${shadows.card} overflow-hidden`}>
              <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 font-medium text-sm">
                <div className="col-span-3">Candidate</div>
                <div className="col-span-2">Position</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Date & Time</div>
                <div className="col-span-2">Interviewers</div>
                <div className="col-span-1">Actions</div>
              </div>
              <div className="divide-y">
                {(interviews.length > 0 ? interviews : mockInterviews).map((interview) => (
                <div key={interview.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                  <div className="col-span-3 flex items-center space-x-3">
                    <div className="h-8 w-8 bg-ats-blue/10 text-ats-blue rounded-full flex items-center justify-center">
                      {interview.candidateName.charAt(0)}
                    </div>
                    <div className="font-medium">{interview.candidateName}</div>
                  </div>
                  <div className="col-span-2">{interview.position}</div>
                  <div className="col-span-2">{interview.type}</div>
                  <div className="col-span-2">
                    <div>{format(interview.dateTime, "MMM d, yyyy")}</div>
                    <div className="text-sm text-gray-500">{format(interview.dateTime, "h:mm a")}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{interview.interviewers.join(", ")}</span>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <InterviewScheduler
            interviewers={interviewers}
            interviewTypes={interviewTypes}
            availableTimeSlots={availableTimeSlots}
            onInterviewScheduled={handleSchedule}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Interviews;