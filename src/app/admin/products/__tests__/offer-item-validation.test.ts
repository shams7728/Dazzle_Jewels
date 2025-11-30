import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Feature: product-showcase-sections, Property 7: Offer item validation
 * Validates: Requirements 6.1
 * 
 * For any product marked as an offer item without a discount price, 
 * the form should display a warning message.
 */

// Type for product form data
interface ProductFormData {
  title: string;
  base_price: number;
  discount_price: number | null;
  is_offer_item: boolean;
}

// Type for validation result
interface ValidationResult {
  shouldShowWarning: boolean;
  warningMessage?: string;
}

// Function that validates offer item and returns whether warning should be shown
function validateOfferItem(formData: ProductFormData): ValidationResult {
  // Check if discount_price is null or undefined (not just falsy, since 0 is a valid discount)
  const shouldShowWarning = formData.is_offer_item && (formData.discount_price === null || formData.discount_price === undefined);
  
  return {
    shouldShowWarning,
    warningMessage: shouldShowWarning 
      ? '⚠️ This product is marked as an offer item but has no discount price set.'
      : undefined,
  };
}

// Generator for product form data
const productFormDataArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  base_price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }),
  discount_price: fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }), { nil: null }),
  is_offer_item: fc.boolean(),
});

describe('Offer Item Validation - Property-Based Tests', () => {
  test('offer item validation - warning shown when offer item has no discount', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }),
        (title, basePrice) => {
          const formData: ProductFormData = {
            title,
            base_price: basePrice,
            discount_price: null,
            is_offer_item: true,
          };
          
          const result = validateOfferItem(formData);
          
          // Warning should be shown
          return result.shouldShowWarning === true && result.warningMessage !== undefined;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('offer item validation - no warning when offer item has discount', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }),
        (title, basePrice, discountPrice) => {
          const formData: ProductFormData = {
            title,
            base_price: basePrice,
            discount_price: discountPrice,
            is_offer_item: true,
          };
          
          const result = validateOfferItem(formData);
          
          // No warning should be shown
          return result.shouldShowWarning === false;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('offer item validation - no warning when not an offer item', () => {
    fc.assert(
      fc.property(
        productFormDataArbitrary,
        (formData) => {
          const notOfferItem = { ...formData, is_offer_item: false };
          const result = validateOfferItem(notOfferItem);
          
          // No warning should be shown regardless of discount price
          return result.shouldShowWarning === false;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('offer item validation - warning state is consistent', () => {
    fc.assert(
      fc.property(
        productFormDataArbitrary,
        (formData) => {
          const result1 = validateOfferItem(formData);
          const result2 = validateOfferItem(formData);
          
          // Multiple validations of the same data should produce the same result
          return result1.shouldShowWarning === result2.shouldShowWarning;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('offer item validation - warning depends only on offer flag and discount', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }), { nil: null }),
        (isOfferItem, discountPrice) => {
          // Create two products with different titles and prices but same offer/discount
          const formData1: ProductFormData = {
            title: 'Product A',
            base_price: 100,
            discount_price: discountPrice,
            is_offer_item: isOfferItem,
          };
          
          const formData2: ProductFormData = {
            title: 'Product B',
            base_price: 500,
            discount_price: discountPrice,
            is_offer_item: isOfferItem,
          };
          
          const result1 = validateOfferItem(formData1);
          const result2 = validateOfferItem(formData2);
          
          // Both should have the same warning state
          return result1.shouldShowWarning === result2.shouldShowWarning;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('offer item validation - all combinations are handled correctly', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        (isOfferItem, hasDiscount) => {
          const formData: ProductFormData = {
            title: 'Test Product',
            base_price: 100,
            discount_price: hasDiscount ? 80 : null,
            is_offer_item: isOfferItem,
          };
          
          const result = validateOfferItem(formData);
          
          // Warning should only show when is_offer_item=true AND discount_price=null
          const expectedWarning = isOfferItem && !hasDiscount;
          
          return result.shouldShowWarning === expectedWarning;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('offer item validation - zero discount price is treated as having discount', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }),
        (title, basePrice) => {
          const formData: ProductFormData = {
            title,
            base_price: basePrice,
            discount_price: 0,
            is_offer_item: true,
          };
          
          const result = validateOfferItem(formData);
          
          // Zero is a valid discount price (free item), so no warning
          return result.shouldShowWarning === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});
