/**
 * End-to-End Tests for Enhanced Checkout Flow
 * 
 * This test suite validates the complete checkout flow including:
 * - Add to Cart flow
 * - Buy Now flow
 * - Cart page functionality
 * - Checkout process
 * 
 * Requirements: All requirements from enhanced-checkout-flow spec
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/lib/store/cart';
import type { Product, ProductVariant } from '@/types';

// Test data
const createMockProduct = (id: string, basePrice: number, discountPrice?: number): Product => ({
  id,
  title: `Test Product ${id}`,
  description: 'Test description',
  base_price: basePrice,
  discount_price: discountPrice,
  category_id: 'cat1',
  stock_quantity: 10,
  is_featured: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  images: ['/test-image.jpg'],
  variants: [],
});

const createMockVariant = (id: string, color: string, priceAdjustment: number): ProductVariant => ({
  id,
  product_id: 'prod1',
  color,
  material: 'Gold',
  price_adjustment: priceAdjustment,
  stock_quantity: 5,
  images: ['/variant-image.jpg'],
});

describe('Enhanced Checkout Flow - End-to-End Tests', () => {
  beforeEach(() => {
    // Reset cart store before each test
    const store = useCartStore.getState();
    store.clearCart();
    store.removeCoupon();
  });

  describe('Add to Cart Flow', () => {
    it('should add product to cart and update button state', () => {
      const store = useCartStore.getState();
      const product = createMockProduct('prod1', 1000);

      // Initially product should not be in cart
      expect(store.isProductInCart('prod1')).toBe(false);

      // Add product to cart
      store.addItem(product);

      // Product should now be in cart
      const updatedStore = useCartStore.getState();
      expect(updatedStore.isProductInCart('prod1')).toBe(true);
      expect(updatedStore.items).toHaveLength(1);
      expect(updatedStore.items[0].product.id).toBe('prod1');
      expect(updatedStore.items[0].quantity).toBe(1);
    });

    it('should handle adding product with variant', () => {
      const store = useCartStore.getState();
      const product = createMockProduct('prod1', 1000);
      const variant = createMockVariant('var1', 'Gold', 200);

      // Add product with variant
      store.addItem(product, variant);

      // Check variant is tracked correctly
      const updatedStore = useCartStore.getState();
      expect(updatedStore.isProductInCart('prod1', 'var1')).toBe(true);
      expect(updatedStore.items[0].variant?.id).toBe('var1');
    });

    it('should increment quantity when adding same product', () => {
      const store = useCartStore.getState();
      const product = createMockProduct('prod1', 1000);

      // Add product twice
      store.addItem(product);
      store.addItem(product);

      // Should have one item with quantity 2
      const updatedStore = useCartStore.getState();
      expect(updatedStore.items).toHaveLength(1);
      expect(updatedStore.items[0].quantity).toBe(2);
    });

    it('should calculate correct cart total with multiple items', () => {
      const store = useCartStore.getState();
      const product1 = createMockProduct('prod1', 1000);
      const product2 = createMockProduct('prod2', 2000);

      store.addItem(product1);
      store.addItem(product2);

      const updatedStore = useCartStore.getState();
      const total = updatedStore.getCartTotal();
      expect(total).toBe(3000);
    });
  });

  describe('Buy Now Flow', () => {
    it('should create checkout session with single product', () => {
      const store = useCartStore.getState();
      const product = createMockProduct('prod1', 1000);

      const session = store.createCheckoutSession([
        { product, quantity: 1 }
      ]);

      expect(session.items).toHaveLength(1);
      expect(session.items[0].product.id).toBe('prod1');
      expect(session.subtotal).toBe(1000);
      expect(session.tax).toBe(100); // 10% tax
      expect(session.total).toBe(1100);
      expect(session.sessionId).toBeDefined();
      expect(session.createdAt).toBeInstanceOf(Date);
    });

    it('should not modify cart when using Buy Now', () => {
      const store = useCartStore.getState();
      const product1 = createMockProduct('prod1', 1000);
      const product2 = createMockProduct('prod2', 2000);

      // Add product1 to cart
      store.addItem(product1);

      const initialCartLength = useCartStore.getState().items.length;

      // Create Buy Now session with product2
      const session = store.createCheckoutSession([
        { product: product2, quantity: 1 }
      ]);

      // Cart should remain unchanged
      const updatedStore = useCartStore.getState();
      expect(updatedStore.items).toHaveLength(initialCartLength);
      expect(updatedStore.isProductInCart('prod2')).toBe(false);
      expect(session.items[0].product.id).toBe('prod2');
    });

    it('should preserve variant and quantity in Buy Now session', () => {
      const store = useCartStore.getState();
      const product = createMockProduct('prod1', 1000);
      const variant = createMockVariant('var1', 'Gold', 200);
      const quantity = 3;

      const session = store.createCheckoutSession([
        { product, variant, quantity }
      ]);

      expect(session.items[0].variant?.id).toBe('var1');
      expect(session.items[0].quantity).toBe(quantity);
      expect(session.subtotal).toBe(1200 * 3); // (1000 + 200) * 3
    });
  });

  describe('Cart Management', () => {
    it('should update item quantity', () => {
      const store = useCartStore.getState();
      const product = createMockProduct('prod1', 1000);

      store.addItem(product);

      // Update quantity to 5
      store.updateQuantity('prod1', undefined, 5);

      const updatedStore = useCartStore.getState();
      expect(updatedStore.items[0].quantity).toBe(5);
    });

    it('should remove item from cart', () => {
      const store = useCartStore.getState();
      const product = createMockProduct('prod1', 1000);

      store.addItem(product);

      expect(useCartStore.getState().items).toHaveLength(1);

      store.removeItem('prod1');

      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('should calculate subtotal correctly', () => {
      const store = useCartStore.getState();
      const product1 = createMockProduct('prod1', 1000);
      const product2 = createMockProduct('prod2', 2000, 1800); // with discount

      store.addItem(product1);
      store.addItem(product2);

      const updatedStore = useCartStore.getState();
      const subtotal = updatedStore.calculateSubtotal();
      expect(subtotal).toBe(2800); // 1000 + 1800 (discounted price)
    });

    it('should calculate tax correctly', () => {
      const store = useCartStore.getState();
      const subtotal = 1000;

      const tax = store.calculateTax(subtotal);
      expect(tax).toBe(100); // 10% of 1000
    });

    it('should handle discount calculation - percentage', () => {
      const store = useCartStore.getState();
      const subtotal = 1000;

      store.applyCoupon({
        code: 'SAVE20',
        discount_value: 20,
        discount_type: 'percentage',
      });

      const updatedStore = useCartStore.getState();
      const discount = updatedStore.calculateDiscount(subtotal);
      expect(discount).toBe(200); // 20% of 1000
    });

    it('should handle discount calculation - fixed', () => {
      const store = useCartStore.getState();
      const subtotal = 1000;

      store.applyCoupon({
        code: 'SAVE100',
        discount_value: 100,
        discount_type: 'fixed',
      });

      const updatedStore = useCartStore.getState();
      const discount = updatedStore.calculateDiscount(subtotal);
      expect(discount).toBe(100);
    });

    it('should not allow discount to exceed subtotal', () => {
      const store = useCartStore.getState();
      const subtotal = 500;

      store.applyCoupon({
        code: 'SAVE1000',
        discount_value: 1000,
        discount_type: 'fixed',
      });

      const updatedStore = useCartStore.getState();
      const discount = updatedStore.calculateDiscount(subtotal);
      expect(discount).toBe(500); // Capped at subtotal
    });

    it('should get correct item count', () => {
      const store = useCartStore.getState();
      const product1 = createMockProduct('prod1', 1000);
      const product2 = createMockProduct('prod2', 2000);

      store.addItem(product1);
      store.addItem(product1); // quantity 2
      store.addItem(product2); // quantity 1

      const updatedStore = useCartStore.getState();
      const itemCount = updatedStore.getItemCount();
      expect(itemCount).toBe(3); // 2 + 1
    });
  });

  describe('Cart with Variants', () => {
    it('should handle multiple variants of same product', () => {
      const store = useCartStore.getState();
      const product = createMockProduct('prod1', 1000);
      const variant1 = createMockVariant('var1', 'Gold', 200);
      const variant2 = createMockVariant('var2', 'Silver', 100);

      store.addItem(product, variant1);
      store.addItem(product, variant2);

      // Should have 2 separate items
      const updatedStore = useCartStore.getState();
      expect(updatedStore.items).toHaveLength(2);
      expect(updatedStore.isProductInCart('prod1', 'var1')).toBe(true);
      expect(updatedStore.isProductInCart('prod1', 'var2')).toBe(true);
    });

    it('should calculate price with variant adjustment', () => {
      const store = useCartStore.getState();
      const product = createMockProduct('prod1', 1000);
      const variant = createMockVariant('var1', 'Gold', 200);

      store.addItem(product, variant);

      const updatedStore = useCartStore.getState();
      const subtotal = updatedStore.calculateSubtotal();
      expect(subtotal).toBe(1200); // 1000 + 200
    });
  });

  describe('Cart Size Tests', () => {
    it('should handle cart with 1 item', () => {
      const store = useCartStore.getState();
      const product = createMockProduct('prod1', 1000);

      store.addItem(product);

      const updatedStore = useCartStore.getState();
      expect(updatedStore.items).toHaveLength(1);
      expect(updatedStore.getItemCount()).toBe(1);
    });

    it('should handle cart with 10 items', () => {
      const store = useCartStore.getState();

      for (let i = 1; i <= 10; i++) {
        const product = createMockProduct(`prod${i}`, 1000 * i);
        store.addItem(product);
      }

      const updatedStore = useCartStore.getState();
      expect(updatedStore.items).toHaveLength(10);
      expect(updatedStore.getItemCount()).toBe(10);
    });

    it('should handle cart with 50 items', () => {
      const store = useCartStore.getState();

      for (let i = 1; i <= 50; i++) {
        const product = createMockProduct(`prod${i}`, 1000);
        store.addItem(product);
      }

      const updatedStore = useCartStore.getState();
      expect(updatedStore.items).toHaveLength(50);
      expect(updatedStore.getItemCount()).toBe(50);
      
      // Verify calculations still work correctly
      const subtotal = updatedStore.calculateSubtotal();
      expect(subtotal).toBe(50000); // 50 * 1000
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty cart', () => {
      const store = useCartStore.getState();

      expect(store.items).toHaveLength(0);
      expect(store.getCartTotal()).toBe(0);
      expect(store.getItemCount()).toBe(0);
    });

    it('should not allow quantity less than 1', () => {
      const store = useCartStore.getState();
      const product = createMockProduct('prod1', 1000);

      store.addItem(product);
      store.updateQuantity('prod1', undefined, 0);

      // Quantity should remain 1 (not updated to 0)
      const updatedStore = useCartStore.getState();
      expect(updatedStore.items[0].quantity).toBe(1);
    });

    it('should handle product with discount price', () => {
      const store = useCartStore.getState();
      const product = createMockProduct('prod1', 1000, 800);

      store.addItem(product);

      const updatedStore = useCartStore.getState();
      const subtotal = updatedStore.calculateSubtotal();
      expect(subtotal).toBe(800); // Should use discount price
    });

    it('should clear cart completely', () => {
      const store = useCartStore.getState();
      const product1 = createMockProduct('prod1', 1000);
      const product2 = createMockProduct('prod2', 2000);

      store.addItem(product1);
      store.addItem(product2);
      store.applyCoupon({
        code: 'TEST',
        discount_value: 10,
        discount_type: 'percentage',
      });

      expect(useCartStore.getState().items).toHaveLength(2);

      store.clearCart();

      const updatedStore = useCartStore.getState();
      expect(updatedStore.items).toHaveLength(0);
      expect(updatedStore.coupon).toBeNull();
    });
  });

  describe('Real-time Updates', () => {
    it('should update total when quantity changes', () => {
      const store = useCartStore.getState();
      const product = createMockProduct('prod1', 1000);

      store.addItem(product);

      const initialTotal = useCartStore.getState().getCartTotal();
      expect(initialTotal).toBe(1000);

      store.updateQuantity('prod1', undefined, 3);

      const updatedTotal = useCartStore.getState().getCartTotal();
      expect(updatedTotal).toBe(3000);
    });

    it('should update total when item is removed', () => {
      const store = useCartStore.getState();
      const product1 = createMockProduct('prod1', 1000);
      const product2 = createMockProduct('prod2', 2000);

      store.addItem(product1);
      store.addItem(product2);

      expect(useCartStore.getState().getCartTotal()).toBe(3000);

      store.removeItem('prod1');

      expect(useCartStore.getState().getCartTotal()).toBe(2000);
    });
  });
});
