import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { orderService } from '@/lib/services/order-service';
import { notificationService } from '@/lib/services/notification-service';
import type { UpdateOrderStatusInput, OrderStatus } from '@/types/order-management';
import { validateUUID, validateOrderStatus, sanitizeText } from '@/lib/utils/input-validation';
import { checkRateLimit, RATE_LIMITS, getUserIdentifier, getClientIP } from '@/lib/utils/rate-limit';

/**
 * PUT /api/admin/orders/[id]/status
 * Update order status
 * 
 * Body:
 * - new_status: OrderStatus (required)
 * - notes: string (optional)
 * - tracking_number: string (optional, for shipped status)
 * - tracking_url: string (optional, for shipped status)
 * - courier_name: string (optional, for shipped status)
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 16+
    const { id: orderId } = await params;
    
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

    // Apply rate limiting (30 requests per minute per admin)
    const clientIP = getClientIP(request.headers);
    const userIdentifier = getUserIdentifier(user.id, clientIP);
    const rateLimitResult = checkRateLimit(userIdentifier, RATE_LIMITS.STATUS_UPDATE);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many status update attempts. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.STATUS_UPDATE.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
          },
        }
      );
    }
    
    // Validate order ID
    const orderIdValidation = validateUUID(orderId, 'Order ID');
    if (!orderIdValidation.isValid) {
      return NextResponse.json(
        { error: orderIdValidation.error },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    const {
      new_status,
      notes,
      tracking_number,
      tracking_url,
      courier_name,
      expected_version,
    } = body;

    // Validate new status
    const statusValidation = validateOrderStatus(new_status);
    if (!statusValidation.isValid) {
      return NextResponse.json(
        { error: statusValidation.error },
        { status: 400 }
      );
    }

    // Build update input with sanitized values
    const updateInput: UpdateOrderStatusInput = {
      order_id: orderIdValidation.sanitized!,
      new_status: statusValidation.sanitized as OrderStatus,
      updated_by: user.id,
      expected_version: expected_version, // Include version for optimistic locking
    };

    // Sanitize and add notes if provided
    if (notes) {
      const notesValidation = sanitizeText(notes, 500);
      if (notesValidation.isValid) {
        updateInput.notes = notesValidation.sanitized;
      }
    }

    // Sanitize and add tracking info if provided (typically for shipped status)
    if (tracking_number) {
      const trackingValidation = sanitizeText(tracking_number, 50);
      if (trackingValidation.isValid) {
        updateInput.tracking_number = trackingValidation.sanitized;
      }
    }
    if (tracking_url) {
      const urlValidation = sanitizeText(tracking_url, 500);
      if (urlValidation.isValid) {
        updateInput.tracking_url = urlValidation.sanitized;
      }
    }
    if (courier_name) {
      const courierValidation = sanitizeText(courier_name, 100);
      if (courierValidation.isValid) {
        updateInput.courier_name = courierValidation.sanitized;
      }
    }

    // Update order status
    const updatedOrder = await orderService.updateOrderStatus(updateInput);

    // Trigger customer notification based on status
    try {
      if (statusValidation.sanitized === 'shipped') {
        await notificationService.sendShippingNotification(updatedOrder);
      } else if (statusValidation.sanitized === 'delivered') {
        await notificationService.sendDeliveryConfirmation(updatedOrder);
      } else {
        await notificationService.sendStatusUpdate(updatedOrder, statusValidation.sanitized as OrderStatus);
      }
    } catch (notificationError) {
      // Log notification error but don't fail the request
      console.error('Failed to send notification:', notificationError);
    }

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error('Error updating order status:', error);
    
    if (error instanceof Error) {
      // Check if it's a version conflict error
      if (error.message.startsWith('CONFLICT:')) {
        return NextResponse.json(
          { 
            error: error.message,
            conflict: true,
          },
          { status: 409 } // 409 Conflict
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
