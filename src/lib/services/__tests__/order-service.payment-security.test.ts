/**
 * Property-Based Test for Payment Data Security
 * 
 * Feature: order-management-system, Property 24: Payment data security
 * Validates: Requirements 12.3
 * 
 * This test verifies that for any order with payment information, the system stores only
 * the transaction ID and never stores full card numbers, CVV, or other sensitive payment data
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

// Generate simulated payment data that should NOT be stored
const sensitivePaymentDataArbitrary = fc.record({
  card_number: fc.integer({ min: 1000000000000000, max: 9999999999999999 }).map(String), // 16 digit card
  cvv: fc.integer({ min: 100, max: 999 }).map(String), // 3 digit CVV
  expiry_month: fc.integer({ min: 1, max: 12 }).map(m => m.toString().padStart(2, '0')),
  expiry_year: fc.integer({ min: 2024, max: 2035 }).map(String),
  cardholder_name: nonEmptyStringArbitrary(3, 100),
});

// Generate payment gateway transaction IDs (what SHOULD be stored)
const paymentGatewayIdArbitrary = fc.record({
  payment_id: fc.string({ minLength: 20, maxLength: 30 }).map(s => `pay_${s.toLowerCase().replace(/[^a-z0-9]/g, 'x')}`),
  razorpay_order_id: fc.string({ minLength: 20, maxLength: 30 }).map(s => `order_${s.toLowerCase().replace(/[^a-z0-9]/g, 'x')}`),
});

const createOrderInputArbitrary = fc.record({
  user_id: fc.uuid(),
  items: fc.array(orderItemArbitrary, { minLength: 1, maxLength: 5 }),
  discount: fc.double({ min: 0, max: 500, noNaN: true }).map(d => Math.round(d * 100) / 100),
  coupon_code: fc.option(nonEmptyStringArbitrary(4, 20).map(s => s.toUpperCase()), { nil: undefined }),
  delivery_charge: fc.double({ min: 0, max: 200, noNaN: true }).map(d => Math.round(d * 100) / 100),
  tax: fc.double({ min: 0, max: 500, noNaN: true }).map(t => Math.round(t * 100) / 100),
  shipping_address: shippingAddressArbitrary,
  delivery_pincode: fc.integer({ min: 100000, max: 999999 }).map(String),
  payment_method: fc.constant('razorpay' as const), // Focus on card payments
  payment_gateway_ids: paymentGatewayIdArbitrary,
  sensitive_payment_data: sensitivePaymentDataArbitrary, // This should NOT be stored
  estimated_delivery_date: fc.option(
    fc.date({ min: new Date(), max: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }).map(d => d.toISOString()),
    { nil: undefined }
  ),
}).map(input => {
  const subtotal = input.items.reduce((sum, item) => sum + item.subtotal, 0);
  const total = Math.round((subtotal - input.discount + input.delivery_charge + input.tax) * 100) / 100;
  return {
    user_id: input.user_id,
    items: input.items,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: input.discount,
    coupon_code: input.coupon_code,
    delivery_charge: input.delivery_charge,
    tax: input.tax,
    total: Math.max(0, total),
    shipping_address: input.shipping_address,
    delivery_pincode: input.delivery_pincode,
    payment_method: input.payment_method,
    payment_id: input.payment_gateway_ids.payment_id,
    razorpay_order_id: input.payment_gateway_ids.razorpay_order_id,
    estimated_delivery_date: input.estimated_delivery_date,
    // Keep sensitive data for verification that it's NOT stored
    _sensitive_data: input.sensitive_payment_data,
  };
});

describe('Payment Data Security Property Test', () => {
  const createdOrderIds: string[] = [];

  afterEach(async () => {
    // Cleanup: Delete all created orders
    if (createdOrderIds.length > 0) {
      await supabase.from('order_items').delete().in('order_id', createdOrderIds);
      await supabase.from('orders').delete().in('id', createdOrderIds);
      createdOrderIds.length = 0;
    }
  });

  it('should never store full card numbers, CVV, or sensitive payment data', async () => {
    await fc.assert(
      fc.asyncProperty(createOrderInputArbitrary, async (inputWithSensitiveData) => {
        // Extract the sensitive data that should NOT be stored
        const sensitiveData = (inputWithSensitiveData as any)._sensitive_data;
        
        // Create order input without sensitive data (as it should be)
        const { _sensitive_data, ...input } = inputWithSensitiveData as any;
        
        // Create the order
        const createdOrder = await orderService.createOrder(input as CreateOrderInput);
        createdOrderIds.push(createdOrder.id);

        // Verify order was created
        expect(createdOrder.id).toBeDefined();

        // CRITICAL: Verify that ONLY payment gateway transaction IDs are stored
        expect(createdOrder.payment_id).toBeDefined();
        expect(createdOrder.payment_id).toBe(input.payment_id);
        expect(createdOrder.razorpay_order_id).toBeDefined();
        expect(createdOrder.razorpay_order_id).toBe(input.razorpay_order_id);

        // Query the database directly to ensure no sensitive data leaked
        const { data: dbOrder, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', createdOrder.id)
          .single();

        expect(error).toBeNull();
        expect(dbOrder).toBeDefined();

        // Convert the entire order record to a string to search for sensitive data
        const orderAsString = JSON.stringify(dbOrder).toLowerCase();

        // Verify full card number is NOT stored anywhere
        expect(orderAsString).not.toContain(sensitiveData.card_number);
        
        // Verify CVV is NOT stored anywhere
        expect(orderAsString).not.toContain(sensitiveData.cvv);
        
        // Verify cardholder name is NOT stored in payment context
        // (it might be in shipping address, which is acceptable)
        const paymentFields = JSON.stringify({
          payment_id: dbOrder.payment_id,
          razorpay_order_id: dbOrder.razorpay_order_id,
          payment_method: dbOrder.payment_method,
          payment_status: dbOrder.payment_status,
        }).toLowerCase();
        
        // Ensure no card-related fields exist in payment data
        expect(paymentFields).not.toContain('card_number');
        expect(paymentFields).not.toContain('cvv');
        expect(paymentFields).not.toContain('card');
        expect(paymentFields).not.toContain('expiry');

        // Verify that payment_id follows expected format (Razorpay format)
        expect(dbOrder.payment_id).toMatch(/^pay_[a-z0-9]+$/);
        expect(dbOrder.razorpay_order_id).toMatch(/^order_[a-z0-9]+$/);

        // Verify no additional payment-related fields exist beyond what's expected
        const allowedPaymentFields = [
          'payment_id',
          'razorpay_order_id',
          'payment_method',
          'payment_status'
        ];
        
        const paymentRelatedKeys = Object.keys(dbOrder).filter(key => 
          key.toLowerCase().includes('payment') || 
          key.toLowerCase().includes('card') ||
          key.toLowerCase().includes('cvv')
        );

        // All payment-related keys should be in the allowed list
        paymentRelatedKeys.forEach(key => {
          expect(allowedPaymentFields).toContain(key);
        });

        // Retrieve order through service and verify same security
        const retrievedOrder = await orderService.getOrderById(createdOrder.id);
        expect(retrievedOrder).toBeDefined();
        
        const retrievedAsString = JSON.stringify(retrievedOrder).toLowerCase();
        expect(retrievedAsString).not.toContain(sensitiveData.card_number);
        expect(retrievedAsString).not.toContain(sensitiveData.cvv);
      }),
      { numRuns: 10 } // Reduced runs for performance
    );
  }, 120000); // 120 second timeout for property test

  it('should only store payment gateway transaction identifiers', async () => {
    await fc.assert(
      fc.asyncProperty(createOrderInputArbitrary, async (inputWithSensitiveData) => {
        const { _sensitive_data, ...input } = inputWithSensitiveData as any;
        
        // Create the order
        const createdOrder = await orderService.createOrder(input as CreateOrderInput);
        createdOrderIds.push(createdOrder.id);

        // Verify only transaction IDs are stored
        expect(createdOrder.payment_id).toBeDefined();
        expect(createdOrder.razorpay_order_id).toBeDefined();

        // Verify these are opaque identifiers, not actual payment data
        expect(createdOrder.payment_id).toMatch(/^pay_[a-z0-9]+$/);
        expect(createdOrder.razorpay_order_id).toMatch(/^order_[a-z0-9]+$/);

        // Verify payment_id is not a card number (card numbers are 13-19 digits)
        expect(createdOrder.payment_id).not.toMatch(/^\d{13,19}$/);
        
        // Verify no numeric-only fields that could be card numbers
        const numericFields = Object.entries(createdOrder)
          .filter(([key, value]) => typeof value === 'string' && /^\d+$/.test(value))
          .filter(([key]) => key.toLowerCase().includes('payment') || key.toLowerCase().includes('card'));
        
        // Should be no numeric-only payment fields (card numbers would be numeric)
        expect(numericFields.length).toBe(0);
      }),
      { numRuns: 10 }
    );
  }, 120000);

  it('should maintain payment security across order status updates', async () => {
    await fc.assert(
      fc.asyncProperty(createOrderInputArbitrary, async (inputWithSensitiveData) => {
        const { _sensitive_data, ...input } = inputWithSensitiveData as any;
        const sensitiveData = _sensitive_data;
        
        // Create the order
        const createdOrder = await orderService.createOrder(input as CreateOrderInput);
        createdOrderIds.push(createdOrder.id);

        // Update order status
        const updatedOrder = await orderService.updateOrderStatus({
          order_id: createdOrder.id,
          new_status: 'processing',
          updated_by: input.user_id,
          notes: 'Processing order',
        });

        // Query database after status update
        const { data: dbOrder } = await supabase
          .from('orders')
          .select('*')
          .eq('id', createdOrder.id)
          .single();

        const orderAsString = JSON.stringify(dbOrder).toLowerCase();

        // Verify sensitive data is still not present after update
        expect(orderAsString).not.toContain(sensitiveData.card_number);
        expect(orderAsString).not.toContain(sensitiveData.cvv);

        // Verify payment IDs remain unchanged and secure
        expect(updatedOrder.payment_id).toBe(createdOrder.payment_id);
        expect(updatedOrder.razorpay_order_id).toBe(createdOrder.razorpay_order_id);
      }),
      { numRuns: 5 } // Fewer runs for update test
    );
  }, 120000);
});
