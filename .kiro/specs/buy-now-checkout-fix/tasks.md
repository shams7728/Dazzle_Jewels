# Implementation Plan

- [x] 1. Refactor checkout page initialization logic




  - Modify `src/app/checkout/page.tsx` to load Buy Now session synchronously on mount
  - Add `isInitialized` state to track initialization completion
  - Move Buy Now session loading logic outside of useEffect to execute immediately
  - Implement error handling for sessionStorage access and JSON parsing
  - _Requirements: 3.1, 3.2, 1.5_

- [ ]* 1.1 Write property test for session loading order
  - **Property 1: Session loading precedes redirect checks**
  - **Validates: Requirements 1.5, 2.1, 3.1, 3.2, 3.3**
-

- [x] 2. Update redirect logic to respect checkout type




  - Modify redirect useEffect to only run after initialization is complete
  - Add conditional check: only redirect for "cart" checkout type with empty items
  - Ensure "buyNow" checkout type never triggers redirect regardless of cart state
  - _Requirements: 1.3, 2.4, 2.5_

- [ ]* 2.1 Write property test for redirect behavior
  - **Property 2: No redirect for Buy Now checkout**
  - **Validates: Requirements 1.3, 2.4**

- [ ]* 2.2 Write property test for cart checkout redirect
  - **Property 6: Redirect for empty cart checkout**
  - **Validates: Requirements 2.5**

- [x] 3. Implement checkout type determination logic





  - Create initialization function that checks sessionStorage first
  - Set checkout type to "buyNow" when session exists, "cart" otherwise
  - Load items from appropriate source based on checkout type
  - Clean up Buy Now session from sessionStorage after reading
  - _Requirements: 2.1, 2.2, 2.3, 3.5_

- [ ]* 3.1 Write property test for checkout type determination
  - **Property 3: Checkout type determines item source**
  - **Validates: Requirements 2.2, 2.3**

- [ ]* 3.2 Write property test for session cleanup
  - **Property 5: Session cleanup after loading**
  - **Validates: Requirements 3.5**

- [x] 4. Verify cart preservation during Buy Now checkout





  - Review order creation logic in `createOrder` function
  - Ensure cart is only cleared when `checkoutType === "cart"`
  - Add explicit check to prevent cart clearing for Buy Now checkouts
  - _Requirements: 1.4_

- [ ]* 4.1 Write property test for cart preservation
  - **Property 4: Cart preservation during Buy Now**
  - **Validates: Requirements 1.4**


- [x] 5. Add session validation and error handling




  - Implement validation for Buy Now session structure
  - Check for required fields (items array, product data, quantities)
  - Add try-catch blocks for sessionStorage access and JSON parsing
  - Implement fallback to cart checkout on validation failure
  - Log errors for debugging without breaking user experience
  - _Requirements: 3.2, 3.5_

- [ ]* 5.1 Write unit tests for error handling
  - Test corrupted JSON in sessionStorage
  - Test missing sessionStorage (privacy mode)
  - Test invalid session structure
  - Test fallback to cart checkout
  - _Requirements: 3.2, 3.5_

- [x] 6. Verify product display from Buy Now session




  - Ensure checkout items state correctly reflects Buy Now session items
  - Verify product information, quantities, and variants are displayed correctly
  - Test with various product configurations (with/without variants)
  - _Requirements: 1.2_

- [ ]* 6.1 Write property test for product display
  - **Property 7: Correct product display from session**
  - **Validates: Requirements 1.2**

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
