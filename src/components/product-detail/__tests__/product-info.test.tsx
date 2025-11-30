/**
 * Property-Based Tests for ProductInfo Component
 * Feature: product-detail-redesign
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { ProductInfo } from '../product-info';
import { Product, ProductVariant } from '@/types';
import { useCartStore } from '@/lib/store/cart';
import { useWishlistStore } from '@/lib/store/wishlist';

// Generators for property-based testing
const productGenerator = () =>
  fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 5, maxLength: 100 }),
    description: fc.option(fc.string({ minLength: 10, maxLength: 500 })),
    base_price: fc.integer({ min: 100, max: 100000 }),
    discount_price: fc.option(fc.integer({ min: 50, max: 99999 })),
    category_id: fc.option(fc.uuid()),
    is_featured: fc.boolean(),
    is_new_arrival: fc.boolean(),
    is_best_seller: fc.boolean(),
    is_offer_item: fc.boolean(),
    created_at: fc.constant(new Date().toISOString()),
  });

const variantGenerator = () =>
  fc.record({
    id: fc.uuid(),
    product_id: fc.uuid(),
    color: fc.option(fc.constantFrom('Gold', 'Silver', 'Rose Gold', 'Platinum')),
    material: fc.option(fc.constantFrom('14K', '18K', '22K', 'Platinum')),
    price_adjustment: fc.integer({ min: -5000, max: 50000 }),
    stock_quantity: fc.integer({ min: 0, max: 100 }),
    images: fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
    created_at: fc.constant(new Date().toISOString()),
  });

const productWithVariantsGenerator = () =>
  fc.record({
    product: productGenerator(),
    variants: fc.array(variantGenerator(), { minLength: 1, maxLength: 10 }),
  });

describe('ProductInfo Component - Property-Based Tests', () => {
  beforeEach(() => {
    // Clear stores before each test
    useCartStore.setState({ items: [] });
    useWishlistStore.setState({ items: [] });
  });
  /**
   * Property 7: Required information elements present
   * Feature: product-detail-redesign, Property 7: Required information elements present
   * Validates: Requirements 2.1
   */
  test('Property 7: all products render title, price, and discount information elements', () => {
    fc.assert(
      fc.property(productGenerator(), (productData) => {
        const product = productData as Product;
        const mockOnVariantChange = vi.fn();
        const mockOnAddToCart = vi.fn();
        const mockOnAddToWishlist = vi.fn();

        const { container } = render(
          <ProductInfo
            product={product}
            variants={[]}
            selectedVariant={null}
            onVariantChange={mockOnVariantChange}
            onAddToCart={mockOnAddToCart}
            onAddToWishlist={mockOnAddToWishlist}
          />
        );

        // Title should be present
        const title = screen.getByTestId('product-title');
        expect(title).toBeTruthy();
        expect(title.textContent).toBe(product.title);

        // Price should be present (either regular or discounted)
        const priceElement =
          container.querySelector('[data-testid="product-price"]') ||
          container.querySelector('[data-testid="discounted-price"]');
        expect(priceElement).toBeTruthy();

        // If discount exists, discount information should be present
        if (product.discount_price && product.discount_price < product.base_price) {
          const discountedPrice = container.querySelector('[data-testid="discounted-price"]');
          const originalPrice = container.querySelector('[data-testid="original-price"]');
          const savingsPercent = container.querySelector('[data-testid="savings-percent"]');

          expect(discountedPrice).toBeTruthy();
          expect(originalPrice).toBeTruthy();
          expect(savingsPercent).toBeTruthy();
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Discount display completeness
   * Feature: product-detail-redesign, Property 8: Discount display completeness
   * Validates: Requirements 2.2
   */
  test('Property 8: products with discounts display all required discount elements', () => {
    fc.assert(
      fc.property(
        fc
          .record({
            id: fc.uuid(),
            title: fc.string({ minLength: 5, maxLength: 100 }),
            base_price: fc.integer({ min: 1000, max: 100000 }),
            discount_price: fc.integer({ min: 100, max: 999 }),
            is_featured: fc.boolean(),
            is_new_arrival: fc.boolean(),
            is_best_seller: fc.boolean(),
            is_offer_item: fc.boolean(),
            created_at: fc.constant(new Date().toISOString()),
          })
          .filter((p) => p.discount_price < p.base_price),
        (productData) => {
          const product = productData as Product;
          const mockOnVariantChange = vi.fn();
          const mockOnAddToCart = vi.fn();
          const mockOnAddToWishlist = vi.fn();

          const { container } = render(
            <ProductInfo
              product={product}
              variants={[]}
              selectedVariant={null}
              onVariantChange={mockOnVariantChange}
              onAddToCart={mockOnAddToCart}
              onAddToWishlist={mockOnAddToWishlist}
            />
          );

          // All three discount elements should be present
          const discountedPrice = container.querySelector('[data-testid="discounted-price"]');
          const originalPrice = container.querySelector('[data-testid="original-price"]');
          const savingsPercent = container.querySelector('[data-testid="savings-percent"]');

          expect(discountedPrice).toBeTruthy();
          expect(originalPrice).toBeTruthy();
          expect(savingsPercent).toBeTruthy();

          // Verify discount percentage calculation
          const expectedPercent = Math.round(
            ((product.base_price - product.discount_price!) / product.base_price) * 100
          );
          expect(savingsPercent?.textContent).toContain(`${expectedPercent}%`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 34: Stock status displays
   * Feature: product-detail-redesign, Property 34: Stock status displays
   * Validates: Requirements 8.3
   */
  test('Property 34: all products display stock status', () => {
    fc.assert(
      fc.property(productWithVariantsGenerator(), ({ product: productData, variants: variantsData }) => {
        const product = productData as Product;
        const variants = variantsData as ProductVariant[];
        const selectedVariant = variants[0];
        const mockOnVariantChange = vi.fn();
        const mockOnAddToCart = vi.fn();
        const mockOnAddToWishlist = vi.fn();

        render(
          <ProductInfo
            product={product}
            variants={variants}
            selectedVariant={selectedVariant}
            onVariantChange={mockOnVariantChange}
            onAddToCart={mockOnAddToCart}
            onAddToWishlist={mockOnAddToWishlist}
          />
        );

        // Stock status should be present
        const stockStatus = screen.getByTestId('stock-status');
        expect(stockStatus).toBeTruthy();

        // Verify correct stock status based on quantity
        const stockQuantity = selectedVariant.stock_quantity;
        if (stockQuantity === 0) {
          expect(stockStatus.textContent).toContain('Out of Stock');
        } else if (stockQuantity <= 5) {
          expect(stockStatus.textContent).toContain('left in stock');
        } else {
          expect(stockStatus.textContent).toContain('In Stock');
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 16: Action buttons present
   * Feature: product-detail-redesign, Property 16: Action buttons present
   * Validates: Requirements 4.1
   */
  test('Property 16: all product pages render Add to Cart and Add to Wishlist buttons', () => {
    fc.assert(
      fc.property(productGenerator(), (productData) => {
        const product = productData as Product;
        const mockOnVariantChange = vi.fn();
        const mockOnAddToCart = vi.fn();
        const mockOnAddToWishlist = vi.fn();

        render(
          <ProductInfo
            product={product}
            variants={[]}
            selectedVariant={null}
            onVariantChange={mockOnVariantChange}
            onAddToCart={mockOnAddToCart}
            onAddToWishlist={mockOnAddToWishlist}
          />
        );

        // Both action buttons should be present
        const addToCartButton = screen.getByTestId('add-to-cart-button');
        const wishlistButton = screen.getByTestId('wishlist-button');

        expect(addToCartButton).toBeTruthy();
        expect(wishlistButton).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 17: Add to cart updates store
   * Feature: product-detail-redesign, Property 17: Add to cart updates store
   * Validates: Requirements 4.2
   */
  test('Property 17: clicking Add to Cart updates cart store and increments cart count', () => {
    fc.assert(
      fc.property(
        productWithVariantsGenerator(),
        async ({ product: productData, variants: variantsData }) => {
          const product = productData as Product;
          const variants = variantsData as ProductVariant[];
          const selectedVariant = variants[0];
          const mockOnVariantChange = vi.fn();
          const mockOnAddToCart = vi.fn();
          const mockOnAddToWishlist = vi.fn();

          // Clear cart before test
          useCartStore.setState({ items: [] });
          const initialCartCount = useCartStore.getState().items.length;

          render(
            <ProductInfo
              product={product}
              variants={variants}
              selectedVariant={selectedVariant}
              onVariantChange={mockOnVariantChange}
              onAddToCart={mockOnAddToCart}
              onAddToWishlist={mockOnAddToWishlist}
            />
          );

          const addToCartButton = screen.getByTestId('add-to-cart-button');
          
          // Click add to cart
          fireEvent.click(addToCartButton);

          // Wait for async operation
          await waitFor(() => {
            const cartState = useCartStore.getState();
            const newCartCount = cartState.items.length;

            // Cart count should have increased
            expect(newCartCount).toBeGreaterThan(initialCartCount);

            // Product should be in cart
            const itemInCart = cartState.items.find(
              (item) => item.product.id === product.id && item.variant?.id === selectedVariant.id
            );
            expect(itemInCart).toBeTruthy();
          });
        }
      ),
      { numRuns: 50 } // Reduced runs for async tests
    );
  });

  /**
   * Property 18: Wishlist toggle state
   * Feature: product-detail-redesign, Property 18: Wishlist toggle state
   * Validates: Requirements 4.3
   */
  test('Property 18: clicking wishlist button toggles wishlist state between added and not added', () => {
    fc.assert(
      fc.property(productGenerator(), async (productData) => {
        const product = productData as Product;
        const mockOnVariantChange = vi.fn();
        const mockOnAddToCart = vi.fn();
        const mockOnAddToWishlist = vi.fn();

        // Clear wishlist before test
        useWishlistStore.setState({ items: [] });
        const initialWishlistState = useWishlistStore.getState().isInWishlist(product.id);

        render(
          <ProductInfo
            product={product}
            variants={[]}
            selectedVariant={null}
            onVariantChange={mockOnVariantChange}
            onAddToCart={mockOnAddToCart}
            onAddToWishlist={mockOnAddToWishlist}
          />
        );

        const wishlistButton = screen.getByTestId('wishlist-button');

        // Click wishlist button
        fireEvent.click(wishlistButton);

        // Wait for async operation
        await waitFor(() => {
          const newWishlistState = useWishlistStore.getState().isInWishlist(product.id);
          // State should have toggled
          expect(newWishlistState).toBe(!initialWishlistState);
        });

        // Click again to toggle back
        fireEvent.click(wishlistButton);

        await waitFor(() => {
          const finalWishlistState = useWishlistStore.getState().isInWishlist(product.id);
          // State should be back to initial
          expect(finalWishlistState).toBe(initialWishlistState);
        });
      }),
      { numRuns: 50 } // Reduced runs for async tests
    );
  });
});
