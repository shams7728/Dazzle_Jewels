import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { reportService } from '@/lib/services/report-service';

/**
 * GET /api/admin/reports/jobs
 * Get all report jobs for the current admin user
 * 
 * Query Parameters:
 * - limit: Number of jobs to return (default: 20)
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
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Get report jobs
    const jobs = await reportService.getReportJobs(user.id, limit);

    return NextResponse.json({
      jobs,
      total: jobs.length,
    });
  } catch (error) {
    console.error('Error fetching report jobs:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch report jobs' },
      { status: 500 }
    );
  }
}
