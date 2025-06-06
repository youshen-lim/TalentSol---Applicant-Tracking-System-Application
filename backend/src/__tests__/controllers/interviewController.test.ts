import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';
import { InterviewController } from '../../controllers/interviewController.js';
import { prisma } from '../../index.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

// Mock Prisma
vi.mock('../../index.js', () => ({
  prisma: {
    interview: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    application: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock services
vi.mock('../../services/notificationService.js', () => ({
  notificationService: {
    sendInterviewConfirmation: vi.fn(),
    sendInterviewReschedule: vi.fn(),
    sendInterviewCancellation: vi.fn(),
  },
}));

vi.mock('../../services/schedulerService.js', () => ({
  schedulerService: {
    scheduleInterviewReminder: vi.fn(),
    cancelInterviewReminders: vi.fn(),
  },
}));

vi.mock('../../websocket/server.js', () => ({
  webSocketServer: {
    broadcastInterviewUpdate: vi.fn(),
  },
}));

const mockUser = {
  id: 'user-1',
  companyId: 'company-1',
  email: 'test@example.com',
};

const mockInterview = {
  id: 'interview-1',
  title: 'Technical Interview',
  applicationId: 'app-1',
  type: 'technical',
  scheduledDate: new Date('2024-06-15T10:00:00Z'),
  startTime: '10:00',
  endTime: '11:00',
  location: 'Conference Room A',
  meetingLink: 'https://zoom.us/j/123456789',
  interviewers: '["Alice Johnson"]',
  notes: 'Technical assessment',
  status: 'scheduled',
  createdById: 'user-1',
  application: {
    candidate: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
    job: {
      title: 'Frontend Developer',
      department: 'Engineering',
    },
  },
  createdBy: {
    firstName: 'Alice',
    lastName: 'Johnson',
  },
};

const mockApplication = {
  id: 'app-1',
  candidate: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  },
  job: {
    title: 'Frontend Developer',
  },
};

describe('InterviewController', () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      user: mockUser,
      params: {},
      query: {},
      body: {},
    };
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getInterviews', () => {
    it('should return paginated interviews', async () => {
      const mockInterviews = [mockInterview];
      const mockCount = 1;

      (prisma.interview.findMany as any).mockResolvedValue(mockInterviews);
      (prisma.interview.count as any).mockResolvedValue(mockCount);

      req.query = { page: '1', limit: '10' };

      await InterviewController.getInterviews(req as AuthenticatedRequest, res as Response);

      expect(prisma.interview.findMany).toHaveBeenCalledWith({
        where: {
          application: {
            job: {
              companyId: mockUser.companyId,
            },
          },
        },
        skip: 0,
        take: 10,
        include: expect.any(Object),
        orderBy: {
          scheduledDate: 'asc',
        },
      });

      expect(res.json).toHaveBeenCalledWith({
        message: 'Interviews retrieved successfully',
        interviews: mockInterviews,
        pagination: {
          page: 1,
          limit: 10,
          total: mockCount,
          pages: 1,
        },
      });
    });

    it('should filter interviews by status', async () => {
      req.query = { status: 'scheduled' };

      await InterviewController.getInterviews(req as AuthenticatedRequest, res as Response);

      expect(prisma.interview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'scheduled',
          }),
        })
      );
    });

    it('should filter interviews by date range', async () => {
      req.query = { 
        startDate: '2024-06-01', 
        endDate: '2024-06-30' 
      };

      await InterviewController.getInterviews(req as AuthenticatedRequest, res as Response);

      expect(prisma.interview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            scheduledDate: {
              gte: new Date('2024-06-01'),
              lte: new Date('2024-06-30'),
            },
          }),
        })
      );
    });
  });

  describe('getInterview', () => {
    it('should return single interview', async () => {
      req.params = { id: 'interview-1' };
      (prisma.interview.findFirst as any).mockResolvedValue(mockInterview);

      await InterviewController.getInterview(req as AuthenticatedRequest, res as Response);

      expect(prisma.interview.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'interview-1',
          application: {
            job: {
              companyId: mockUser.companyId,
            },
          },
        },
        include: expect.any(Object),
      });

      expect(res.json).toHaveBeenCalledWith({
        message: 'Interview retrieved successfully',
        interview: mockInterview,
      });
    });

    it('should throw error if interview not found', async () => {
      req.params = { id: 'nonexistent' };
      (prisma.interview.findFirst as any).mockResolvedValue(null);

      await expect(
        InterviewController.getInterview(req as AuthenticatedRequest, res as Response)
      ).rejects.toThrow('Interview not found');
    });
  });

  describe('createInterview', () => {
    beforeEach(() => {
      req.body = {
        applicationId: 'app-1',
        title: 'Technical Interview',
        type: 'technical',
        scheduledDate: '2024-06-15T10:00:00Z',
        startTime: '10:00',
        endTime: '11:00',
        location: 'Conference Room A',
      };
    });

    it('should create new interview', async () => {
      (prisma.application.findFirst as any).mockResolvedValue(mockApplication);
      (prisma.interview.create as any).mockResolvedValue(mockInterview);
      (prisma.application.update as any).mockResolvedValue({});

      await InterviewController.createInterview(req as AuthenticatedRequest, res as Response);

      expect(prisma.interview.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...req.body,
          createdById: mockUser.id,
        }),
        include: expect.any(Object),
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Interview scheduled successfully',
        interview: mockInterview,
      });
    });

    it('should throw error if application not found', async () => {
      (prisma.application.findFirst as any).mockResolvedValue(null);

      await expect(
        InterviewController.createInterview(req as AuthenticatedRequest, res as Response)
      ).rejects.toThrow('Application not found or access denied');
    });

    it('should update application activity', async () => {
      (prisma.application.findFirst as any).mockResolvedValue(mockApplication);
      (prisma.interview.create as any).mockResolvedValue(mockInterview);
      (prisma.application.update as any).mockResolvedValue({});

      await InterviewController.createInterview(req as AuthenticatedRequest, res as Response);

      expect(prisma.application.update).toHaveBeenCalledWith({
        where: { id: req.body.applicationId },
        data: {
          activity: {
            push: expect.objectContaining({
              type: 'interview_scheduled',
              description: `Interview "${req.body.title}" scheduled`,
              userId: mockUser.id,
            }),
          },
        },
      });
    });
  });

  describe('updateInterview', () => {
    beforeEach(() => {
      req.params = { id: 'interview-1' };
      req.body = {
        title: 'Updated Interview',
        scheduledDate: '2024-06-16T10:00:00Z',
      };
    });

    it('should update interview', async () => {
      (prisma.interview.findFirst as any).mockResolvedValue(mockInterview);
      (prisma.interview.update as any).mockResolvedValue({
        ...mockInterview,
        ...req.body,
      });

      await InterviewController.updateInterview(req as AuthenticatedRequest, res as Response);

      expect(prisma.interview.update).toHaveBeenCalledWith({
        where: { id: 'interview-1' },
        data: req.body,
        include: expect.any(Object),
      });

      expect(res.json).toHaveBeenCalledWith({
        message: 'Interview updated successfully',
        interview: expect.objectContaining(req.body),
      });
    });

    it('should throw error if interview not found', async () => {
      (prisma.interview.findFirst as any).mockResolvedValue(null);

      await expect(
        InterviewController.updateInterview(req as AuthenticatedRequest, res as Response)
      ).rejects.toThrow('Interview not found');
    });
  });

  describe('deleteInterview', () => {
    beforeEach(() => {
      req.params = { id: 'interview-1' };
    });

    it('should delete interview', async () => {
      (prisma.interview.findFirst as any).mockResolvedValue(mockInterview);
      (prisma.interview.delete as any).mockResolvedValue({});

      await InterviewController.deleteInterview(req as AuthenticatedRequest, res as Response);

      expect(prisma.interview.delete).toHaveBeenCalledWith({
        where: { id: 'interview-1' },
      });

      expect(res.json).toHaveBeenCalledWith({
        message: 'Interview deleted successfully',
      });
    });

    it('should throw error if interview not found', async () => {
      (prisma.interview.findFirst as any).mockResolvedValue(null);

      await expect(
        InterviewController.deleteInterview(req as AuthenticatedRequest, res as Response)
      ).rejects.toThrow('Interview not found');
    });
  });
});
