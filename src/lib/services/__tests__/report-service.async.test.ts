/**
 * Test for Async Report Processing
 * 
 * This test verifies that the report service correctly handles async processing
 * for large datasets and returns job IDs for tracking.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { reportService } from '../report-service';
import { supabase } from '@/lib/supabase';
import type { ReportFilters } from '@/types/order-management';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe('Async Report Processing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return sync response for small datasets', async () => {
    let callCount = 0;

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'orders') {
        callCount++;
        
        if (callCount === 1) {
          // First call is for count - need to chain properly
          const mockCountQuery = {
            select: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            then: vi.fn((resolve) => resolve({ count: 500, error: null })),
          };
          return mockCountQuery;
        } else {
          // Second call is for actual data
          const mockOrdersQuery = {
            select: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            then: vi.fn((resolve) => resolve({
              data: [
                { id: '1', total: 100, status: 'delivered', created_at: new Date().toISOString(), order_items: [] },
                { id: '2', total: 200, status: 'delivered', created_at: new Date().toISOString(), order_items: [] },
              ],
              error: null,
            })),
          };
          return mockOrdersQuery;
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
      };
    });

    const filters: ReportFilters = {
      dateFrom: new Date('2024-01-01'),
      dateTo: new Date('2024-12-31'),
    };

    const result = await reportService.generateReport(filters, 'test-user-id');

    expect(result.type).toBe('sync');
    if (result.type === 'sync') {
      expect(result.data).toBeDefined();
      expect(result.data.total_orders).toBe(2);
      expect(result.data.total_revenue).toBe(300);
    }
  });

  it('should return async job ID for large datasets', async () => {
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'orders') {
        // Mock order count query (above threshold)
        const mockCountQuery = {
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          then: vi.fn((resolve) => resolve({ count: 2000, error: null })),
        };
        return mockCountQuery;
      }
      if (table === 'report_jobs') {
        // Mock job creation
        const mockJobInsert = {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'job-123', status: 'pending' },
            error: null,
          }),
        };
        return mockJobInsert;
      }
      return {
        select: vi.fn().mockReturnThis(),
      };
    });

    const filters: ReportFilters = {
      dateFrom: new Date('2024-01-01'),
      dateTo: new Date('2024-12-31'),
    };

    const result = await reportService.generateReport(filters, 'test-user-id');

    expect(result.type).toBe('async');
    if (result.type === 'async') {
      expect(result.jobId).toBe('job-123');
    }
  });

  it('should retrieve job status correctly', async () => {
    const mockJobQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'job-123',
          status: 'completed',
          result: {
            total_orders: 1500,
            total_revenue: 150000,
            average_order_value: 100,
            status_breakdown: [],
          },
        },
        error: null,
      }),
    };

    (supabase.from as any).mockReturnValue(mockJobQuery);

    const job = await reportService.getReportJob('job-123', 'test-user-id');

    expect(job).toBeDefined();
    expect(job?.status).toBe('completed');
    expect(job?.result).toBeDefined();
    expect(job?.result?.total_orders).toBe(1500);
  });

  it('should return null for non-existent job', async () => {
    const mockJobQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      }),
    };

    (supabase.from as any).mockReturnValue(mockJobQuery);

    const job = await reportService.getReportJob('non-existent-job', 'test-user-id');

    expect(job).toBeNull();
  });

  it('should list report jobs for a user', async () => {
    const mockJobsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          { id: 'job-1', status: 'completed', created_at: new Date().toISOString() },
          { id: 'job-2', status: 'processing', created_at: new Date().toISOString() },
        ],
        error: null,
      }),
    };

    (supabase.from as any).mockReturnValue(mockJobsQuery);

    const jobs = await reportService.getReportJobs('test-user-id', 20);

    expect(jobs).toBeDefined();
    expect(jobs.length).toBe(2);
    expect(jobs[0].id).toBe('job-1');
    expect(jobs[1].id).toBe('job-2');
  });
});
