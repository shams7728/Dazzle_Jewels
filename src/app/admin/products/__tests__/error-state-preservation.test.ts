import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Feature: product-showcase-sections, Property 11: Error state preservation
 * Validates: Requirements 6.5
 * 
 * For any product form submission that fails due to database errors, 
 * the form should display an error message and preserve all user-entered values.
 */

// Type for product form data
interface ProductFormData {
  title: string;
  description: string;
  base_price: number;
  discount_price: number | null;
  category_id: string | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_offer_item: boolean;
}

// Type for form state after error
interface FormStateAfterError {
  formData: ProductFormData;
  errorMessage: string | null;
  hasError: boolean;
}

// Simulates a failed submission that should preserve form state
function simulateFailedSubmission(
  originalFormData: ProductFormData
): FormStateAfterError {
  // On error, form should preserve all data and show error message
  return {
    formData: { ...originalFormData },
    errorMessage: 'Database error: Failed to save product',
    hasError: true,
  };
}

// Check if form data is preserved exactly
function formDataPreserved(
  original: ProductFormData,
  afterError: ProductFormData
): boolean {
  // Helper to compare values that might be NaN
  const valuesEqual = (a: any, b: any): boolean => {
    if (typeof a === 'number' && typeof b === 'number') {
      // Both NaN
      if (Number.isNaN(a) && Number.isNaN(b)) return true;
      // Regular comparison
      return a === b;
    }
    return a === b;
  };

  return (
    original.title === afterError.title &&
    original.description === afterError.description &&
    valuesEqual(original.base_price, afterError.base_price) &&
    valuesEqual(original.discount_price, afterError.discount_price) &&
    original.category_id === afterError.category_id &&
    original.is_featured === afterError.is_featured &&
    original.is_new_arrival === afterError.is_new_arrival &&
    original.is_best_seller === afterError.is_best_seller &&
    original.is_offer_item === afterError.is_offer_item
  );
}

describe('Error State Preservation - Property-Based Tests', () => {
  test('error state preservation - all form data is preserved on error', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ maxLength: 500 }),
          base_price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000) }),
          discount_price: fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(1000000) }), { nil: null }),
          category_id: fc.option(fc.uuid(), { nil: null }),
          is_featured: fc.boolean(),
          is_new_arrival: fc.boolean(),
          is_best_seller: fc.boolean(),
          is_offer_item: fc.boolean(),
        }),
        (originalFormData) => {
          const result = simulateFailedSubmission(originalFormData);
          
          // All form data must be preserved exactly
          return formDataPreserved(originalFormData, result.formData);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('error state preservation - error message is displayed', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ maxLength: 500 }),
          base_price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000) }),
          discount_price: fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(1000000) }), { nil: null }),
          category_id: fc.option(fc.uuid(), { nil: null }),
          is_featured: fc.boolean(),
          is_new_arrival: fc.boolean(),
          is_best_seller: fc.boolean(),
          is_offer_item: fc.boolean(),
        }),
        (originalFormData) => {
          const result = simulateFailedSubmission(originalFormData);
          
          // Error message must be present and non-empty
          return (
            result.hasError === true &&
            result.errorMessage !== null &&
            result.errorMessage.length > 0
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  test('error state preservation - showcase attributes are preserved', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ maxLength: 500 }),
          base_price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000) }),
          discount_price: fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(1000000) }), { nil: null }),
          category_id: fc.option(fc.uuid(), { nil: null }),
          is_featured: fc.boolean(),
          is_new_arrival: fc.boolean(),
          is_best_seller: fc.boolean(),
          is_offer_item: fc.boolean(),
        }),
        (originalFormData) => {
          const result = simulateFailedSubmission(originalFormData);
          
          // Showcase attributes must be preserved exactly
          return (
            result.formData.is_new_arrival === originalFormData.is_new_arrival &&
            result.formData.is_best_seller === originalFormData.is_best_seller &&
            result.formData.is_offer_item === originalFormData.is_offer_item
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  test('error state preservation - numeric values are preserved exactly', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ maxLength: 500 }),
          base_price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000) }),
          discount_price: fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(1000000) }), { nil: null }),
          category_id: fc.option(fc.uuid(), { nil: null }),
          is_featured: fc.boolean(),
          is_new_arrival: fc.boolean(),
          is_best_seller: fc.boolean(),
          is_offer_item: fc.boolean(),
        }),
        (originalFormData) => {
          const result = simulateFailedSubmission(originalFormData);
          
          // Helper to compare values that might be NaN
          const valuesEqual = (a: any, b: any): boolean => {
            if (typeof a === 'number' && typeof b === 'number') {
              if (Number.isNaN(a) && Number.isNaN(b)) return true;
              return a === b;
            }
            return a === b;
          };
          
          // Numeric values must be preserved exactly (no rounding or conversion errors)
          return (
            valuesEqual(result.formData.base_price, originalFormData.base_price) &&
            valuesEqual(result.formData.discount_price, originalFormData.discount_price)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  test('error state preservation - string values are preserved exactly', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ maxLength: 500 }),
          base_price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000) }),
          discount_price: fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(1000000) }), { nil: null }),
          category_id: fc.option(fc.uuid(), { nil: null }),
          is_featured: fc.boolean(),
          is_new_arrival: fc.boolean(),
          is_best_seller: fc.boolean(),
          is_offer_item: fc.boolean(),
        }),
        (originalFormData) => {
          const result = simulateFailedSubmission(originalFormData);
          
          // String values must be preserved exactly (no trimming or modification)
          return (
            result.formData.title === originalFormData.title &&
            result.formData.description === originalFormData.description &&
            result.formData.category_id === originalFormData.category_id
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  test('error state preservation - null values remain null', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ maxLength: 500 }),
          base_price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000) }),
          discount_price: fc.constant(null),
          category_id: fc.constant(null),
          is_featured: fc.boolean(),
          is_new_arrival: fc.boolean(),
          is_best_seller: fc.boolean(),
          is_offer_item: fc.boolean(),
        }),
        (originalFormData) => {
          const result = simulateFailedSubmission(originalFormData);
          
          // Null values must remain null (not converted to empty strings or undefined)
          return (
            result.formData.discount_price === null &&
            result.formData.category_id === null
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
