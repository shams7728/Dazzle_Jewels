import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { orderService } from '../order-service';
import { supabase } from '../../supabase';
import type { CreateOrderInput, ShippingAddress, OrderItem } from '@/types/order-management';

/**
 * Property Test: Order detail completeness
 * Feature: order-management-system, Property 12: Order detail completeness
 * Validates: Requirements 4.3, 7.1, 7.2, 7.3, 7.4
 * 
 * This test verifies that for any order viewed by customer or admin,
 * the detail page displays all required information including:
 * - Items with images, quantities, prices
 * - Pricing breakdown (subtotal, discount, delivery, tax, total)
 * - Shipping address
 * - Payment information (method, transaction ID)
 * - Status history with timestamps
 */

// Arbitraries for generating test data
const nonEmptyStringArbitrary = (minLength: number, maxLength: number) =>
  fc.string({ minLength, maxLength })
    .filter(s => s.trim().length > 0);

const shippingAddressArbitrary = fc.record({
  name: nonEmptyStringArbitrary(1, 100),
  phone: fc.integer({ min: 1000000000, max: 9999999999 }).map(String),
  street: nonEmptyStringArbitrary(5, 200),
  city: nonEmptyStringArbitrary(2, 50),
  state: nonEmptyStringArbitrary(2, 50),
  pincode: fc.integer({ min: 100000, max: 999999 }).map(String),
  country: fc.constant('India'),
  latitude: fc.option(fc.double({ min: -90, max: 90 }), { nil: undefined }),
  longitude: fc.option(fc.double({ min: -180, max: 180 }), { nil: undefined }),
}) as fc.Arbitrary<ShippingAddress>;

const orderItemArbitrary = fc.record({
  product_id: fc.uuid(),
  product_name: nonEmptyStringArbitrary(1, 200),
  product_image: fc.option(fc.webUrl(), { nil: undefined }),
  variant_id: fc.option(fc.uuid(), { nil: undefined }),
  variant_name: fc.option(nonEmptyStringArbitrary(1, 100), { nil: undefined }),
  quantity: fc.integer({ min: 1, max: 10 }),
  price: fc.double({ min: 1, max: 10000, noNaN: true }).map(p => Math.round(p * 100) / 100),
}).map(item => ({
  ...item,
  subtotal: Math.round(item.price * item.quantity * 100) / 100,
})) as fc.Arbitrary<Omit<OrderItem, 'id' | 'order_id'>>;

const createOrderInputArbitrary = fc.record({
  user_id: fc.uuid(),
  items: fc.array(orderItemArbitrary, { minLength: 1, maxLength: 5 }),
  discount: fc.double({ min: 0, max: 500, noNaN: true }).map(d => Math.round(d * 100) / 100),
  coupon_code: fc.option(nonEmptyStringArbitrary(4, 20).map(s => s.toUpperCase()), { nil: undefined }),
  delivery_charge: fc.double({ min: 0, max: 200, noNaN: true }).map(d => Math.round(d * 100) / 100),
  tax: fc.double({ min: 0, max: 500, noNaN: true }).map(t => Math.round(t * 100) / 100),
  shipping_address: shippingAddressArbitrary,
  delivery_pincode: fc.integer({ min: 100000, max: 999999 }).map(String),
  payment_method: fc.constantFrom('razorpay' as const, 'cod' as const),
  payment_id: fc.option(nonEmptyStringArbitrary(10, 50), { nil: undefined }),
  razorpay_order_id: fc.option(nonEmptyStringArbitrary(10, 50), { nil: undefined }),
  estimated_delivery_date: fc.option(
    fc.date({ min: new Date(), max: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }).map(d => d.toISOString()),
    { nil: undefined }
  ),
}).map(input => {
  const subtotal = input.items.reduce((sum, item) => sum + item.subtotal, 0);
  const total = Math.round((subtotal - input.discount + input.delivery_charge + input.tax) * 100) / 100;
  return {
    ...input,
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.max(0, total),
  };
}) as fc.Arbitrary<CreateOrderInput>;

describe('Order Detail Completeness Property Test', () => {
  const createdOrderIds: string[] = [];

  afterEach(async () => {
    // Cleanup: Delete all created orders
    if (createdOrderIds.length > 0) {
      await supabase.from('order_items').delete().in('order_id', createdOrderIds);
      await supabase.from('orders').delete().in('id', createdOrderIds);
      createdOrderIds.length = 0;
    }
  });

  it('should display all required order information for any order', async () => {
    await fc.assert(
      fc.asyncProperty(createOrderInputArbitrary, async (input) => {
        // Skip test if database is not available
        try {
          await supabase.from('orders').select('id').limit(1);
        } catch (error) {
          console.log('Skipping test - database not available');
          return;
        }

        // Create the order
        const createdOrder = await orderService.createOrder(input);
        createdOrderIds.push(createdOrder.id);

        // Retrieve the order (simulating what the detail page does)
        const retrievedOrder = await orderService.getOrderById(createdOrder.id, input.user_id);
        
        expect(retrievedOrder).toBeDefined();
        if (!retrievedOrder) return;

        // Property 1: Items should be displayed with all details
        expect(retrievedOrder.items).toBeDefined();
        expect(retrievedOrder.items?.length).toBe(input.items.length);
        
        for (const item of retrievedOrder.items || []) {
          // Each item should have image (or null), quantity, and price
          expect(item.product_name).toBeDefined();
          expect(item.product_name).not.toBe('');
          expect(item.quantity).toBeGreaterThan(0);
          expect(item.price).toBeGreaterThanOrEqual(0);
          expect(item.subtotal).toBe(item.price * item.quantity);
        }

        // Property 2: Pricing breakdown should be complete
        expect(retrievedOrder.subtotal).toBeDefined();
        expect(typeof retrievedOrder.subtotal).toBe('number');
        expect(retrievedOrder.subtotal).toBeGreaterThan(0);

        expect(retrievedOrder.discount).toBeDefined();
        expect(typeof retrievedOrder.discount).toBe('number');
        expect(retrievedOrder.discount).toBeGreaterThanOrEqual(0);

        expect(retrievedOrder.delivery_charge).toBeDefined();
        expect(typeof retrievedOrder.delivery_charge).toBe('number');
        expect(retrievedOrder.delivery_charge).toBeGreaterThanOrEqual(0);

        expect(retrievedOrder.tax).toBeDefined();
        expect(typeof retrievedOrder.tax).toBe('number');
        expect(retrievedOrder.tax).toBeGreaterThanOrEqual(0);

        expect(retrievedOrder.total).toBeDefined();
        expect(typeof retrievedOrder.total).toBe('number');
        expect(retrievedOrder.total).toBeGreaterThan(0);

        // Verify total calculation
        const expectedTotal = Math.round(
          (retrievedOrder.subtotal - retrievedOrder.discount + 
           retrievedOrder.delivery_charge + retrievedOrder.tax) * 100
        ) / 100;
        expect(retrievedOrder.total).toBe(expectedTotal);

        // Property 3: Shipping address should be complete
        expect(retrievedOrder.shipping_address).toBeDefined();
        expect(retrievedOrder.shipping_address.name).toBeDefined();
        expect(retrievedOrder.shipping_address.name).not.toBe('');
        expect(retrievedOrder.shipping_address.phone).toBeDefined();
        expect(retrievedOrder.shipping_address.phone).not.toBe('');
        expect(retrievedOrder.shipping_address.street).toBeDefined();
        expect(retrievedOrder.shipping_address.street).not.toBe('');
        expect(retrievedOrder.shipping_address.city).toBeDefined();
        expect(retrievedOrder.shipping_address.city).not.toBe('');
        expect(retrievedOrder.shipping_address.state).toBeDefined();
        expect(retrievedOrder.shipping_address.state).not.toBe('');
        expect(retrievedOrder.shipping_address.pincode).toBeDefined();
        expect(retrievedOrder.shipping_address.pincode).not.toBe('');
        expect(retrievedOrder.shipping_address.country).toBeDefined();
        expect(retrievedOrder.shipping_address.country).not.toBe('');

        // Property 4: Payment information should be present
        expect(retrievedOrder.payment_method).toBeDefined();
        expect(['razorpay', 'cod']).toContain(retrievedOrder.payment_method);
        
        expect(retrievedOrder.payment_status).toBeDefined();
        expect(['pending', 'completed', 'failed', 'refunded']).toContain(retrievedOrder.payment_status);

        // If payment was made via Razorpay, transaction ID should be present
        if (input.payment_id) {
          expect(retrievedOrder.payment_id).toBe(input.payment_id);
        }

        // Property 5: Status history should be present with timestamps
        expect(retrievedOrder.status_history).toBeDefined();
        expect(Array.isArray(retrievedOrder.status_history)).toBe(true);
        expect(retrievedOrder.status_history.length).toBeGreaterThan(0);

        for (const historyEntry of retrievedOrder.status_history) {
          expect(historyEntry.status).toBeDefined();
          expect(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
            .toContain(historyEntry.status);
          
          expect(historyEntry.timestamp).toBeDefined();
          expect(new Date(historyEntry.timestamp).toString()).not.toBe('Invalid Date');
          
          expect(historyEntry.updated_by).toBeDefined();
          expect(historyEntry.updated_by).not.toBe('');
        }

        // Property 6: Order should have timestamps
        expect(retrievedOrder.created_at).toBeDefined();
        expect(new Date(retrievedOrder.created_at).toString()).not.toBe('Invalid Date');
        
        expect(retrievedOrder.updated_at).toBeDefined();
        expect(new Date(retrievedOrder.updated_at).toString()).not.toBe('Invalid Date');
      }),
      { numRuns: 100 } // Run 100 iterations as specified in design
    );
  }, 60000); // 60 second timeout

  it('should allow both customer and admin to view order details', async () => {
    await fc.assert(
      fc.asyncProperty(
        createOrderInputArbitrary,
        fc.uuid(), // Admin user ID
        async (input, adminUserId) => {
          // Skip test if database is not available
          try {
            await supabase.from('orders').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create the order
          const createdOrder = await orderService.createOrder(input);
          createdOrderIds.push(createdOrder.id);

          // Customer should be able to view their own order
          const customerView = await orderService.getOrderById(createdOrder.id, input.user_id);
          expect(customerView).toBeDefined();
          expect(customerView?.id).toBe(createdOrder.id);

          // Admin should be able to view any order (no user_id filter)
          const adminView = await orderService.getOrderById(createdOrder.id);
          expect(adminView).toBeDefined();
          expect(adminView?.id).toBe(createdOrder.id);

          // Customer should NOT be able to view another user's order
          const otherUserView = await orderService.getOrderById(createdOrder.id, adminUserId);
          expect(otherUserView).toBeNull();
        }
      ),
      { numRuns: 20 }
    );
  }, 60000);

  it('should display coupon information when discount is applied', async () => {
    await fc.assert(
      fc.asyncProperty(
        createOrderInputArbitrary.filter(input => input.discount > 0 && input.coupon_code),
        async (input) => {
          // Skip test if database is not available
          try {
            await supabase.from('orders').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create the order with discount
          const createdOrder = await orderService.createOrder(input);
          createdOrderIds.push(createdOrder.id);

          // Retrieve the order
          const retrievedOrder = await orderService.getOrderById(createdOrder.id, input.user_id);
          
          expect(retrievedOrder).toBeDefined();
          if (!retrievedOrder) return;

          // Should display discount amount
          expect(retrievedOrder.discount).toBeGreaterThan(0);
          
          // Should display coupon code
          expect(retrievedOrder.coupon_code).toBeDefined();
          expect(retrievedOrder.coupon_code).not.toBe('');
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);
});
