import { NextRequest, NextResponse } from 'next/server';
import { getPaymentGateway } from '@/lib/services/payment-gateway';
import { orderService } from '@/lib/services/order-service';
import { notificationService } from '@/lib/services/notification-service';
import { couponService } from '@/lib/services/coupon-service';
import type { CreateOrderInput } from '@/types/order-management';
import { checkRateLimit, RATE_LIMITS, getUserIdentifier, getClientIP } from '@/lib/utils/rate-limit';

/**
 * POST /api/checkout/verify-payment
 * 
 * Verify payment signature and create order
 * 
 * Request body:
 * - razorpay_payment_id: string
 * - razorpay_order_id: string
 * - razorpay_signature: string
 * - orderData: CreateOrderInput (order details to create)
 * 
 * Response:
 * - success: boolean
 * - order: Order (created order details)
 * - message: string
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderData,
    } = body;

    // Apply rate limiting (10 requests per minute per user)
    const clientIP = getClientIP(request.headers);
    const userIdentifier = getUserIdentifier(orderData?.user_id, clientIP);
    const rateLimitResult = checkRateLimit(userIdentifier, RATE_LIMITS.ORDER_CREATION);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many order creation attempts. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.ORDER_CREATION.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
          },
        }
      );
    }

    // Validate input
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment verification details are required' },
        { status: 400 }
      );
    }

    if (!orderData) {
      return NextResponse.json(
        { error: 'Order data is required' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const paymentGateway = getPaymentGateway();
    const isValid = await paymentGateway.verifyPayment(
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Payment verification failed. Invalid signature.' },
        { status: 400 }
      );
    }

    // Create order with payment details
    const orderInput: CreateOrderInput = {
      ...orderData,
      payment_id: razorpay_payment_id,
      razorpay_order_id: razorpay_order_id,
    };

    const order = await orderService.createOrder(orderInput);

    // Increment coupon usage if coupon was applied
    if (order.coupon_code) {
      try {
        await couponService.incrementUsageCount(order.coupon_code);
      } catch (error) {
        // Log error but don't fail the order creation
        console.error('Failed to increment coupon usage:', error);
      }
    }

    // Send order confirmation notification to customer
    try {
      await notificationService.sendOrderConfirmation(order);
    } catch (error) {
      // Log error but don't fail the order creation
      console.error('Failed to send order confirmation:', error);
    }

    // Send new order alert to admin
    try {
      await notificationService.sendAdminNewOrderAlert(order);
    } catch (error) {
      // Log error but don't fail the order creation
      console.error('Failed to send admin notification:', error);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total: order.total,
        status: order.status,
        created_at: order.created_at,
      },
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Verify payment error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Handle specific errors
    if (errorMessage.includes('verification failed')) {
      return NextResponse.json(
        { error: 'Payment verification failed. Please contact support.' },
        { status: 400 }
      );
    }

    if (errorMessage.includes('Order creation') || errorMessage.includes('required')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Failed to process payment and create order. Please contact support.' },
      { status: 500 }
    );
  }
}
