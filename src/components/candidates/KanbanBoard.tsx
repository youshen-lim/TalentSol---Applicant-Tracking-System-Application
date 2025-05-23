import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, PlusCircle } from 'lucide-react';
import CandidateCard, { Candidate } from './CandidateCard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

  // Render the kanban board with a blend of both styles
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      {/* Header with title and add button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Candidate Pipeline</h2>
        {onAddCandidate && (
          <Button onClick={onAddCandidate}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        )}
      </div>

      {/* Drag and drop context */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-6">
          {columns.map(column => (
            <div
              key={column.id}
              className="min-w-[300px] w-[300px] bg-white rounded-lg border border-gray-200 flex-shrink-0"
            >
              {/* Column header */}
              <div className="p-3 border-b sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{column.title}</h3>
                    <span className="text-xs text-gray-500">{column.candidates.length} candidates</span>
                  </div>
                  {onAddCandidate && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onAddCandidate}>
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="p-2 min-h-[calc(100vh-12rem)]"
                  >
                    <div className="space-y-3">
                      {column.candidates.map((candidate, index) => (
                        <Draggable
                          key={candidate.id}
                          draggableId={candidate.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
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
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
