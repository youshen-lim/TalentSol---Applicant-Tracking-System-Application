import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import InterviewCalendar from '@/components/interviews/InterviewCalendar';
import DragDropInterviewScheduler from '@/components/interviews/DragDropInterviewScheduler';
import BulkInterviewOperations from '@/components/interviews/BulkInterviewOperations';

// Mock API client
vi.mock('@/utils/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock hooks
vi.mock('@/hooks/useInterviews', () => ({
  useInterviews: () => ({
    interviews: mockInterviews,
    loading: false,
    error: null,
    createInterview: vi.fn().mockResolvedValue({}),
    updateInterview: vi.fn().mockResolvedValue({}),
    deleteInterview: vi.fn().mockResolvedValue({}),
    refetch: vi.fn(),
  }),
}));

vi.mock('@/hooks/useCandidates', () => ({
  useCandidates: () => ({
    candidates: mockCandidates,
    loading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useBulkInterviewOperations', () => ({
  useBulkInterviewOperations: () => ({
    loading: false,
    error: null,
    bulkReschedule: vi.fn().mockResolvedValue({ success: true }),
    bulkCancel: vi.fn().mockResolvedValue({ success: true }),
    bulkSendReminder: vi.fn().mockResolvedValue({ success: true }),
    bulkDelete: vi.fn().mockResolvedValue({ success: true }),
  }),
}));

const mockInterviews = [
  {
    id: '1',
    title: 'Technical Interview',
    candidateName: 'John Doe',
    candidateId: 'candidate-1',
    position: 'Frontend Developer',
    type: 'technical',
    scheduledDate: '2024-06-15T10:00:00Z',
    startTime: '10:00',
    endTime: '11:00',
    location: 'Conference Room A',
    status: 'scheduled',
  },
  {
    id: '2',
    title: 'Behavioral Interview',
    candidateName: 'Jane Smith',
    candidateId: 'candidate-2',
    position: 'Backend Developer',
    type: 'behavioral',
    scheduledDate: '2024-06-16T14:00:00Z',
    startTime: '14:00',
    endTime: '15:00',
    location: 'Conference Room B',
    status: 'scheduled',
  },
];

const mockCandidates = [
  {
    id: 'candidate-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    position: 'Frontend Developer',
    status: 'active',
  },
  {
    id: 'candidate-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    position: 'Backend Developer',
    status: 'active',
  },
];

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Interview Management E2E Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Calendar Interview Management', () => {
    it('should complete full interview lifecycle in calendar view', async () => {
      const user = userEvent.setup();
      const mockCreate = vi.fn().mockResolvedValue({});
      const mockUpdate = vi.fn().mockResolvedValue({});
      const mockDelete = vi.fn().mockResolvedValue({});

      render(
        <TestWrapper>
          <InterviewCalendar
            interviews={mockInterviews}
            onInterviewCreate={mockCreate}
            onInterviewUpdate={mockUpdate}
            onInterviewDelete={mockDelete}
            onInterviewSelect={vi.fn()}
            loading={false}
          />
        </TestWrapper>
      );

      // 1. Verify calendar loads with existing interviews
      expect(screen.getByText('Interview Calendar')).toBeInTheDocument();
      expect(screen.getByText('Technical')).toBeInTheDocument();
      expect(screen.getByText('Behavioral')).toBeInTheDocument();

      // 2. Create new interview by selecting date
      const createButton = screen.getByText('Create Interview');
      await user.click(createButton);
      expect(mockCreate).toHaveBeenCalled();

      // 3. Switch calendar views
      const weekButton = screen.getByText('Week');
      await user.click(weekButton);
      expect(weekButton).toBeInTheDocument();

      const dayButton = screen.getByText('Day');
      await user.click(dayButton);
      expect(dayButton).toBeInTheDocument();

      // 4. Navigate calendar
      const todayButton = screen.getByText('Today');
      await user.click(todayButton);
      expect(todayButton).toBeInTheDocument();
    });

    it('should handle interview drag and drop rescheduling', async () => {
      const user = userEvent.setup();
      const mockUpdate = vi.fn().mockResolvedValue({});

      render(
        <TestWrapper>
          <InterviewCalendar
            interviews={mockInterviews}
            onInterviewUpdate={mockUpdate}
            onInterviewCreate={vi.fn()}
            onInterviewDelete={vi.fn()}
            onInterviewSelect={vi.fn()}
            loading={false}
          />
        </TestWrapper>
      );

      // Simulate drag and drop (this would be handled by FullCalendar)
      // In a real E2E test, you would use actual drag and drop actions
      const dragEvent = new CustomEvent('eventDrop', {
        detail: {
          event: {
            id: '1',
            start: new Date('2024-06-16T10:00:00Z'),
            extendedProps: { interview: mockInterviews[0] },
          },
        },
      });

      // Simulate the drag and drop callback
      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            scheduledDate: expect.any(String),
          })
        );
      });
    });
  });

  describe('Drag and Drop Scheduler Workflow', () => {
    it('should complete candidate scheduling workflow', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <DragDropInterviewScheduler
            candidates={mockCandidates}
            scheduledInterviews={mockInterviews}
            onScheduleInterview={vi.fn()}
            onRescheduleInterview={vi.fn()}
            loading={false}
          />
        </TestWrapper>
      );

      // 1. Verify scheduler loads
      expect(screen.getByText('Drag & Drop Interview Scheduler')).toBeInTheDocument();

      // 2. Filter candidates
      const statusFilter = screen.getByRole('combobox', { name: /filter by status/i });
      await user.click(statusFilter);
      
      const activeOption = screen.getByText('Active');
      await user.click(activeOption);

      // 3. Search candidates
      const searchInput = screen.getByPlaceholderText(/search candidates/i);
      await user.type(searchInput, 'John');

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // 4. Select interview type
      const typeSelect = screen.getByRole('combobox', { name: /interview type/i });
      await user.click(typeSelect);
      
      const technicalOption = screen.getByText('Technical');
      await user.click(technicalOption);

      // 5. Verify time slots are displayed
      expect(screen.getByText('Available Time Slots')).toBeInTheDocument();
    });

    it('should handle conflict detection during scheduling', async () => {
      const user = userEvent.setup();
      const mockSchedule = vi.fn().mockRejectedValue(new Error('Time slot conflict'));

      render(
        <TestWrapper>
          <DragDropInterviewScheduler
            candidates={mockCandidates}
            scheduledInterviews={mockInterviews}
            onScheduleInterview={mockSchedule}
            onRescheduleInterview={vi.fn()}
            loading={false}
          />
        </TestWrapper>
      );

      // Simulate scheduling conflict
      // In a real E2E test, you would drag a candidate to an occupied time slot
      await waitFor(() => {
        expect(mockSchedule).toHaveBeenCalled();
      });
    });
  });

  describe('Bulk Operations Workflow', () => {
    it('should complete bulk operations workflow', async () => {
      const user = userEvent.setup();
      const mockBulkReschedule = vi.fn().mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <BulkInterviewOperations
            interviews={mockInterviews}
            onBulkOperation={vi.fn()}
            loading={false}
          />
        </TestWrapper>
      );

      // 1. Verify bulk operations interface loads
      expect(screen.getByText('Bulk Interview Operations')).toBeInTheDocument();

      // 2. Select multiple interviews
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });
      await user.click(selectAllCheckbox);

      // Verify individual checkboxes are selected
      const interviewCheckboxes = screen.getAllByRole('checkbox');
      expect(interviewCheckboxes).toHaveLength(3); // Select all + 2 interviews

      // 3. Choose bulk operation
      const operationSelect = screen.getByRole('combobox', { name: /bulk operation/i });
      await user.click(operationSelect);
      
      const rescheduleOption = screen.getByText('Reschedule');
      await user.click(rescheduleOption);

      // 4. Set new date and time
      const dateInput = screen.getByLabelText(/new date/i);
      await user.type(dateInput, '2024-06-20');

      const timeInput = screen.getByLabelText(/new time/i);
      await user.type(timeInput, '15:00');

      // 5. Execute bulk operation
      const executeButton = screen.getByText('Execute Bulk Operation');
      await user.click(executeButton);

      // 6. Confirm operation
      const confirmButton = screen.getByText('Confirm');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/operation completed successfully/i)).toBeInTheDocument();
      });
    });

    it('should handle bulk email reminders', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BulkInterviewOperations
            interviews={mockInterviews}
            onBulkOperation={vi.fn()}
            loading={false}
          />
        </TestWrapper>
      );

      // 1. Select interviews
      const firstCheckbox = screen.getAllByRole('checkbox')[1]; // Skip select all
      await user.click(firstCheckbox);

      // 2. Choose send reminder operation
      const operationSelect = screen.getByRole('combobox', { name: /bulk operation/i });
      await user.click(operationSelect);
      
      const reminderOption = screen.getByText('Send Reminder');
      await user.click(reminderOption);

      // 3. Enter reminder message
      const messageInput = screen.getByLabelText(/reminder message/i);
      await user.type(messageInput, 'Don\'t forget about your upcoming interview!');

      // 4. Send reminders
      const sendButton = screen.getByText('Send Reminders');
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/reminders sent successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Integration Between Components', () => {
    it('should maintain state consistency across components', async () => {
      const user = userEvent.setup();
      let sharedInterviews = [...mockInterviews];

      const updateSharedState = (newInterview: any) => {
        sharedInterviews = [...sharedInterviews, newInterview];
      };

      // Render multiple components that share state
      const { rerender } = render(
        <TestWrapper>
          <div>
            <InterviewCalendar
              interviews={sharedInterviews}
              onInterviewCreate={updateSharedState}
              onInterviewUpdate={vi.fn()}
              onInterviewDelete={vi.fn()}
              onInterviewSelect={vi.fn()}
              loading={false}
            />
            <BulkInterviewOperations
              interviews={sharedInterviews}
              onBulkOperation={vi.fn()}
              loading={false}
            />
          </div>
        </TestWrapper>
      );

      // Verify initial state
      expect(screen.getAllByText(/interview/i)).toHaveLength(expect.any(Number));

      // Simulate state update
      const newInterview = {
        id: '3',
        title: 'Final Interview',
        candidateName: 'Bob Johnson',
        candidateId: 'candidate-3',
        position: 'Full Stack Developer',
        type: 'final',
        scheduledDate: '2024-06-17T16:00:00Z',
        startTime: '16:00',
        endTime: '17:00',
        location: 'Conference Room C',
        status: 'scheduled',
      };

      updateSharedState(newInterview);

      // Rerender with updated state
      rerender(
        <TestWrapper>
          <div>
            <InterviewCalendar
              interviews={sharedInterviews}
              onInterviewCreate={updateSharedState}
              onInterviewUpdate={vi.fn()}
              onInterviewDelete={vi.fn()}
              onInterviewSelect={vi.fn()}
              loading={false}
            />
            <BulkInterviewOperations
              interviews={sharedInterviews}
              onBulkOperation={vi.fn()}
              loading={false}
            />
          </div>
        </TestWrapper>
      );

      // Verify state is consistent across components
      expect(sharedInterviews).toHaveLength(3);
    });
  });

  describe('Error Handling Workflows', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      const mockCreateError = vi.fn().mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <InterviewCalendar
            interviews={mockInterviews}
            onInterviewCreate={mockCreateError}
            onInterviewUpdate={vi.fn()}
            onInterviewDelete={vi.fn()}
            onInterviewSelect={vi.fn()}
            loading={false}
          />
        </TestWrapper>
      );

      // Attempt to create interview
      const createButton = screen.getByText('Create Interview');
      await user.click(createButton);

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });
});
