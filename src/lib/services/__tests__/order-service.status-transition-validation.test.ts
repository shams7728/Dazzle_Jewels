import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { orderService } from '../order-service';
import { supabase } from '../../supabase';
import type { CreateOrderInput, OrderStatus } from '@/types/order-management';

/**
 * Property Test: Status transition validation
 * Feature: order-management-system, Property 5 (extended): Status transition validation
 * Validates: Requirements 8.1, 8.2
 * 
 * This test verifies that:
 * 1. Only valid status transitions are allowed
 * 2. Invalid status transitions are rejected with appropriate errors
 * 3. Status flow is enforced: pending → confirmed → processing → shipped → delivered
 * 4. Terminal statuses (delivered, cancelled) cannot be changed
 */

// Define valid status transitions
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

// Get all possible statuses
const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

describe('Status Transition Validation - Property Test', () => {
  let createdOrderIds: string[] = [];

  afterEach(async () => {
    // Clean up created orders
    if (createdOrderIds.length > 0) {
      await supabase.from('order_items').delete().in('order_id', createdOrderIds);
      await supabase.from('orders').delete().in('id', createdOrderIds);
      createdOrderIds = [];
    }
  });

  it('should allow only valid status transitions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
          adminId: fc.uuid(),
          customerName: fc.string({ minLength: 3, maxLength: 20 }),
          subtotal: fc.integer({ min: 100, max: 5000 }),
          // Pick a starting status that has valid transitions
          startStatus: fc.constantFrom('pending', 'confirmed', 'processing', 'shipped'),
        }),
        async (spec) => {
          // Skip test if database is not available
          try {
            await supabase.from('orders').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create an order
          const orderInput: CreateOrderInput = {
            user_id: spec.userId,
            items: [
              {
                product_id: `prod-${Math.random()}`,
                product_name: 'Test Product',
                quantity: 1,
                price: spec.subtotal,
                subtotal: spec.subtotal,
              },
            ],
            subtotal: spec.subtotal,
            discount: 0,
            delivery_charge: 50,
            tax: spec.subtotal * 0.1,
            total: spec.subtotal + 50 + spec.subtotal * 0.1,
            shipping_address: {
              name: spec.customerName,
              phone: '1234567890',
              street: '123 Test St',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001',
              country: 'India',
            },
            delivery_pincode: '400001',
            payment_method: 'razorpay',
            // Conditionally add payment_id to control initial status
            ...(spec.startStatus !== 'pending' && { payment_id: `pay_${Math.random()}` }),
          };

          const order = await orderService.createOrder(orderInput);
          createdOrderIds.push(order.id);

          // Manually set the order to the desired start status if needed
          if (spec.startStatus !== order.status) {
            await supabase
              .from('orders')
              .update({ status: spec.startStatus })
              .eq('id', order.id);
          }

          const validTransitions = VALID_TRANSITIONS[spec.startStatus];

          // Property 1: Valid transitions should succeed
          if (validTransitions.length > 0) {
            const validTarget = validTransitions[0];
            
            try {
              const updatedOrder = await orderService.updateOrderStatus({
                order_id: order.id,
                new_status: validTarget,
                updated_by: spec.adminId,
                ...(validTarget === 'shipped' && { tracking_number: 'TRACK123' }),
              });

              expect(updatedOrder.status).toBe(validTarget);
            } catch (error: any) {
              // Should not throw for valid transitions
              throw new Error(`Valid transition ${spec.startStatus} -> ${validTarget} failed: ${error.message}`);
            }
          }
        }
      ),
      { numRuns: 10, timeout: 30000 }
    );
  }, 35000);

  it('should reject invalid status transitions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
          adminId: fc.uuid(),
          customerName: fc.string({ minLength: 3, maxLength: 20 }),
          subtotal: fc.integer({ min: 100, max: 5000 }),
        }),
        async (spec) => {
          // Skip test if database is not available
          try {
            await supabase.from('orders').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create an order with confirmed status
          const orderInput: CreateOrderInput = {
            user_id: spec.userId,
            items: [
              {
                product_id: `prod-${Math.random()}`,
                product_name: 'Test Product',
                quantity: 1,
                price: spec.subtotal,
                subtotal: spec.subtotal,
              },
            ],
            subtotal: spec.subtotal,
            discount: 0,
            delivery_charge: 50,
            tax: spec.subtotal * 0.1,
            total: spec.subtotal + 50 + spec.subtotal * 0.1,
            shipping_address: {
              name: spec.customerName,
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

          // Order should be in 'confirmed' status
          expect(order.status).toBe('confirmed');

          // Property: Invalid transitions should be rejected
          // From 'confirmed', valid transitions are: processing, cancelled
          // Invalid transitions are: pending, shipped, delivered
          const invalidTransitions: OrderStatus[] = ['pending', 'shipped', 'delivered'];

          for (const invalidTarget of invalidTransitions) {
            try {
              await orderService.updateOrderStatus({
                order_id: order.id,
                new_status: invalidTarget,
                updated_by: spec.adminId,
                ...(invalidTarget === 'shipped' && { tracking_number: 'TRACK123' }),
              });

              // Should not reach here - invalid transition should throw
              throw new Error(`Invalid transition confirmed -> ${invalidTarget} was allowed but should have been rejected`);
            } catch (error: any) {
              // Should throw an error for invalid transitions
              expect(error.message).toContain('Invalid status transition');
            }
          }

          // Verify order status hasn't changed
          const unchangedOrder = await orderService.getOrderById(order.id);
          expect(unchangedOrder?.status).toBe('confirmed');
        }
      ),
      { numRuns: 10, timeout: 30000 }
    );
  }, 35000);

  it('should prevent transitions from terminal statuses', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
          adminId: fc.uuid(),
          customerName: fc.string({ minLength: 3, maxLength: 20 }),
          subtotal: fc.integer({ min: 100, max: 5000 }),
          terminalStatus: fc.constantFrom('delivered', 'cancelled'),
        }),
        async (spec) => {
          // Skip test if database is not available
          try {
            await supabase.from('orders').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create an order
          const orderInput: CreateOrderInput = {
            user_id: spec.userId,
            items: [
              {
                product_id: `prod-${Math.random()}`,
                product_name: 'Test Product',
                quantity: 1,
                price: spec.subtotal,
                subtotal: spec.subtotal,
              },
            ],
            subtotal: spec.subtotal,
            discount: 0,
            delivery_charge: 50,
            tax: spec.subtotal * 0.1,
            total: spec.subtotal + 50 + spec.subtotal * 0.1,
            shipping_address: {
              name: spec.customerName,
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

          // Manually set order to terminal status
          await supabase
            .from('orders')
            .update({ status: spec.terminalStatus })
            .eq('id', order.id);

          // Property: Terminal statuses should not allow any transitions
          const attemptedTransitions: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

          for (const targetStatus of attemptedTransitions) {
            if (targetStatus === spec.terminalStatus) continue; // Skip same status

            try {
              await orderService.updateOrderStatus({
                order_id: order.id,
                new_status: targetStatus,
                updated_by: spec.adminId,
                ...(targetStatus === 'shipped' && { tracking_number: 'TRACK123' }),
              });

              // Should not reach here
              throw new Error(`Transition from terminal status ${spec.terminalStatus} -> ${targetStatus} was allowed`);
            } catch (error: any) {
              // Should throw an error
              expect(error.message).toContain('Invalid status transition');
            }
          }

          // Verify order status hasn't changed
          const unchangedOrder = await orderService.getOrderById(order.id);
          expect(unchangedOrder?.status).toBe(spec.terminalStatus);
        }
      ),
      { numRuns: 10, timeout: 30000 }
    );
  }, 35000);

  it('should enforce the complete status flow', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
          adminId: fc.uuid(),
          customerName: fc.string({ minLength: 3, maxLength: 20 }),
          subtotal: fc.integer({ min: 100, max: 5000 }),
        }),
        async (spec) => {
          // Skip test if database is not available
          try {
            await supabase.from('orders').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create an order
          const orderInput: CreateOrderInput = {
            user_id: spec.userId,
            items: [
              {
                product_id: `prod-${Math.random()}`,
                product_name: 'Test Product',
                quantity: 1,
                price: spec.subtotal,
                subtotal: spec.subtotal,
              },
            ],
            subtotal: spec.subtotal,
            discount: 0,
            delivery_charge: 50,
            tax: spec.subtotal * 0.1,
            total: spec.subtotal + 50 + spec.subtotal * 0.1,
            shipping_address: {
              name: spec.customerName,
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

          // Property: Should be able to follow the complete flow
          // confirmed -> processing -> shipped -> delivered

          // Step 1: confirmed -> processing
          const order1 = await orderService.updateOrderStatus({
            order_id: order.id,
            new_status: 'processing',
            updated_by: spec.adminId,
          });
          expect(order1.status).toBe('processing');

          // Step 2: processing -> shipped
          const order2 = await orderService.updateOrderStatus({
            order_id: order.id,
            new_status: 'shipped',
            updated_by: spec.adminId,
            tracking_number: 'TRACK789',
          });
          expect(order2.status).toBe('shipped');

          // Step 3: shipped -> delivered
          const order3 = await orderService.updateOrderStatus({
            order_id: order.id,
            new_status: 'delivered',
            updated_by: spec.adminId,
          });
          expect(order3.status).toBe('delivered');

          // Property: Cannot transition from delivered
          try {
            await orderService.updateOrderStatus({
              order_id: order.id,
              new_status: 'processing',
              updated_by: spec.adminId,
            });
            throw new Error('Should not allow transition from delivered');
          } catch (error: any) {
            expect(error.message).toContain('Invalid status transition');
          }
        }
      ),
      { numRuns: 10, timeout: 30000 }
    );
  }, 35000);
});
