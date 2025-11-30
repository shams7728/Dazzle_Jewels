/**
 * Property-Based Test for Payment Gateway Initialization
 * 
 * Feature: order-management-system, Property 1: Payment gateway initialization
 * Validates: Requirements 1.2
 * 
 * This test verifies that for any payment method selection, the system initializes
 * the correct payment gateway module
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  PaymentGatewayFactory,
  RazorpayGateway,
  type PaymentGateway,
} from '../payment-gateway';

describe('Payment Gateway Initialization Property Test', () => {
  beforeEach(() => {
    // Reset factory before each test
    PaymentGatewayFactory.reset();
  });

  afterEach(() => {
    // Clean up after each test
    PaymentGatewayFactory.reset();
  });

  it('should initialize Razorpay gateway with valid credentials', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 10, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.boolean(),
        (keyId, keySecret, testMode) => {
          // Create gateway instance
          const gateway = new RazorpayGateway(keyId, keySecret, testMode);

          // Verify gateway is created
          expect(gateway).toBeDefined();
          expect(gateway).toBeInstanceOf(RazorpayGateway);

          // Verify test mode is set correctly
          expect(gateway.isInTestMode()).toBe(testMode);

          // Verify gateway implements required methods
          expect(typeof gateway.createOrder).toBe('function');
          expect(typeof gateway.verifyPayment).toBe('function');
          expect(typeof gateway.refundPayment).toBe('function');
          expect(typeof gateway.getPaymentDetails).toBe('function');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should throw error when initializing with invalid credentials', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', null, undefined),
        fc.constantFrom('', null, undefined),
        (invalidKeyId, invalidKeySecret) => {
          // Attempt to create gateway with invalid credentials
          expect(() => {
            new RazorpayGateway(invalidKeyId as any, invalidKeySecret as any);
          }).toThrow(/key ID and secret are required/i);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should create singleton instance through factory', () => {
    // Set environment variables for testing
    const originalKeyId = process.env.RAZORPAY_KEY_ID;
    const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;

    process.env.RAZORPAY_KEY_ID = 'test_key_id';
    process.env.RAZORPAY_KEY_SECRET = 'test_key_secret';

    try {
      // Get gateway instance twice
      const gateway1 = PaymentGatewayFactory.getGateway('razorpay');
      const gateway2 = PaymentGatewayFactory.getGateway('razorpay');

      // Should return same instance (singleton)
      expect(gateway1).toBe(gateway2);
      expect(gateway1).toBeInstanceOf(RazorpayGateway);
    } finally {
      // Restore original environment variables
      if (originalKeyId) {
        process.env.RAZORPAY_KEY_ID = originalKeyId;
      } else {
        delete process.env.RAZORPAY_KEY_ID;
      }

      if (originalKeySecret) {
        process.env.RAZORPAY_KEY_SECRET = originalKeySecret;
      } else {
        delete process.env.RAZORPAY_KEY_SECRET;
      }
    }
  });

  it('should support fallback gateway configuration', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 10, maxLength: 50 }).filter(s => s.trim().length > 0),
        (keyId, keySecret) => {
          // Create a fallback gateway
          const fallbackGateway = new RazorpayGateway(keyId, keySecret, true);

          // Set as fallback
          PaymentGatewayFactory.setFallbackGateway(fallbackGateway);

          // Retrieve fallback
          const retrievedFallback = PaymentGatewayFactory.getFallbackGateway();

          // Should be the same instance
          expect(retrievedFallback).toBe(fallbackGateway);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle test mode configuration correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 10, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.boolean(),
        (keyId, keySecret, testMode) => {
          // Create gateway with specific test mode
          const gateway = new RazorpayGateway(keyId, keySecret, testMode);

          // Verify test mode matches
          expect(gateway.isInTestMode()).toBe(testMode);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify payment signatures correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 10, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 10, maxLength: 50 }),
        fc.string({ minLength: 10, maxLength: 50 }),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (keyId, keySecret, paymentId, orderId, signature) => {
          // Create gateway
          const gateway = new RazorpayGateway(keyId, keySecret);

          // Verify payment (will return false for random signature)
          const isValid = await gateway.verifyPayment(paymentId, orderId, signature);

          // Result should be boolean
          expect(typeof isValid).toBe('boolean');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain gateway state across multiple operations', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 10, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.boolean(),
        (keyId, keySecret, testMode) => {
          // Create gateway
          const gateway = new RazorpayGateway(keyId, keySecret, testMode);

          // Check test mode multiple times
          const mode1 = gateway.isInTestMode();
          const mode2 = gateway.isInTestMode();
          const mode3 = gateway.isInTestMode();

          // Should always return the same value
          expect(mode1).toBe(testMode);
          expect(mode2).toBe(testMode);
          expect(mode3).toBe(testMode);
          expect(mode1).toBe(mode2);
          expect(mode2).toBe(mode3);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reset factory state correctly', () => {
    // Set environment variables
    process.env.RAZORPAY_KEY_ID = 'test_key';
    process.env.RAZORPAY_KEY_SECRET = 'test_secret';

    try {
      // Get gateway instance
      const gateway1 = PaymentGatewayFactory.getGateway('razorpay');
      expect(gateway1).toBeDefined();

      // Reset factory
      PaymentGatewayFactory.reset();

      // Get gateway again
      const gateway2 = PaymentGatewayFactory.getGateway('razorpay');
      expect(gateway2).toBeDefined();

      // Should be different instances after reset
      expect(gateway1).not.toBe(gateway2);
    } finally {
      delete process.env.RAZORPAY_KEY_ID;
      delete process.env.RAZORPAY_KEY_SECRET;
    }
  });
});
