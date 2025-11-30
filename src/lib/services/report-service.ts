import { supabase } from '../supabase';
import { notificationService } from './notification-service';
import type {
  ReportFilters,
  ReportMetrics,
  ReportJob,
  ReportJobStatus,
  OrderStatus,
  OrderStatusBreakdown,
} from '@/types/order-management';

/**
 * ReportService - Handles report generation and async processing
 * 
 * Features:
 * - Synchronous report generation for small datasets
 * - Asynchronous report processing for large datasets
 * - Job queue management
 * - Result caching
 */
export class ReportService {
  // Threshold for async processing (number of orders)
  private readonly ASYNC_THRESHOLD = 1000;

  /**
   * Generate a report synchronously or create an async job
   * Returns either the report metrics or a job ID
   */
  async generateReport(
    filters: ReportFilters,
    userId: string
  ): Promise<{ type: 'sync'; data: ReportMetrics } | { type: 'async'; jobId: string }> {
    // First, check the dataset size
    const orderCount = await this.getOrderCount(filters);

    if (orderCount > this.ASYNC_THRESHOLD) {
      // Create async job
      const jobId = await this.createReportJob(filters, userId);
      
      // Start processing in background (fire and forget)
      this.processReportJob(jobId).catch(error => {
        console.error(`Error processing report job ${jobId}:`, error);
      });

      return { type: 'async', jobId };
    } else {
      // Generate report synchronously
      const metrics = await this.calculateReportMetrics(filters);
      return { type: 'sync', data: metrics };
    }
  }

  /**
   * Create a new report job
   */
  private async createReportJob(filters: ReportFilters, userId: string): Promise<string> {
    const { data: job, error } = await supabase
      .from('report_jobs')
      .insert({
        user_id: userId,
        status: 'pending',
        filters,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create report job: ${error.message}`);
    }

    return job.id;
  }

  /**
   * Process a report job asynchronously
   */
  private async processReportJob(jobId: string): Promise<void> {
    try {
      // Update status to processing
      await this.updateJobStatus(jobId, 'processing', { started_at: new Date().toISOString() });

      // Get job details
      const { data: job, error: jobError } = await supabase
        .from('report_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError || !job) {
        throw new Error('Report job not found');
      }

      // Calculate metrics
      const metrics = await this.calculateReportMetrics(job.filters);

      // Update job with results
      await supabase
        .from('report_jobs')
        .update({
          status: 'completed',
          result: metrics,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      // Get user email for notification
      const { data: userData } = await supabase.auth.admin.getUserById(job.user_id);
      const userEmail = userData?.user?.email;

      // Send notification to admin
      if (userEmail) {
        try {
          await notificationService.sendReportReadyNotification(jobId, userEmail);
          console.log(`Report ready notification sent to ${userEmail} for job ${jobId}`);
        } catch (notificationError) {
          console.error(`Failed to send report ready notification for job ${jobId}:`, notificationError);
          // Don't fail the job if notification fails
        }
      }

      console.log(`Report job ${jobId} completed successfully`);
    } catch (error) {
      // Update job with error
      await supabase
        .from('report_jobs')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      throw error;
    }
  }

  /**
   * Get the status of a report job
   */
  async getReportJob(jobId: string, userId: string): Promise<ReportJob | null> {
    const { data: job, error } = await supabase
      .from('report_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Job not found
      }
      throw new Error(`Failed to fetch report job: ${error.message}`);
    }

    return job;
  }

  /**
   * Get all report jobs for a user
   */
  async getReportJobs(userId: string, limit: number = 20): Promise<ReportJob[]> {
    const { data: jobs, error } = await supabase
      .from('report_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch report jobs: ${error.message}`);
    }

    return jobs || [];
  }

  /**
   * Calculate report metrics from orders
   */
  private async calculateReportMetrics(filters: ReportFilters): Promise<ReportMetrics> {
    // Build query
    let query = supabase
      .from('orders')
      .select('id, total, status, created_at, order_items(product_id)');

    // Apply filters
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom.toISOString());
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo.toISOString());
    }

    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      throw new Error(`Failed to fetch orders: ${ordersError.message}`);
    }

    // Filter by product if specified
    let filteredOrders = orders || [];
    if (filters.product_id) {
      filteredOrders = filteredOrders.filter(order =>
        order.order_items?.some((item: any) => item.product_id === filters.product_id)
      );
    }

    // Calculate metrics
    const total_orders = filteredOrders.length;
    const total_revenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const average_order_value = total_orders > 0 ? total_revenue / total_orders : 0;

    // Calculate status breakdown
    const statusMap = new Map<OrderStatus, { count: number; revenue: number }>();

    filteredOrders.forEach(order => {
      const existing = statusMap.get(order.status) || { count: 0, revenue: 0 };
      statusMap.set(order.status, {
        count: existing.count + 1,
        revenue: existing.revenue + order.total,
      });
    });

    const status_breakdown: OrderStatusBreakdown[] = Array.from(statusMap.entries()).map(
      ([status, data]) => ({
        status,
        count: data.count,
        total_revenue: data.revenue,
      })
    );

    return {
      total_orders,
      total_revenue,
      average_order_value,
      status_breakdown,
    };
  }

  /**
   * Get the count of orders matching filters
   */
  private async getOrderCount(filters: ReportFilters): Promise<number> {
    let query = supabase
      .from('orders')
      .select('id', { count: 'exact', head: true });

    // Apply filters
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom.toISOString());
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo.toISOString());
    }

    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count orders: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Update job status
   */
  private async updateJobStatus(
    jobId: string,
    status: ReportJobStatus,
    additionalData: Record<string, any> = {}
  ): Promise<void> {
    const { error } = await supabase
      .from('report_jobs')
      .update({
        status,
        ...additionalData,
      })
      .eq('id', jobId);

    if (error) {
      throw new Error(`Failed to update job status: ${error.message}`);
    }
  }

  /**
   * Delete old completed jobs (cleanup)
   */
  async cleanupOldJobs(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await supabase
      .from('report_jobs')
      .delete()
      .in('status', ['completed', 'failed'])
      .lt('completed_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      throw new Error(`Failed to cleanup old jobs: ${error.message}`);
    }

    return data?.length || 0;
  }
}

// Export singleton instance
export const reportService = new ReportService();
