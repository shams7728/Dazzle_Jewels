import { NextRequest, NextResponse } from 'next/server';
import { couponService } from '@/lib/services/coupon-service';
import { validateCouponCode, validatePositiveNumber, validateUUID } from '@/lib/utils/input-validation';
import { checkRateLimit, RATE_LIMITS, getUserIdentifier, getClientIP } from '@/lib/utils/rate-limit';

/**
 * POST /api/checkout/validate-coupon
 * 
 * Validate coupon code and calculate discount
 * 
 * Request body:
 * - couponCode: string (coupon code to validate)
 * - orderSubtotal: number (order subtotal amount)
 * - userId?: string (optional user ID for per-user limit validation)
 * 
 * Response:
 * - valid: boolean
 * - discount: number
 * - couponCode: string
 * - description: string
 * - updatedTotal: number
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { couponCode, orderSubtotal, userId } = body;

    // Apply rate limiting (5 requests per minute)
    const clientIP = getClientIP(request.headers);
    const userIdentifier = getUserIdentifier(userId, clientIP);
    const rateLimitResult = checkRateLimit(userIdentifier, RATE_LIMITS.COUPON_VALIDATION);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many coupon validation attempts. Please try again later.',
          valid: false,
          retryAfter: rateLimitResult.retryAfter,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.COUPON_VALIDATION.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
          },
        }
      );
    }

    // Validate coupon code
    const couponValidation = validateCouponCode(couponCode);
    if (!couponValidation.isValid) {
      return NextResponse.json(
        { error: couponValidation.error, valid: false },
        { status: 400 }
      );
    }

    // Validate order subtotal
    const subtotalValidation = validatePositiveNumber(orderSubtotal, 'Order subtotal', 0);
    if (!subtotalValidation.isValid) {
      return NextResponse.json(
        { error: subtotalValidation.error, valid: false },
        { status: 400 }
      );
    }

    // Validate userId if provided
    let sanitizedUserId = userId;
    if (userId) {
      const userIdValidation = validateUUID(userId, 'User ID');
      if (!userIdValidation.isValid) {
        return NextResponse.json(
          { error: userIdValidation.error, valid: false },
          { status: 400 }
        );
      }
      sanitizedUserId = userIdValidation.sanitized;
    }

    // Validate and apply coupon using sanitized values
    const result = await couponService.validateAndApplyCoupon(
      couponValidation.sanitized!,
      subtotalValidation.sanitized!,
      sanitizedUserId
    );

    // Calculate updated total
    const updatedTotal = orderSubtotal - result.discount;

    return NextResponse.json({
      valid: true,
      discount: result.discount,
      couponCode: result.coupon.code,
      description: result.coupon.description || `${result.coupon.discount_type === 'percentage' ? result.coupon.discount_value + '%' : '₹' + result.coupon.discount_value} off`,
      updatedTotal,
    });
  } catch (error) {
    console.error('Validate coupon error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Handle specific coupon validation errors
    if (
      errorMessage.includes('Invalid coupon') ||
      errorMessage.includes('expired') ||
      errorMessage.includes('usage limit') ||
      errorMessage.includes('not yet valid') ||
      errorMessage.includes('no longer active') ||
      errorMessage.includes('Minimum order value')
    ) {
      return NextResponse.json(
        { error: errorMessage, valid: false },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Failed to validate coupon. Please try again.', valid: false },
      { status: 500 }
    );
  }
}
