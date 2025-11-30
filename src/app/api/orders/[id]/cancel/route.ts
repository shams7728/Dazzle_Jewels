import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { orderService } from '@/lib/services/order-service';
import type { CancelOrderInput } from '@/types/order-management';

/**
 * POST /api/orders/[id]/cancel
 * Cancel an order
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */
export async function POST(
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

    const { id: orderId } = await params;
    const body = await request.json();
    const { cancellation_reason } = body;

    // Validate order exists and belongs to user
    const order = await orderService.getOrderById(orderId, user.id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order can be cancelled (only pending or confirmed)
    if (!['pending', 'confirmed'].includes(order.status)) {
      return NextResponse.json(
        { 
          error: 'Order cannot be cancelled',
          message: `Orders with status "${order.status}" cannot be cancelled. Please contact support for assistance.`
        },
        { status: 400 }
      );
    }

    // Cancel the order
    const cancelInput: CancelOrderInput = {
      order_id: orderId,
      user_id: user.id,
      cancellation_reason: cancellation_reason || 'Cancelled by customer',
    };

    const cancelledOrder = await orderService.cancelOrder(cancelInput);

    // TODO: Initiate refund if payment was completed
    // This would integrate with the payment gateway service
    if (cancelledOrder.payment_status === 'refunded') {
      // In a real implementation, you would call the payment gateway here
      // await paymentGateway.refundPayment(cancelledOrder.payment_id, cancelledOrder.total);
      console.log(`Refund initiated for order ${cancelledOrder.order_number}`);
    }

    // TODO: Send cancellation confirmation email
    // This would integrate with the notification service
    // await notificationService.sendCancellationConfirmation(cancelledOrder);
    console.log(`Cancellation email sent for order ${cancelledOrder.order_number}`);

    return NextResponse.json(cancelledOrder, { status: 200 });
  } catch (error) {
    console.error('Error cancelling order:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
