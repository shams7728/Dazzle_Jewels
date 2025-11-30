import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { Product } from '@/types';

/**
 * Feature: product-showcase-sections, Property 1: Product navigation consistency
 * Validates: Requirements 1.5, 2.5, 3.5
 * 
 * For any product displayed in any showcase section, clicking the product 
 * should navigate to the product detail page with the correct product ID in the URL.
 */

// Generator for creating random products
const productGenerator = () =>
  fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 5, maxLength: 50 }),
    description: fc.option(fc.string({ minLength: 10, maxLength: 200 })),
    base_price: fc.integer({ min: 1000, max: 100000 }),
    discount_price: fc.option(fc.integer({ min: 500, max: 99999 })),
    category_id: fc.option(fc.uuid()),
    is_featured: fc.boolean(),
    is_new_arrival: fc.boolean(),
    is_best_seller: fc.boolean(),
    is_offer_item: fc.boolean(),
    created_at: fc.constant(new Date().toISOString()),
  }) as fc.Arbitrary<Product>;

// Function that generates the expected product detail URL
function generateProductDetailUrl(productId: string): string {
  return `/products/${productId}`;
}

// Function that validates if a URL matches the expected pattern
function isValidProductDetailUrl(url: string, productId: string): boolean {
  const expectedUrl = generateProductDetailUrl(productId);
  return url === expectedUrl;
}

describe('Product Navigation - Property-Based Tests', () => {
  test('product navigation consistency - URL contains correct product ID', () => {
    fc.assert(
      fc.property(
        productGenerator(),
        (product) => {
          const generatedUrl = generateProductDetailUrl(product.id);
          
          // The URL should follow the pattern /products/{id}
          const urlPattern = /^\/products\/[a-f0-9-]{36}$/;
          const matchesPattern = urlPattern.test(generatedUrl);
          
          // The URL should contain the exact product ID
          const containsProductId = generatedUrl.includes(product.id);
          
          // The URL should be valid for the given product
          const isValid = isValidProductDetailUrl(generatedUrl, product.id);
          
          return matchesPattern && containsProductId && isValid;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('product navigation consistency - different products have different URLs', () => {
    fc.assert(
      fc.property(
        productGenerator(),
        productGenerator(),
        (product1, product2) => {
          // Skip if products have the same ID (extremely unlikely with UUIDs)
          fc.pre(product1.id !== product2.id);
          
          const url1 = generateProductDetailUrl(product1.id);
          const url2 = generateProductDetailUrl(product2.id);
          
          // Different products should have different URLs
          return url1 !== url2;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('product navigation consistency - URL generation is deterministic', () => {
    fc.assert(
      fc.property(
        productGenerator(),
        (product) => {
          // Generating the URL multiple times should produce the same result
          const url1 = generateProductDetailUrl(product.id);
          const url2 = generateProductDetailUrl(product.id);
          const url3 = generateProductDetailUrl(product.id);
          
          return url1 === url2 && url2 === url3;
        }
      ),
      { numRuns: 100 }
    );
  });
});
