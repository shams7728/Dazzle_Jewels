import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { reportService } from '@/lib/services/report-service';

/**
 * GET /api/admin/reports/[jobId]
 * Get the status and results of an async report job
 * 
 * Response:
 * - 200: Job completed, returns report metrics
 * - 202: Job still processing
 * - 404: Job not found
 * - 500: Job failed
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
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

    // Get job details
    const { jobId } = await params;
    const job = await reportService.getReportJob(jobId, user.id);

    if (!job) {
      return NextResponse.json(
        { error: 'Report job not found' },
        { status: 404 }
      );
    }

    // Return response based on job status
    switch (job.status) {
      case 'completed':
        return NextResponse.json({
          status: 'completed',
          data: job.result,
          completedAt: job.completed_at,
        });

      case 'failed':
        return NextResponse.json({
          status: 'failed',
          error: job.error_message || 'Report generation failed',
          completedAt: job.completed_at,
        }, { status: 500 });

      case 'processing':
        return NextResponse.json({
          status: 'processing',
          startedAt: job.started_at,
          message: 'Report is being generated. Please check back shortly.',
        }, { status: 202 });

      case 'pending':
        return NextResponse.json({
          status: 'pending',
          createdAt: job.created_at,
          message: 'Report job is queued and will start processing soon.',
        }, { status: 202 });

      default:
        return NextResponse.json({
          status: job.status,
          message: 'Unknown job status',
        }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching report job:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch report job' },
      { status: 500 }
    );
  }
}
