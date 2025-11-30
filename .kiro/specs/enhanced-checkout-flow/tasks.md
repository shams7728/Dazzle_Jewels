# Implementation Plan

- [x] 1. Enhance cart store with new methods



  - Add `isProductInCart` method to check if product/variant exists in cart
  - Add `getItemQuantity` method to get quantity of specific item
  - Add `createCheckoutSession` method for Buy Now flow
  - Update TypeScript interfaces for new methods
  - _Requirements: 1.2, 1.3, 1.4, 2.1, 2.2_

- [ ] 2. Create Product Actions component with Buy Now and dynamic Add to Cart





  - [x] 2.1 Create ProductActions component structure


    - Create `src/components/product-detail/product-actions.tsx`
    - Accept product, selectedVariant, and quantity as props
    - Set up component state for loading and button states
    - _Requirements: 1.1, 2.1_

  - [x] 2.2 Implement Add to Cart / Go to Cart button logic


    - Use `isProductInCart` to determine button text
    - Handle Add to Cart action with cart store
    - Show success toast/animation on add
    - Navigate to /cart when "Go to Cart" is clicked
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 2.3 Implement Buy Now button logic


    - Validate variant selection before proceeding
    - Create checkout session with single product
    - Navigate to /checkout with session data
    - Ensure cart remains unchanged
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [x] 2.4 Add button animations and transitions


    - Add smooth transition for button state changes
    - Implement loading states for both buttons
    - Add hover and active states matching theme
    - Ensure buttons are responsive and touch-friendly (44px min)
    - _Requirements: 2.4, 4.4_

  - [ ]* 2.5 Write property test for Buy Now data preservation
    - **Property 1: Buy Now preserves product data**
    - **Validates: Requirements 1.2, 1.3**

  - [ ]* 2.6 Write property test for Buy Now cart isolation
    - **Property 2: Buy Now isolation**
    - **Validates: Requirements 1.4**

  - [ ]* 2.7 Write property test for button state correctness
    - **Property 3: Button state reflects cart membership**
    - **Validates: Requirements 2.1, 2.2**


- [x] 3. Integrate ProductActions into product detail page




  - Update `src/app/products/[id]/product-detail-client.tsx`
  - Replace existing Add to Cart button with ProductActions component
  - Pass product, selectedVariant, and quantity props
  - Ensure responsive layout on mobile and desktop
  - _Requirements: 1.1, 2.1_


- [x] 4. Create cart page components



  - [x] 4.1 Create Empty Cart component


    - Create `src/components/cart/empty-cart.tsx`
    - Add empty state illustration/icon
    - Add "Continue Shopping" button that navigates to products
    - Style with theme colors (black bg, yellow accents)
    - Make fully responsive
    - _Requirements: 3.5_

  - [x] 4.2 Create Cart Page Item component


    - Create `src/components/cart/cart-page-item.tsx`
    - Display product image (larger than sheet version)
    - Show title, variant info, and price
    - Add quantity controls (-, quantity, +)
    - Add remove button with confirmation
    - Implement smooth removal animation
    - Make responsive for mobile/tablet/desktop
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 4.3 Create Cart Summary component


    - Create `src/components/cart/cart-summary.tsx`
    - Display subtotal, tax, discount (if applicable), and total
    - Add "Proceed to Checkout" button
    - Make sticky on desktop, bottom-fixed on mobile
    - Update in real-time when cart changes
    - Style with theme colors
    - _Requirements: 7.1, 7.2, 7.3, 8.1_

  - [ ]* 4.4 Write property test for cart total calculation
    - **Property 6: Cart management operations work correctly**
    - **Validates: Requirements 3.2, 3.3, 3.4, 7.2**

  - [ ]* 4.5 Write property test for discount display
    - **Property 7: Discount display is conditional**
    - **Validates: Requirements 7.3**


- [x] 5. Create dedicated cart page


  - [x] 5.1 Create cart page structure


    - Create `src/app/cart/page.tsx`
    - Set up page layout with proper metadata
    - Fetch cart items from store
    - Handle empty cart state
    - _Requirements: 3.1, 3.5_


  - [x] 5.2 Implement responsive cart layout

    - Mobile: Single column, items stacked, summary at bottom
    - Tablet: Optimized spacing for medium screens
    - Desktop: Two columns (items left 2/3, summary right 1/3 sticky)
    - Use Tailwind responsive classes (sm:, md:, lg:)
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 5.3 Integrate cart components


    - Render CartPageItem for each cart item
    - Render CartSummary with calculated totals
    - Render EmptyCart when no items
    - Connect quantity update and remove handlers
    - _Requirements: 3.1, 3.2, 3.3_


  - [x] 5.4 Add animations and transitions

    - Stagger item appearance on page load
    - Animate item removal (fade out + slide)
    - Animate price updates
    - Add loading states for async operations
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 5.5 Write property test for cart page display
    - **Property 5: Cart page displays complete item data**
    - **Validates: Requirements 3.1**

- [x] 6. Update checkout page to handle Buy Now flow





  - Read checkout session from URL params or state
  - Support both cart checkout and Buy Now checkout
  - Ensure Buy Now doesn't modify persistent cart
  - Display correct items based on checkout type
  - _Requirements: 1.2, 1.4_
-

- [x] 7. Add navigation and routing updates




  - Ensure /cart route is properly configured
  - Update header cart icon to link to /cart page
  - Handle browser back button correctly
  - Preserve cart state across navigation
  - _Requirements: 2.3, 8.3_


- [x] 8. Implement theme consistency



  - Apply black background with yellow accents throughout
  - Use consistent button styles matching existing pages
  - Apply proper typography hierarchy
  - Ensure proper contrast and readability
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 9. Add accessibility features








  - [x] 9.1 Implement keyboard navigation




    - Ensure all buttons are keyboard accessible
    - Set logical tab order
    - Add visible focus indicators
    - _Requirements: 4.4_



  - [x] 9.2 Add ARIA labels and screen reader support


    - Add proper ARIA labels to all interactive elements
    - Announce cart updates to screen readers
    - Describe button states clearly
    - Test with screen reader
    - _Requirements: 4.4_

  - [ ]* 9.3 Write property test for touch target sizing
    - **Property 10: Touch targets meet minimum size**
    - **Validates: Requirements 4.4**

- [x] 10. Optimize performance




  - Memoize expensive cart calculations
  - Debounce quantity update actions
  - Optimize component re-renders with React.memo
  - Use CSS transforms for animations
  - Lazy load cart page components
  - _Requirements: All (performance improvement)_

- [ ]* 11. Write property test for checkout button availability
  - **Property 8: Checkout button availability**
  - **Validates: Requirements 8.1, 8.2**

- [ ]* 12. Write property test for checkout navigation
  - **Property 9: Checkout navigation includes all items**
  - **Validates: Requirements 8.3**

- [x] 13. Final testing and polish









  - Test complete Add to Cart flow end-to-end
  - Test complete Buy Now flow end-to-end
  - Test on mobile devices (iOS Safari, Android Chrome)
  - Test on tablet devices (iPad)
  - Test on desktop browsers (Chrome, Firefox, Safari)
  - Test with various cart sizes (1, 10, 50 items)
  - Verify all animations are smooth
  - Test with slow network conditions
  - _Requirements: All_

- [ ] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
