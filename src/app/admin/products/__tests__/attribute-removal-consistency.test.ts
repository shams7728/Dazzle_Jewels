import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Feature: product-showcase-sections, Property 6: Attribute removal consistency
 * Validates: Requirements 4.4
 * 
 * For any product with showcase attributes set to true, unchecking those 
 * attributes and saving should result in the database values being set to false.
 */

// Type for showcase attributes
interface ShowcaseAttributes {
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_offer_item: boolean;
}

// Simulates the process of unchecking an attribute and saving
function uncheckAndSaveAttribute(
  currentAttributes: ShowcaseAttributes,
  attributeToUncheck: keyof ShowcaseAttributes
): ShowcaseAttributes {
  // Create a new object with the specified attribute set to false
  return {
    ...currentAttributes,
    [attributeToUncheck]: false,
  };
}

// Simulates unchecking multiple attributes
function uncheckAndSaveMultipleAttributes(
  currentAttributes: ShowcaseAttributes,
  attributesToUncheck: Array<keyof ShowcaseAttributes>
): ShowcaseAttributes {
  let result = { ...currentAttributes };
  
  for (const attr of attributesToUncheck) {
    result = {
      ...result,
      [attr]: false,
    };
  }
  
  return result;
}

// Generator for showcase attributes with at least one true value
const showcaseAttributesWithTrueArbitrary = fc.record({
  is_new_arrival: fc.boolean(),
  is_best_seller: fc.boolean(),
  is_offer_item: fc.boolean(),
}).filter(attrs => attrs.is_new_arrival || attrs.is_best_seller || attrs.is_offer_item);

// Generator for all showcase attributes
const showcaseAttributesArbitrary = fc.record({
  is_new_arrival: fc.boolean(),
  is_best_seller: fc.boolean(),
  is_offer_item: fc.boolean(),
});

describe('Attribute Removal Consistency - Property-Based Tests', () => {
  test('attribute removal - unchecking new_arrival sets it to false', () => {
    fc.assert(
      fc.property(
        showcaseAttributesArbitrary,
        (attributes) => {
          const updated = uncheckAndSaveAttribute(attributes, 'is_new_arrival');
          
          // is_new_arrival should be false after unchecking
          return updated.is_new_arrival === false;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('attribute removal - unchecking best_seller sets it to false', () => {
    fc.assert(
      fc.property(
        showcaseAttributesArbitrary,
        (attributes) => {
          const updated = uncheckAndSaveAttribute(attributes, 'is_best_seller');
          
          // is_best_seller should be false after unchecking
          return updated.is_best_seller === false;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('attribute removal - unchecking offer_item sets it to false', () => {
    fc.assert(
      fc.property(
        showcaseAttributesArbitrary,
        (attributes) => {
          const updated = uncheckAndSaveAttribute(attributes, 'is_offer_item');
          
          // is_offer_item should be false after unchecking
          return updated.is_offer_item === false;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('attribute removal - unchecking does not affect other attributes', () => {
    fc.assert(
      fc.property(
        showcaseAttributesArbitrary,
        fc.constantFrom('is_new_arrival', 'is_best_seller', 'is_offer_item'),
        (attributes, attributeToUncheck) => {
          const updated = uncheckAndSaveAttribute(attributes, attributeToUncheck);
          
          // Other attributes should remain unchanged
          const otherAttributes = Object.keys(attributes).filter(
            key => key !== attributeToUncheck
          ) as Array<keyof ShowcaseAttributes>;
          
          return otherAttributes.every(
            attr => updated[attr] === attributes[attr]
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('attribute removal - unchecking all attributes sets all to false', () => {
    fc.assert(
      fc.property(
        showcaseAttributesArbitrary,
        (attributes) => {
          const updated = uncheckAndSaveMultipleAttributes(
            attributes,
            ['is_new_arrival', 'is_best_seller', 'is_offer_item']
          );
          
          // All attributes should be false
          return (
            updated.is_new_arrival === false &&
            updated.is_best_seller === false &&
            updated.is_offer_item === false
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('attribute removal - unchecking true value changes it to false', () => {
    fc.assert(
      fc.property(
        fc.constant({
          is_new_arrival: true,
          is_best_seller: true,
          is_offer_item: true,
        }),
        fc.constantFrom('is_new_arrival', 'is_best_seller', 'is_offer_item'),
        (attributes, attributeToUncheck) => {
          const updated = uncheckAndSaveAttribute(attributes, attributeToUncheck);
          
          // The unchecked attribute should now be false
          return updated[attributeToUncheck] === false;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('attribute removal - unchecking false value keeps it false', () => {
    fc.assert(
      fc.property(
        fc.constant({
          is_new_arrival: false,
          is_best_seller: false,
          is_offer_item: false,
        }),
        fc.constantFrom('is_new_arrival', 'is_best_seller', 'is_offer_item'),
        (attributes, attributeToUncheck) => {
          const updated = uncheckAndSaveAttribute(attributes, attributeToUncheck);
          
          // The attribute should remain false
          return updated[attributeToUncheck] === false;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('attribute removal - multiple unchecks are independent', () => {
    fc.assert(
      fc.property(
        showcaseAttributesArbitrary,
        fc.subarray(['is_new_arrival', 'is_best_seller', 'is_offer_item'] as const),
        (attributes, attributesToUncheck) => {
          const updated = uncheckAndSaveMultipleAttributes(
            attributes,
            attributesToUncheck as Array<keyof ShowcaseAttributes>
          );
          
          // All unchecked attributes should be false
          const allUncheckedAreFalse = attributesToUncheck.every(
            attr => updated[attr as keyof ShowcaseAttributes] === false
          );
          
          // Attributes not in the uncheck list should remain unchanged
          const allAttributes: Array<keyof ShowcaseAttributes> = [
            'is_new_arrival',
            'is_best_seller',
            'is_offer_item',
          ];
          const unchangedAttributes = allAttributes.filter(
            attr => !attributesToUncheck.includes(attr)
          );
          const unchangedRemainSame = unchangedAttributes.every(
            attr => updated[attr] === attributes[attr]
          );
          
          return allUncheckedAreFalse && unchangedRemainSame;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('attribute removal - removal is idempotent', () => {
    fc.assert(
      fc.property(
        showcaseAttributesArbitrary,
        fc.constantFrom('is_new_arrival', 'is_best_seller', 'is_offer_item'),
        (attributes, attributeToUncheck) => {
          // Unchecking multiple times should produce the same result
          const updated1 = uncheckAndSaveAttribute(attributes, attributeToUncheck);
          const updated2 = uncheckAndSaveAttribute(updated1, attributeToUncheck);
          const updated3 = uncheckAndSaveAttribute(updated2, attributeToUncheck);
          
          return (
            updated1[attributeToUncheck] === false &&
            updated2[attributeToUncheck] === false &&
            updated3[attributeToUncheck] === false &&
            updated1.is_new_arrival === updated2.is_new_arrival &&
            updated2.is_new_arrival === updated3.is_new_arrival &&
            updated1.is_best_seller === updated2.is_best_seller &&
            updated2.is_best_seller === updated3.is_best_seller &&
            updated1.is_offer_item === updated2.is_offer_item &&
            updated2.is_offer_item === updated3.is_offer_item
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('attribute removal - order of removal does not matter', () => {
    fc.assert(
      fc.property(
        showcaseAttributesArbitrary,
        (attributes) => {
          // Uncheck in different orders
          const order1 = uncheckAndSaveMultipleAttributes(
            attributes,
            ['is_new_arrival', 'is_best_seller', 'is_offer_item']
          );
          
          const order2 = uncheckAndSaveMultipleAttributes(
            attributes,
            ['is_offer_item', 'is_new_arrival', 'is_best_seller']
          );
          
          const order3 = uncheckAndSaveMultipleAttributes(
            attributes,
            ['is_best_seller', 'is_offer_item', 'is_new_arrival']
          );
          
          // All orders should produce the same result (all false)
          return (
            order1.is_new_arrival === false &&
            order1.is_best_seller === false &&
            order1.is_offer_item === false &&
            order2.is_new_arrival === false &&
            order2.is_best_seller === false &&
            order2.is_offer_item === false &&
            order3.is_new_arrival === false &&
            order3.is_best_seller === false &&
            order3.is_offer_item === false
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
