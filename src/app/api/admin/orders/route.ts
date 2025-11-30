import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { orderService } from '@/lib/services/order-service';
import type { OrderFilters, PaginationParams, OrderStatus, PaymentStatus } from '@/types/order-management';
import { validateOrderStatus, validateDateRange, validatePagination, sanitizeText } from '@/lib/utils/input-validation';

/**
 * GET /api/admin/orders
 * Get paginated list of orders with filtering
 * 
 * Query Parameters:
 * - status: OrderStatus[] (comma-separated)
 * - payment_status: PaymentStatus[] (comma-separated)
 * - dateFrom: ISO date string
 * - dateTo: ISO date string
 * - searchQuery: string (order number, customer name, email)
 * - page: number (default: 1)
 * - limit: number (default: 20)
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    
    // Build filters
    const filters: OrderFilters = {};

    // Status filter with validation
    const statusParam = searchParams.get('status');
    if (statusParam) {
      const statuses = statusParam.split(',');
      const validatedStatuses: OrderStatus[] = [];
      
      for (const status of statuses) {
        const validation = validateOrderStatus(status);
        if (validation.isValid) {
          validatedStatuses.push(validation.sanitized as OrderStatus);
        }
      }
      
      if (validatedStatuses.length > 0) {
        filters.status = validatedStatuses;
      }
    }

    // Payment status filter with validation
    const paymentStatusParam = searchParams.get('payment_status');
    if (paymentStatusParam) {
      const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
      const statuses = paymentStatusParam.split(',').filter(s => validPaymentStatuses.includes(s.toLowerCase()));
      if (statuses.length > 0) {
        filters.payment_status = statuses as PaymentStatus[];
      }
    }

    // Date range filters with validation
    const dateFromParam = searchParams.get('dateFrom');
    const dateToParam = searchParams.get('dateTo');
    
    const dateValidation = validateDateRange(dateFromParam || undefined, dateToParam || undefined);
    if (!dateValidation.isValid) {
      return NextResponse.json(
        { error: dateValidation.error },
        { status: 400 }
      );
    }
    
    if (dateValidation.sanitized?.dateFrom) {
      filters.dateFrom = dateValidation.sanitized.dateFrom;
    }
    if (dateValidation.sanitized?.dateTo) {
      filters.dateTo = dateValidation.sanitized.dateTo;
    }

    // Search query with sanitization
    const searchQuery = searchParams.get('searchQuery');
    if (searchQuery) {
      const searchValidation = sanitizeText(searchQuery, 100);
      if (searchValidation.isValid) {
        filters.searchQuery = searchValidation.sanitized;
      }
    }

    // Pagination with validation
    const paginationValidation = validatePagination(
      searchParams.get('page'),
      searchParams.get('limit')
    );
    
    if (!paginationValidation.isValid) {
      return NextResponse.json(
        { error: paginationValidation.error },
        { status: 400 }
      );
    }

    const pagination: PaginationParams = paginationValidation.sanitized!;

    // Fetch orders
    const result = await orderService.getOrders(filters, pagination);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
