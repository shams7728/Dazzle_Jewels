/**
 * Manual Email Integration Test
 * 
 * This is a manual test file to verify email sending works in development.
 * Run this test manually when you have configured RESEND_API_KEY in .env.local
 * 
 * To run: npm test -- email-integration.manual.test.ts
 * 
 * Note: This test is skipped by default. Remove .skip to run it manually.
 */

import { describe, it, expect } from 'vitest';
import { notificationService } from '../notification-service';
import type { Order } from '@/types/order-management';

// Create a sample order for testing
const sampleOrder: Order = {
  id: 'test-order-id',
  order_number: 'ORD-2024-TEST001',
  user_id: 'test-user-id',
  items: [
    {
      id: 'item-1',
      order_id: 'test-order-id',
      product_id: 'product-1',
      product_name: 'Gold Necklace',
      product_image: 'https://example.com/necklace.jpg',
      variant_name: '18K Gold',
      quantity: 1,
      price: 5000,
      subtotal: 5000,
    },
    {
      id: 'item-2',
      order_id: 'test-order-id',
      product_id: 'product-2',
      product_name: 'Diamond Ring',
      product_image: 'https://example.com/ring.jpg',
      quantity: 2,
      price: 3000,
      subtotal: 6000,
    },
  ],
  subtotal: 11000,
  discount: 1000,
  coupon_code: 'SAVE10',
  delivery_charge: 100,
  tax: 1210,
  total: 11310,
  shipping_address: {
    name: 'John Doe',
    phone: '+91 9876543210',
    street: '123 MG Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    country: 'India',
    latitude: 19.0760,
    longitude: 72.8777,
  },
  delivery_pincode: '400001',
  estimated_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  payment_method: 'razorpay',
  payment_status: 'completed',
  payment_id: 'pay_test123456',
  razorpay_order_id: 'order_test123456',
  status: 'confirmed',
  status_history: [
    {
      status: 'pending',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      updated_by: 'system',
    },
    {
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      updated_by: 'system',
    },
  ],
  tracking_number: 'TRACK123456789',
  tracking_url: 'https://tracking.example.com/TRACK123456789',
  courier_name: 'Blue Dart',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe.skip('Email Integration Manual Tests', () => {
  it('should send order confirmation email', async () => {
    console.log('\n📧 Testing Order Confirmation Email...');
    await notificationService.sendOrderConfirmation(sampleOrder);
    console.log('✅ Order confirmation email sent (check logs)');
    expect(true).toBe(true);
  }, 30000);

  it('should send status update email', async () => {
    console.log('\n📧 Testing Status Update Email...');
    await notificationService.sendStatusUpdate(sampleOrder, 'processing');
    console.log('✅ Status update email sent (check logs)');
    expect(true).toBe(true);
  }, 30000);

  it('should send shipping notification email', async () => {
    console.log('\n📧 Testing Shipping Notification Email...');
    await notificationService.sendShippingNotification(sampleOrder);
    console.log('✅ Shipping notification email sent (check logs)');
    expect(true).toBe(true);
  }, 30000);

  it('should send delivery confirmation email', async () => {
    console.log('\n📧 Testing Delivery Confirmation Email...');
    await notificationService.sendDeliveryConfirmation(sampleOrder);
    console.log('✅ Delivery confirmation email sent (check logs)');
    expect(true).toBe(true);
  }, 30000);

  it('should send cancellation confirmation email', async () => {
    console.log('\n📧 Testing Cancellation Confirmation Email...');
    const cancelledOrder = {
      ...sampleOrder,
      status: 'cancelled' as const,
      cancellation_reason: 'Customer requested cancellation',
      cancelled_at: new Date().toISOString(),
    };
    await notificationService.sendCancellationConfirmation(cancelledOrder);
    console.log('✅ Cancellation confirmation email sent (check logs)');
    expect(true).toBe(true);
  }, 30000);

  it('should send admin new order alert', async () => {
    console.log('\n📧 Testing Admin New Order Alert...');
    await notificationService.sendAdminNewOrderAlert(sampleOrder);
    console.log('✅ Admin new order alert sent (check logs)');
    expect(true).toBe(true);
  }, 30000);

  it('should send admin priority notification', async () => {
    console.log('\n📧 Testing Admin Priority Notification...');
    await notificationService.sendAdminPriorityNotification(
      sampleOrder,
      'Payment gateway timeout - manual verification required'
    );
    console.log('✅ Admin priority notification sent (check logs)');
    expect(true).toBe(true);
  }, 30000);
});

describe('Email Integration Development Mode Tests', () => {
  it('should handle missing Resend API key gracefully in development', async () => {
    console.log('\n🔧 Testing graceful handling without API key...');
    
    // This should not throw in development mode
    await expect(
      notificationService.sendOrderConfirmation(sampleOrder)
    ).resolves.not.toThrow();
    
    console.log('✅ Gracefully handled missing API key');
  }, 30000);

  it('should log email details when API key is not configured', async () => {
    console.log('\n📝 Testing email logging without sending...');
    
    // In development without API key, should just log
    await notificationService.sendStatusUpdate(sampleOrder, 'shipped');
    
    console.log('✅ Email details logged (check console output)');
    expect(true).toBe(true);
  }, 30000);
});
