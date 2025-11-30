/**
 * Property-Based Test for Coupon Application
 * 
 * Feature: order-management-system, Property 4: Coupon application correctness
 * Validates: Requirements 2.2, 2.3, 2.4, 2.5
 * 
 * This test verifies that for any valid coupon code, the system correctly calculates
 * the discount based on coupon type (percentage or fixed), applies usage limits,
 * and updates the order total
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { couponService } from '../coupon-service';
import { supabase } from '../../supabase';
import type { Coupon } from '@/types/order-management';

// Arbitrary for generating valid coupons
const validCouponArbitrary = fc.record({
  code: fc.string({ minLength: 4, maxLength: 20 })
    .filter(s => s.trim().length > 0)
    .map(s => s.toUpperCase().replace(/\s/g, '')),
  description: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
  discount_type: fc.constantFrom('percentage' as const, 'fixed' as const),
  discount_value: fc.double({ min: 1, max: 100, noNaN: true }).map(v => Math.round(v * 100) / 100),
  min_order_value: fc.option(
    fc.double({ min: 0, max: 1000, noNaN: true }).map(v => Math.round(v * 100) / 100),
    { nil: undefined }
  ),
  max_discount: fc.option(
    fc.double({ min: 10, max: 500, noNaN: true }).map(v => Math.round(v * 100) / 100),
    { nil: undefined }
  ),
  usage_limit: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: undefined }),
  per_user_limit: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined }),
  valid_from: fc.constant(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()), // Yesterday
  valid_until: fc.constant(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()), // 30 days from now
  is_active: fc.constant(true),
});

describe('Coupon Application Property Test', () => {
  const createdCouponIds: string[] = [];

  afterEach(async () => {
    // Cleanup: Delete all created coupons
    if (createdCouponIds.length > 0) {
      await supabase.from('coupons').delete().in('id', createdCouponIds);
      createdCouponIds.length = 0;
    }
  });

  it('should correctly calculate fixed discount for any valid coupon and order subtotal', async () => {
    await fc.assert(
      fc.asyncProperty(
        validCouponArbitrary.filter(c => c.discount_type === 'fixed'),
        fc.double({ min: 100, max: 10000, noNaN: true }).map(v => Math.round(v * 100) / 100),
        async (couponData, orderSubtotal) => {
          // Ensure min_order_value doesn't exceed orderSubtotal
          if (couponData.min_order_value && couponData.min_order_value > orderSubtotal) {
            couponData.min_order_value = orderSubtotal * 0.5;
          }

          // Create the coupon
          const createdCoupon = await couponService.createCoupon({
            ...couponData,
            usage_count: 0,
          } as any);
          createdCouponIds.push(createdCoupon.id);

          // Apply the coupon
          const { discount, coupon } = await couponService.validateAndApplyCoupon(
            createdCoupon.code,
            orderSubtotal
          );

          // Verify discount is correct for fixed type
          const expectedDiscount = Math.min(couponData.discount_value, orderSubtotal);
          expect(discount).toBe(expectedDiscount);

          // Verify discount doesn't exceed order subtotal
          expect(discount).toBeLessThanOrEqual(orderSubtotal);

          // Verify coupon data is returned
          expect(coupon.code).toBe(createdCoupon.code);
          expect(coupon.discount_type).toBe('fixed');
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should correctly calculate percentage discount with max cap for any valid coupon', async () => {
    await fc.assert(
      fc.asyncProperty(
        validCouponArbitrary.filter(c => c.discount_type === 'percentage'),
        fc.double({ min: 100, max: 10000, noNaN: true }).map(v => Math.round(v * 100) / 100),
        async (couponData, orderSubtotal) => {
          // Ensure min_order_value doesn't exceed orderSubtotal
          if (couponData.min_order_value && couponData.min_order_value > orderSubtotal) {
            couponData.min_order_value = orderSubtotal * 0.5;
          }

          // Ensure discount_value is a valid percentage (1-100)
          if (couponData.discount_value > 100) {
            couponData.discount_value = 50; // 50% discount
          }

          // Create the coupon
          const createdCoupon = await couponService.createCoupon({
            ...couponData,
            usage_count: 0,
          } as any);
          createdCouponIds.push(createdCoupon.id);

          // Apply the coupon
          const { discount } = await couponService.validateAndApplyCoupon(
            createdCoupon.code,
            orderSubtotal
          );

          // Calculate expected discount
          let expectedDiscount = (orderSubtotal * couponData.discount_value) / 100;
          
          // Apply max discount cap if specified
          if (couponData.max_discount && expectedDiscount > couponData.max_discount) {
            expectedDiscount = couponData.max_discount;
          }

          // Ensure discount doesn't exceed subtotal
          expectedDiscount = Math.min(expectedDiscount, orderSubtotal);
          expectedDiscount = Math.round(expectedDiscount * 100) / 100;

          expect(discount).toBe(expectedDiscount);

          // Verify max discount cap is respected
          if (couponData.max_discount) {
            expect(discount).toBeLessThanOrEqual(couponData.max_discount);
          }

          // Verify discount doesn't exceed order subtotal
          expect(discount).toBeLessThanOrEqual(orderSubtotal);
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should reject coupons when order subtotal is below minimum order value', async () => {
    await fc.assert(
      fc.asyncProperty(
        validCouponArbitrary.filter(c => c.min_order_value && c.min_order_value > 0),
        async (couponData) => {
          // Create the coupon
          const createdCoupon = await couponService.createCoupon({
            ...couponData,
            usage_count: 0,
          } as any);
          createdCouponIds.push(createdCoupon.id);

          // Try to apply with order subtotal below minimum
          const orderSubtotal = (couponData.min_order_value || 100) * 0.5;

          await expect(
            couponService.validateAndApplyCoupon(createdCoupon.code, orderSubtotal)
          ).rejects.toThrow(/minimum order value/i);
        }
      ),
      { numRuns: 30 }
    );
  }, 120000);

  it('should reject coupons that have reached usage limit', async () => {
    await fc.assert(
      fc.asyncProperty(
        validCouponArbitrary.filter(c => c.usage_limit && c.usage_limit > 0),
        fc.double({ min: 100, max: 1000, noNaN: true }).map(v => Math.round(v * 100) / 100),
        async (couponData, orderSubtotal) => {
          // Set usage_count to usage_limit
          const usageLimit = couponData.usage_limit || 10;

          // Create the coupon with usage at limit
          const { data: createdCoupon, error } = await supabase
            .from('coupons')
            .insert({
              ...couponData,
              usage_count: usageLimit,
            })
            .select()
            .single();

          if (error) throw error;
          createdCouponIds.push(createdCoupon.id);

          // Try to apply the coupon
          await expect(
            couponService.validateAndApplyCoupon(createdCoupon.code, orderSubtotal)
          ).rejects.toThrow(/usage limit/i);
        }
      ),
      { numRuns: 30 }
    );
  }, 120000);

  it('should reject expired coupons', async () => {
    await fc.assert(
      fc.asyncProperty(
        validCouponArbitrary,
        fc.double({ min: 100, max: 1000, noNaN: true }).map(v => Math.round(v * 100) / 100),
        async (couponData, orderSubtotal) => {
          // Set coupon as expired
          const expiredCouponData = {
            ...couponData,
            valid_from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
            valid_until: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
          };

          // Create the expired coupon
          const createdCoupon = await couponService.createCoupon({
            ...expiredCouponData,
            usage_count: 0,
          } as any);
          createdCouponIds.push(createdCoupon.id);

          // Try to apply the expired coupon
          await expect(
            couponService.validateAndApplyCoupon(createdCoupon.code, orderSubtotal)
          ).rejects.toThrow(/expired/i);
        }
      ),
      { numRuns: 30 }
    );
  }, 120000);

  it('should reject inactive coupons', async () => {
    await fc.assert(
      fc.asyncProperty(
        validCouponArbitrary,
        fc.double({ min: 100, max: 1000, noNaN: true }).map(v => Math.round(v * 100) / 100),
        async (couponData, orderSubtotal) => {
          // Set coupon as inactive
          const inactiveCouponData = {
            ...couponData,
            is_active: false,
          };

          // Create the inactive coupon
          const createdCoupon = await couponService.createCoupon({
            ...inactiveCouponData,
            usage_count: 0,
          } as any);
          createdCouponIds.push(createdCoupon.id);

          // Try to apply the inactive coupon
          await expect(
            couponService.validateAndApplyCoupon(createdCoupon.code, orderSubtotal)
          ).rejects.toThrow(/no longer active/i);
        }
      ),
      { numRuns: 30 }
    );
  }, 120000);

  it('should calculate discount correctly regardless of coupon code case', async () => {
    await fc.assert(
      fc.asyncProperty(
        validCouponArbitrary,
        fc.double({ min: 100, max: 1000, noNaN: true }).map(v => Math.round(v * 100) / 100),
        async (couponData, orderSubtotal) => {
          // Ensure min_order_value doesn't exceed orderSubtotal
          if (couponData.min_order_value && couponData.min_order_value > orderSubtotal) {
            couponData.min_order_value = orderSubtotal * 0.5;
          }

          // Create the coupon
          const createdCoupon = await couponService.createCoupon({
            ...couponData,
            usage_count: 0,
          } as any);
          createdCouponIds.push(createdCoupon.id);

          // Apply with uppercase
          const { discount: discount1 } = await couponService.validateAndApplyCoupon(
            createdCoupon.code.toUpperCase(),
            orderSubtotal
          );

          // Apply with lowercase
          const { discount: discount2 } = await couponService.validateAndApplyCoupon(
            createdCoupon.code.toLowerCase(),
            orderSubtotal
          );

          // Apply with mixed case
          const { discount: discount3 } = await couponService.validateAndApplyCoupon(
            createdCoupon.code.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(''),
            orderSubtotal
          );

          // All should return the same discount
          expect(discount1).toBe(discount2);
          expect(discount2).toBe(discount3);
        }
      ),
      { numRuns: 30 }
    );
  }, 120000);
});
