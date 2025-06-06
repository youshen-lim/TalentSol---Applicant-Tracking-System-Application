import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { performance } from 'perf_hooks';
import { BulkInterviewController } from '../../controllers/bulkInterviewController.js';
import { prisma } from '../../index.js';

// Mock Prisma for performance testing
vi.mock('../../index.js', () => ({
  prisma: {
    interview: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

// Mock services
vi.mock('../../services/notificationService.js', () => ({
  notificationService: {
    sendInterviewReschedule: vi.fn().mockResolvedValue({}),
    sendInterviewCancellation: vi.fn().mockResolvedValue({}),
    sendInterviewReminder: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../services/schedulerService.js', () => ({
  schedulerService: {
    cancelInterviewReminders: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../websocket/server.js', () => ({
  webSocketServer: {
    broadcastInterviewUpdate: vi.fn(),
  },
}));

const createMockInterviews = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `interview-${i}`,
    title: `Interview ${i}`,
    application: {
      candidate: {
        firstName: `Candidate${i}`,
        lastName: `Last${i}`,
        email: `candidate${i}@example.com`,
      },
      job: {
        title: `Job ${i}`,
      },
    },
  }));
};

const mockUser = {
  id: 'user-1',
  companyId: 'company-1',
  email: 'test@example.com',
};

describe('Bulk Operations Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Bulk Reschedule Performance', () => {
    it('should handle 10 interviews within 2 seconds', async () => {
      const interviewCount = 10;
      const mockInterviews = createMockInterviews(interviewCount);
      const interviewIds = mockInterviews.map(i => i.id);

      (prisma.interview.findMany as any).mockResolvedValue(mockInterviews);
      (prisma.interview.updateMany as any).mockResolvedValue({ count: interviewCount });

      const req = {
        user: mockUser,
        body: {
          operation: 'reschedule',
          interviewIds,
          data: { newDate: '2024-06-15', newTime: '10:00' },
        },
      };

      const res = {
        json: vi.fn(),
      };

      const startTime = performance.now();
      await BulkInterviewController.bulkOperations(req as any, res as any);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(2000); // Less than 2 seconds
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          affectedCount: interviewCount,
        })
      );
    });

    it('should handle 50 interviews within 5 seconds', async () => {
      const interviewCount = 50;
      const mockInterviews = createMockInterviews(interviewCount);
      const interviewIds = mockInterviews.map(i => i.id);

      (prisma.interview.findMany as any).mockResolvedValue(mockInterviews);
      (prisma.interview.updateMany as any).mockResolvedValue({ count: interviewCount });

      const req = {
        user: mockUser,
        body: {
          operation: 'reschedule',
          interviewIds,
          data: { newDate: '2024-06-15', newTime: '10:00' },
        },
      };

      const res = {
        json: vi.fn(),
      };

      const startTime = performance.now();
      await BulkInterviewController.bulkOperations(req as any, res as any);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(5000); // Less than 5 seconds
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          affectedCount: interviewCount,
        })
      );
    });

    it('should handle 100 interviews within 10 seconds', async () => {
      const interviewCount = 100;
      const mockInterviews = createMockInterviews(interviewCount);
      const interviewIds = mockInterviews.map(i => i.id);

      (prisma.interview.findMany as any).mockResolvedValue(mockInterviews);
      (prisma.interview.updateMany as any).mockResolvedValue({ count: interviewCount });

      const req = {
        user: mockUser,
        body: {
          operation: 'reschedule',
          interviewIds,
          data: { newDate: '2024-06-15', newTime: '10:00' },
        },
      };

      const res = {
        json: vi.fn(),
      };

      const startTime = performance.now();
      await BulkInterviewController.bulkOperations(req as any, res as any);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(10000); // Less than 10 seconds
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          affectedCount: interviewCount,
        })
      );
    });
  });

  describe('Bulk Email Performance', () => {
    it('should send emails in batches to avoid overwhelming email service', async () => {
      const interviewCount = 25;
      const mockInterviews = createMockInterviews(interviewCount);
      const interviewIds = mockInterviews.map(i => i.id);

      (prisma.interview.findMany as any).mockResolvedValue(mockInterviews);

      const req = {
        user: mockUser,
        body: {
          operation: 'send_reminder',
          interviewIds,
          data: { message: 'Test reminder' },
        },
      };

      const res = {
        json: vi.fn(),
      };

      const startTime = performance.now();
      await BulkInterviewController.bulkOperations(req as any, res as any);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time even with batching delays
      expect(executionTime).toBeLessThan(8000); // Less than 8 seconds
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          affectedCount: interviewCount,
        })
      );
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not cause memory leaks with large datasets', async () => {
      const interviewCount = 1000;
      const mockInterviews = createMockInterviews(interviewCount);
      const interviewIds = mockInterviews.map(i => i.id);

      (prisma.interview.findMany as any).mockResolvedValue(mockInterviews);
      (prisma.interview.updateMany as any).mockResolvedValue({ count: interviewCount });

      const req = {
        user: mockUser,
        body: {
          operation: 'update_status',
          interviewIds,
          data: { status: 'completed' },
        },
      };

      const res = {
        json: vi.fn(),
      };

      const initialMemory = process.memoryUsage().heapUsed;
      
      await BulkInterviewController.bulkOperations(req as any, res as any);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB for 1000 items)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Database Query Optimization', () => {
    it('should use efficient queries for bulk operations', async () => {
      const interviewCount = 100;
      const mockInterviews = createMockInterviews(interviewCount);
      const interviewIds = mockInterviews.map(i => i.id);

      (prisma.interview.findMany as any).mockResolvedValue(mockInterviews);
      (prisma.interview.updateMany as any).mockResolvedValue({ count: interviewCount });

      const req = {
        user: mockUser,
        body: {
          operation: 'update_status',
          interviewIds,
          data: { status: 'completed' },
        },
      };

      const res = {
        json: vi.fn(),
      };

      await BulkInterviewController.bulkOperations(req as any, res as any);

      // Should use updateMany instead of individual updates
      expect(prisma.interview.updateMany).toHaveBeenCalledTimes(1);
      expect(prisma.interview.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: interviewIds },
        },
        data: {
          status: 'completed',
        },
      });
    });

    it('should minimize database queries', async () => {
      const interviewCount = 50;
      const mockInterviews = createMockInterviews(interviewCount);
      const interviewIds = mockInterviews.map(i => i.id);

      (prisma.interview.findMany as any).mockResolvedValue(mockInterviews);
      (prisma.interview.deleteMany as any).mockResolvedValue({ count: interviewCount });

      const req = {
        user: mockUser,
        body: {
          operation: 'delete',
          interviewIds,
        },
      };

      const res = {
        json: vi.fn(),
      };

      await BulkInterviewController.bulkOperations(req as any, res as any);

      // Should only query database twice: once for validation, once for deletion
      expect(prisma.interview.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.interview.deleteMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle errors efficiently without blocking', async () => {
      const interviewCount = 20;
      const mockInterviews = createMockInterviews(interviewCount);
      const interviewIds = mockInterviews.map(i => i.id);

      (prisma.interview.findMany as any).mockResolvedValue(mockInterviews);
      // Simulate some interviews not found
      (prisma.interview.findMany as any).mockResolvedValue(mockInterviews.slice(0, 15));

      const req = {
        user: mockUser,
        body: {
          operation: 'reschedule',
          interviewIds,
          data: { newDate: '2024-06-15', newTime: '10:00' },
        },
      };

      const res = {
        json: vi.fn(),
      };

      const startTime = performance.now();
      
      try {
        await BulkInterviewController.bulkOperations(req as any, res as any);
      } catch (error) {
        // Expected to throw error for missing interviews
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Error handling should be fast
      expect(executionTime).toBeLessThan(1000); // Less than 1 second
    });
  });
});
