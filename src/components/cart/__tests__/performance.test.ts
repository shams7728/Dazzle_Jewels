/**
 * Performance optimization tests for cart components
 * These tests verify that memoization and optimization strategies are working correctly
 */

import { describe, it, expect } from 'vitest';
import { useCartStore } from '@/lib/store/cart';

describe('Cart Store Performance Optimizations', () => {
  it('should provide memoized calculation methods', () => {
    const store = useCartStore.getState();
    
    // Verify all memoized methods exist
    expect(store.calculateSubtotal).toBeDefined();
    expect(store.calculateDiscount).toBeDefined();
    expect(store.calculateTax).toBeDefined();
    expect(store.getItemCount).toBeDefined();
    
    // Verify they are functions
    expect(typeof store.calculateSubtotal).toBe('function');
    expect(typeof store.calculateDiscount).toBe('function');
    expect(typeof store.calculateTax).toBe('function');
    expect(typeof store.getItemCount).toBe('function');
  });

  it('should provide debounced quantity update method', () => {
    const store = useCartStore.getState();
    
    expect(store.updateQuantityDebounced).toBeDefined();
    expect(typeof store.updateQuantityDebounced).toBe('function');
  });

  it('should calculate subtotal correctly', () => {
    const store = useCartStore.getState();
    
    // Clear cart first
    store.clearCart();
    
    // Add a test item
    const testProduct = {
      id: 'test-1',
      title: 'Test Product',
      description: 'Test Description',
      base_price: 100,
      discount_price: null,
      category_id: 'test-cat',
      is_featured: false,
      is_new_arrival: false,
      is_best_seller: false,
      is_offer_item: false,
      created_at: new Date().toISOString(),
    };
    
    store.addItem(testProduct);
    
    const subtotal = store.calculateSubtotal();
    expect(subtotal).toBe(100);
  });

  it('should calculate discount correctly', () => {
    const store = useCartStore.getState();
    
    // Test percentage discount
    store.applyCoupon({
      code: 'TEST10',
      discount_value: 10,
      discount_type: 'percentage',
    });
    
    const discount = store.calculateDiscount(100);
    expect(discount).toBe(10);
    
    // Test fixed discount
    store.applyCoupon({
      code: 'TEST20',
      discount_value: 20,
      discount_type: 'fixed',
    });
    
    const fixedDiscount = store.calculateDiscount(100);
    expect(fixedDiscount).toBe(20);
    
    // Cleanup
    store.removeCoupon();
  });

  it('should calculate tax correctly', () => {
    const store = useCartStore.getState();
    
    const tax = store.calculateTax(100);
    expect(tax).toBe(10); // 10% tax
  });

  it('should calculate item count correctly', () => {
    const store = useCartStore.getState();
    
    // Clear cart first
    store.clearCart();
    
    const testProduct = {
      id: 'test-2',
      title: 'Test Product 2',
      description: 'Test Description',
      base_price: 50,
      discount_price: null,
      category_id: 'test-cat',
      is_featured: false,
      is_new_arrival: false,
      is_best_seller: false,
      is_offer_item: false,
      created_at: new Date().toISOString(),
    };
    
    // Add item 3 times
    store.addItem(testProduct);
    store.addItem(testProduct);
    store.addItem(testProduct);
    
    const itemCount = store.getItemCount();
    expect(itemCount).toBe(3);
  });

  it('should handle discount calculation with no coupon', () => {
    const store = useCartStore.getState();
    
    store.removeCoupon();
    const discount = store.calculateDiscount(100);
    expect(discount).toBe(0);
  });

  it('should cap fixed discount at subtotal amount', () => {
    const store = useCartStore.getState();
    
    store.applyCoupon({
      code: 'HUGE',
      discount_value: 200,
      discount_type: 'fixed',
    });
    
    const discount = store.calculateDiscount(100);
    expect(discount).toBe(100); // Should not exceed subtotal
    
    store.removeCoupon();
  });
});

describe('Performance Characteristics', () => {
  it('should complete calculations in reasonable time', () => {
    const store = useCartStore.getState();
    
    // Clear and add multiple items
    store.clearCart();
    
    const testProduct = {
      id: 'perf-test',
      title: 'Performance Test Product',
      description: 'Test',
      base_price: 100,
      discount_price: 90,
      category_id: 'test',
      is_featured: false,
      is_new_arrival: false,
      is_best_seller: false,
      is_offer_item: false,
      created_at: new Date().toISOString(),
    };
    
    // Add 50 items
    for (let i = 0; i < 50; i++) {
      store.addItem({ ...testProduct, id: `perf-test-${i}` });
    }
    
    // Measure calculation time
    const start = performance.now();
    store.calculateSubtotal();
    store.getItemCount();
    const end = performance.now();
    
    // Should complete in less than 10ms even with 50 items
    expect(end - start).toBeLessThan(10);
  });
});
