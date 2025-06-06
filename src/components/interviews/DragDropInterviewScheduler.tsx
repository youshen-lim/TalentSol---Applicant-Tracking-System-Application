import React, { useState, useCallback, memo, useMemo } from 'react';
import { useDebouncedSearch, useOptimizedFilter } from '@/components/ui/VirtualScrollList';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Video, 
  Users,
  GripVertical,
  Plus,
  Filter
} from 'lucide-react';
import { format, parseISO, addDays, startOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  status: string;
  avatar?: string;
  applicationId: string;
}

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  interviewerId?: string;
  interviewerName?: string;
}

interface ScheduledInterview {
  id: string;
  candidateId: string;
  timeSlotId: string;
  type: string;
  status: string;
}

interface DragDropInterviewSchedulerProps {
  candidates: Candidate[];
  timeSlots: TimeSlot[];
  scheduledInterviews: ScheduledInterview[];
  onScheduleInterview: (candidateId: string, timeSlotId: string, type: string) => void;
  onRescheduleInterview: (interviewId: string, newTimeSlotId: string) => void;
  onCancelInterview: (interviewId: string) => void;
  loading?: boolean;
}

const DragDropInterviewScheduler: React.FC<DragDropInterviewSchedulerProps> = ({
  candidates,
  timeSlots,
  scheduledInterviews,
  onScheduleInterview,
  onRescheduleInterview,
  onCancelInterview,
  loading = false
}) => {
  const [selectedInterviewType, setSelectedInterviewType] = useState('technical');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced search
  const debouncedSearchTerm = useDebouncedSearch(searchTerm, 300);

  const interviewTypes = [
    { value: 'technical', label: 'Technical', color: 'bg-blue-500' },
    { value: 'behavioral', label: 'Behavioral', color: 'bg-purple-500' },
    { value: 'cultural_fit', label: 'Cultural Fit', color: 'bg-amber-500' },
    { value: 'final', label: 'Final', color: 'bg-cyan-500' }
  ];

  // Optimized filtering with search and status
  const filteredCandidates = useOptimizedFilter(
    candidates,
    useCallback((candidate: Candidate) => {
      const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus;
      const matchesSearch = !debouncedSearchTerm ||
        candidate.firstName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        candidate.lastName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        candidate.position.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    }, [filterStatus, debouncedSearchTerm]),
    [filterStatus, debouncedSearchTerm]
  );

  // Group time slots by date
  const timeSlotsByDate = timeSlots.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  // Get scheduled interview for a time slot
  const getScheduledInterview = (timeSlotId: string) => {
    return scheduledInterviews.find(interview => interview.timeSlotId === timeSlotId);
  };

  // Get candidate by ID
  const getCandidateById = (candidateId: string) => {
    return candidates.find(candidate => candidate.id === candidateId);
  };

  // Handle drag and drop
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // If dropped in the same place, do nothing
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Handle different drop scenarios
    if (source.droppableId === 'candidates' && destination.droppableId.startsWith('timeslot-')) {
      // Scheduling a new interview
      const timeSlotId = destination.droppableId.replace('timeslot-', '');
      const candidateId = draggableId.replace('candidate-', '');
      
      // Check if time slot is available
      const timeSlot = timeSlots.find(slot => slot.id === timeSlotId);
      if (!timeSlot?.available) {
        toast({
          title: 'Time Slot Unavailable',
          description: 'This time slot is not available for scheduling.',
          variant: 'destructive',
        });
        return;
      }

      onScheduleInterview(candidateId, timeSlotId, selectedInterviewType);
      
      toast({
        title: 'Interview Scheduled',
        description: `Interview scheduled successfully for ${selectedInterviewType} round.`,
      });
    } else if (source.droppableId.startsWith('timeslot-') && destination.droppableId.startsWith('timeslot-')) {
      // Rescheduling an existing interview
      const sourceTimeSlotId = source.droppableId.replace('timeslot-', '');
      const destTimeSlotId = destination.droppableId.replace('timeslot-', '');
      
      const interview = getScheduledInterview(sourceTimeSlotId);
      if (interview) {
        // Check if destination time slot is available
        const destTimeSlot = timeSlots.find(slot => slot.id === destTimeSlotId);
        if (!destTimeSlot?.available) {
          toast({
            title: 'Time Slot Unavailable',
            description: 'This time slot is not available for rescheduling.',
            variant: 'destructive',
          });
          return;
        }

        onRescheduleInterview(interview.id, destTimeSlotId);
        
        toast({
          title: 'Interview Rescheduled',
          description: 'Interview has been rescheduled successfully.',
        });
      }
    }
  }, [candidates, timeSlots, scheduledInterviews, selectedInterviewType, onScheduleInterview, onRescheduleInterview]);

  // Render candidate card
  const renderCandidateCard = (candidate: Candidate, index: number) => (
    <Draggable
      key={candidate.id}
      draggableId={`candidate-${candidate.id}`}
      index={index}
      isDragDisabled={loading}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "bg-white border rounded-lg p-3 mb-2 shadow-sm transition-all duration-200",
            snapshot.isDragging && "rotate-1 scale-105 shadow-lg z-50"
          )}
        >
          <div className="flex items-center gap-3">
            <GripVertical className="h-4 w-4 text-gray-400" />
            <Avatar className="h-8 w-8">
              <AvatarImage src={candidate.avatar} />
              <AvatarFallback>
                {candidate.firstName[0]}{candidate.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {candidate.firstName} {candidate.lastName}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {candidate.position}
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {candidate.status}
            </Badge>
          </div>
        </div>
      )}
    </Draggable>
  );

  // Render time slot
  const renderTimeSlot = (timeSlot: TimeSlot, date: string) => {
    const scheduledInterview = getScheduledInterview(timeSlot.id);
    const candidate = scheduledInterview ? getCandidateById(scheduledInterview.candidateId) : null;

    return (
      <Droppable
        key={timeSlot.id}
        droppableId={`timeslot-${timeSlot.id}`}
        isDropDisabled={!timeSlot.available || loading}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "border rounded-lg p-3 min-h-[80px] transition-all duration-200",
              timeSlot.available ? "border-dashed border-gray-300 bg-gray-50" : "border-solid border-gray-200 bg-white",
              snapshot.isDraggingOver && "border-blue-500 bg-blue-50",
              !timeSlot.available && "opacity-50"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">
                {timeSlot.startTime} - {timeSlot.endTime}
              </div>
              {timeSlot.interviewerName && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {timeSlot.interviewerName}
                </div>
              )}
            </div>

            {scheduledInterview && candidate ? (
              <Draggable
                draggableId={`interview-${scheduledInterview.id}`}
                index={0}
                isDragDisabled={loading}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                      "bg-white border rounded p-2 shadow-sm transition-all duration-200",
                      snapshot.isDragging && "rotate-1 scale-105 shadow-lg z-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-3 w-3 text-gray-400" />
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={candidate.avatar} />
                        <AvatarFallback className="text-xs">
                          {candidate.firstName[0]}{candidate.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">
                          {candidate.firstName} {candidate.lastName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {scheduledInterview.type}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ) : (
              <div className="text-xs text-gray-400 text-center py-2">
                {timeSlot.available ? 'Drop candidate here' : 'Unavailable'}
              </div>
            )}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Candidates Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Candidates
            </CardTitle>
            
            {/* Interview Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Interview Type:</label>
              <div className="grid grid-cols-2 gap-1">
                {interviewTypes.map(type => (
                  <Button
                    key={type.value}
                    variant={selectedInterviewType === type.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedInterviewType(type.value)}
                    className="text-xs"
                  >
                    <div className={cn("w-2 h-2 rounded-full mr-1", type.color)} />
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full text-sm border rounded px-2 py-1"
              >
                <option value="all">All Candidates</option>
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
              </select>
            </div>
          </CardHeader>

          <CardContent>
            <Droppable droppableId="candidates" isDropDisabled={true}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2 max-h-96 overflow-y-auto"
                >
                  {filteredCandidates.map((candidate, index) => 
                    renderCandidateCard(candidate, index)
                  )}
                  {provided.placeholder}
                  
                  {filteredCandidates.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No candidates found</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </CardContent>
        </Card>

        {/* Schedule Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Interview Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {Object.entries(timeSlotsByDate).map(([date, slots]) => (
                  <div key={date}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {slots.map(slot => renderTimeSlot(slot, date))}
                    </div>
                  </div>
                ))}
                
                {Object.keys(timeSlotsByDate).length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Clock className="h-12 w-12 mx-auto mb-4" />
                    <p>No time slots available</p>
                    <p className="text-sm">Add time slots to start scheduling interviews</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DragDropContext>
  );
};

export default DragDropInterviewScheduler;
