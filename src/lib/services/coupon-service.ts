import { supabase } from '../supabase';
import type { Coupon } from '@/types/order-management';

/**
 * CouponService - Handles coupon validation and discount calculation
 * 
 * Features:
 * - Coupon validation (expiry, usage limits, min order value)
 * - Discount calculation (percentage and fixed)
 * - Coupon application with max discount caps
 * - Track coupon usage count
 */
export class CouponService {
  /**
   * Validate and apply a coupon code
   * Returns the discount amount if valid, throws error if invalid
   */
  async validateAndApplyCoupon(
    couponCode: string,
    orderSubtotal: number,
    userId?: string
  ): Promise<{ discount: number; coupon: Coupon }> {
    // Fetch the coupon
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .single();

    if (error || !coupon) {
      throw new Error('Invalid coupon code');
    }

    // Validate coupon
    this.validateCoupon(coupon, orderSubtotal, userId);

    // Calculate discount
    const discount = this.calculateDiscount(coupon, orderSubtotal);

    return { discount, coupon };
  }

  /**
   * Validate coupon against all constraints
   */
  private validateCoupon(coupon: Coupon, orderSubtotal: number, userId?: string): void {
    // Check if coupon is active
    if (!coupon.is_active) {
      throw new Error('This coupon is no longer active');
    }

    // Check expiry dates
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (now < validFrom) {
      throw new Error('This coupon is not yet valid');
    }

    if (now > validUntil) {
      throw new Error(`This coupon expired on ${validUntil.toLocaleDateString()}`);
    }

    // Check minimum order value
    if (coupon.min_order_value && orderSubtotal < coupon.min_order_value) {
      throw new Error(
        `Minimum order value of ₹${coupon.min_order_value} required for this coupon`
      );
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      throw new Error('This coupon has reached its usage limit');
    }

    // Note: per_user_limit validation would require checking user's coupon usage history
    // This would need a separate table to track user-specific coupon usage
    // For now, we'll skip this validation but it should be implemented in production
  }

  /**
   * Calculate discount amount based on coupon type
   */
  calculateDiscount(coupon: Coupon, orderSubtotal: number): number {
    let discount = 0;

    if (coupon.discount_type === 'fixed') {
      // Fixed amount discount
      discount = coupon.discount_value;
    } else if (coupon.discount_type === 'percentage') {
      // Percentage discount
      discount = (orderSubtotal * coupon.discount_value) / 100;

      // Apply max discount cap if specified
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    }

    // Ensure discount doesn't exceed order subtotal
    discount = Math.min(discount, orderSubtotal);

    // Round to 2 decimal places
    return Math.round(discount * 100) / 100;
  }

  /**
   * Increment coupon usage count
   * Should be called after successful order creation
   */
  async incrementUsageCount(couponCode: string): Promise<void> {
    const { error } = await supabase.rpc('increment_coupon_usage', {
      coupon_code: couponCode.toUpperCase(),
    });

    if (error) {
      // Log error but don't throw - usage count increment failure shouldn't block order
      console.error('Failed to increment coupon usage:', error);
    }
  }

  /**
   * Get coupon by code
   */
  async getCouponByCode(couponCode: string): Promise<Coupon | null> {
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .single();

    if (error) {
      return null;
    }

    return coupon;
  }

  /**
   * Get all active coupons
   */
  async getActiveCoupons(): Promise<Coupon[]> {
    const now = new Date().toISOString();

    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .lte('valid_from', now)
      .gte('valid_until', now)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch active coupons: ${error.message}`);
    }

    return coupons || [];
  }

  /**
   * Create a new coupon (admin only)
   */
  async createCoupon(coupon: Omit<Coupon, 'id' | 'created_at' | 'usage_count'>): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        ...coupon,
        code: coupon.code.toUpperCase(),
        usage_count: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create coupon: ${error.message}`);
    }

    return data;
  }

  /**
   * Update coupon (admin only)
   */
  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update coupon: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete coupon (admin only)
   */
  async deleteCoupon(id: string): Promise<void> {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete coupon: ${error.message}`);
    }
  }
}

// Export singleton instance
export const couponService = new CouponService();
