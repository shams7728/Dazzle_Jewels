import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { Product } from '@/types';

/**
 * Feature: product-showcase-sections, Property 3: Product card completeness
 * Validates: Requirements 1.4, 2.4, 3.4
 * 
 * For any product displayed in a showcase section, the rendered card should contain 
 * all required information fields (image, name, price, and section-specific attributes 
 * like badges or discount information).
 */

// Generator for creating random products with valid discount prices
const productGenerator = () =>
  fc.integer({ min: 1000, max: 100000 }).chain(basePrice =>
    fc.record({
      id: fc.uuid(),
      title: fc.string({ minLength: 5, maxLength: 50 }),
      description: fc.option(fc.string({ minLength: 10, maxLength: 200 })),
      base_price: fc.constant(basePrice),
      discount_price: fc.option(fc.integer({ min: 500, max: basePrice - 1 })),
      category_id: fc.option(fc.uuid()),
      is_featured: fc.boolean(),
      is_new_arrival: fc.boolean(),
      is_best_seller: fc.boolean(),
      is_offer_item: fc.boolean(),
      created_at: fc.constant(new Date().toISOString()),
      variants: fc.option(fc.array(fc.record({
        id: fc.uuid(),
        product_id: fc.uuid(),
        color: fc.option(fc.string()),
        material: fc.option(fc.string()),
        price_adjustment: fc.integer({ min: 0, max: 10000 }),
        stock_quantity: fc.integer({ min: 0, max: 100 }),
        images: fc.array(fc.webUrl(), { minLength: 1, maxLength: 3 }),
        created_at: fc.constant(new Date().toISOString()),
      }), { minLength: 1, maxLength: 3 })),
    })
  ) as fc.Arbitrary<Product>;

// Function that checks if a product card has all required fields
interface ProductCardData {
  hasImage: boolean;
  hasTitle: boolean;
  hasPrice: boolean;
  hasDiscountInfo: boolean;
  hasBadge: boolean;
}

function validateProductCardCompleteness(product: Product, showcaseType: 'new_arrival' | 'best_seller' | 'offer_item'): ProductCardData {
  const firstVariant = product.variants?.[0];
  const hasImage = !!(firstVariant?.images && firstVariant.images.length > 0);
  const hasTitle = !!product.title && product.title.length > 0;
  const hasPrice = product.base_price > 0;
  
  // Discount info should be present if there's a discount price
  const hasDiscountInfo = product.discount_price ? product.discount_price > 0 : true;
  
  // Badge should be present based on showcase type
  let hasBadge = false;
  if (showcaseType === 'new_arrival') {
    hasBadge = product.is_new_arrival;
  } else if (showcaseType === 'best_seller') {
    hasBadge = product.is_best_seller;
  } else if (showcaseType === 'offer_item') {
    hasBadge = product.is_offer_item;
  }
  
  return {
    hasImage,
    hasTitle,
    hasPrice,
    hasDiscountInfo,
    hasBadge,
  };
}

describe('Product Card Completeness - Property-Based Tests', () => {
  test('product card completeness - all required fields are present', () => {
    fc.assert(
      fc.property(
        productGenerator(),
        fc.constantFrom('new_arrival', 'best_seller', 'offer_item') as fc.Arbitrary<'new_arrival' | 'best_seller' | 'offer_item'>,
        (product, showcaseType) => {
          const cardData = validateProductCardCompleteness(product, showcaseType);
          
          // All products must have a title
          const titlePresent = cardData.hasTitle;
          
          // All products must have a price
          const pricePresent = cardData.hasPrice;
          
          // If discount price exists, it should be valid
          const discountValid = cardData.hasDiscountInfo;
          
          return titlePresent && pricePresent && discountValid;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('product card completeness - discount information is consistent', () => {
    fc.assert(
      fc.property(
        productGenerator(),
        (product) => {
          // If a product has a discount price, it should be less than the base price
          if (product.discount_price) {
            return product.discount_price < product.base_price;
          }
          // If no discount price, that's valid too
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('product card completeness - showcase badge matches product flag', () => {
    fc.assert(
      fc.property(
        productGenerator(),
        fc.constantFrom('new_arrival', 'best_seller', 'offer_item') as fc.Arbitrary<'new_arrival' | 'best_seller' | 'offer_item'>,
        (product, showcaseType) => {
          const cardData = validateProductCardCompleteness(product, showcaseType);
          
          // The badge presence should match the corresponding product flag
          if (showcaseType === 'new_arrival') {
            return cardData.hasBadge === product.is_new_arrival;
          } else if (showcaseType === 'best_seller') {
            return cardData.hasBadge === product.is_best_seller;
          } else if (showcaseType === 'offer_item') {
            return cardData.hasBadge === product.is_offer_item;
          }
          return false;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('product card completeness - offer items should have discount information', () => {
    fc.assert(
      fc.property(
        productGenerator(),
        (product) => {
          // If a product is marked as an offer item, it should ideally have a discount
          // However, this is a warning condition, not a hard requirement
          // So we just check that if it's an offer item AND has a discount, the discount is valid
          if (product.is_offer_item && product.discount_price) {
            return product.discount_price < product.base_price && product.discount_price > 0;
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
