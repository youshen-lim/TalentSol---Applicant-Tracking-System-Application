import { useState } from "react";
import { Calendar as CalendarIcon, Calendar as CalendarLucide, ChevronLeft, ChevronRight, Clock, User, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { standardizedShadowVariants, shadows } from "@/components/ui/shadow";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import InterviewScheduler from "@/components/interviews/InterviewScheduler";
import InterviewCalendar from "@/components/interviews/InterviewCalendar";
import DragDropInterviewScheduler from "@/components/interviews/DragDropInterviewScheduler";
import InterviewTemplates from "@/components/interviews/InterviewTemplates";
import BulkInterviewOperations from "@/components/interviews/BulkInterviewOperations";
import { toast } from "@/components/ui/use-toast";
import PageHeader from "@/components/layout/PageHeader";
import LoadingUI from "@/components/ui/loading";
import { useInterviews } from "@/hooks/useInterviews";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useRealTimeInterviews } from "@/hooks/useRealTimeInterviews";

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
  const [activeTab, setActiveTab] = useState("calendar");

  // API Integration - Replace mock data with real data
  const { interviews, loading, error, refetch } = useInterviews();

  // Real-time updates
  const { isConnected, connectionError } = useRealTimeInterviews();

  // Enhanced responsive layout management
  const { isMobile, isTablet, shouldUseCardLayout } = useResponsiveLayout();

  // State for advanced features
  const [selectedInterviews, setSelectedInterviews] = useState<string[]>([]);
  const [showBulkOperations, setShowBulkOperations] = useState(false);

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
    <div className="ats-page-layout">
      <div className="ats-content-container">
      <PageHeader
        title="Interviews"
        subtitle="Schedule and manage candidate interviews"
        icon={CalendarIcon}
        variant="default"
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
        <div className="flex items-center gap-3">
          {/* Real-time connection status */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-gray-600">
              {isConnected ? 'Live updates' : 'Offline'}
            </span>
          </div>
          <Button size="sm" className="bg-ats-blue hover:bg-ats-dark-blue text-white">
            <UserPlus className="mr-2 h-4 w-4" />
            Schedule Interview
          </Button>
        </div>
      </PageHeader>

      {/* Standardized Navigation Tabs - Matching Analytics Page Style */}
      <Tabs
        defaultValue="calendar"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-6 mb-6" variant="ats-blue">
          <TabsTrigger value="calendar" className="flex items-center" variant="ats-blue">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="fullcalendar" className="flex items-center" variant="ats-blue">
            <CalendarLucide className="h-4 w-4 mr-2" />
            Full Calendar
          </TabsTrigger>
          <TabsTrigger value="dragdrop" className="flex items-center" variant="ats-blue">
            <Users className="h-4 w-4 mr-2" />
            Drag & Drop
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center" variant="ats-blue">
            <Users className="h-4 w-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center" variant="ats-blue">
            <Clock className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center" variant="ats-blue">
            <UserPlus className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          {/* Week Navigation with standardized styling */}
          <div className={`${standardizedShadowVariants.card} p-4 mb-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-section-header text-gray-900">
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
          </div>

          {/* Week Calendar Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day, i) => (
              <div
                key={i}
                className="text-center py-3 border-b-2 font-medium transition-colors duration-200"
                style={{
                  borderColor:
                    format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                      ? "#3B82F6"
                      : "transparent"
                }}
              >
                <div className="text-xs text-gray-500 uppercase tracking-wide">{format(day, "EEE")}</div>
                <div className={`text-sm ${
                  format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                    ? "text-ats-blue font-semibold"
                    : "text-gray-900"
                }`}>{format(day, "d")}</div>
              </div>
            ))}
          </div>

          {/* Calendar Grid with standardized styling and horizontal scroll */}
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 mt-2 overflow-x-auto min-w-fit">
            {weekDays.map((day, i) => (
              <div key={i} className={`min-h-[300px] ${standardizedShadowVariants.card} p-3`}>
                {getDayInterviews(day).length > 0 ? (
                  <div className="space-y-2">
                    {getDayInterviews(day).map((interview) => (
                      <Card key={interview.id} className={`${standardizedShadowVariants.cardEnhanced} p-3 text-xs border-l-4 border-l-ats-blue hover:border-l-ats-dark-blue transition-all duration-200`}>
                        <div className="font-semibold text-ats-blue">{format(interview.dateTime, "h:mm a")}</div>
                        <div className="font-medium text-gray-900 mt-1">{interview.candidateName}</div>
                        <div className="text-gray-600 text-xs">{interview.type}</div>
                        <div className="flex items-center mt-2 text-gray-500">
                          <Users className="h-3 w-3 mr-1" />
                          <span className="text-xs truncate">{interview.interviewers.join(", ")}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-xs text-gray-400 text-center">No interviews scheduled</p>
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
            <div className={`${standardizedShadowVariants.card} p-6 text-center bg-red-50 border-red-200`}>
              <div className="text-red-600 mb-2">
                <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-section-header text-red-700">Error loading interviews</h3>
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
            <div className={`${standardizedShadowVariants.card} overflow-x-auto overflow-y-hidden`}>
              {/* Responsive table header */}
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-12'} gap-4 p-4 border-b bg-ats-blue/5 font-semibold text-sm text-ats-blue min-w-fit`}>
                {!isMobile ? (
                  <>
                    <div className="col-span-3">Candidate</div>
                    <div className="col-span-2">Position</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Date & Time</div>
                    <div className="col-span-2">Interviewers</div>
                    <div className="col-span-1">Actions</div>
                  </>
                ) : (
                  <div className="text-center">Interview Details</div>
                )}
              </div>

              {/* Responsive table content */}
              <div className="divide-y divide-gray-100 min-w-fit">
                {(interviews.length > 0 ? interviews : mockInterviews).map((interview) => (
                  <div key={interview.id} className={`${isMobile ? 'p-4 space-y-3' : 'grid grid-cols-12 gap-4 p-4 items-center'} hover:bg-gray-50 transition-colors duration-200`}>
                    {isMobile ? (
                      // Mobile card layout
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-ats-blue/10 text-ats-blue rounded-full flex items-center justify-center font-semibold">
                            {interview.candidateName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{interview.candidateName}</div>
                            <div className="text-sm text-gray-600">{interview.position}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Type</div>
                            <div className="font-medium">{interview.type}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Date & Time</div>
                            <div className="font-medium">{format(interview.dateTime, "MMM d, yyyy")}</div>
                            <div className="text-xs text-gray-500">{format(interview.dateTime, "h:mm a")}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm mb-1">Interviewers</div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">{interview.interviewers.join(", ")}</span>
                          </div>
                        </div>
                        <div className="pt-2">
                          <Button variant="outline" size="sm" className="w-full">
                            Edit Interview
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Desktop table layout
                      <>
                        <div className="col-span-3 flex items-center space-x-3">
                          <div className="h-8 w-8 bg-ats-blue/10 text-ats-blue rounded-full flex items-center justify-center font-semibold">
                            {interview.candidateName.charAt(0)}
                          </div>
                          <div className="font-medium text-gray-900">{interview.candidateName}</div>
                        </div>
                        <div className="col-span-2 text-gray-700">{interview.position}</div>
                        <div className="col-span-2 text-gray-700">{interview.type}</div>
                        <div className="col-span-2">
                          <div className="font-medium text-gray-900">{format(interview.dateTime, "MMM d, yyyy")}</div>
                          <div className="text-sm text-gray-500">{format(interview.dateTime, "h:mm a")}</div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm text-gray-700">{interview.interviewers.join(", ")}</span>
                          </div>
                        </div>
                        <div className="col-span-1">
                          <Button variant="ghost" size="sm" className="text-ats-blue hover:text-ats-dark-blue hover:bg-ats-blue/10">
                            Edit
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Full Calendar View */}
        <TabsContent value="fullcalendar" className="mt-6">
          <InterviewCalendar
            interviews={interviews}
            onInterviewSelect={(interview) => {
              toast({
                title: 'Interview Selected',
                description: `Selected interview with ${interview.candidateName}`,
              });
            }}
            onInterviewUpdate={async (interviewId, updates) => {
              // Handle interview update
              console.log('Update interview:', interviewId, updates);
              await refetch();
            }}
            onInterviewCreate={(dateInfo) => {
              toast({
                title: 'Create Interview',
                description: `Create interview for ${dateInfo.startStr}`,
              });
            }}
            onInterviewDelete={async (interviewId) => {
              // Handle interview deletion
              console.log('Delete interview:', interviewId);
              await refetch();
            }}
            loading={loading}
          />
        </TabsContent>

        {/* Drag and Drop Scheduler */}
        <TabsContent value="dragdrop" className="mt-6">
          <DragDropInterviewScheduler
            candidates={[
              // Mock candidates for demo
              {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                position: 'Frontend Developer',
                status: 'screening',
                applicationId: 'app_1'
              },
              {
                id: '2',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                position: 'Backend Developer',
                status: 'interview',
                applicationId: 'app_2'
              }
            ]}
            timeSlots={[
              // Mock time slots for demo
              {
                id: 'slot_1',
                date: '2024-06-06',
                startTime: '09:00',
                endTime: '10:00',
                available: true,
                interviewerId: 'int_1',
                interviewerName: 'Alice Johnson'
              },
              {
                id: 'slot_2',
                date: '2024-06-06',
                startTime: '10:00',
                endTime: '11:00',
                available: true,
                interviewerId: 'int_2',
                interviewerName: 'Bob Wilson'
              }
            ]}
            scheduledInterviews={[]}
            onScheduleInterview={(candidateId, timeSlotId, type) => {
              toast({
                title: 'Interview Scheduled',
                description: `Scheduled ${type} interview for candidate ${candidateId}`,
              });
            }}
            onRescheduleInterview={(interviewId, newTimeSlotId) => {
              toast({
                title: 'Interview Rescheduled',
                description: `Interview ${interviewId} moved to slot ${newTimeSlotId}`,
              });
            }}
            onCancelInterview={(interviewId) => {
              toast({
                title: 'Interview Cancelled',
                description: `Interview ${interviewId} has been cancelled`,
              });
            }}
            loading={loading}
          />
        </TabsContent>

        {/* Templates Management */}
        <TabsContent value="templates" className="mt-6">
          <InterviewTemplates
            templates={[
              // Mock templates for demo
              {
                id: 'template_1',
                name: 'Senior Frontend Developer Technical Interview',
                description: 'Comprehensive technical assessment for senior frontend positions',
                type: 'technical',
                duration: 90,
                location: 'Conference Room A',
                meetingLink: 'https://zoom.us/j/123456789',
                interviewers: ['Alice Johnson', 'Bob Wilson'],
                questions: [],
                evaluationCriteria: [],
                instructions: 'Focus on React, TypeScript, and system design',
                isDefault: true,
                createdAt: '2024-06-01T00:00:00Z',
                updatedAt: '2024-06-01T00:00:00Z'
              }
            ]}
            onCreateTemplate={(template) => {
              toast({
                title: 'Template Created',
                description: `Interview template "${template.name}" has been created`,
              });
            }}
            onUpdateTemplate={(id, template) => {
              toast({
                title: 'Template Updated',
                description: `Template ${id} has been updated`,
              });
            }}
            onDeleteTemplate={(id) => {
              toast({
                title: 'Template Deleted',
                description: `Template ${id} has been deleted`,
              });
            }}
            onDuplicateTemplate={(id) => {
              toast({
                title: 'Template Duplicated',
                description: `Template ${id} has been duplicated`,
              });
            }}
            onUseTemplate={(template) => {
              toast({
                title: 'Template Applied',
                description: `Using template "${template.name}"`,
              });
            }}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <div className="space-y-6">
            {/* Bulk Operations */}
            <BulkInterviewOperations
              interviews={interviews}
              selectedInterviews={selectedInterviews}
              onSelectionChange={setSelectedInterviews}
              onBulkReschedule={async (interviewIds, newDate, newTime) => {
                console.log('Bulk reschedule:', interviewIds, newDate, newTime);
                await refetch();
              }}
              onBulkCancel={async (interviewIds, reason) => {
                console.log('Bulk cancel:', interviewIds, reason);
                await refetch();
              }}
              onBulkSendReminder={async (interviewIds, message) => {
                console.log('Bulk send reminder:', interviewIds, message);
              }}
              onBulkExport={async (interviewIds, format) => {
                console.log('Bulk export:', interviewIds, format);
              }}
              onBulkDelete={async (interviewIds) => {
                console.log('Bulk delete:', interviewIds);
                await refetch();
              }}
              loading={loading}
            />

            {/* Original Scheduler */}
            <div className={standardizedShadowVariants.card}>
              <InterviewScheduler
                interviewers={interviewers}
                interviewTypes={interviewTypes}
                availableTimeSlots={availableTimeSlots}
                onInterviewScheduled={handleSchedule}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default Interviews;