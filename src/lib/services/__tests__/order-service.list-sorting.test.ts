import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { orderService } from '../order-service';
import { supabase } from '../../supabase';
import type { CreateOrderInput, Order } from '@/types/order-management';

/**
 * Property Test: Order list sorting and completeness
 * Feature: order-management-system, Property 11: Order list sorting and completeness
 * Validates: Requirements 4.1, 4.2
 * 
 * This test verifies that:
 * 1. Orders are sorted by date (newest first)
 * 2. Each order displays all required fields (order number, date, total, status)
 */

describe('Order List Sorting and Completeness - Property Test', () => {
  let createdOrderIds: string[] = [];

  afterEach(async () => {
    // Clean up created orders
    if (createdOrderIds.length > 0) {
      await supabase.from('order_items').delete().in('order_id', createdOrderIds);
      await supabase.from('orders').delete().in('id', createdOrderIds);
      createdOrderIds = [];
    }
  });

  it('should sort orders by date (newest first) and include all required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a user ID and 2-5 orders with different timestamps
        fc.uuid(),
        fc.array(
          fc.record({
            subtotal: fc.integer({ min: 100, max: 10000 }),
            discount: fc.integer({ min: 0, max: 1000 }),
            delivery_charge: fc.integer({ min: 0, max: 500 }),
            tax: fc.integer({ min: 0, max: 1000 }),
            // Generate timestamps spread over the last 30 days
            daysAgo: fc.integer({ min: 0, max: 30 }),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (testUserId, orderSpecs) => {
          // Skip test if database is not available
          try {
            await supabase.from('orders').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }
          // Create orders with different timestamps
          const orders: Order[] = [];
          
          for (const spec of orderSpecs) {
            const total = spec.subtotal - spec.discount + spec.delivery_charge + spec.tax;
            
            const orderInput: CreateOrderInput = {
              user_id: testUserId,
              items: [
                {
                  product_id: `prod-${Math.random()}`,
                  product_name: 'Test Product',
                  product_image: '/test.jpg',
                  quantity: 1,
                  price: spec.subtotal,
                  subtotal: spec.subtotal,
                },
              ],
              subtotal: spec.subtotal,
              discount: spec.discount,
              delivery_charge: spec.delivery_charge,
              tax: spec.tax,
              total,
              shipping_address: {
                name: 'Test User',
                phone: '1234567890',
                street: '123 Test St',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                country: 'India',
              },
              delivery_pincode: '400001',
              payment_method: 'razorpay',
              payment_id: `pay_${Math.random()}`,
            };

            const order = await orderService.createOrder(orderInput);
            createdOrderIds.push(order.id);
            
            // Manually set created_at to simulate different order times
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - spec.daysAgo);
            
            await supabase
              .from('orders')
              .update({ created_at: createdAt.toISOString() })
              .eq('id', order.id);
            
            orders.push({ ...order, created_at: createdAt.toISOString() });
          }

          // Fetch orders using the service
          const result = await orderService.getOrders(
            { user_id: testUserId },
            { page: 1, limit: 20 }
          );

          // Property 1: Orders should be sorted by date (newest first)
          for (let i = 0; i < result.orders.length - 1; i++) {
            const currentDate = new Date(result.orders[i].created_at);
            const nextDate = new Date(result.orders[i + 1].created_at);
            expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
          }

          // Property 2: Each order should have all required fields
          for (const order of result.orders) {
            // Order number should exist and not be empty
            expect(order.order_number).toBeDefined();
            expect(order.order_number).not.toBe('');
            expect(order.order_number).toMatch(/^ORD-/);

            // Date should exist and be valid
            expect(order.created_at).toBeDefined();
            expect(new Date(order.created_at).toString()).not.toBe('Invalid Date');

            // Total should exist and be a valid number
            expect(order.total).toBeDefined();
            expect(typeof order.total).toBe('number');
            expect(order.total).toBeGreaterThan(0);

            // Status should exist and be valid
            expect(order.status).toBeDefined();
            expect(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
              .toContain(order.status);
          }

          // Property 3: All created orders should be returned
          expect(result.orders.length).toBe(orders.length);
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design
    );
  });

  it('should handle empty order list correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (testUserId) => {
          // Test with user who has no orders
          const result = await orderService.getOrders(
            { user_id: testUserId },
            { page: 1, limit: 20 }
          );

          expect(result.orders).toEqual([]);
          expect(result.total).toBe(0);
          expect(result.totalPages).toBe(0);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should maintain sort order across pagination', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a user ID and 15-25 orders to test pagination
        fc.uuid(),
        fc.integer({ min: 15, max: 25 }),
        async (testUserId, orderCount) => {
          // Create orders
          for (let i = 0; i < orderCount; i++) {
            const orderInput: CreateOrderInput = {
              user_id: testUserId,
              items: [
                {
                  product_id: `prod-${i}`,
                  product_name: `Product ${i}`,
                  quantity: 1,
                  price: 1000,
                  subtotal: 1000,
                },
              ],
              subtotal: 1000,
              discount: 0,
              delivery_charge: 50,
              tax: 100,
              total: 1150,
              shipping_address: {
                name: 'Test User',
                phone: '1234567890',
                street: '123 Test St',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                country: 'India',
              },
              delivery_pincode: '400001',
              payment_method: 'razorpay',
              payment_id: `pay_${i}`,
            };

            const order = await orderService.createOrder(orderInput);
            createdOrderIds.push(order.id);
            
            // Set different timestamps
            const createdAt = new Date();
            createdAt.setMinutes(createdAt.getMinutes() - i);
            
            await supabase
              .from('orders')
              .update({ created_at: createdAt.toISOString() })
              .eq('id', order.id);
          }

          // Fetch first page
          const page1 = await orderService.getOrders(
            { user_id: testUserId },
            { page: 1, limit: 10 }
          );

          // Fetch second page
          const page2 = await orderService.getOrders(
            { user_id: testUserId },
            { page: 2, limit: 10 }
          );

          // Property: Last order on page 1 should be older than first order on page 2
          if (page1.orders.length > 0 && page2.orders.length > 0) {
            const lastOnPage1 = new Date(page1.orders[page1.orders.length - 1].created_at);
            const firstOnPage2 = new Date(page2.orders[0].created_at);
            expect(lastOnPage1.getTime()).toBeGreaterThanOrEqual(firstOnPage2.getTime());
          }
        }
      ),
      { numRuns: 10 } // Fewer runs for this test as it creates many orders
    );
  });
});
