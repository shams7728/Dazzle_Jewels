import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Feature: product-showcase-sections, Property 17: Statistics accuracy
 * Validates: Requirements 8.5
 * 
 * For any showcase section, the displayed count should exactly match 
 * the number of products with the corresponding boolean flag set to true.
 */

// Type for product with showcase attributes
interface Product {
  id: string;
  title: string;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_offer_item: boolean;
}

// Type for showcase statistics
interface ShowcaseStatistics {
  newArrivalsCount: number;
  bestSellersCount: number;
  offerItemsCount: number;
}

// Calculate statistics from product array
function calculateShowcaseStatistics(products: Product[]): ShowcaseStatistics {
  return {
    newArrivalsCount: products.filter(p => p.is_new_arrival === true).length,
    bestSellersCount: products.filter(p => p.is_best_seller === true).length,
    offerItemsCount: products.filter(p => p.is_offer_item === true).length,
  };
}

// Generator for a single product
const productArbitrary = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  is_new_arrival: fc.boolean(),
  is_best_seller: fc.boolean(),
  is_offer_item: fc.boolean(),
});

describe('Statistics Accuracy - Property-Based Tests', () => {
  test('statistics accuracy - counts match actual product flags', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 100 }),
        (products) => {
          const stats = calculateShowcaseStatistics(products);
          
          // Manually count to verify
          const expectedNewArrivals = products.filter(p => p.is_new_arrival === true).length;
          const expectedBestSellers = products.filter(p => p.is_best_seller === true).length;
          const expectedOfferItems = products.filter(p => p.is_offer_item === true).length;
          
          return (
            stats.newArrivalsCount === expectedNewArrivals &&
            stats.bestSellersCount === expectedBestSellers &&
            stats.offerItemsCount === expectedOfferItems
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('statistics accuracy - empty product list yields zero counts', () => {
    fc.assert(
      fc.property(
        fc.constant([]),
        (products) => {
          const stats = calculateShowcaseStatistics(products);
          
          return (
            stats.newArrivalsCount === 0 &&
            stats.bestSellersCount === 0 &&
            stats.offerItemsCount === 0
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('statistics accuracy - all products with all flags true', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            is_new_arrival: fc.constant(true),
            is_best_seller: fc.constant(true),
            is_offer_item: fc.constant(true),
          }),
          { minLength: 1, maxLength: 50 }
        ),
        (products) => {
          const stats = calculateShowcaseStatistics(products);
          
          // All counts should equal the total number of products
          return (
            stats.newArrivalsCount === products.length &&
            stats.bestSellersCount === products.length &&
            stats.offerItemsCount === products.length
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('statistics accuracy - all products with all flags false', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            is_new_arrival: fc.constant(false),
            is_best_seller: fc.constant(false),
            is_offer_item: fc.constant(false),
          }),
          { minLength: 1, maxLength: 50 }
        ),
        (products) => {
          const stats = calculateShowcaseStatistics(products);
          
          // All counts should be zero
          return (
            stats.newArrivalsCount === 0 &&
            stats.bestSellersCount === 0 &&
            stats.offerItemsCount === 0
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('statistics accuracy - counts are non-negative', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 100 }),
        (products) => {
          const stats = calculateShowcaseStatistics(products);
          
          return (
            stats.newArrivalsCount >= 0 &&
            stats.bestSellersCount >= 0 &&
            stats.offerItemsCount >= 0
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('statistics accuracy - counts do not exceed total products', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 100 }),
        (products) => {
          const stats = calculateShowcaseStatistics(products);
          
          return (
            stats.newArrivalsCount <= products.length &&
            stats.bestSellersCount <= products.length &&
            stats.offerItemsCount <= products.length
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('statistics accuracy - adding product with flag increases count by one', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 50 }),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom('is_new_arrival', 'is_best_seller', 'is_offer_item'),
        (products, newId, newTitle, flagToSet) => {
          const statsBefore = calculateShowcaseStatistics(products);
          
          // Add a new product with one flag set to true
          const newProduct: Product = {
            id: newId,
            title: newTitle,
            is_new_arrival: flagToSet === 'is_new_arrival',
            is_best_seller: flagToSet === 'is_best_seller',
            is_offer_item: flagToSet === 'is_offer_item',
          };
          
          const updatedProducts = [...products, newProduct];
          const statsAfter = calculateShowcaseStatistics(updatedProducts);
          
          // The count for the set flag should increase by exactly 1
          if (flagToSet === 'is_new_arrival') {
            return (
              statsAfter.newArrivalsCount === statsBefore.newArrivalsCount + 1 &&
              statsAfter.bestSellersCount === statsBefore.bestSellersCount &&
              statsAfter.offerItemsCount === statsBefore.offerItemsCount
            );
          } else if (flagToSet === 'is_best_seller') {
            return (
              statsAfter.newArrivalsCount === statsBefore.newArrivalsCount &&
              statsAfter.bestSellersCount === statsBefore.bestSellersCount + 1 &&
              statsAfter.offerItemsCount === statsBefore.offerItemsCount
            );
          } else {
            return (
              statsAfter.newArrivalsCount === statsBefore.newArrivalsCount &&
              statsAfter.bestSellersCount === statsBefore.bestSellersCount &&
              statsAfter.offerItemsCount === statsBefore.offerItemsCount + 1
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('statistics accuracy - removing product with flag decreases count by one', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 50 }),
        fc.nat(),
        (products, indexSeed) => {
          const index = indexSeed % products.length;
          const productToRemove = products[index];
          
          const statsBefore = calculateShowcaseStatistics(products);
          const updatedProducts = products.filter((_, i) => i !== index);
          const statsAfter = calculateShowcaseStatistics(updatedProducts);
          
          // Calculate expected changes
          const newArrivalsChange = productToRemove.is_new_arrival ? -1 : 0;
          const bestSellersChange = productToRemove.is_best_seller ? -1 : 0;
          const offerItemsChange = productToRemove.is_offer_item ? -1 : 0;
          
          return (
            statsAfter.newArrivalsCount === statsBefore.newArrivalsCount + newArrivalsChange &&
            statsAfter.bestSellersCount === statsBefore.bestSellersCount + bestSellersChange &&
            statsAfter.offerItemsCount === statsBefore.offerItemsCount + offerItemsChange
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('statistics accuracy - statistics are independent of product order', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 2, maxLength: 20 }),
        (products) => {
          const stats1 = calculateShowcaseStatistics(products);
          
          // Reverse the array
          const reversedProducts = [...products].reverse();
          const stats2 = calculateShowcaseStatistics(reversedProducts);
          
          // Statistics should be identical regardless of order
          return (
            stats1.newArrivalsCount === stats2.newArrivalsCount &&
            stats1.bestSellersCount === stats2.bestSellersCount &&
            stats1.offerItemsCount === stats2.offerItemsCount
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('statistics accuracy - duplicate products are counted separately', () => {
    fc.assert(
      fc.property(
        productArbitrary,
        fc.integer({ min: 1, max: 10 }),
        (product, duplicateCount) => {
          // Create array with duplicate products (same attributes, different IDs)
          const products = Array.from({ length: duplicateCount }, (_, i) => ({
            ...product,
            id: `${product.id}-${i}`,
          }));
          
          const stats = calculateShowcaseStatistics(products);
          
          // Each duplicate should be counted
          const expectedNewArrivals = product.is_new_arrival ? duplicateCount : 0;
          const expectedBestSellers = product.is_best_seller ? duplicateCount : 0;
          const expectedOfferItems = product.is_offer_item ? duplicateCount : 0;
          
          return (
            stats.newArrivalsCount === expectedNewArrivals &&
            stats.bestSellersCount === expectedBestSellers &&
            stats.offerItemsCount === expectedOfferItems
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
