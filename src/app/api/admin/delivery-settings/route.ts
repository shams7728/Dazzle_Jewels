import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { deliveryService } from '@/lib/services/delivery-service';
import type { DeliverySettings } from '@/types/order-management';
import { validatePincode, validateAddressField, validatePositiveNumber } from '@/lib/utils/input-validation';
import { cache, CacheKeys } from '@/lib/utils/cache';

/**
 * GET /api/admin/delivery-settings
 * Get current delivery settings
 * 
 * Requirements: 3C.1, 3C.2, 3C.4, 3C.5
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

    // Fetch delivery settings
    const settings = await deliveryService.getDeliverySettings();

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Error fetching delivery settings:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch delivery settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/delivery-settings
 * Update delivery settings
 * 
 * Body: Partial<DeliverySettings>
 * - business_pincode: string
 * - business_city: string
 * - business_state: string
 * - business_latitude: number
 * - business_longitude: number
 * - local_delivery_charge: number
 * - city_delivery_charge: number
 * - state_delivery_charge: number
 * - national_delivery_charge: number
 * - free_shipping_threshold: number
 * - free_shipping_enabled: boolean
 * 
 * Requirements: 3C.1, 3C.2, 3C.4, 3C.5
 */
export async function PUT(request: NextRequest) {
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

    const body = await request.json();

    // Validate input
    const updates: Partial<DeliverySettings> = {};

    // Business location with validation
    if (body.business_pincode !== undefined) {
      const pincodeValidation = validatePincode(body.business_pincode);
      if (!pincodeValidation.isValid) {
        return NextResponse.json(
          { error: pincodeValidation.error },
          { status: 400 }
        );
      }
      updates.business_pincode = pincodeValidation.sanitized;
    }

    if (body.business_city !== undefined) {
      const cityValidation = validateAddressField(body.business_city, 'Business city', 2, 50);
      if (!cityValidation.isValid) {
        return NextResponse.json(
          { error: cityValidation.error },
          { status: 400 }
        );
      }
      updates.business_city = cityValidation.sanitized;
    }

    if (body.business_state !== undefined) {
      const stateValidation = validateAddressField(body.business_state, 'Business state', 2, 50);
      if (!stateValidation.isValid) {
        return NextResponse.json(
          { error: stateValidation.error },
          { status: 400 }
        );
      }
      updates.business_state = stateValidation.sanitized;
    }

    if (body.business_latitude !== undefined) {
      const lat = parseFloat(body.business_latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return NextResponse.json(
          { error: 'business_latitude must be between -90 and 90' },
          { status: 400 }
        );
      }
      updates.business_latitude = lat;
    }

    if (body.business_longitude !== undefined) {
      const lon = parseFloat(body.business_longitude);
      if (isNaN(lon) || lon < -180 || lon > 180) {
        return NextResponse.json(
          { error: 'business_longitude must be between -180 and 180' },
          { status: 400 }
        );
      }
      updates.business_longitude = lon;
    }

    // Delivery charges with validation
    const chargeFields = [
      'local_delivery_charge',
      'city_delivery_charge',
      'state_delivery_charge',
      'national_delivery_charge',
    ];

    for (const field of chargeFields) {
      if (body[field] !== undefined) {
        const chargeValidation = validatePositiveNumber(body[field], field, 0, 10000);
        if (!chargeValidation.isValid) {
          return NextResponse.json(
            { error: chargeValidation.error },
            { status: 400 }
          );
        }
        updates[field as keyof DeliverySettings] = chargeValidation.sanitized as any;
      }
    }

    // Free shipping with validation
    if (body.free_shipping_threshold !== undefined) {
      const thresholdValidation = validatePositiveNumber(body.free_shipping_threshold, 'Free shipping threshold', 0, 1000000);
      if (!thresholdValidation.isValid) {
        return NextResponse.json(
          { error: thresholdValidation.error },
          { status: 400 }
        );
      }
      updates.free_shipping_threshold = thresholdValidation.sanitized;
    }

    if (body.free_shipping_enabled !== undefined) {
      if (typeof body.free_shipping_enabled !== 'boolean') {
        return NextResponse.json(
          { error: 'free_shipping_enabled must be a boolean' },
          { status: 400 }
        );
      }
      updates.free_shipping_enabled = body.free_shipping_enabled;
    }

    // Update settings
    const updatedSettings = await deliveryService.updateDeliverySettings(updates, user.id);

    // Invalidate delivery settings cache
    cache.delete(CacheKeys.deliverySettings());
    
    // Invalidate all pincode coordinate caches since delivery zones may have changed
    cache.deletePattern('pincode:.*');

    return NextResponse.json(updatedSettings, { status: 200 });
  } catch (error) {
    console.error('Error updating delivery settings:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update delivery settings' },
      { status: 500 }
    );
  }
}
