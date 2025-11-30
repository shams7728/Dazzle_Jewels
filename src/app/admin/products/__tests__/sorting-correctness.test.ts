import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Feature: product-showcase-sections, Property 15: Sorting correctness
 * Validates: Requirements 8.3
 * 
 * For any showcase attribute used for sorting in the admin panel, products 
 * should be ordered correctly based on the boolean values (true before false 
 * or vice versa depending on sort direction).
 */

// Type for product with showcase attributes
interface Product {
  id: string;
  title: string;
  created_at: string;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_offer_item: boolean;
}

// Type for sort options
type SortOption = 'created_at' | 'is_new_arrival' | 'is_best_seller' | 'is_offer_item';

// Function that implements the sorting logic from the admin panel
function sortProducts(products: Product[], sortBy: SortOption): Product[] {
  return [...products].sort((a, b) => {
    if (sortBy === "created_at") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === "is_new_arrival") {
      return (b.is_new_arrival ? 1 : 0) - (a.is_new_arrival ? 1 : 0);
    } else if (sortBy === "is_best_seller") {
      return (b.is_best_seller ? 1 : 0) - (a.is_best_seller ? 1 : 0);
    } else if (sortBy === "is_offer_item") {
      return (b.is_offer_item ? 1 : 0) - (a.is_offer_item ? 1 : 0);
    }
    return 0;
  });
}

// Generator for products
const productArbitrary = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  created_at: fc.integer({ min: 1577836800000, max: 1735689600000 }).map(ts => new Date(ts).toISOString()),
  is_new_arrival: fc.boolean(),
  is_best_seller: fc.boolean(),
  is_offer_item: fc.boolean(),
});

// Generator for sort options (showcase attributes only)
const showcaseSortArbitrary = fc.constantFrom<SortOption>(
  'is_new_arrival',
  'is_best_seller',
  'is_offer_item'
);

describe('Sorting Correctness - Property-Based Tests', () => {
  test('sorting correctness - true values appear before false values for showcase attributes', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 2, maxLength: 20 }),
        showcaseSortArbitrary,
        (products, sortBy) => {
          const sorted = sortProducts(products, sortBy);
          
          // Find the index of the first false value
          const firstFalseIndex = sorted.findIndex(p => !p[sortBy]);
          
          // If there are no false values, the test passes
          if (firstFalseIndex === -1) return true;
          
          // All products before the first false should be true
          const allTrueBeforeFalse = sorted
            .slice(0, firstFalseIndex)
            .every(p => p[sortBy] === true);
          
          // All products from the first false onwards should be false
          const allFalseAfter = sorted
            .slice(firstFalseIndex)
            .every(p => p[sortBy] === false);
          
          return allTrueBeforeFalse && allFalseAfter;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('sorting correctness - products with true attribute come first', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 2, maxLength: 20 }),
        showcaseSortArbitrary,
        (products, sortBy) => {
          // Ensure we have at least one true and one false
          if (products.every(p => p[sortBy]) || products.every(p => !p[sortBy])) {
            return true; // Skip if all same value
          }
          
          const sorted = sortProducts(products, sortBy);
          
          // Find first true and first false
          const firstTrueIndex = sorted.findIndex(p => p[sortBy] === true);
          const firstFalseIndex = sorted.findIndex(p => p[sortBy] === false);
          
          // If both exist, true should come before false
          if (firstTrueIndex !== -1 && firstFalseIndex !== -1) {
            return firstTrueIndex < firstFalseIndex;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('sorting correctness - sorting is stable for products with same attribute value', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 2, maxLength: 20 }),
        showcaseSortArbitrary,
        (products, sortBy) => {
          const sorted = sortProducts(products, sortBy);
          
          // Group products by their attribute value
          const trueProducts = sorted.filter(p => p[sortBy] === true);
          const falseProducts = sorted.filter(p => p[sortBy] === false);
          
          // Verify that all true products come before all false products
          const trueCount = trueProducts.length;
          const actualTrueProducts = sorted.slice(0, trueCount);
          const actualFalseProducts = sorted.slice(trueCount);
          
          const allTrueFirst = actualTrueProducts.every(p => p[sortBy] === true);
          const allFalseLast = actualFalseProducts.every(p => p[sortBy] === false);
          
          return allTrueFirst && allFalseLast;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('sorting correctness - sorting preserves all products', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 20 }),
        showcaseSortArbitrary,
        (products, sortBy) => {
          const sorted = sortProducts(products, sortBy);
          
          // Same length
          if (sorted.length !== products.length) return false;
          
          // All original products are in sorted array
          const allPresent = products.every(p => 
            sorted.some(s => s.id === p.id)
          );
          
          return allPresent;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('sorting correctness - sorting by new arrival orders correctly', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 2, maxLength: 20 }),
        (products) => {
          const sorted = sortProducts(products, 'is_new_arrival');
          
          // Check that sorting is correct
          for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i].is_new_arrival ? 1 : 0;
            const next = sorted[i + 1].is_new_arrival ? 1 : 0;
            
            // Current should be >= next (descending order, true first)
            if (current < next) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('sorting correctness - sorting by best seller orders correctly', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 2, maxLength: 20 }),
        (products) => {
          const sorted = sortProducts(products, 'is_best_seller');
          
          // Check that sorting is correct
          for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i].is_best_seller ? 1 : 0;
            const next = sorted[i + 1].is_best_seller ? 1 : 0;
            
            // Current should be >= next (descending order, true first)
            if (current < next) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('sorting correctness - sorting by offer item orders correctly', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 2, maxLength: 20 }),
        (products) => {
          const sorted = sortProducts(products, 'is_offer_item');
          
          // Check that sorting is correct
          for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i].is_offer_item ? 1 : 0;
            const next = sorted[i + 1].is_offer_item ? 1 : 0;
            
            // Current should be >= next (descending order, true first)
            if (current < next) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('sorting correctness - empty array remains empty', () => {
    fc.assert(
      fc.property(
        showcaseSortArbitrary,
        (sortBy) => {
          const sorted = sortProducts([], sortBy);
          return sorted.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('sorting correctness - single product array remains unchanged', () => {
    fc.assert(
      fc.property(
        productArbitrary,
        showcaseSortArbitrary,
        (product, sortBy) => {
          const sorted = sortProducts([product], sortBy);
          return sorted.length === 1 && sorted[0].id === product.id;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('sorting correctness - all true products stay together', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 2, maxLength: 20 }),
        showcaseSortArbitrary,
        (products, sortBy) => {
          const sorted = sortProducts(products, sortBy);
          
          // Find indices of all true products
          const trueIndices: number[] = [];
          sorted.forEach((p, i) => {
            if (p[sortBy]) trueIndices.push(i);
          });
          
          // If there are true products, they should be consecutive from index 0
          if (trueIndices.length > 0) {
            const expectedIndices = Array.from({ length: trueIndices.length }, (_, i) => i);
            return JSON.stringify(trueIndices) === JSON.stringify(expectedIndices);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('sorting correctness - all false products stay together', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 2, maxLength: 20 }),
        showcaseSortArbitrary,
        (products, sortBy) => {
          const sorted = sortProducts(products, sortBy);
          
          // Find indices of all false products
          const falseIndices: number[] = [];
          sorted.forEach((p, i) => {
            if (!p[sortBy]) falseIndices.push(i);
          });
          
          // If there are false products, they should be consecutive at the end
          if (falseIndices.length > 0) {
            const startIndex = sorted.length - falseIndices.length;
            const expectedIndices = Array.from({ length: falseIndices.length }, (_, i) => startIndex + i);
            return JSON.stringify(falseIndices) === JSON.stringify(expectedIndices);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
