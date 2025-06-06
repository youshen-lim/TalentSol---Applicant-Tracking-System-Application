import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, EventApi, DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Video, 
  Edit, 
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface Interview {
  id: string;
  title: string;
  candidateName: string;
  candidateId: string;
  position: string;
  type: string;
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  meetingLink?: string;
  interviewers: string[];
  status: string;
  notes?: string;
}

interface InterviewCalendarProps {
  interviews: Interview[];
  onInterviewSelect?: (interview: Interview) => void;
  onInterviewUpdate?: (interviewId: string, updates: Partial<Interview>) => void;
  onInterviewCreate?: (dateInfo: DateSelectArg) => void;
  onInterviewDelete?: (interviewId: string) => void;
  loading?: boolean;
  className?: string;
}

const InterviewCalendar: React.FC<InterviewCalendarProps> = ({
  interviews,
  onInterviewSelect,
  onInterviewUpdate,
  onInterviewCreate,
  onInterviewDelete,
  loading = false,
  className
}) => {
  const calendarRef = useRef<FullCalendar>(null);
  const [currentView, setCurrentView] = useState('timeGridWeek');
  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null);

  // Convert interviews to FullCalendar events
  const calendarEvents: EventInput[] = interviews.map(interview => {
    const startDate = new Date(interview.scheduledDate);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour duration

    // If start and end times are provided, use them
    if (interview.startTime && interview.endTime) {
      const [startHour, startMinute] = interview.startTime.split(':').map(Number);
      const [endHour, endMinute] = interview.endTime.split(':').map(Number);
      
      startDate.setHours(startHour, startMinute, 0, 0);
      endDate.setHours(endHour, endMinute, 0, 0);
    }

    return {
      id: interview.id,
      title: `${interview.candidateName} - ${interview.position}`,
      start: startDate,
      end: endDate,
      backgroundColor: getEventColor(interview.type, interview.status),
      borderColor: getEventBorderColor(interview.status),
      textColor: '#ffffff',
      extendedProps: {
        interview,
        candidateName: interview.candidateName,
        position: interview.position,
        type: interview.type,
        status: interview.status,
        location: interview.location,
        meetingLink: interview.meetingLink,
        interviewers: interview.interviewers
      }
    };
  });

  // Get event colors based on interview type and status
  const getEventColor = (type: string, status: string) => {
    if (status === 'cancelled') return '#ef4444';
    if (status === 'completed') return '#10b981';
    
    switch (type.toLowerCase()) {
      case 'technical': return '#3b82f6';
      case 'behavioral': return '#8b5cf6';
      case 'cultural fit': return '#f59e0b';
      case 'final': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  const getEventBorderColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#1f2937';
      case 'in_progress': return '#059669';
      case 'completed': return '#047857';
      case 'cancelled': return '#dc2626';
      default: return '#374151';
    }
  };

  // Handle event click
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const interview = clickInfo.event.extendedProps.interview as Interview;
    setSelectedEvent(clickInfo.event);
    onInterviewSelect?.(interview);
  }, [onInterviewSelect]);

  // Handle date selection for creating new interviews
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    onInterviewCreate?.(selectInfo);
  }, [onInterviewCreate]);

  // Handle event drag and drop
  const handleEventDrop = useCallback(async (dropInfo: EventDropArg) => {
    const interview = dropInfo.event.extendedProps.interview as Interview;
    const newDate = dropInfo.event.start;

    if (!newDate) return;

    try {
      // Update the interview with new date/time
      const updates: Partial<Interview> = {
        scheduledDate: newDate.toISOString(),
        startTime: format(newDate, 'HH:mm'),
        endTime: format(new Date(newDate.getTime() + 60 * 60 * 1000), 'HH:mm')
      };

      await onInterviewUpdate?.(interview.id, updates);

      toast({
        title: 'Interview Rescheduled',
        description: `${interview.candidateName}'s interview has been moved to ${format(newDate, 'PPP p')}`,
      });
    } catch (error) {
      // Revert the change if update fails
      dropInfo.revert();
      toast({
        title: 'Error',
        description: 'Failed to reschedule interview. Please try again.',
        variant: 'destructive',
      });
    }
  }, [onInterviewUpdate]);

  // Handle event resize
  const handleEventResize = useCallback(async (resizeInfo: any) => {
    const interview = resizeInfo.event.extendedProps.interview as Interview;
    const newStart = resizeInfo.event.start;
    const newEnd = resizeInfo.event.end;

    if (!newStart || !newEnd) return;

    try {
      const updates: Partial<Interview> = {
        startTime: format(newStart, 'HH:mm'),
        endTime: format(newEnd, 'HH:mm')
      };

      await onInterviewUpdate?.(interview.id, updates);

      toast({
        title: 'Interview Duration Updated',
        description: `${interview.candidateName}'s interview duration has been updated`,
      });
    } catch (error) {
      resizeInfo.revert();
      toast({
        title: 'Error',
        description: 'Failed to update interview duration. Please try again.',
        variant: 'destructive',
      });
    }
  }, [onInterviewUpdate]);

  // Calendar navigation
  const handlePrevious = () => {
    calendarRef.current?.getApi().prev();
  };

  const handleNext = () => {
    calendarRef.current?.getApi().next();
  };

  const handleToday = () => {
    calendarRef.current?.getApi().today();
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    calendarRef.current?.getApi().changeView(view);
  };

  // Custom event content renderer
  const renderEventContent = (eventInfo: any) => {
    const { interview } = eventInfo.event.extendedProps;
    
    return (
      <div className="p-1 text-xs">
        <div className="font-semibold truncate">{interview.candidateName}</div>
        <div className="text-xs opacity-90 truncate">{interview.position}</div>
        <div className="flex items-center gap-1 mt-1">
          {interview.location && <MapPin className="h-3 w-3" />}
          {interview.meetingLink && <Video className="h-3 w-3" />}
          <Clock className="h-3 w-3" />
        </div>
      </div>
    );
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Interview Calendar
          </CardTitle>
          
          {/* Calendar Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* View Switcher */}
            <div className="flex items-center gap-1">
              <Button
                variant={currentView === 'dayGridMonth' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewChange('dayGridMonth')}
              >
                Month
              </Button>
              <Button
                variant={currentView === 'timeGridWeek' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewChange('timeGridWeek')}
              >
                Week
              </Button>
              <Button
                variant={currentView === 'timeGridDay' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewChange('timeGridDay')}
              >
                Day
              </Button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Technical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Behavioral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span>Cultural Fit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded"></div>
            <span>Final</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="calendar-container">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={false} // We're using custom header
            initialView={currentView}
            events={calendarEvents}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            eventClick={handleEventClick}
            select={handleDateSelect}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            eventContent={renderEventContent}
            height="auto"
            slotMinTime="08:00:00"
            slotMaxTime="18:00:00"
            allDaySlot={false}
            nowIndicator={true}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
              startTime: '09:00',
              endTime: '17:00',
            }}
            slotDuration="00:30:00"
            snapDuration="00:15:00"
            eventOverlap={false}
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              omitZeroMinute: false,
              meridiem: 'short'
            }}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short'
            }}
            loading={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(InterviewCalendar);
