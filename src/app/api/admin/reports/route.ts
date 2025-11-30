import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { reportService } from '@/lib/services/report-service';
import type { ReportFilters, OrderStatus } from '@/types/order-management';

/**
 * GET /api/admin/reports
 * Generate order reports with metrics and analytics
 * 
 * Query Parameters:
 * - dateFrom: ISO date string (optional)
 * - dateTo: ISO date string (optional)
 * - status: Comma-separated order statuses (optional)
 * - product_id: Filter by specific product (optional)
 * - async: Force async processing (optional, boolean)
 * 
 * Response:
 * - For small datasets: Returns report metrics directly
 * - For large datasets: Returns job ID for async processing
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters: ReportFilters = {};

    if (searchParams.get('dateFrom')) {
      filters.dateFrom = new Date(searchParams.get('dateFrom')!);
    }

    if (searchParams.get('dateTo')) {
      filters.dateTo = new Date(searchParams.get('dateTo')!);
    }

    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')!.split(',') as OrderStatus[];
    }

    if (searchParams.get('product_id')) {
      filters.product_id = searchParams.get('product_id')!;
    }

    // Generate report (sync or async based on dataset size)
    const result = await reportService.generateReport(filters, user.id);

    if (result.type === 'sync') {
      // Return metrics directly
      return NextResponse.json(result.data);
    } else {
      // Return job ID for async processing
      return NextResponse.json({
        jobId: result.jobId,
        status: 'processing',
        message: 'Report is being generated. Use the job ID to check status.',
      }, { status: 202 }); // 202 Accepted
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate report' },
      { status: 500 }
    );
  }
}
