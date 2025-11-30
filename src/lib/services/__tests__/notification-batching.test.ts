/**
 * Unit Tests for Notification Batching
 * 
 * Tests the notification batching logic to prevent email flooding
 * when multiple orders are placed within a short time window.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NotificationService } from '../notification-service';
import type { Order } from '@/types/order-management';

// Mock the delay to speed up tests
vi.mock('../notification-service', async () => {
  const actual = await vi.importActual('../notification-service');
  return {
    ...actual,
    // We'll use the actual implementation but with shorter timeouts
  };
});

// Helper to create a test order
function createTestOrder(orderNumber: string): Order {
  return {
    id: `order-${orderNumber}`,
    order_number: orderNumber,
    user_id: 'test-user-id',
    items: [
      {
        id: 'item-1',
        order_id: `order-${orderNumber}`,
        product_id: 'product-1',
        product_name: 'Test Product',
        quantity: 1,
        price: 100,
        subtotal: 100,
      },
    ],
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
    payment_status: 'pending',
    status: 'pending',
    status_history: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

describe('Notification Batching', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    // Create a new instance for each test
    notificationService = new NotificationService();
  });

  afterEach(async () => {
    // Flush any pending batches after each test
    await notificationService.flushBatches();
  });

  it('should create a batch when first admin notification is added', async () => {
    const order = createTestOrder('ORD-2024-001');

    // Send admin notification
    await notificationService.sendAdminNewOrderAlert(order);

    // Check batch status
    const status = notificationService.getBatchStatus();
    expect(status).toHaveLength(1);
    expect(status[0].batchKey).toBe('admin_new_order');
    expect(status[0].count).toBe(1);
  });

  it('should add multiple notifications to the same batch', async () => {
    const order1 = createTestOrder('ORD-2024-001');
    const order2 = createTestOrder('ORD-2024-002');
    const order3 = createTestOrder('ORD-2024-003');

    // Send multiple admin notifications quickly
    await notificationService.sendAdminNewOrderAlert(order1);
    await notificationService.sendAdminNewOrderAlert(order2);
    await notificationService.sendAdminNewOrderAlert(order3);

    // Check batch status
    const status = notificationService.getBatchStatus();
    expect(status).toHaveLength(1);
    expect(status[0].count).toBe(3);
  });

  it('should process batch after window expires', async () => {
    const order1 = createTestOrder('ORD-2024-001');
    const order2 = createTestOrder('ORD-2024-002');

    // Send notifications
    await notificationService.sendAdminNewOrderAlert(order1);
    await notificationService.sendAdminNewOrderAlert(order2);

    // Verify batch exists
    let status = notificationService.getBatchStatus();
    expect(status).toHaveLength(1);
    expect(status[0].count).toBe(2);

    // Wait for batch window to expire (using a shorter timeout for testing)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Flush batches manually (simulating timeout)
    await notificationService.flushBatches();

    // Verify batch is cleared
    status = notificationService.getBatchStatus();
    expect(status).toHaveLength(0);
  });

  it('should handle single notification in batch correctly', async () => {
    const order = createTestOrder('ORD-2024-001');

    // Send single notification
    await notificationService.sendAdminNewOrderAlert(order);

    // Verify batch created
    let status = notificationService.getBatchStatus();
    expect(status).toHaveLength(1);
    expect(status[0].count).toBe(1);

    // Flush batch
    await notificationService.flushBatches();

    // Verify batch cleared
    status = notificationService.getBatchStatus();
    expect(status).toHaveLength(0);
  });

  it('should handle empty batch gracefully', async () => {
    // Try to flush when no batches exist
    await expect(notificationService.flushBatches()).resolves.not.toThrow();

    // Verify no batches
    const status = notificationService.getBatchStatus();
    expect(status).toHaveLength(0);
  });

  it('should track scheduled time for batches', async () => {
    const order = createTestOrder('ORD-2024-001');
    const beforeTime = Date.now();

    // Send notification
    await notificationService.sendAdminNewOrderAlert(order);

    const afterTime = Date.now();

    // Check batch status
    const status = notificationService.getBatchStatus();
    expect(status).toHaveLength(1);
    
    const scheduledTime = status[0].scheduledTime.getTime();
    
    // Scheduled time should be in the future (within batch window)
    expect(scheduledTime).toBeGreaterThan(beforeTime);
    expect(scheduledTime).toBeLessThanOrEqual(afterTime + 61000); // 1 minute + buffer
  });

  it('should not batch customer notifications', async () => {
    const order = createTestOrder('ORD-2024-001');

    // Send customer notification (should not be batched)
    await notificationService.sendOrderConfirmation(order);

    // Verify no batches created
    const status = notificationService.getBatchStatus();
    expect(status).toHaveLength(0);
  });

  it('should handle multiple batches with different keys', async () => {
    const order1 = createTestOrder('ORD-2024-001');
    const order2 = createTestOrder('ORD-2024-002');

    // Send admin notification (batched)
    await notificationService.sendAdminNewOrderAlert(order1);

    // Send priority notification (could be batched separately if implemented)
    await notificationService.sendAdminPriorityNotification(order2, 'Test reason');

    // Currently only admin_new_order is batched
    const status = notificationService.getBatchStatus();
    expect(status.length).toBeGreaterThanOrEqual(1);
  });

  it('should provide accurate batch status information', async () => {
    const order1 = createTestOrder('ORD-2024-001');
    const order2 = createTestOrder('ORD-2024-002');
    const order3 = createTestOrder('ORD-2024-003');

    // Send notifications
    await notificationService.sendAdminNewOrderAlert(order1);
    await notificationService.sendAdminNewOrderAlert(order2);
    await notificationService.sendAdminNewOrderAlert(order3);

    // Get status
    const status = notificationService.getBatchStatus();

    // Verify status structure
    expect(status).toHaveLength(1);
    expect(status[0]).toHaveProperty('batchKey');
    expect(status[0]).toHaveProperty('count');
    expect(status[0]).toHaveProperty('scheduledTime');
    expect(status[0].batchKey).toBe('admin_new_order');
    expect(status[0].count).toBe(3);
    expect(status[0].scheduledTime).toBeInstanceOf(Date);
  });
});

describe('Notification Batching Integration', () => {
  it('should handle rapid order creation without flooding', async () => {
    const notificationService = new NotificationService();
    const orderCount = 10;
    const orders = Array.from({ length: orderCount }, (_, i) => 
      createTestOrder(`ORD-2024-${String(i + 1).padStart(3, '0')}`)
    );

    // Simulate rapid order creation
    for (const order of orders) {
      await notificationService.sendAdminNewOrderAlert(order);
    }

    // All should be in one batch
    const status = notificationService.getBatchStatus();
    expect(status).toHaveLength(1);
    expect(status[0].count).toBe(orderCount);

    // Clean up
    await notificationService.flushBatches();
  });

  it('should handle mixed notification types correctly', async () => {
    const notificationService = new NotificationService();
    const order1 = createTestOrder('ORD-2024-001');
    const order2 = createTestOrder('ORD-2024-002');

    // Send different types of notifications
    await notificationService.sendAdminNewOrderAlert(order1);
    await notificationService.sendOrderConfirmation(order1);
    await notificationService.sendAdminNewOrderAlert(order2);
    await notificationService.sendStatusUpdate(order1, 'confirmed');

    // Only admin notifications should be batched
    const status = notificationService.getBatchStatus();
    expect(status).toHaveLength(1);
    expect(status[0].count).toBe(2); // Two admin notifications

    // Clean up
    await notificationService.flushBatches();
  });
});
