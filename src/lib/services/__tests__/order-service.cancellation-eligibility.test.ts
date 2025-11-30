import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { orderService } from '../order-service';
import { supabase } from '../../supabase';
import type { CreateOrderInput, OrderStatus, UpdateOrderStatusInput } from '@/types/order-management';

/**
 * Property Test: Order cancellation eligibility
 * Feature: order-management-system, Property 21: Order cancellation eligibility
 * Validates: Requirements 11.1, 11.4
 * 
 * This test verifies that:
 * - Orders with status "pending" or "confirmed" can be cancelled
 * - Orders with status "processing" or "shipped" cannot be cancelled
 * - The cancel button visibility is determined by order status
 */

describe('Order Cancellation Eligibility Property Test', () => {
  const createdOrderIds: string[] = [];

  afterEach(async () => {
    // Cleanup: Delete all created orders
    if (createdOrderIds.length > 0) {
      await supabase.from('order_items').delete().in('order_id', createdOrderIds);
      await supabase.from('orders').delete().in('id', createdOrderIds);
      createdOrderIds.length = 0;
    }
  });

  it('should allow cancellation for pending and confirmed orders only', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // user_id
        fc.constantFrom<OrderStatus>('pending', 'confirmed', 'processing', 'shipped', 'delivered'),
        async (userId, orderStatus) => {
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

          // Progress order to target status if needed
          if (orderStatus !== 'pending') {
            const statusProgression: OrderStatus[] = ['confirmed', 'processing', 'shipped', 'delivered'];
            const targetIndex = statusProgression.indexOf(orderStatus);
            
            if (targetIndex >= 0) {
              for (let i = 0; i <= targetIndex; i++) {
                const updateInput: UpdateOrderStatusInput = {
                  order_id: order.id,
                  new_status: statusProgression[i],
                  updated_by: userId,
                };
                await orderService.updateOrderStatus(updateInput);
              }
            }
          }

          // Retrieve the updated order
          const updatedOrder = await orderService.getOrderById(order.id, userId);
          expect(updatedOrder).toBeDefined();
          if (!updatedOrder) return;

          // Property 1: Cancellation eligibility based on status
          const canCancel = ['pending', 'confirmed'].includes(updatedOrder.status);
          
          if (canCancel) {
            // Should be able to cancel
            const cancelResult = await orderService.cancelOrder({
              order_id: updatedOrder.id,
              user_id: userId,
              cancellation_reason: 'Test cancellation',
            });

            expect(cancelResult.status).toBe('cancelled');
            expect(cancelResult.cancelled_at).toBeDefined();
            expect(cancelResult.cancellation_reason).toBeDefined();
          } else {
            // Should NOT be able to cancel
            await expect(
              orderService.cancelOrder({
                order_id: updatedOrder.id,
                user_id: userId,
                cancellation_reason: 'Test cancellation',
              })
            ).rejects.toThrow();
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design
    );
  }, 120000); // 2 minute timeout

  it('should hide cancel button for processing and shipped orders', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.constantFrom<OrderStatus>('processing', 'shipped', 'delivered'),
        async (userId, orderStatus) => {
          // Skip test if database is not available
          try {
            await supabase.from('orders').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create and progress order
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

          // Progress to target status
          const statusProgression: OrderStatus[] = ['confirmed', 'processing', 'shipped', 'delivered'];
          const targetIndex = statusProgression.indexOf(orderStatus);
          
          for (let i = 0; i <= targetIndex; i++) {
            const updateInput: UpdateOrderStatusInput = {
              order_id: order.id,
              new_status: statusProgression[i],
              updated_by: userId,
            };
            await orderService.updateOrderStatus(updateInput);
          }

          // Retrieve the order
          const updatedOrder = await orderService.getOrderById(order.id, userId);
          expect(updatedOrder).toBeDefined();
          if (!updatedOrder) return;

          // Property: Cancel button should be hidden (cancellation should fail)
          const canCancel = ['pending', 'confirmed'].includes(updatedOrder.status);
          expect(canCancel).toBe(false);

          // Attempting to cancel should throw an error
          await expect(
            orderService.cancelOrder({
              order_id: updatedOrder.id,
              user_id: userId,
              cancellation_reason: 'Test cancellation',
            })
          ).rejects.toThrow(/Cannot cancel order with status/);
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should show cancel button for pending and confirmed orders', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.constantFrom<OrderStatus>('pending', 'confirmed'),
        async (userId, orderStatus) => {
          // Skip test if database is not available
          try {
            await supabase.from('orders').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create order
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

          // Progress to confirmed if needed
          if (orderStatus === 'confirmed') {
            await orderService.updateOrderStatus({
              order_id: order.id,
              new_status: 'confirmed',
              updated_by: userId,
            });
          }

          // Retrieve the order
          const updatedOrder = await orderService.getOrderById(order.id, userId);
          expect(updatedOrder).toBeDefined();
          if (!updatedOrder) return;

          // Property: Cancel button should be visible (cancellation should succeed)
          const canCancel = ['pending', 'confirmed'].includes(updatedOrder.status);
          expect(canCancel).toBe(true);

          // Should be able to cancel successfully
          const cancelledOrder = await orderService.cancelOrder({
            order_id: updatedOrder.id,
            user_id: userId,
            cancellation_reason: 'Test cancellation',
          });

          expect(cancelledOrder.status).toBe('cancelled');
        }
      ),
      { numRuns: 50 }
    );
  }, 120000);

  it('should not allow cancellation of already cancelled orders', async () => {
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

          // Create and cancel an order
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

          // Cancel the order
          await orderService.cancelOrder({
            order_id: order.id,
            user_id: userId,
            cancellation_reason: 'First cancellation',
          });

          // Retrieve the cancelled order
          const cancelledOrder = await orderService.getOrderById(order.id, userId);
          expect(cancelledOrder?.status).toBe('cancelled');

          // Property: Attempting to cancel again should fail
          await expect(
            orderService.cancelOrder({
              order_id: order.id,
              user_id: userId,
              cancellation_reason: 'Second cancellation attempt',
            })
          ).rejects.toThrow(/Cannot cancel order with status/);
        }
      ),
      { numRuns: 20 }
    );
  }, 60000);
});
