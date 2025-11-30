import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { orderService } from '@/lib/services/order-service';
import { notificationService } from '@/lib/services/notification-service';

/**
 * PUT /api/admin/orders/[id]/tracking
 * Update order tracking information
 * 
 * Body:
 * - tracking_number: string (required)
 * - tracking_url: string (optional)
 * - courier_name: string (optional)
 * 
 * Requirements: 8.5, 9.3
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: orderId } = await params;
    const body = await request.json();
    
    const {
      tracking_number,
      tracking_url,
      courier_name,
    } = body;

    // Validate required fields
    if (!tracking_number) {
      return NextResponse.json(
        { error: 'tracking_number is required' },
        { status: 400 }
      );
    }

    // Get current order
    const order = await orderService.getOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update tracking information directly in database
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        tracking_number,
        tracking_url: tracking_url || null,
        courier_name: courier_name || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select('*, order_items(*)')
      .single();

    if (updateError) {
      throw new Error(`Failed to update tracking info: ${updateError.message}`);
    }

    const orderWithItems = {
      ...updatedOrder,
      items: updatedOrder.order_items || [],
    };

    // Trigger shipping notification to customer
    try {
      await notificationService.sendShippingNotification(orderWithItems);
    } catch (notificationError) {
      // Log notification error but don't fail the request
      console.error('Failed to send shipping notification:', notificationError);
    }

    return NextResponse.json(orderWithItems, { status: 200 });
  } catch (error) {
    console.error('Error updating tracking information:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update tracking information' },
      { status: 500 }
    );
  }
}
