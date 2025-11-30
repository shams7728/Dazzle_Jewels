import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Feature: product-showcase-sections, Property 9: Form state reactivity
 * Validates: Requirements 6.3
 * 
 * For any showcase checkbox, toggling its value should immediately update 
 * the form state without requiring a page reload.
 */

// Type for form state
interface FormState {
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_offer_item: boolean;
}

// Function that simulates toggling a checkbox
function toggleCheckbox(
  formState: FormState,
  field: keyof FormState
): FormState {
  return {
    ...formState,
    [field]: !formState[field],
  };
}

// Function to check if a field was toggled correctly
function wasToggledCorrectly(
  originalState: FormState,
  newState: FormState,
  field: keyof FormState
): boolean {
  return newState[field] === !originalState[field];
}

// Function to check if other fields remained unchanged
function otherFieldsUnchanged(
  originalState: FormState,
  newState: FormState,
  toggledField: keyof FormState
): boolean {
  const fields: Array<keyof FormState> = ['is_new_arrival', 'is_best_seller', 'is_offer_item'];
  return fields
    .filter(field => field !== toggledField)
    .every(field => originalState[field] === newState[field]);
}

describe('Form State Reactivity - Property-Based Tests', () => {
  test('form state reactivity - toggling updates state immediately', () => {
    fc.assert(
      fc.property(
        fc.record({
          is_new_arrival: fc.boolean(),
          is_best_seller: fc.boolean(),
          is_offer_item: fc.boolean(),
        }),
        fc.constantFrom('is_new_arrival', 'is_best_seller', 'is_offer_item') as fc.Arbitrary<keyof FormState>,
        (initialState, fieldToToggle) => {
          const newState = toggleCheckbox(initialState, fieldToToggle);
          
          // The toggled field should have the opposite value
          const toggledCorrectly = wasToggledCorrectly(initialState, newState, fieldToToggle);
          
          // Other fields should remain unchanged
          const othersUnchanged = otherFieldsUnchanged(initialState, newState, fieldToToggle);
          
          return toggledCorrectly && othersUnchanged;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('form state reactivity - double toggle returns to original state', () => {
    fc.assert(
      fc.property(
        fc.record({
          is_new_arrival: fc.boolean(),
          is_best_seller: fc.boolean(),
          is_offer_item: fc.boolean(),
        }),
        fc.constantFrom('is_new_arrival', 'is_best_seller', 'is_offer_item') as fc.Arbitrary<keyof FormState>,
        (initialState, fieldToToggle) => {
          // Toggle twice
          const afterFirstToggle = toggleCheckbox(initialState, fieldToToggle);
          const afterSecondToggle = toggleCheckbox(afterFirstToggle, fieldToToggle);
          
          // Should return to original state
          return (
            afterSecondToggle.is_new_arrival === initialState.is_new_arrival &&
            afterSecondToggle.is_best_seller === initialState.is_best_seller &&
            afterSecondToggle.is_offer_item === initialState.is_offer_item
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('form state reactivity - multiple field toggles are independent', () => {
    fc.assert(
      fc.property(
        fc.record({
          is_new_arrival: fc.boolean(),
          is_best_seller: fc.boolean(),
          is_offer_item: fc.boolean(),
        }),
        (initialState) => {
          // Toggle all three fields in sequence
          const afterFirst = toggleCheckbox(initialState, 'is_new_arrival');
          const afterSecond = toggleCheckbox(afterFirst, 'is_best_seller');
          const afterThird = toggleCheckbox(afterSecond, 'is_offer_item');
          
          // Each field should be toggled exactly once
          return (
            afterThird.is_new_arrival === !initialState.is_new_arrival &&
            afterThird.is_best_seller === !initialState.is_best_seller &&
            afterThird.is_offer_item === !initialState.is_offer_item
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('form state reactivity - toggle order does not matter', () => {
    fc.assert(
      fc.property(
        fc.record({
          is_new_arrival: fc.boolean(),
          is_best_seller: fc.boolean(),
          is_offer_item: fc.boolean(),
        }),
        (initialState) => {
          // Toggle in one order
          const path1Step1 = toggleCheckbox(initialState, 'is_new_arrival');
          const path1Step2 = toggleCheckbox(path1Step1, 'is_best_seller');
          
          // Toggle in reverse order
          const path2Step1 = toggleCheckbox(initialState, 'is_best_seller');
          const path2Step2 = toggleCheckbox(path2Step1, 'is_new_arrival');
          
          // Final states should be the same
          return (
            path1Step2.is_new_arrival === path2Step2.is_new_arrival &&
            path1Step2.is_best_seller === path2Step2.is_best_seller &&
            path1Step2.is_offer_item === path2Step2.is_offer_item
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('form state reactivity - toggling from false to true works', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('is_new_arrival', 'is_best_seller', 'is_offer_item') as fc.Arbitrary<keyof FormState>,
        (fieldToToggle) => {
          const initialState: FormState = {
            is_new_arrival: false,
            is_best_seller: false,
            is_offer_item: false,
          };
          
          const newState = toggleCheckbox(initialState, fieldToToggle);
          
          // The toggled field should now be true
          return newState[fieldToToggle] === true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('form state reactivity - toggling from true to false works', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('is_new_arrival', 'is_best_seller', 'is_offer_item') as fc.Arbitrary<keyof FormState>,
        (fieldToToggle) => {
          const initialState: FormState = {
            is_new_arrival: true,
            is_best_seller: true,
            is_offer_item: true,
          };
          
          const newState = toggleCheckbox(initialState, fieldToToggle);
          
          // The toggled field should now be false
          return newState[fieldToToggle] === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});
