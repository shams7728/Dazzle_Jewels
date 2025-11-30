import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Feature: product-showcase-sections, Property 16: Bulk update consistency
 * Validates: Requirements 8.4
 * 
 * For any set of selected products in the admin panel, applying showcase attributes 
 * in bulk should update all selected products with the same attribute values.
 */

// Type for showcase attributes
interface ShowcaseAttributes {
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_offer_item: boolean;
}

// Type for a product with showcase attributes
interface Product {
  id: string;
  title: string;
  showcase: ShowcaseAttributes;
}

// Type for bulk update operation
type BulkUpdateOperation = 
  | { type: 'set_new_arrival' }
  | { type: 'remove_new_arrival' }
  | { type: 'set_best_seller' }
  | { type: 'remove_best_seller' }
  | { type: 'set_offer_item' }
  | { type: 'remove_offer_item' };

// Simulates applying a bulk update to a set of products
function applyBulkUpdate(
  products: Product[],
  selectedIds: Set<string>,
  operation: BulkUpdateOperation
): Product[] {
  return products.map(product => {
    if (!selectedIds.has(product.id)) {
      return product;
    }

    const updatedShowcase = { ...product.showcase };

    switch (operation.type) {
      case 'set_new_arrival':
        updatedShowcase.is_new_arrival = true;
        break;
      case 'remove_new_arrival':
        updatedShowcase.is_new_arrival = false;
        break;
      case 'set_best_seller':
        updatedShowcase.is_best_seller = true;
        break;
      case 'remove_best_seller':
        updatedShowcase.is_best_seller = false;
        break;
      case 'set_offer_item':
        updatedShowcase.is_offer_item = true;
        break;
      case 'remove_offer_item':
        updatedShowcase.is_offer_item = false;
        break;
    }

    return {
      ...product,
      showcase: updatedShowcase,
    };
  });
}

// Check if all selected products have the expected attribute value
function allSelectedProductsHaveAttribute(
  products: Product[],
  selectedIds: Set<string>,
  attributeKey: keyof ShowcaseAttributes,
  expectedValue: boolean
): boolean {
  return products
    .filter(p => selectedIds.has(p.id))
    .every(p => p.showcase[attributeKey] === expectedValue);
}

// Check if non-selected products remain unchanged
function nonSelectedProductsUnchanged(
  originalProducts: Product[],
  updatedProducts: Product[],
  selectedIds: Set<string>
): boolean {
  return originalProducts.every((original, index) => {
    if (selectedIds.has(original.id)) {
      return true; // Skip selected products
    }
    const updated = updatedProducts[index];
    return (
      updated.showcase.is_new_arrival === original.showcase.is_new_arrival &&
      updated.showcase.is_best_seller === original.showcase.is_best_seller &&
      updated.showcase.is_offer_item === original.showcase.is_offer_item
    );
  });
}

// Generators
const showcaseAttributesArbitrary = fc.record({
  is_new_arrival: fc.boolean(),
  is_best_seller: fc.boolean(),
  is_offer_item: fc.boolean(),
});

const productArbitrary = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  showcase: showcaseAttributesArbitrary,
});

const bulkOperationArbitrary = fc.constantFrom<BulkUpdateOperation>(
  { type: 'set_new_arrival' },
  { type: 'remove_new_arrival' },
  { type: 'set_best_seller' },
  { type: 'remove_best_seller' },
  { type: 'set_offer_item' },
  { type: 'remove_offer_item' }
);

describe('Bulk Update Consistency - Property-Based Tests', () => {
  test('bulk update consistency - all selected products receive the same update', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 20 }),
        fc.nat(),
        bulkOperationArbitrary,
        (products, selectionSeed, operation) => {
          // Select a random subset of products
          const selectedIds = new Set(
            products
              .filter((_, i) => (i + selectionSeed) % 3 === 0)
              .map(p => p.id)
          );

          if (selectedIds.size === 0) return true; // Skip if no products selected

          const updated = applyBulkUpdate(products, selectedIds, operation);

          // Determine expected attribute and value based on operation
          let attributeKey: keyof ShowcaseAttributes;
          let expectedValue: boolean;

          switch (operation.type) {
            case 'set_new_arrival':
              attributeKey = 'is_new_arrival';
              expectedValue = true;
              break;
            case 'remove_new_arrival':
              attributeKey = 'is_new_arrival';
              expectedValue = false;
              break;
            case 'set_best_seller':
              attributeKey = 'is_best_seller';
              expectedValue = true;
              break;
            case 'remove_best_seller':
              attributeKey = 'is_best_seller';
              expectedValue = false;
              break;
            case 'set_offer_item':
              attributeKey = 'is_offer_item';
              expectedValue = true;
              break;
            case 'remove_offer_item':
              attributeKey = 'is_offer_item';
              expectedValue = false;
              break;
          }

          // All selected products should have the expected attribute value
          return allSelectedProductsHaveAttribute(
            updated,
            selectedIds,
            attributeKey,
            expectedValue
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  test('bulk update consistency - non-selected products remain unchanged', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 2, maxLength: 20 }),
        fc.nat(),
        bulkOperationArbitrary,
        (products, selectionSeed, operation) => {
          // Select a subset, ensuring some products are not selected
          const selectedIds = new Set(
            products
              .filter((_, i) => (i + selectionSeed) % 3 === 0)
              .map(p => p.id)
          );

          if (selectedIds.size === products.length) return true; // Skip if all selected

          const updated = applyBulkUpdate(products, selectedIds, operation);

          // Non-selected products should remain unchanged
          return nonSelectedProductsUnchanged(products, updated, selectedIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('bulk update consistency - only target attribute is modified', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 20 }),
        fc.nat(),
        bulkOperationArbitrary,
        (products, selectionSeed, operation) => {
          const selectedIds = new Set(
            products
              .filter((_, i) => (i + selectionSeed) % 3 === 0)
              .map(p => p.id)
          );

          if (selectedIds.size === 0) return true;

          const updated = applyBulkUpdate(products, selectedIds, operation);

          // Determine which attributes should remain unchanged
          const unchangedAttributes: (keyof ShowcaseAttributes)[] = [];
          
          if (!operation.type.includes('new_arrival')) {
            unchangedAttributes.push('is_new_arrival');
          }
          if (!operation.type.includes('best_seller')) {
            unchangedAttributes.push('is_best_seller');
          }
          if (!operation.type.includes('offer_item')) {
            unchangedAttributes.push('is_offer_item');
          }

          // Check that unchanged attributes remain the same for selected products
          return products.every((original, index) => {
            if (!selectedIds.has(original.id)) return true;
            
            const updatedProduct = updated[index];
            return unchangedAttributes.every(
              attr => updatedProduct.showcase[attr] === original.showcase[attr]
            );
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('bulk update consistency - empty selection results in no changes', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 20 }),
        bulkOperationArbitrary,
        (products, operation) => {
          const selectedIds = new Set<string>(); // Empty selection

          const updated = applyBulkUpdate(products, selectedIds, operation);

          // All products should remain unchanged
          return products.every((original, index) => {
            const updatedProduct = updated[index];
            return (
              updatedProduct.showcase.is_new_arrival === original.showcase.is_new_arrival &&
              updatedProduct.showcase.is_best_seller === original.showcase.is_best_seller &&
              updatedProduct.showcase.is_offer_item === original.showcase.is_offer_item
            );
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('bulk update consistency - selecting all products updates all products', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 20 }),
        bulkOperationArbitrary,
        (products, operation) => {
          const selectedIds = new Set(products.map(p => p.id)); // Select all

          const updated = applyBulkUpdate(products, selectedIds, operation);

          // Determine expected attribute and value
          let attributeKey: keyof ShowcaseAttributes;
          let expectedValue: boolean;

          switch (operation.type) {
            case 'set_new_arrival':
              attributeKey = 'is_new_arrival';
              expectedValue = true;
              break;
            case 'remove_new_arrival':
              attributeKey = 'is_new_arrival';
              expectedValue = false;
              break;
            case 'set_best_seller':
              attributeKey = 'is_best_seller';
              expectedValue = true;
              break;
            case 'remove_best_seller':
              attributeKey = 'is_best_seller';
              expectedValue = false;
              break;
            case 'set_offer_item':
              attributeKey = 'is_offer_item';
              expectedValue = true;
              break;
            case 'remove_offer_item':
              attributeKey = 'is_offer_item';
              expectedValue = false;
              break;
          }

          // All products should have the expected value
          return updated.every(p => p.showcase[attributeKey] === expectedValue);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('bulk update consistency - idempotent operations', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 20 }),
        fc.nat(),
        bulkOperationArbitrary,
        (products, selectionSeed, operation) => {
          const selectedIds = new Set(
            products
              .filter((_, i) => (i + selectionSeed) % 3 === 0)
              .map(p => p.id)
          );

          if (selectedIds.size === 0) return true;

          // Apply the same operation twice
          const updated1 = applyBulkUpdate(products, selectedIds, operation);
          const updated2 = applyBulkUpdate(updated1, selectedIds, operation);

          // Results should be identical
          return updated1.every((p1, index) => {
            const p2 = updated2[index];
            return (
              p2.showcase.is_new_arrival === p1.showcase.is_new_arrival &&
              p2.showcase.is_best_seller === p1.showcase.is_best_seller &&
              p2.showcase.is_offer_item === p1.showcase.is_offer_item
            );
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('bulk update consistency - product count remains the same', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 20 }),
        fc.nat(),
        bulkOperationArbitrary,
        (products, selectionSeed, operation) => {
          const selectedIds = new Set(
            products
              .filter((_, i) => (i + selectionSeed) % 3 === 0)
              .map(p => p.id)
          );

          const updated = applyBulkUpdate(products, selectedIds, operation);

          // Product count should remain the same
          return updated.length === products.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('bulk update consistency - product IDs remain unchanged', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 20 }),
        fc.nat(),
        bulkOperationArbitrary,
        (products, selectionSeed, operation) => {
          const selectedIds = new Set(
            products
              .filter((_, i) => (i + selectionSeed) % 3 === 0)
              .map(p => p.id)
          );

          const updated = applyBulkUpdate(products, selectedIds, operation);

          // All product IDs should remain the same
          return products.every((original, index) => {
            return updated[index].id === original.id;
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
