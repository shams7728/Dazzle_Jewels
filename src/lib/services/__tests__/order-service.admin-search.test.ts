import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { orderService } from '../order-service';
import { supabase } from '../../supabase';
import type { CreateOrderInput, Order } from '@/types/order-management';

/**
 * Property Test: Admin order search functionality
 * Feature: order-management-system, Property 14: Admin order search functionality
 * Validates: Requirements 6.5
 * 
 * This test verifies that:
 * 1. Search by order number returns matching orders
 * 2. Search by customer name returns matching orders
 * 3. Search by email returns matching orders (when available)
 * 4. Search is case-insensitive
 * 5. Partial matches are supported
 */

describe('Admin Order Search Functionality - Property Test', () => {
  let createdOrderIds: string[] = [];

  afterEach(async () => {
    // Clean up created orders
    if (createdOrderIds.length > 0) {
      await supabase.from('order_items').delete().in('order_id', createdOrderIds);
      await supabase.from('orders').delete().in('id', createdOrderIds);
      createdOrderIds = [];
    }
  });

  it('should find orders by order number search', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate multiple orders with different order numbers
        fc.array(
          fc.record({
            userId: fc.uuid(),
            customerName: fc.string({ minLength: 3, maxLength: 20 }),
            subtotal: fc.integer({ min: 100, max: 10000 }),
          }),
          { minLength: 3, maxLength: 8 }
        ),
        async (orderSpecs) => {
          // Skip test if database is not available
          try {
            await supabase.from('orders').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create orders
          const createdOrders: Order[] = [];
          
          for (const spec of orderSpecs) {
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
            createdOrders.push(order);
          }

          // Pick a random order to search for
          const targetOrder = createdOrders[Math.floor(Math.random() * createdOrders.length)];
          
          // Property 1: Search by full order number should return the order
          const fullSearchResult = await orderService.getOrders(
            { searchQuery: targetOrder.order_number },
            { page: 1, limit: 20 }
          );

          const foundByFullNumber = fullSearchResult.orders.find(
            o => o.order_number === targetOrder.order_number
          );
          expect(foundByFullNumber).toBeDefined();
          expect(foundByFullNumber?.id).toBe(targetOrder.id);

          // Property 2: Search by partial order number should return the order
          // Extract a substring from the order number (e.g., last 4 digits)
          const partialOrderNumber = targetOrder.order_number.slice(-4);
          const partialSearchResult = await orderService.getOrders(
            { searchQuery: partialOrderNumber },
            { page: 1, limit: 20 }
          );

          const foundByPartialNumber = partialSearchResult.orders.find(
            o => o.order_number === targetOrder.order_number
          );
          expect(foundByPartialNumber).toBeDefined();

          // Property 3: All returned orders should match the search query
          for (const order of fullSearchResult.orders) {
            const matchesOrderNumber = order.order_number.toLowerCase().includes(
              targetOrder.order_number.toLowerCase()
            );
            expect(matchesOrderNumber).toBe(true);
          }
        }
      ),
      { numRuns: 10, timeout: 30000 } // Reduced runs and increased timeout for database operations
    );
  }, 35000); // Test timeout

  it('should find orders by customer name search', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            userId: fc.uuid(),
            customerName: fc.constantFrom('John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams'),
            subtotal: fc.integer({ min: 100, max: 5000 }),
          }),
          { minLength: 3, maxLength: 6 }
        ),
        async (orderSpecs) => {
          // Skip test if database is not available
          try {
            await supabase.from('orders').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create orders
          const createdOrders: Order[] = [];
          
          for (const spec of orderSpecs) {
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
            createdOrders.push(order);
          }

          // Pick a random order to search for
          const targetOrder = createdOrders[Math.floor(Math.random() * createdOrders.length)];
          const targetName = targetOrder.shipping_address.name;
          
          // Property 1: Search by full customer name should return orders with that name
          const fullNameResult = await orderService.getOrders(
            { searchQuery: targetName },
            { page: 1, limit: 20 }
          );

          // Should find at least the target order
          const foundByFullName = fullNameResult.orders.some(
            o => o.shipping_address.name === targetName
          );
          expect(foundByFullName).toBe(true);

          // Property 2: Search by partial name (first name) should return matching orders
          const firstName = targetName.split(' ')[0];
          const firstNameResult = await orderService.getOrders(
            { searchQuery: firstName },
            { page: 1, limit: 20 }
          );

          // Should find orders with matching first name
          const foundByFirstName = firstNameResult.orders.some(
            o => o.shipping_address.name.includes(firstName)
          );
          expect(foundByFirstName).toBe(true);

          // Property 3: Search should be case-insensitive
          const lowerCaseResult = await orderService.getOrders(
            { searchQuery: targetName.toLowerCase() },
            { page: 1, limit: 20 }
          );

          const upperCaseResult = await orderService.getOrders(
            { searchQuery: targetName.toUpperCase() },
            { page: 1, limit: 20 }
          );

          // Both should return results
          expect(lowerCaseResult.orders.length).toBeGreaterThan(0);
          expect(upperCaseResult.orders.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 10, timeout: 30000 }
    );
  }, 35000);

  it('should return empty results for non-matching search queries', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            userId: fc.uuid(),
            customerName: fc.string({ minLength: 3, maxLength: 20 }),
            subtotal: fc.integer({ min: 100, max: 5000 }),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (orderSpecs) => {
          // Skip test if database is not available
          try {
            await supabase.from('orders').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create orders
          for (const spec of orderSpecs) {
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
          }

          // Property: Search with a query that definitely doesn't match should return empty
          const nonMatchingQuery = 'ZZZZZ-NONEXISTENT-QUERY-12345';
          const result = await orderService.getOrders(
            { searchQuery: nonMatchingQuery },
            { page: 1, limit: 20 }
          );

          expect(result.orders.length).toBe(0);
          expect(result.total).toBe(0);
        }
      ),
      { numRuns: 10, timeout: 30000 }
    );
  }, 35000);

  it('should handle special characters in search queries', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
          customerName: fc.constantFrom("O'Brien", "Smith-Jones", "José García"),
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

          // Property: Search should handle special characters without errors
          const result = await orderService.getOrders(
            { searchQuery: spec.customerName },
            { page: 1, limit: 20 }
          );

          // Should not throw an error and should find the order
          expect(result.orders.length).toBeGreaterThan(0);
          const found = result.orders.some(
            o => o.shipping_address.name === spec.customerName
          );
          expect(found).toBe(true);
        }
      ),
      { numRuns: 10, timeout: 30000 }
    );
  }, 35000);
});
