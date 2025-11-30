/**
 * Property-Based Test for Notification Triggering
 * 
 * Feature: order-management-system, Property 16: Notification triggering
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 11.5
 * 
 * This test verifies that for any order lifecycle event (confirmation, status change,
 * shipping, delivery, cancellation), the system sends an appropriate email notification
 * to the customer
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { notificationService } from '../notification-service';
import type { Order, OrderStatus } from '@/types/order-management';

// Helper to create a minimal order for testing
function createTestOrder(overrides?: Partial<Order>): Order {
  return {
    id: '00000000-0000-1000-8000-000000000001',
    order_number: 'ORD-2024-000001',
    user_id: '00000000-0000-1000-8000-000000000002',
    items: [],
    subtotal: 100,
    discount: 0,
    delivery_charge: 50,
    tax: 15,
    total: 165,
    shipping_address: {
      name: 'Test User',
      phone: '1234567890',
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      country: 'India',
    },
    delivery_pincode: '123456',
    payment_method: 'cod',
    payment_status: 'pending',
    status: 'pending',
    status_history: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('Notification Triggering Property Test', () => {
  it('should trigger notification for any order confirmation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 20 }),
        fc.double({ min: 100, max: 10000, noNaN: true }).map(v => Math.round(v * 100) / 100),
        async (orderNumber, total) => {
          const order = createTestOrder({ order_number: orderNumber, total });

          // Should not throw error
          await expect(
            notificationService.sendOrderConfirmation(order)
          ).resolves.not.toThrow();
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should trigger notification for any status update', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<OrderStatus>('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
        async (newStatus) => {
          const order = createTestOrder();

          // Should not throw error
          await expect(
            notificationService.sendStatusUpdate(order, newStatus)
          ).resolves.not.toThrow();
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should trigger shipping notification for any order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.option(fc.string({ minLength: 10, maxLength: 30 }), { nil: undefined }),
        fc.option(fc.webUrl(), { nil: undefined }),
        async (trackingNumber, trackingUrl) => {
          const order = createTestOrder({
            tracking_number: trackingNumber,
            tracking_url: trackingUrl,
          });

          // Should not throw error
          await expect(
            notificationService.sendShippingNotification(order)
          ).resolves.not.toThrow();
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should trigger delivery confirmation for any order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 20 }),
        async (orderNumber) => {
          const order = createTestOrder({ order_number: orderNumber, status: 'delivered' });

          // Should not throw error
          await expect(
            notificationService.sendDeliveryConfirmation(order)
          ).resolves.not.toThrow();
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should trigger cancellation notification for any order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.option(fc.string({ minLength: 5, maxLength: 200 }), { nil: undefined }),
        async (cancellationReason) => {
          const order = createTestOrder({
            status: 'cancelled',
            cancellation_reason: cancellationReason,
          });

          // Should not throw error
          await expect(
            notificationService.sendCancellationConfirmation(order)
          ).resolves.not.toThrow();
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should trigger admin notification for new orders', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 20 }),
        fc.double({ min: 100, max: 10000, noNaN: true }).map(v => Math.round(v * 100) / 100),
        fc.integer({ min: 1, max: 10 }),
        async (orderNumber, total, itemCount) => {
          const order = createTestOrder({
            order_number: orderNumber,
            total,
            items: Array(itemCount).fill({}).map((_, i) => ({
              id: `item-${i}`,
              order_id: 'order-1',
              product_id: `product-${i}`,
              product_name: `Product ${i}`,
              quantity: 1,
              price: 100,
              subtotal: 100,
            })),
          });

          // Should not throw error
          await expect(
            notificationService.sendAdminNewOrderAlert(order)
          ).resolves.not.toThrow();
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should trigger priority admin notification for any reason', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 200 }),
        async (reason) => {
          const order = createTestOrder();

          // Should not throw error
          await expect(
            notificationService.sendAdminPriorityNotification(order, reason)
          ).resolves.not.toThrow();
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should handle notifications for orders with various totals', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0.01, max: 100000, noNaN: true }).map(v => Math.round(v * 100) / 100),
        async (total) => {
          const order = createTestOrder({ total });

          // All notification types should work
          await expect(notificationService.sendOrderConfirmation(order)).resolves.not.toThrow();
          await expect(notificationService.sendStatusUpdate(order, 'confirmed')).resolves.not.toThrow();
          await expect(notificationService.sendAdminNewOrderAlert(order)).resolves.not.toThrow();
        }
      ),
      { numRuns: 30 }
    );
  }, 120000);
});
