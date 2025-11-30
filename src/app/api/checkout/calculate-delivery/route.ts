import { NextRequest, NextResponse } from 'next/server';
import { deliveryService } from '@/lib/services/delivery-service';
import { validatePincode, validatePositiveNumber } from '@/lib/utils/input-validation';

/**
 * GET /api/checkout/calculate-delivery?pincode=123456&orderSubtotal=1000
 * 
 * Calculate delivery charges based on pincode and order details
 * 
 * Query params:
 * - pincode: string (6-digit Indian pincode)
 * - orderSubtotal: number (optional, order subtotal amount for free shipping check)
 * 
 * Response:
 * - deliveryCharge: number
 * - isFreeShipping: boolean
 * - zone: string
 * - estimatedDeliveryDate: string (ISO date)
 * - isStandardCharge: boolean (true if fallback to standard charge was used)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pincode = searchParams.get('pincode');
    const orderSubtotalParam = searchParams.get('orderSubtotal');
    const orderSubtotal = orderSubtotalParam ? parseFloat(orderSubtotalParam) : 0;

    // Validate pincode
    if (!pincode) {
      return NextResponse.json(
        { error: 'Pincode is required' },
        { status: 400 }
      );
    }

    const pincodeValidation = validatePincode(pincode);
    if (!pincodeValidation.isValid) {
      return NextResponse.json(
        { error: pincodeValidation.error },
        { status: 400 }
      );
    }

    // Validate order subtotal if provided
    if (orderSubtotalParam) {
      const subtotalValidation = validatePositiveNumber(orderSubtotal, 'Order subtotal', 0);
      if (!subtotalValidation.isValid) {
        return NextResponse.json(
          { error: subtotalValidation.error },
          { status: 400 }
        );
      }
    }

    try {
      // Try to calculate delivery charges using sanitized values
      const result = await deliveryService.calculateDeliveryCharge(
        pincodeValidation.sanitized!,
        orderSubtotal
      );

      // Calculate estimated delivery date
      const deliveryDays: Record<string, number> = {
        local: 1,
        city: 2,
        state: 3,
        national: 5,
        free_shipping: 2,
      };

      const daysToAdd = deliveryDays[result.zone] || 3;
      const estimatedDeliveryDate = new Date();
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + daysToAdd);

      return NextResponse.json({
        deliveryCharge: result.charge,
        isFreeShipping: result.isFreeShipping,
        zone: result.zone,
        estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
        isStandardCharge: false,
      });
    } catch (deliveryError) {
      // If delivery calculation fails, fallback to standard charge
      console.warn('Delivery calculation failed, using standard charge:', deliveryError);
      
      const settings = await deliveryService.getDeliverySettings();
      
      // Check if free shipping applies
      const isFreeShipping = settings.free_shipping_enabled && orderSubtotal >= settings.free_shipping_threshold;
      
      // Use national delivery charge as standard fallback
      const standardCharge = isFreeShipping ? 0 : settings.national_delivery_charge;
      
      const estimatedDeliveryDate = new Date();
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5); // Standard 5 days

      return NextResponse.json({
        deliveryCharge: standardCharge,
        isFreeShipping,
        zone: 'standard',
        estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
        isStandardCharge: true,
      });
    }
  } catch (error) {
    console.error('Calculate delivery error:', error);

    // Handle invalid pincode error
    if (error instanceof Error && error.message.includes('Invalid pincode')) {
      return NextResponse.json(
        { error: 'Invalid pincode format. Please enter a valid 6-digit pincode.' },
        { status: 400 }
      );
    }

    // For any other error, try to return standard charge as last resort
    try {
      const settings = await deliveryService.getDeliverySettings();
      return NextResponse.json({
        deliveryCharge: settings.national_delivery_charge,
        isFreeShipping: false,
        zone: 'standard',
        estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        isStandardCharge: true,
      });
    } catch (fallbackError) {
      // If even fallback fails, return error
      return NextResponse.json(
        { error: 'Failed to calculate delivery charges. Please try again.' },
        { status: 500 }
      );
    }
  }
}

/**
 * POST /api/checkout/calculate-delivery
 * 
 * Calculate delivery charges based on pincode and order details
 * 
 * Request body:
 * - pincode: string (6-digit Indian pincode)
 * - orderSubtotal: number (order subtotal amount)
 * 
 * Response:
 * - deliveryCharge: number
 * - isFreeShipping: boolean
 * - zone: string
 * - estimatedDeliveryDate: string (ISO date)
 * - isStandardCharge: boolean (true if fallback to standard charge was used)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pincode, orderSubtotal } = body;

    // Validate pincode
    const pincodeValidation = validatePincode(pincode);
    if (!pincodeValidation.isValid) {
      return NextResponse.json(
        { error: pincodeValidation.error },
        { status: 400 }
      );
    }

    // Validate order subtotal
    const subtotalValidation = validatePositiveNumber(orderSubtotal, 'Order subtotal', 0);
    if (!subtotalValidation.isValid) {
      return NextResponse.json(
        { error: subtotalValidation.error },
        { status: 400 }
      );
    }

    try {
      // Try to calculate delivery charges using sanitized values
      const result = await deliveryService.calculateDeliveryCharge(
        pincodeValidation.sanitized!,
        subtotalValidation.sanitized!
      );

      // Calculate estimated delivery date
      const deliveryDays: Record<string, number> = {
        local: 1,
        city: 2,
        state: 3,
        national: 5,
        free_shipping: 2,
      };

      const daysToAdd = deliveryDays[result.zone] || 3;
      const estimatedDeliveryDate = new Date();
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + daysToAdd);

      return NextResponse.json({
        deliveryCharge: result.charge,
        isFreeShipping: result.isFreeShipping,
        zone: result.zone,
        estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
        isStandardCharge: false,
      });
    } catch (deliveryError) {
      // If delivery calculation fails, fallback to standard charge
      console.warn('Delivery calculation failed, using standard charge:', deliveryError);
      
      const settings = await deliveryService.getDeliverySettings();
      
      // Check if free shipping applies
      const isFreeShipping = settings.free_shipping_enabled && subtotalValidation.sanitized! >= settings.free_shipping_threshold;
      
      // Use national delivery charge as standard fallback
      const standardCharge = isFreeShipping ? 0 : settings.national_delivery_charge;
      
      const estimatedDeliveryDate = new Date();
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5); // Standard 5 days

      return NextResponse.json({
        deliveryCharge: standardCharge,
        isFreeShipping,
        zone: 'standard',
        estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
        isStandardCharge: true,
      });
    }
  } catch (error) {
    console.error('Calculate delivery error:', error);

    // Handle invalid pincode error
    if (error instanceof Error && error.message.includes('Invalid pincode')) {
      return NextResponse.json(
        { error: 'Invalid pincode format. Please enter a valid 6-digit pincode.' },
        { status: 400 }
      );
    }

    // For any other error, try to return standard charge as last resort
    try {
      const settings = await deliveryService.getDeliverySettings();
      return NextResponse.json({
        deliveryCharge: settings.national_delivery_charge,
        isFreeShipping: false,
        zone: 'standard',
        estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        isStandardCharge: true,
      });
    } catch (fallbackError) {
      // If even fallback fails, return error
      return NextResponse.json(
        { error: 'Failed to calculate delivery charges. Please try again.' },
        { status: 500 }
      );
    }
  }
}