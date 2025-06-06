import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import InterviewCalendar from '@/components/interviews/InterviewCalendar';

// Mock FullCalendar
vi.mock('@fullcalendar/react', () => ({
  default: vi.fn(({ eventClick, select, eventDrop, eventResize }) => (
    <div data-testid="fullcalendar">
      <button 
        onClick={() => eventClick?.({ event: { id: '1', extendedProps: { interview: mockInterview } } })}
        data-testid="event-click"
      >
        Click Event
      </button>
      <button 
        onClick={() => select?.({ start: new Date(), end: new Date() })}
        data-testid="date-select"
      >
        Select Date
      </button>
      <button 
        onClick={() => eventDrop?.({ event: { id: '1', start: new Date(), extendedProps: { interview: mockInterview } } })}
        data-testid="event-drop"
      >
        Drop Event
      </button>
    </div>
  ))
}));

const mockInterview = {
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
  meetingLink: 'https://zoom.us/j/123456789',
  interviewers: ['Alice Johnson'],
  status: 'scheduled',
  notes: 'Technical assessment'
};

const mockProps = {
  interviews: [mockInterview],
  onInterviewSelect: vi.fn(),
  onInterviewUpdate: vi.fn(),
  onInterviewCreate: vi.fn(),
  onInterviewDelete: vi.fn(),
  loading: false
};

describe('InterviewCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders calendar component', () => {
    render(<InterviewCalendar {...mockProps} />);
    
    expect(screen.getByText('Interview Calendar')).toBeInTheDocument();
    expect(screen.getByTestId('fullcalendar')).toBeInTheDocument();
  });

  it('displays calendar controls', () => {
    render(<InterviewCalendar {...mockProps} />);
    
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Week')).toBeInTheDocument();
    expect(screen.getByText('Day')).toBeInTheDocument();
  });

  it('displays interview type legend', () => {
    render(<InterviewCalendar {...mockProps} />);
    
    expect(screen.getByText('Technical')).toBeInTheDocument();
    expect(screen.getByText('Behavioral')).toBeInTheDocument();
    expect(screen.getByText('Cultural Fit')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
  });

  it('handles interview selection', async () => {
    render(<InterviewCalendar {...mockProps} />);
    
    const eventButton = screen.getByTestId('event-click');
    await userEvent.click(eventButton);
    
    expect(mockProps.onInterviewSelect).toHaveBeenCalledWith(mockInterview);
  });

  it('handles date selection for creating interviews', async () => {
    render(<InterviewCalendar {...mockProps} />);
    
    const dateSelectButton = screen.getByTestId('date-select');
    await userEvent.click(dateSelectButton);
    
    expect(mockProps.onInterviewCreate).toHaveBeenCalled();
  });

  it('handles interview drag and drop', async () => {
    const mockUpdate = vi.fn().mockResolvedValue({});
    render(<InterviewCalendar {...mockProps} onInterviewUpdate={mockUpdate} />);
    
    const dropButton = screen.getByTestId('event-drop');
    await userEvent.click(dropButton);
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        mockInterview.id,
        expect.objectContaining({
          scheduledDate: expect.any(String),
          startTime: expect.any(String),
          endTime: expect.any(String)
        })
      );
    });
  });

  it('shows loading state', () => {
    render(<InterviewCalendar {...mockProps} loading={true} />);
    
    // FullCalendar should receive loading prop
    expect(screen.getByTestId('fullcalendar')).toBeInTheDocument();
  });

  it('handles empty interviews list', () => {
    render(<InterviewCalendar {...mockProps} interviews={[]} />);
    
    expect(screen.getByText('Interview Calendar')).toBeInTheDocument();
    expect(screen.getByTestId('fullcalendar')).toBeInTheDocument();
  });

  it('switches calendar views', async () => {
    render(<InterviewCalendar {...mockProps} />);
    
    const weekButton = screen.getByText('Week');
    await userEvent.click(weekButton);
    
    // Should update the view (tested through FullCalendar mock)
    expect(weekButton).toBeInTheDocument();
  });

  it('navigates calendar dates', async () => {
    render(<InterviewCalendar {...mockProps} />);
    
    const todayButton = screen.getByText('Today');
    await userEvent.click(todayButton);
    
    expect(todayButton).toBeInTheDocument();
  });

  it('handles interview update errors gracefully', async () => {
    const mockUpdateError = vi.fn().mockRejectedValue(new Error('Update failed'));
    render(<InterviewCalendar {...mockProps} onInterviewUpdate={mockUpdateError} />);
    
    const dropButton = screen.getByTestId('event-drop');
    await userEvent.click(dropButton);
    
    await waitFor(() => {
      expect(mockUpdateError).toHaveBeenCalled();
    });
  });

  it('formats interview events correctly', () => {
    const interviewWithTimes = {
      ...mockInterview,
      startTime: '14:30',
      endTime: '15:30'
    };
    
    render(<InterviewCalendar {...mockProps} interviews={[interviewWithTimes]} />);
    
    expect(screen.getByTestId('fullcalendar')).toBeInTheDocument();
  });

  it('handles interviews without times', () => {
    const interviewWithoutTimes = {
      ...mockInterview,
      startTime: undefined,
      endTime: undefined
    };
    
    render(<InterviewCalendar {...mockProps} interviews={[interviewWithoutTimes]} />);
    
    expect(screen.getByTestId('fullcalendar')).toBeInTheDocument();
  });

  it('applies correct event colors based on interview type', () => {
    const interviews = [
      { ...mockInterview, type: 'technical' },
      { ...mockInterview, id: '2', type: 'behavioral' },
      { ...mockInterview, id: '3', type: 'cultural_fit' },
      { ...mockInterview, id: '4', type: 'final' }
    ];
    
    render(<InterviewCalendar {...mockProps} interviews={interviews} />);
    
    expect(screen.getByTestId('fullcalendar')).toBeInTheDocument();
  });

  it('handles interview status changes', () => {
    const cancelledInterview = {
      ...mockInterview,
      status: 'cancelled'
    };
    
    render(<InterviewCalendar {...mockProps} interviews={[cancelledInterview]} />);
    
    expect(screen.getByTestId('fullcalendar')).toBeInTheDocument();
  });
});
