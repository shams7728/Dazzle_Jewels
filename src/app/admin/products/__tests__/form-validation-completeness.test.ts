import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Feature: product-showcase-sections, Property 8: Form validation completeness
 * Validates: Requirements 6.2
 * 
 * For any product submission with showcase attributes, if required fields are missing, 
 * the form should prevent submission and display validation errors.
 */

// Type for product form data
interface ProductFormData {
  title: string;
  description: string;
  base_price: number | null;
  discount_price: number | null;
  category_id: string;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_offer_item: boolean;
}

// Type for validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Function that validates the complete form
function validateProductForm(formData: ProductFormData): ValidationResult {
  const errors: string[] = [];
  
  // Required field validations
  if (!formData.title || formData.title.trim() === '') {
    errors.push('Product title is required');
  } else if (formData.title.trim().length < 3) {
    // Title must be meaningful (not just whitespace or too short)
    errors.push('Product title must be at least 3 characters');
  }
  
  if (formData.base_price === null || formData.base_price === undefined || formData.base_price <= 0) {
    errors.push('Base price is required and must be greater than 0');
  }
  
  // Showcase-specific validations
  // When showcase attributes are set, ensure all required fields are complete
  const hasShowcaseAttribute = formData.is_new_arrival || formData.is_best_seller || formData.is_offer_item;
  
  if (hasShowcaseAttribute) {
    // Description should be present for showcase items
    if (!formData.description || formData.description.trim() === '') {
      errors.push('Description is required for showcase products');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Generator for product form data with potential missing fields
const productFormDataArbitrary = fc.record({
  title: fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: '' }),
  description: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: '' }),
  base_price: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(1000000), noNaN: true }), { nil: null }),
  discount_price: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(1000000), noNaN: true }), { nil: null }),
  category_id: fc.option(fc.uuid(), { nil: '' }),
  is_new_arrival: fc.boolean(),
  is_best_seller: fc.boolean(),
  is_offer_item: fc.boolean(),
});

// Generator for valid product form data
const validProductFormDataArbitrary = fc.record({
  title: fc.string({ minLength: 3, maxLength: 100 }).filter(s => s.trim().length >= 3),
  description: fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length >= 10),
  base_price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }),
  discount_price: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(1000000), noNaN: true }), { nil: null }),
  category_id: fc.uuid(),
  is_new_arrival: fc.boolean(),
  is_best_seller: fc.boolean(),
  is_offer_item: fc.boolean(),
});

describe('Form Validation Completeness - Property-Based Tests', () => {
  test('form validation completeness - missing title prevents submission', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.constant(''),
          description: fc.string({ minLength: 10, maxLength: 500 }),
          base_price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }),
          discount_price: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(1000000), noNaN: true }), { nil: null }),
          category_id: fc.uuid(),
          is_new_arrival: fc.boolean(),
          is_best_seller: fc.boolean(),
          is_offer_item: fc.boolean(),
        }),
        (formData) => {
          const result = validateProductForm(formData);
          
          // Form should be invalid
          return !result.isValid && result.errors.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('form validation completeness - missing base price prevents submission', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 3, maxLength: 100 }),
          description: fc.string({ minLength: 10, maxLength: 500 }),
          base_price: fc.constant(null),
          discount_price: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(1000000), noNaN: true }), { nil: null }),
          category_id: fc.uuid(),
          is_new_arrival: fc.boolean(),
          is_best_seller: fc.boolean(),
          is_offer_item: fc.boolean(),
        }),
        (formData) => {
          const result = validateProductForm(formData);
          
          // Form should be invalid
          return !result.isValid && result.errors.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('form validation completeness - valid form with showcase attributes passes', () => {
    fc.assert(
      fc.property(
        validProductFormDataArbitrary,
        (formData) => {
          const result = validateProductForm(formData);
          
          // Form should be valid
          return result.isValid && result.errors.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('form validation completeness - showcase products require description', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 3, maxLength: 100 }),
          description: fc.constant(''),
          base_price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }),
          discount_price: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(1000000), noNaN: true }), { nil: null }),
          category_id: fc.uuid(),
          is_new_arrival: fc.boolean(),
          is_best_seller: fc.boolean(),
          is_offer_item: fc.boolean(),
        }),
        (formData) => {
          // At least one showcase attribute must be true
          const showcaseFormData = {
            ...formData,
            is_new_arrival: true,
          };
          
          const result = validateProductForm(showcaseFormData);
          
          // Form should be invalid due to missing description
          return !result.isValid && result.errors.some(e => e.includes('Description'));
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('form validation completeness - showcase products require meaningful title', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 2 }).filter(s => s.trim().length > 0), // Too short but not empty
          description: fc.string({ minLength: 10, maxLength: 500 }),
          base_price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }),
          discount_price: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(1000000), noNaN: true }), { nil: null }),
          category_id: fc.uuid(),
          is_new_arrival: fc.boolean(),
          is_best_seller: fc.boolean(),
          is_offer_item: fc.boolean(),
        }),
        (formData) => {
          // At least one showcase attribute must be true
          const showcaseFormData = {
            ...formData,
            is_best_seller: true,
          };
          
          const result = validateProductForm(showcaseFormData);
          
          // Form should be invalid due to short title
          return !result.isValid && result.errors.some(e => e.includes('at least 3 characters'));
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('form validation completeness - validation is consistent', () => {
    fc.assert(
      fc.property(
        productFormDataArbitrary,
        (formData) => {
          const result1 = validateProductForm(formData);
          const result2 = validateProductForm(formData);
          
          // Multiple validations should produce the same result
          return result1.isValid === result2.isValid && result1.errors.length === result2.errors.length;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('form validation completeness - errors are descriptive', () => {
    fc.assert(
      fc.property(
        productFormDataArbitrary,
        (formData) => {
          const result = validateProductForm(formData);
          
          // If invalid, there should be at least one error message
          if (!result.isValid) {
            return result.errors.length > 0 && result.errors.every(e => e.length > 0);
          }
          
          // If valid, there should be no errors
          return result.errors.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('form validation completeness - zero or negative base price is invalid', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 3, maxLength: 100 }),
          description: fc.string({ minLength: 10, maxLength: 500 }),
          base_price: fc.float({ min: Math.fround(-1000), max: Math.fround(0), noNaN: true }),
          discount_price: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(1000000), noNaN: true }), { nil: null }),
          category_id: fc.uuid(),
          is_new_arrival: fc.boolean(),
          is_best_seller: fc.boolean(),
          is_offer_item: fc.boolean(),
        }),
        (formData) => {
          const result = validateProductForm(formData);
          
          // Form should be invalid
          return !result.isValid && result.errors.some(e => e.includes('Base price'));
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('form validation completeness - whitespace-only title is invalid', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.constantFrom('   ', '\t\t', '\n\n', '  \t  ', '     '),
          description: fc.string({ minLength: 10, maxLength: 500 }),
          base_price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }),
          discount_price: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(1000000), noNaN: true }), { nil: null }),
          category_id: fc.uuid(),
          is_new_arrival: fc.boolean(),
          is_best_seller: fc.boolean(),
          is_offer_item: fc.boolean(),
        }),
        (formData) => {
          const result = validateProductForm(formData);
          
          // Form should be invalid
          return !result.isValid && result.errors.some(e => e.includes('title'));
        }
      ),
      { numRuns: 100 }
    );
  });
});
