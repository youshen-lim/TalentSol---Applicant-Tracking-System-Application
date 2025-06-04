import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ApplicationManagement from './pages/ApplicationManagement';
import { applicationApi } from './services/api';

// Mock the API
vi.mock('./services/api', () => ({
  applicationApi: {
    getStats: vi.fn(),
  },
}));

// Mock the toast hook
vi.mock('./components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockStats = {
  totalApplications: 156,
  newApplications: 23,
  conversionRate: 18.5,
  averageScore: 82,
  recentApplications: [
    {
      id: '1',
      candidateName: 'Sarah Johnson',
      jobTitle: 'Frontend Developer',
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'applied',
      score: 85
    },
    {
      id: '2',
      candidateName: 'Michael Chen',
      jobTitle: 'Backend Developer',
      submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      status: 'reviewed',
      score: 92
    }
  ],
  sourceStats: [
    { source: 'Company Website', count: 67, percentage: 43 },
    { source: 'LinkedIn', count: 45, percentage: 29 },
    { source: 'Indeed', count: 28, percentage: 18 },
    { source: 'Referrals', count: 16, percentage: 10 }
  ]
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Application Management Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API Integration', () => {
    it('should fetch and display application statistics', async () => {
      (applicationApi.getStats as any).mockResolvedValue(mockStats);

      renderWithRouter(<ApplicationManagement />);

      await waitFor(() => {
        expect(screen.getByText('156')).toBeInTheDocument();
        expect(screen.getByText('23')).toBeInTheDocument();
        expect(screen.getByText('18.5%')).toBeInTheDocument();
        expect(screen.getByText('82')).toBeInTheDocument();
      });

      expect(applicationApi.getStats).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors gracefully', async () => {
      (applicationApi.getStats as any).mockRejectedValue(new Error('API Error'));

      renderWithRouter(<ApplicationManagement />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load application statistics/)).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      (applicationApi.getStats as any).mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithRouter(<ApplicationManagement />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getAllByRole('generic', { name: /animate-pulse/ })).toHaveLength(4);
    });
  });

  describe('UI Elements', () => {
    beforeEach(async () => {
      (applicationApi.getStats as any).mockResolvedValue(mockStats);
      renderWithRouter(<ApplicationManagement />);
      await waitFor(() => {
        expect(screen.getByText('156')).toBeInTheDocument();
      });
    });

    it('should render header with correct title and buttons', () => {
      expect(screen.getByText('Application Management')).toBeInTheDocument();
      expect(screen.getByText('Manage job application forms and review candidate submissions')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Form Builder/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Preview Application Form/ })).toBeInTheDocument();
    });

    it('should render statistics cards with correct data', () => {
      expect(screen.getByText('Total Applications')).toBeInTheDocument();
      expect(screen.getByText('New Applications')).toBeInTheDocument();
      expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
      expect(screen.getByText('Average Score')).toBeInTheDocument();
    });

    it('should render quick actions section', () => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Build Application Form/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Review Applications/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /View Analytics/ })).toBeInTheDocument();
    });

    it('should render recent applications list', () => {
      expect(screen.getByText('Recent Applications')).toBeInTheDocument();
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Michael Chen')).toBeInTheDocument();
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
      expect(screen.getByText('Backend Developer')).toBeInTheDocument();
    });

    it('should render application sources chart', () => {
      expect(screen.getByText('Application Sources')).toBeInTheDocument();
      expect(screen.getByText('Company Website')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('Indeed')).toBeInTheDocument();
      expect(screen.getByText('Referrals')).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    beforeEach(async () => {
      (applicationApi.getStats as any).mockResolvedValue(mockStats);
      renderWithRouter(<ApplicationManagement />);
      await waitFor(() => {
        expect(screen.getByText('156')).toBeInTheDocument();
      });
    });

    it('should handle form builder button click', () => {
      const formBuilderButton = screen.getByRole('button', { name: /Form Builder/ });
      fireEvent.click(formBuilderButton);
      expect(mockNavigate).toHaveBeenCalledWith('/applications');
    });

    it('should handle preview form button click', () => {
      const previewButton = screen.getByRole('button', { name: /Preview Application Form/ });
      fireEvent.click(previewButton);
      expect(mockNavigate).toHaveBeenCalledWith('/applications/preview');
    });

    it('should handle quick action buttons', () => {
      const buildFormButton = screen.getByRole('button', { name: /Build Application Form/ });
      const reviewButton = screen.getByRole('button', { name: /Review Applications/ });
      const analyticsButton = screen.getByRole('button', { name: /View Analytics/ });

      fireEvent.click(buildFormButton);
      expect(mockNavigate).toHaveBeenCalledWith('/applications');

      fireEvent.click(reviewButton);
      expect(mockNavigate).toHaveBeenCalledWith('/applications');

      fireEvent.click(analyticsButton);
      expect(mockNavigate).toHaveBeenCalledWith('/analytics');
    });

    it('should handle search input', () => {
      const searchInput = screen.getByPlaceholderText('Search applications...');
      fireEvent.change(searchInput, { target: { value: 'Sarah' } });
      expect(searchInput).toHaveValue('Sarah');
    });

    it('should handle filter button click', () => {
      const filterButton = screen.getByRole('button', { name: '' }); // Filter button with icon only
      expect(filterButton).toBeInTheDocument();
      fireEvent.click(filterButton);
      // Filter functionality would be tested here
    });
  });

  describe('Styling and Design System', () => {
    beforeEach(async () => {
      (applicationApi.getStats as any).mockResolvedValue(mockStats);
      renderWithRouter(<ApplicationManagement />);
      await waitFor(() => {
        expect(screen.getByText('156')).toBeInTheDocument();
      });
    });

    it('should apply shadow system classes', () => {
      const cards = document.querySelectorAll('[class*="shadow"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should use consistent badge styling', () => {
      const badges = document.querySelectorAll('[class*="badge"]');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should apply ATS blue color scheme', () => {
      const blueElements = document.querySelectorAll('[class*="ats-blue"]');
      expect(blueElements.length).toBeGreaterThan(0);
    });
  });
});
