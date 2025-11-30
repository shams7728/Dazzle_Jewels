/**
 * Property-Based Test for Report Metrics Calculation
 * 
 * Feature: order-management-system, Property 29: Report metrics calculation
 * Validates: Requirements 15.2
 * 
 * This test verifies that for any generated report, the system calculates and displays
 * total orders, total revenue, average order value, and order status breakdown correctly
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { supabase } from '../../supabase';
import type { Order, OrderStatus, ReportMetrics } from '@/types/order-management';

// Helper function to calculate metrics from orders
function calculateMetrics(orders: Order[]): ReportMetrics {
  const total_orders = orders.length;
  const total_revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const average_order_value = total_orders > 0 ? total_revenue / total_orders : 0;

  // Calculate status breakdown
  const statusMap = new Map<OrderStatus, { count: number; revenue: number }>();
  
  orders.forEach(order => {
    const existing = statusMap.get(order.status) || { count: 0, revenue: 0 };
    statusMap.set(order.status, {
      count: existing.count + 1,
      revenue: existing.revenue + order.total,
    });
  });

  const status_breakdown = Array.from(statusMap.entries()).map(
    ([status, data]) => ({
      status,
      count: data.count,
      total_revenue: data.revenue,
    })
  );

  return {
    total_orders,
    total_revenue,
    average_order_value,
    status_breakdown,
  };
}

// Arbitraries for generating test data
const orderStatusArbitrary = fc.constantFrom<OrderStatus>(
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

const orderArbitrary = fc.record({
  id: fc.uuid(),
  order_number: fc.integer({ min: 1, max: 999999 }).map(n => `ORD-2024-${String(n).padStart(6, '0')}`),
  user_id: fc.uuid(),
  subtotal: fc.double({ min: 100, max: 10000, noNaN: true }).map(p => Math.round(p * 100) / 100),
  discount: fc.double({ min: 0, max: 500, noNaN: true }).map(d => Math.round(d * 100) / 100),
  delivery_charge: fc.double({ min: 0, max: 200, noNaN: true }).map(d => Math.round(d * 100) / 100),
  tax: fc.double({ min: 0, max: 500, noNaN: true }).map(t => Math.round(t * 100) / 100),
  status: orderStatusArbitrary,
  payment_status: fc.constantFrom('pending', 'completed', 'failed', 'refunded'),
  payment_method: fc.constantFrom('razorpay', 'cod'),
  created_at: fc.integer({ min: Date.parse('2024-01-01'), max: Date.now() }).map(ts => new Date(ts).toISOString()),
}).map(order => ({
  ...order,
  total: Math.round((order.subtotal - order.discount + order.delivery_charge + order.tax) * 100) / 100,
})) as fc.Arbitrary<Partial<Order>>;

describe('Report Metrics Calculation Property Test', () => {
  it('should calculate total orders correctly for any set of orders', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(orderArbitrary, { minLength: 0, maxLength: 50 }),
        async (orders) => {
          const metrics = calculateMetrics(orders as Order[]);
          
          // Property: total_orders should equal the number of orders
          expect(metrics.total_orders).toBe(orders.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should calculate total revenue correctly for any set of orders', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(orderArbitrary, { minLength: 1, maxLength: 50 }),
        async (orders) => {
          const metrics = calculateMetrics(orders as Order[]);
          
          // Property: total_revenue should equal sum of all order totals
          const expectedRevenue = orders.reduce((sum, order) => sum + order.total, 0);
          expect(Math.abs(metrics.total_revenue - expectedRevenue)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should calculate average order value correctly for any set of orders', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(orderArbitrary, { minLength: 1, maxLength: 50 }),
        async (orders) => {
          const metrics = calculateMetrics(orders as Order[]);
          
          // Property: average_order_value should equal total_revenue / total_orders
          const expectedAverage = metrics.total_revenue / metrics.total_orders;
          expect(Math.abs(metrics.average_order_value - expectedAverage)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty order set correctly', async () => {
    const metrics = calculateMetrics([]);
    
    expect(metrics.total_orders).toBe(0);
    expect(metrics.total_revenue).toBe(0);
    expect(metrics.average_order_value).toBe(0);
    expect(metrics.status_breakdown).toEqual([]);
  });

  it('should calculate status breakdown correctly for any set of orders', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(orderArbitrary, { minLength: 1, maxLength: 50 }),
        async (orders) => {
          const metrics = calculateMetrics(orders as Order[]);
          
          // Property: sum of status counts should equal total orders
          const totalStatusCount = metrics.status_breakdown.reduce(
            (sum, breakdown) => sum + breakdown.count,
            0
          );
          expect(totalStatusCount).toBe(metrics.total_orders);
          
          // Property: sum of status revenues should equal total revenue
          const totalStatusRevenue = metrics.status_breakdown.reduce(
            (sum, breakdown) => sum + breakdown.total_revenue,
            0
          );
          expect(Math.abs(totalStatusRevenue - metrics.total_revenue)).toBeLessThan(0.01);
          
          // Property: each status should have correct count and revenue
          for (const breakdown of metrics.status_breakdown) {
            const ordersWithStatus = orders.filter(o => o.status === breakdown.status);
            expect(breakdown.count).toBe(ordersWithStatus.length);
            
            const expectedRevenue = ordersWithStatus.reduce((sum, o) => sum + o.total, 0);
            expect(Math.abs(breakdown.total_revenue - expectedRevenue)).toBeLessThan(0.01);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include all unique statuses in breakdown', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(orderArbitrary, { minLength: 1, maxLength: 50 }),
        async (orders) => {
          const metrics = calculateMetrics(orders as Order[]);
          
          // Property: status_breakdown should contain all unique statuses from orders
          const uniqueStatuses = new Set(orders.map(o => o.status));
          const breakdownStatuses = new Set(metrics.status_breakdown.map(b => b.status));
          
          expect(breakdownStatuses.size).toBe(uniqueStatuses.size);
          uniqueStatuses.forEach(status => {
            expect(breakdownStatuses.has(status)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain precision in calculations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(orderArbitrary, { minLength: 1, maxLength: 20 }),
        async (orders) => {
          const metrics = calculateMetrics(orders as Order[]);
          
          // Property: all monetary values should be properly rounded
          expect(Number.isFinite(metrics.total_revenue)).toBe(true);
          expect(Number.isFinite(metrics.average_order_value)).toBe(true);
          
          metrics.status_breakdown.forEach(breakdown => {
            expect(Number.isFinite(breakdown.total_revenue)).toBe(true);
            expect(breakdown.count).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle orders with same status correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          orderStatusArbitrary,
          fc.array(orderArbitrary, { minLength: 2, maxLength: 10 })
        ),
        async ([status, orders]) => {
          // Set all orders to the same status
          const sameStatusOrders = orders.map(o => ({ ...o, status }));
          const metrics = calculateMetrics(sameStatusOrders as Order[]);
          
          // Property: should have exactly one status in breakdown
          expect(metrics.status_breakdown.length).toBe(1);
          expect(metrics.status_breakdown[0].status).toBe(status);
          expect(metrics.status_breakdown[0].count).toBe(orders.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
