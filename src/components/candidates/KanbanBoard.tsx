import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, PlusCircle, Users } from 'lucide-react';
import CandidateCard, { Candidate } from './CandidateCard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { KanbanScroll } from '@/components/ui/horizontal-scroll';

// Support both naming conventions (Stage and KanbanColumn)
interface Stage {
  id: string;
  name: string;
  candidates: Candidate[];
}

interface KanbanColumn {
  id: string;
  title: string;
  candidates: Candidate[];
}

// Combined props interface that supports both versions
interface KanbanBoardProps {
  // Original props
  candidates?: Candidate[];
  onCandidateStatusChange?: (candidateId: string, newStatus: string) => void;
  onAddCandidate?: () => void;
  onViewCandidate?: ((candidate: Candidate) => void) | ((id: string) => void);
  onEditCandidate?: (candidate: Candidate) => void;

  // New props
  initialStages?: Stage[];

  // Common props
  className?: string;
}

// Default columns/stages if none are provided
const defaultColumns: KanbanColumn[] = [
  { id: 'new', title: 'New Applications', candidates: [] },
  { id: 'screening', title: 'Screening', candidates: [] },
  { id: 'interview', title: 'Interview', candidates: [] },
  { id: 'offer', title: 'Offer', candidates: [] },
  { id: 'hired', title: 'Hired', candidates: [] },
  { id: 'rejected', title: 'Rejected', candidates: [] },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  // Handle all possible props with defaults
  candidates = [],
  initialStages,
  onCandidateStatusChange,
  onAddCandidate,
  onViewCandidate,
  onEditCandidate,
  className,
}) => {
  // Initialize columns/stages based on provided props
  const getInitialColumns = (): KanbanColumn[] => {
    // If initialStages is provided, convert to our internal format
    if (initialStages && initialStages.length > 0) {
      return initialStages.map(stage => ({
        id: stage.id,
        title: stage.name,
        candidates: stage.candidates,
      }));
    }

    // Otherwise, use candidates prop to populate default columns
    if (candidates && candidates.length > 0) {
      const columns = [...defaultColumns];

      // Distribute candidates to their respective columns
      candidates.forEach(candidate => {
        // Handle both status and stage properties
        const status = candidate.status || (candidate.stage?.toLowerCase() as Candidate['status']);
        if (!status) return;

        const columnIndex = columns.findIndex(col => col.id === status);
        if (columnIndex !== -1) {
          columns[columnIndex].candidates.push(candidate);
        }
      });

      return columns;
    }

    // If neither is provided, return empty default columns
    return defaultColumns;
  };

  // State to track columns/stages
  const [columns, setColumns] = useState<KanbanColumn[]>(getInitialColumns());

  // Sync columns with initialStages prop changes (for filtering)
  useEffect(() => {
    if (initialStages && initialStages.length > 0) {
      const updatedColumns = initialStages.map(stage => ({
        id: stage.id,
        title: stage.name,
        candidates: stage.candidates,
      }));
      setColumns(updatedColumns);
    }
  }, [initialStages]);

  // Helper function to get total candidate count for debugging
  const getTotalCandidates = () => {
    return columns.reduce((total, column) => total + column.candidates.length, 0);
  };

  // Handle drag end event
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) return;

    // No change
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    // Find source and destination columns
    const sourceColIndex = columns.findIndex(col => col.id === source.droppableId);
    const destColIndex = columns.findIndex(col => col.id === destination.droppableId);

    if (sourceColIndex === -1 || destColIndex === -1) return;

    // Create new columns array
    const newColumns = [...columns];

    // Remove candidate from source column
    const [movedCandidate] = newColumns[sourceColIndex].candidates.splice(source.index, 1);

    // Add candidate to destination column with updated status/stage
    const updatedCandidate = {
      ...movedCandidate,
      // Update both status and stage properties for compatibility
      status: newColumns[destColIndex].id as Candidate['status'],
      stage: newColumns[destColIndex].title,
    };

    newColumns[destColIndex].candidates.splice(destination.index, 0, updatedCandidate);

    // Update state
    setColumns(newColumns);

    // Show toast notification
    toast.success(`Moved ${movedCandidate.name} to ${newColumns[destColIndex].title}`);

    // Notify parent component if callback exists
    if (onCandidateStatusChange) {
      onCandidateStatusChange(movedCandidate.id, newColumns[destColIndex].id);
    }
  };

  // Handle view candidate with different callback signatures
  const handleViewCandidate = (candidate: Candidate) => {
    if (!onViewCandidate) return;

    if (typeof onViewCandidate === 'function') {
      // Check if the function expects an id or the whole candidate
      if (onViewCandidate.toString().includes('id:')) {
        (onViewCandidate as (id: string) => void)(candidate.id);
      } else {
        (onViewCandidate as (candidate: Candidate) => void)(candidate);
      }
    }
  };

  // Legacy stage color mapping (control group)
  const getLegacyStageColor = (stageId: string) => {
    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
      applied: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      screening: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      interview: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      assessment: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      offer: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
      rejected: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    };
    return colorMap[stageId] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };
  };

  // Standardized stage color mapping (test group)
  const getStandardizedStageColor = (stageId: string) => {
    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
      applied: { bg: 'bg-ats-blue/5', border: 'border-ats-blue/20', text: 'text-ats-blue' },
      screening: { bg: 'bg-ats-purple/5', border: 'border-ats-purple/20', text: 'text-ats-purple' },
      interview: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
      assessment: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
      offer: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
      rejected: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    };
    return colorMap[stageId] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };
  };

  // Use legacy stage color mapping
  const getStageColor = (stageId: string) => {
    return getLegacyStageColor(stageId);
  };

  // Render the kanban board with enhanced responsive styling
  return (
    <div className={cn("w-full overflow-hidden", className)}>
      {/* Kanban Board Header Layout - Title with adjacent button */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Candidate Pipeline</h2>
        {onAddCandidate && (
          <Button
            onClick={onAddCandidate}
            className="bg-ats-blue hover:bg-ats-dark-blue text-white w-full sm:w-auto"
            size="sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        )}
      </div>

      {/* Drag and drop context with enhanced horizontal scrolling */}
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Enhanced horizontal scroll container with scroll indicators and smooth scrolling */}
        <KanbanScroll columnWidth="320px" variant="blue" snapToItems={true} className="enhanced-scrollbar-blue smooth-scroll touch-scroll">
          {columns.map(column => {
            const stageColors = getStageColor(column.id);
            return (
              <div
                key={column.id}
                className={cn(
                  // Width handled by KanbanScroll columnWidth prop - fill the wrapper width
                  "w-full rounded-lg border-2 flex-shrink-0 transition-all duration-200",
                  "kanban-scroll-snap", // Add scroll snap alignment
                  stageColors.bg,
                  stageColors.border
                )}
              >
                {/* Column header with responsive styling */}
                <div className={cn(
                  "p-3 sm:p-4 border-b-2 sticky top-0 z-10 rounded-t-lg",
                  stageColors.bg,
                  stageColors.border
                )}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className={cn("font-semibold text-xs sm:text-sm uppercase tracking-wide truncate", stageColors.text)}>
                        {column.title}
                      </h3>
                      <span className="text-xs text-gray-500 font-medium">
                        {column.candidates.length} candidate{column.candidates.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {onAddCandidate && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-6 w-6 sm:h-7 sm:w-7 hover:bg-white/50 flex-shrink-0", stageColors.text)}
                        onClick={onAddCandidate}
                      >
                        <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Droppable area with responsive styling */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "p-2 sm:p-3 transition-colors duration-200",
                        // Responsive min-height based on screen size
                        "min-h-[calc(100vh-16rem)] sm:min-h-[calc(100vh-14rem)] md:min-h-[calc(100vh-12rem)]",
                        snapshot.isDraggingOver && "bg-white/70"
                      )}
                    >
                      <div className="space-y-2 sm:space-y-3">
                        {column.candidates.map((candidate, index) => (
                          <Draggable
                            key={candidate.id}
                            draggableId={candidate.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "transition-all duration-200",
                                  snapshot.isDragging && "rotate-1 sm:rotate-2 scale-105 shadow-lg z-50"
                                )}
                              >
                                <CandidateCard
                                  candidate={candidate}
                                  onView={handleViewCandidate}
                                  onEdit={onEditCandidate}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}

                      {/* Empty state for columns */}
                      {column.candidates.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-gray-400">
                          <Users className="h-6 w-6 sm:h-8 sm:w-8 mb-2" />
                          <p className="text-xs sm:text-sm text-center">No candidates</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </KanbanScroll>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
