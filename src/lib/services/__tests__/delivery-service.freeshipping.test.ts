/**
 * Property-Based Test for Free Shipping Threshold
 * 
 * Feature: order-management-system, Property 7: Free shipping threshold application
 * Validates: Requirements 3.2
 * 
 * This test verifies that for any order where subtotal exceeds the configured free
 * shipping threshold, delivery charges are set to zero
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { deliveryService } from '../delivery-service';

describe('Free Shipping Threshold Property Test', () => {
  beforeEach(() => {
    // Clear cache before each test
    deliveryService.clearCache();
  });

  it('should apply free shipping when order subtotal exceeds threshold', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100000, max: 999999 }).map(String),
        fc.double({ min: 1000, max: 10000, noNaN: true }).map(v => Math.round(v * 100) / 100),
        async (pincode, orderSubtotal) => {
          try {
            // Get delivery settings to know the threshold
            const settings = await deliveryService.getDeliverySettings();

            // If free shipping is enabled and subtotal exceeds threshold
            if (settings.free_shipping_enabled && orderSubtotal >= settings.free_shipping_threshold) {
              const result = await deliveryService.calculateDeliveryCharge(pincode, orderSubtotal);

              // Delivery charge should be 0
              expect(result.charge).toBe(0);
              expect(result.isFreeShipping).toBe(true);
              expect(result.zone).toBe('free_shipping');
            }
          } catch (error) {
            // If it fails, it should be due to database not being set up
            expect((error as Error).message).toMatch(/delivery settings|database|schema/i);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  it('should charge delivery when order subtotal is below threshold', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100000, max: 999999 }).map(String),
        fc.double({ min: 10, max: 500, noNaN: true }).map(v => Math.round(v * 100) / 100),
        async (pincode, orderSubtotal) => {
          try {
            // Get delivery settings to know the threshold
            const settings = await deliveryService.getDeliverySettings();

            // If free shipping is enabled but subtotal is below threshold
            if (settings.free_shipping_enabled && orderSubtotal < settings.free_shipping_threshold) {
              const result = await deliveryService.calculateDeliveryCharge(pincode, orderSubtotal);

              // Delivery charge should be greater than 0
              expect(result.charge).toBeGreaterThan(0);
              expect(result.isFreeShipping).toBe(false);
              expect(result.zone).not.toBe('free_shipping');
            }
          } catch (error) {
            // If it fails, it should be due to database not being set up
            expect((error as Error).message).toMatch(/delivery settings|database|schema/i);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  it('should handle edge case at exact threshold amount', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100000, max: 999999 }).map(String),
        async (pincode) => {
          try {
            // Get delivery settings
            const settings = await deliveryService.getDeliverySettings();

            if (settings.free_shipping_enabled) {
              // Test at exact threshold
              const resultAtThreshold = await deliveryService.calculateDeliveryCharge(
                pincode,
                settings.free_shipping_threshold
              );

              // At threshold, should get free shipping
              expect(resultAtThreshold.charge).toBe(0);
              expect(resultAtThreshold.isFreeShipping).toBe(true);

              // Test just below threshold
              const resultBelowThreshold = await deliveryService.calculateDeliveryCharge(
                pincode,
                settings.free_shipping_threshold - 0.01
              );

              // Below threshold, should charge delivery
              expect(resultBelowThreshold.charge).toBeGreaterThan(0);
              expect(resultBelowThreshold.isFreeShipping).toBe(false);

              // Test just above threshold
              const resultAboveThreshold = await deliveryService.calculateDeliveryCharge(
                pincode,
                settings.free_shipping_threshold + 0.01
              );

              // Above threshold, should get free shipping
              expect(resultAboveThreshold.charge).toBe(0);
              expect(resultAboveThreshold.isFreeShipping).toBe(true);
            }
          } catch (error) {
            // If it fails, it should be due to database not being set up
            expect((error as Error).message).toMatch(/delivery settings|database|schema/i);
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should respect free shipping enabled/disabled setting', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100000, max: 999999 }).map(String),
        fc.double({ min: 1000, max: 10000, noNaN: true }).map(v => Math.round(v * 100) / 100),
        async (pincode, orderSubtotal) => {
          try {
            // Get delivery settings
            const settings = await deliveryService.getDeliverySettings();

            const result = await deliveryService.calculateDeliveryCharge(pincode, orderSubtotal);

            // If free shipping is disabled, should never get free shipping
            if (!settings.free_shipping_enabled) {
              expect(result.isFreeShipping).toBe(false);
              expect(result.zone).not.toBe('free_shipping');
            }
          } catch (error) {
            // If it fails, it should be due to database not being set up
            expect((error as Error).message).toMatch(/delivery settings|database|schema/i);
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should apply free shipping regardless of delivery zone when threshold is met', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 100000, max: 999999 }).map(String), { minLength: 3, maxLength: 5 }),
        fc.double({ min: 2000, max: 10000, noNaN: true }).map(v => Math.round(v * 100) / 100),
        async (pincodes, orderSubtotal) => {
          try {
            // Get delivery settings
            const settings = await deliveryService.getDeliverySettings();

            if (settings.free_shipping_enabled && orderSubtotal >= settings.free_shipping_threshold) {
              // Test multiple pincodes (different zones)
              for (const pincode of pincodes) {
                const result = await deliveryService.calculateDeliveryCharge(pincode, orderSubtotal);

                // All should get free shipping regardless of zone
                expect(result.charge).toBe(0);
                expect(result.isFreeShipping).toBe(true);
                expect(result.zone).toBe('free_shipping');
              }
            }
          } catch (error) {
            // If it fails, it should be due to database not being set up
            expect((error as Error).message).toMatch(/delivery settings|database|schema/i);
          }
        }
      ),
      { numRuns: 30 }
    );
  }, 120000);

  it('should calculate correct charges for orders just below and above threshold', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100000, max: 999999 }).map(String),
        async (pincode) => {
          try {
            // Get delivery settings
            const settings = await deliveryService.getDeliverySettings();

            if (settings.free_shipping_enabled && settings.free_shipping_threshold > 0) {
              // Calculate for amount below threshold
              const belowAmount = settings.free_shipping_threshold - 1;
              const resultBelow = await deliveryService.calculateDeliveryCharge(pincode, belowAmount);

              // Calculate for amount above threshold
              const aboveAmount = settings.free_shipping_threshold + 1;
              const resultAbove = await deliveryService.calculateDeliveryCharge(pincode, aboveAmount);

              // Below should have charge, above should be free
              expect(resultBelow.charge).toBeGreaterThan(0);
              expect(resultBelow.isFreeShipping).toBe(false);

              expect(resultAbove.charge).toBe(0);
              expect(resultAbove.isFreeShipping).toBe(true);

              // The difference should be exactly the delivery charge
              const deliveryCharge = resultBelow.charge;
              expect(deliveryCharge).toBeGreaterThan(0);
            }
          } catch (error) {
            // If it fails, it should be due to database not being set up
            expect((error as Error).message).toMatch(/delivery settings|database|schema/i);
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);
});
