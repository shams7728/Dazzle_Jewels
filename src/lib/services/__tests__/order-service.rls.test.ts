/**
 * Property-Based Test for Row-Level Security
 * 
 * Feature: order-management-system, Property 26: Row-level security enforcement
 * Validates: Requirements 12.5
 * 
 * This test verifies that for any order query by a customer, the system only returns
 * orders belonging to that customer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { orderService } from '../order-service';
import { supabase } from '../../supabase';
import type { CreateOrderInput } from '@/types/order-management';

// Helper to create a minimal valid order input
function createMinimalOrderInput(userId: string): CreateOrderInput {
  return {
    user_id: userId,
    items: [{
      product_id: '00000000-0000-1000-8000-000000000001',
      product_name: 'Test Product',
      quantity: 1,
      price: 100,
      subtotal: 100,
    }],
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
  };
}

describe('Row-Level Security Property Test', () => {
  const createdOrderIds: string[] = [];

  afterEach(async () => {
    // Cleanup: Delete all created orders
    if (createdOrderIds.length > 0) {
      await supabase.from('order_items').delete().in('order_id', createdOrderIds);
      await supabase.from('orders').delete().in('id', createdOrderIds);
      createdOrderIds.length = 0;
    }
  });

  it('should only return orders belonging to the requesting user', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.uuid(), { minLength: 2, maxLength: 5 }).map(arr => [...new Set(arr)]), // Unique user IDs
        async (userIds) => {
          // Ensure we have at least 2 unique users
          if (userIds.length < 2) {
            userIds.push(fc.sample(fc.uuid(), 1)[0]);
          }

          // Create orders for different users
          const ordersPerUser: Record<string, string[]> = {};
          
          for (const userId of userIds) {
            const numOrders = Math.floor(Math.random() * 3) + 1; // 1-3 orders per user
            ordersPerUser[userId] = [];
            
            for (let i = 0; i < numOrders; i++) {
              const orderInput = createMinimalOrderInput(userId);
              const order = await orderService.createOrder(orderInput);
              createdOrderIds.push(order.id);
              ordersPerUser[userId].push(order.id);
            }
          }

          // For each user, verify they can only see their own orders
          for (const userId of userIds) {
            const userOrders = await orderService.getOrders({ user_id: userId });
            
            // All returned orders should belong to this user
            for (const order of userOrders.orders) {
              expect(order.user_id).toBe(userId);
            }

            // The count should match the number of orders created for this user
            expect(userOrders.orders.length).toBe(ordersPerUser[userId].length);

            // Verify the order IDs match
            const returnedOrderIds = userOrders.orders.map(o => o.id).sort();
            const expectedOrderIds = ordersPerUser[userId].sort();
            expect(returnedOrderIds).toEqual(expectedOrderIds);
          }

          // Verify that querying without user_id returns all orders (admin view)
          const allOrders = await orderService.getOrders({});
          expect(allOrders.orders.length).toBeGreaterThanOrEqual(createdOrderIds.length);
        }
      ),
      { numRuns: 20 } // Fewer runs since this creates multiple orders
    );
  }, 120000); // 2 minute timeout

  it('should prevent users from accessing other users orders by ID', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(fc.uuid(), fc.uuid()).filter(([u1, u2]) => u1 !== u2),
        async ([user1Id, user2Id]) => {
          // Create an order for user1
          const order1Input = createMinimalOrderInput(user1Id);
          const order1 = await orderService.createOrder(order1Input);
          createdOrderIds.push(order1.id);

          // Create an order for user2
          const order2Input = createMinimalOrderInput(user2Id);
          const order2 = await orderService.createOrder(order2Input);
          createdOrderIds.push(order2.id);

          // User1 should be able to access their own order
          const user1Order = await orderService.getOrderById(order1.id, user1Id);
          expect(user1Order).not.toBeNull();
          expect(user1Order?.id).toBe(order1.id);

          // User1 should NOT be able to access user2's order
          const user1AccessToUser2Order = await orderService.getOrderById(order2.id, user1Id);
          expect(user1AccessToUser2Order).toBeNull();

          // User2 should be able to access their own order
          const user2Order = await orderService.getOrderById(order2.id, user2Id);
          expect(user2Order).not.toBeNull();
          expect(user2Order?.id).toBe(order2.id);

          // User2 should NOT be able to access user1's order
          const user2AccessToUser1Order = await orderService.getOrderById(order1.id, user2Id);
          expect(user2AccessToUser1Order).toBeNull();
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should prevent users from accessing other users orders by order number', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(fc.uuid(), fc.uuid()).filter(([u1, u2]) => u1 !== u2),
        async ([user1Id, user2Id]) => {
          // Create orders for both users
          const order1Input = createMinimalOrderInput(user1Id);
          const order1 = await orderService.createOrder(order1Input);
          createdOrderIds.push(order1.id);

          const order2Input = createMinimalOrderInput(user2Id);
          const order2 = await orderService.createOrder(order2Input);
          createdOrderIds.push(order2.id);

          // User1 can access their order by number
          const user1OrderByNumber = await orderService.getOrderByNumber(order1.order_number, user1Id);
          expect(user1OrderByNumber).not.toBeNull();
          expect(user1OrderByNumber?.order_number).toBe(order1.order_number);

          // User1 cannot access user2's order by number
          const user1AccessByNumber = await orderService.getOrderByNumber(order2.order_number, user1Id);
          expect(user1AccessByNumber).toBeNull();

          // User2 can access their order by number
          const user2OrderByNumber = await orderService.getOrderByNumber(order2.order_number, user2Id);
          expect(user2OrderByNumber).not.toBeNull();
          expect(user2OrderByNumber?.order_number).toBe(order2.order_number);

          // User2 cannot access user1's order by number
          const user2AccessByNumber = await orderService.getOrderByNumber(order1.order_number, user2Id);
          expect(user2AccessByNumber).toBeNull();
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);
});
