import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { shadows } from '@/components/ui/shadow';
import { useToast } from '@/components/ui/use-toast';
import {
  Eye,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Star,
  MoreHorizontal,
  MessageSquare,
  XCircle,
  Users,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Application, ApplicationStatus } from '@/types/application';
import { cn } from '@/lib/utils';

// Application stages for the Kanban board
const APPLICATION_STAGES = [
  { id: 'applied', name: 'Applied', color: 'bg-blue-50 border-blue-200' },
  { id: 'reviewed', name: 'Reviewed', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'screening', name: 'Screening', color: 'bg-purple-50 border-purple-200' },
  { id: 'interview', name: 'Interview', color: 'bg-indigo-50 border-indigo-200' },
  { id: 'assessment', name: 'Assessment', color: 'bg-orange-50 border-orange-200' },
  { id: 'offer', name: 'Offer', color: 'bg-green-50 border-green-200' },
  { id: 'hired', name: 'Hired', color: 'bg-emerald-50 border-emerald-200' },
  { id: 'rejected', name: 'Rejected', color: 'bg-red-50 border-red-200' }
];

interface ApplicationKanbanBoardProps {
  applications: Application[];
  onApplicationAction: (applicationId: string, action: string) => void;
  onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void;
  loading?: boolean;
}

const ApplicationKanbanBoard: React.FC<ApplicationKanbanBoardProps> = ({
  applications,
  onApplicationAction,
  onStatusChange,
  loading = false
}) => {
  const { toast } = useToast();

  // Group applications by status
  const applicationsByStatus = useMemo(() => {
    const grouped = APPLICATION_STAGES.reduce((acc, stage) => {
      acc[stage.id] = applications.filter(app => app.status === stage.id);
      return acc;
    }, {} as Record<string, Application[]>);
    return grouped;
  }, [applications]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Find the application being moved
    const application = applications.find(app => app.id === draggableId);
    if (!application) return;

    const newStatus = destination.droppableId as ApplicationStatus;
    const oldStatus = source.droppableId as ApplicationStatus;

    if (newStatus !== oldStatus) {
      try {
        await onStatusChange(application.id, newStatus);
        
        const stageName = APPLICATION_STAGES.find(s => s.id === newStatus)?.name || newStatus;
        toast.atsBlue({
          title: 'Application Updated',
          description: `${application.candidateInfo.firstName} ${application.candidateInfo.lastName} moved to ${stageName}`
        });
      } catch (error) {
        console.error('Failed to update application status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update application status. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const statusConfig = {
      applied: { color: 'bg-blue-500', label: 'Applied' },
      reviewed: { color: 'bg-yellow-500', label: 'Reviewed' },
      screening: { color: 'bg-purple-500', label: 'Screening' },
      interview: { color: 'bg-indigo-500', label: 'Interview' },
      assessment: { color: 'bg-orange-500', label: 'Assessment' },
      offer: { color: 'bg-green-500', label: 'Offer' },
      hired: { color: 'bg-emerald-500', label: 'Hired' },
      rejected: { color: 'bg-red-500', label: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.applied;
    return (
      <Badge className={`${config.color} text-white hover:${config.color}/80 text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const ApplicationCard = ({ application }: { application: Application }) => (
    <Card className={`${shadows.card} cursor-pointer hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${application.candidateInfo.firstName} ${application.candidateInfo.lastName}`} />
              <AvatarFallback className="text-xs">
                {application.candidateInfo.firstName[0]}{application.candidateInfo.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">
                {application.candidateInfo.firstName} {application.candidateInfo.lastName}
              </h3>
              <p className="text-xs text-gray-600 truncate">
                {application.professionalInfo.currentTitle}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={shadows.dropdown}>
              <DropdownMenuItem onClick={() => onApplicationAction(application.id, 'view')}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onApplicationAction(application.id, 'interview')}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onApplicationAction(application.id, 'note')}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Note
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onApplicationAction(application.id, 'reject')}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Mail className="h-3 w-3" />
            <span className="truncate">{application.candidateInfo.email}</span>
          </div>
          {application.candidateInfo.phone && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Phone className="h-3 w-3" />
              <span>{application.candidateInfo.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{new Date(application.submittedAt || '').toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className={`text-xs font-medium ${getScoreColor(application.scoring.automaticScore)}`}>
              {application.scoring.automaticScore}%
            </span>
          </div>
          {getStatusBadge(application.status)}
        </div>

        <div className="flex gap-1">
          <Button 
            size="sm" 
            className="flex-1 h-7 text-xs bg-ats-blue hover:bg-ats-dark-blue"
            onClick={() => onApplicationAction(application.id, 'view')}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 h-7 text-xs"
            onClick={() => onApplicationAction(application.id, 'interview')}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-4 -mx-2 px-2">
          {APPLICATION_STAGES.map(stage => {
            const stageApplications = applicationsByStatus[stage.id] || [];
            
            return (
              <div
                key={stage.id}
                className={cn(
                  "min-w-[300px] w-[300px] rounded-lg border-2 flex-shrink-0",
                  stage.color
                )}
              >
                <div className="p-3 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{stage.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {stageApplications.length}
                    </Badge>
                  </div>
                </div>

                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "p-3 min-h-[calc(100vh-16rem)] transition-colors",
                        snapshot.isDraggingOver && "bg-white/70"
                      )}
                    >
                      <div className="space-y-3">
                        {stageApplications.map((application, index) => (
                          <Draggable
                            key={application.id}
                            draggableId={application.id}
                            index={index}
                            isDragDisabled={loading}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "transition-all duration-200",
                                  snapshot.isDragging && "rotate-1 scale-105 shadow-lg z-50"
                                )}
                              >
                                <ApplicationCard application={application} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                      
                      {stageApplications.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <Users className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">No applications</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default ApplicationKanbanBoard;
