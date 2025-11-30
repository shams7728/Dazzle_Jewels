import { NextRequest, NextResponse } from 'next/server';
import { getPaymentGateway } from '@/lib/services/payment-gateway';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/checkout/create-payment
 * 
 * Create a payment order with the payment gateway
 * 
 * Request body:
 * - amount: number (total order amount)
 * - currency?: string (default: 'INR')
 * - paymentMethod: string (payment method selected)
 * - orderDetails: object (order metadata for receipt)
 * 
 * Response:
 * - orderId: string (payment gateway order ID)
 * - amount: number
 * - currency: string
 * - keyId: string (public key for frontend)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'INR', paymentMethod, orderDetails } = body;

    // Validate input
    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      );
    }

    // For COD, no payment gateway order needed
    if (paymentMethod === 'cod') {
      return NextResponse.json({
        orderId: null,
        amount,
        currency,
        paymentMethod: 'cod',
        message: 'Cash on Delivery selected',
      });
    }

    // Create payment gateway order
    const paymentGateway = getPaymentGateway();
    
    const paymentOrder = await paymentGateway.createOrder(
      amount,
      currency,
      {
        receipt: `receipt_${Date.now()}`,
        notes: {
          ...orderDetails,
          payment_method: paymentMethod,
        },
      }
    );

    // Log payment creation attempt
    await supabase.from('notification_log').insert({
      notification_type: 'admin_priority',
      recipient_email: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject: 'Payment Order Created',
      body: `Payment order ${paymentOrder.id} created for amount ${amount}`,
      status: 'sent',
      retry_count: 0,
      sent_at: new Date().toISOString(),
    });

    // Return payment order details for frontend
    return NextResponse.json({
      orderId: paymentOrder.id,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      paymentMethod,
    });
  } catch (error) {
    console.error('Create payment error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Handle payment gateway errors
    if (errorMessage.includes('credentials') || errorMessage.includes('key')) {
      return NextResponse.json(
        { error: 'Payment gateway configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Failed to create payment order. Please try again.' },
      { status: 500 }
    );
  }
}
