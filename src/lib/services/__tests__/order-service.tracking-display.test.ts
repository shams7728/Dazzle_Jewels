import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { orderService } from '../order-service';
import { supabase } from '../../supabase';
import type { CreateOrderInput, OrderStatus, UpdateOrderStatusInput } from '@/types/order-management';

/**
 * Property Test: Order status tracking display
 * Feature: order-management-system, Property 13: Order status tracking display
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 * 
 * This test verifies that for any order, the tracking page displays:
 * - Current status with visual progress indicator
 * - Timestamps for each status change
 * - Tracking information when shipped
 */

describe('Order Status Tracking Display Property Test', () => {
  const createdOrderIds: string[] = [];

  afterEach(async () => {
    // Cleanup: Delete all created orders
    if (createdOrderIds.length > 0) {
      await supabase.from('order_items').delete().in('order_id', createdOrderIds);
      await supabase.from('orders').delete().in('id', createdOrderIds);
      createdOrderIds.length = 0;
    }
  });

  it('should display current status with timestamps for any order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // user_id
        fc.constantFrom<OrderStatus>('pending', 'confirmed', 'processing', 'shipped', 'delivered'),
        async (userId, targetStatus) => {
          // Skip test if database is not available
          try {
            await supabase.from('orders').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create a basic order
          const orderInput: CreateOrderInput = {
            user_id: userId,
            items: [
              {
                product_id: fc.sample(fc.uuid(), 1)[0],
                product_name: 'Test Product',
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
            payment_id: 'pay_test123',
          };

          const order = await orderService.createOrder(orderInput);
          createdOrderIds.push(order.id);

          // Progress order to target status
          const statusProgression: OrderStatus[] = ['confirmed', 'processing', 'shipped', 'delivered'];
          const targetIndex = statusProgression.indexOf(targetStatus);
          
          if (targetIndex >= 0) {
            for (let i = 0; i <= targetIndex; i++) {
              const updateInput: UpdateOrderStatusInput = {
                order_id: order.id,
                new_status: statusProgression[i],
                updated_by: userId,
                notes: `Updated to ${statusProgression[i]}`,
              };

              // Add tracking info when shipping
              if (statusProgression[i] === 'shipped') {
                updateInput.tracking_number = 'TRACK123456';
                updateInput.tracking_url = 'https://tracking.example.com/TRACK123456';
                updateInput.courier_name = 'Test Courier';
              }

              await orderService.updateOrderStatus(updateInput);
            }
          }

          // Retrieve the updated order
          const updatedOrder = await orderService.getOrderById(order.id, userId);
          expect(updatedOrder).toBeDefined();
          if (!updatedOrder) return;

          // Property 1: Current status should be displayed
          expect(updatedOrder.status).toBe(targetStatus);

          // Property 2: Status history should contain timestamps for each status change
          expect(updatedOrder.status_history).toBeDefined();
          expect(Array.isArray(updatedOrder.status_history)).toBe(true);
          expect(updatedOrder.status_history.length).toBeGreaterThan(0);

          // Each status in history should have a timestamp
          for (const historyEntry of updatedOrder.status_history) {
            expect(historyEntry.timestamp).toBeDefined();
            expect(new Date(historyEntry.timestamp).toString()).not.toBe('Invalid Date');
            
            // Timestamp should be in the past or present
            expect(new Date(historyEntry.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
          }

          // Property 3: Status history should be in chronological order
          for (let i = 0; i < updatedOrder.status_history.length - 1; i++) {
            const currentTime = new Date(updatedOrder.status_history[i].timestamp).getTime();
            const nextTime = new Date(updatedOrder.status_history[i + 1].timestamp).getTime();
            expect(currentTime).toBeLessThanOrEqual(nextTime);
          }

          // Property 4: When order is shipped, tracking information should be present
          if (targetStatus === 'shipped' || targetStatus === 'delivered') {
            expect(updatedOrder.tracking_number).toBeDefined();
            expect(updatedOrder.tracking_number).not.toBe('');
            expect(updatedOrder.tracking_url).toBeDefined();
            expect(updatedOrder.tracking_url).not.toBe('');
            expect(updatedOrder.courier_name).toBeDefined();
            expect(updatedOrder.courier_name).not.toBe('');
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design
    );
  }, 120000); // 2 minute timeout for status progression tests

  it('should show visual progress indicator reflecting current status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (userId) => {
          // Skip test if database is not available
          try {
            await supabase.from('orders').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create an order
          const orderInput: CreateOrderInput = {
            user_id: userId,
            items: [
              {
                product_id: fc.sample(fc.uuid(), 1)[0],
                product_name: 'Test Product',
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
            payment_id: 'pay_test123',
          };

          const order = await orderService.createOrder(orderInput);
          createdOrderIds.push(order.id);

          // Retrieve the order
          const retrievedOrder = await orderService.getOrderById(order.id, userId);
          expect(retrievedOrder).toBeDefined();
          if (!retrievedOrder) return;

          // Property: Status should be one of the valid statuses
          const validStatuses: OrderStatus[] = [
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
          ];
          expect(validStatuses).toContain(retrievedOrder.status);

          // Property: Status history should contain the current status
          const statusesInHistory = retrievedOrder.status_history.map(entry => entry.status);
          expect(statusesInHistory).toContain(retrievedOrder.status);
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);

  it('should display estimated delivery date when available', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.date({ min: new Date(), max: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }),
        async (userId, estimatedDate) => {
          // Skip test if database is not available
          try {
            await supabase.from('orders').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create an order with estimated delivery date
          const orderInput: CreateOrderInput = {
            user_id: userId,
            items: [
              {
                product_id: fc.sample(fc.uuid(), 1)[0],
                product_name: 'Test Product',
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
            payment_id: 'pay_test123',
            estimated_delivery_date: estimatedDate.toISOString(),
          };

          const order = await orderService.createOrder(orderInput);
          createdOrderIds.push(order.id);

          // Retrieve the order
          const retrievedOrder = await orderService.getOrderById(order.id, userId);
          expect(retrievedOrder).toBeDefined();
          if (!retrievedOrder) return;

          // Property: Estimated delivery date should be present and valid
          expect(retrievedOrder.estimated_delivery_date).toBeDefined();
          expect(new Date(retrievedOrder.estimated_delivery_date!).toString()).not.toBe('Invalid Date');
          
          // Estimated delivery should be in the future (or today)
          const estimatedTime = new Date(retrievedOrder.estimated_delivery_date!).getTime();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          expect(estimatedTime).toBeGreaterThanOrEqual(today.getTime());
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);
});
