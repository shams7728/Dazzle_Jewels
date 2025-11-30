/**
 * Property-Based Test for Order Data Persistence
 * 
 * Feature: order-management-system, Property 23: Order data persistence completeness
 * Validates: Requirements 12.1, 12.2
 * 
 * This test verifies that for any order creation, the system stores all required data
 * (customer info, items, prices, payment details, shipping address, timestamps) with a unique order number
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { orderService } from '../order-service';
import { supabase } from '../../supabase';
import type { CreateOrderInput, ShippingAddress, OrderItem } from '@/types/order-management';

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
    total: Math.max(0, total), // Ensure total is not negative
  };
}) as fc.Arbitrary<CreateOrderInput>;

describe('Order Data Persistence Property Test', () => {
  const createdOrderIds: string[] = [];

  afterEach(async () => {
    // Cleanup: Delete all created orders
    if (createdOrderIds.length > 0) {
      await supabase.from('order_items').delete().in('order_id', createdOrderIds);
      await supabase.from('orders').delete().in('id', createdOrderIds);
      createdOrderIds.length = 0;
    }
  });

  it('should persist all order data completely for any valid order input', async () => {
    await fc.assert(
      fc.asyncProperty(createOrderInputArbitrary, async (input) => {
        // Create the order
        const createdOrder = await orderService.createOrder(input);
        createdOrderIds.push(createdOrder.id);

        // Verify order was created with unique order number
        expect(createdOrder.id).toBeDefined();
        expect(createdOrder.order_number).toBeDefined();
        expect(createdOrder.order_number).toMatch(/^ORD-\d{4}-\d{6}$/);

        // Verify all customer information is persisted
        expect(createdOrder.user_id).toBe(input.user_id);

        // Verify all pricing information is persisted
        expect(createdOrder.subtotal).toBe(input.subtotal);
        expect(createdOrder.discount).toBe(input.discount);
        expect(createdOrder.coupon_code).toBe(input.coupon_code);
        expect(createdOrder.delivery_charge).toBe(input.delivery_charge);
        expect(createdOrder.tax).toBe(input.tax);
        expect(createdOrder.total).toBe(input.total);

        // Verify shipping address is persisted completely
        expect(createdOrder.shipping_address).toBeDefined();
        expect(createdOrder.shipping_address.name).toBe(input.shipping_address.name);
        expect(createdOrder.shipping_address.phone).toBe(input.shipping_address.phone);
        expect(createdOrder.shipping_address.street).toBe(input.shipping_address.street);
        expect(createdOrder.shipping_address.city).toBe(input.shipping_address.city);
        expect(createdOrder.shipping_address.state).toBe(input.shipping_address.state);
        expect(createdOrder.shipping_address.pincode).toBe(input.shipping_address.pincode);
        expect(createdOrder.shipping_address.country).toBe(input.shipping_address.country);
        expect(createdOrder.delivery_pincode).toBe(input.delivery_pincode);

        // Verify payment details are persisted
        expect(createdOrder.payment_method).toBe(input.payment_method);
        expect(createdOrder.payment_id).toBe(input.payment_id);
        expect(createdOrder.razorpay_order_id).toBe(input.razorpay_order_id);
        expect(createdOrder.payment_status).toBeDefined();

        // Verify timestamps are created
        expect(createdOrder.created_at).toBeDefined();
        expect(createdOrder.updated_at).toBeDefined();
        expect(new Date(createdOrder.created_at).getTime()).toBeLessThanOrEqual(Date.now());

        // Verify status and status history
        expect(createdOrder.status).toBeDefined();
        expect(['pending', 'confirmed']).toContain(createdOrder.status);
        expect(createdOrder.status_history).toBeDefined();
        expect(createdOrder.status_history.length).toBeGreaterThan(0);

        // Verify all items are persisted
        expect(createdOrder.items).toBeDefined();
        expect(createdOrder.items?.length).toBe(input.items.length);

        // Verify each item's data is complete
        for (let i = 0; i < input.items.length; i++) {
          const inputItem = input.items[i];
          const persistedItem = createdOrder.items?.find(
            item => item.product_id === inputItem.product_id && item.quantity === inputItem.quantity
          );

          expect(persistedItem).toBeDefined();
          expect(persistedItem?.product_name).toBe(inputItem.product_name);
          expect(persistedItem?.product_image).toBe(inputItem.product_image);
          expect(persistedItem?.variant_id).toBe(inputItem.variant_id);
          expect(persistedItem?.variant_name).toBe(inputItem.variant_name);
          expect(persistedItem?.quantity).toBe(inputItem.quantity);
          expect(persistedItem?.price).toBe(inputItem.price);
          expect(persistedItem?.subtotal).toBe(inputItem.subtotal);
        }

        // Verify we can retrieve the order by ID
        const retrievedOrder = await orderService.getOrderById(createdOrder.id);
        expect(retrievedOrder).toBeDefined();
        expect(retrievedOrder?.id).toBe(createdOrder.id);
        expect(retrievedOrder?.order_number).toBe(createdOrder.order_number);

        // Verify we can retrieve the order by order number
        const retrievedByNumber = await orderService.getOrderByNumber(createdOrder.order_number);
        expect(retrievedByNumber).toBeDefined();
        expect(retrievedByNumber?.id).toBe(createdOrder.id);
      }),
      { numRuns: 100 } // Run 100 iterations as specified in design
    );
  }, 60000); // 60 second timeout for property test

  it('should generate unique order numbers for concurrent orders', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(createOrderInputArbitrary, { minLength: 2, maxLength: 5 }),
        async (inputs) => {
          // Create multiple orders
          const orders = await Promise.all(
            inputs.map(input => orderService.createOrder(input))
          );

          orders.forEach(order => createdOrderIds.push(order.id));

          // Verify all order numbers are unique
          const orderNumbers = orders.map(o => o.order_number);
          const uniqueOrderNumbers = new Set(orderNumbers);
          expect(uniqueOrderNumbers.size).toBe(orderNumbers.length);

          // Verify all order numbers follow the format
          orderNumbers.forEach(num => {
            expect(num).toMatch(/^ORD-\d{4}-\d{6}$/);
          });
        }
      ),
      { numRuns: 20 } // Fewer runs for concurrent test
    );
  }, 60000);
});
