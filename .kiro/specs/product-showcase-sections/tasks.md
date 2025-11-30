# Implementation Plan

- [x] 1. Extend database schema and type definitions





  - Add three boolean columns to products table: is_new_arrival, is_best_seller, is_offer_item
  - Create database indexes for performance optimization
  - Update Product type in src/types/index.ts with new boolean fields
  - Create ShowcaseConfig type for section configuration
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. Create reusable ShowcaseSection component


  - Implement ShowcaseSection component that accepts configuration and fetches filtered products
  - Add loading state handling with skeleton loaders
  - Implement empty state logic (hide section when no products)
  - Add responsive grid layout using Tailwind CSS
  - Include "View All" link when product count exceeds limit
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 7.5_

- [x] 2.1 Write property test for showcase filtering


  - **Property 2: Showcase filtering accuracy**
  - **Validates: Requirements 1.2, 2.2, 3.2**

- [x] 2.2 Write property test for display limit enforcement


  - **Property 13: Display limit enforcement**
  - **Validates: Requirements 7.5**

- [x] 3. Create showcase configuration constants


  - Define showcaseConfigs object with New Arrivals, Best Sellers, and Offer Items configurations
  - Include titles, subtitles, badge text, icons, filter keys, and theme colors
  - Export configuration for use in components
  - _Requirements: 1.1, 2.1, 3.1_

- [x] 4. Integrate showcase sections into homepage


  - Import ShowcaseSection component into src/app/page.tsx
  - Add NewArrivalsSection below categories section
  - Add BestSellersSection below NewArrivalsSection
  - Add OfferItemsSection below BestSellersSection
  - Ensure proper spacing and theme consistency
  - _Requirements: 1.1, 1.5, 2.1, 2.5, 3.1, 3.5, 5.4_

- [x] 4.1 Write property test for product navigation


  - **Property 1: Product navigation consistency**
  - **Validates: Requirements 1.5, 2.5, 3.5**

- [x] 4.2 Write property test for product card completeness


  - **Property 3: Product card completeness**
  - **Validates: Requirements 1.4, 2.4, 3.4**

- [x] 4.3 Write property test for image lazy loading


  - **Property 12: Image lazy loading**
  - **Validates: Requirements 7.2**

- [x] 5. Extend admin product form with showcase checkboxes



  - Add three checkboxes to product form: "New Arrival", "Best Seller", "Offer Item"
  - Position checkboxes in a dedicated "Showcase Settings" section
  - Style checkboxes consistently with existing form elements
  - Bind checkbox values to form state
  - _Requirements: 4.1, 4.2_

- [x] 5.1 Write property test for form state persistence


  - **Property 4: Form state persistence**
  - **Validates: Requirements 4.2**

- [x] 5.2 Write property test for form state reactivity


  - **Property 9: Form state reactivity**
  - **Validates: Requirements 6.3**

- [x] 6. Implement form validation for showcase attributes





  - Add validation to warn when product is marked as "Offer Item" without discount price
  - Display warning message below checkbox (non-blocking)
  - Validate required fields when showcase attributes are set
  - Implement real-time validation on checkbox change
  - _Requirements: 6.1, 6.2_

- [x] 6.1 Write property test for offer item validation


  - **Property 7: Offer item validation**
  - **Validates: Requirements 6.1**

- [x] 6.2 Write property test for form validation completeness


  - **Property 8: Form validation completeness**
  - **Validates: Requirements 6.2**

- [x] 7. Implement product save functionality with showcase attributes





  - Update product creation API to accept showcase boolean fields
  - Update product edit API to handle showcase attribute changes
  - Ensure database persistence of all three showcase flags
  - Handle attribute removal (unchecking checkboxes)
  - _Requirements: 4.3, 4.4, 4.5_

- [x] 7.1 Write property test for showcase attribute round-trip


  - **Property 5: Showcase attribute round-trip**
  - **Validates: Requirements 4.3**

- [x] 7.2 Write property test for attribute removal consistency


  - **Property 6: Attribute removal consistency**
  - **Validates: Requirements 4.4**

- [x] 8. Add error handling and user feedback





  - Implement error handling for database failures in showcase sections
  - Add error handling for product save failures in admin form
  - Display success toast message after successful product save
  - Display error toast message on save failure
  - Preserve form state on error
  - _Requirements: 6.4, 6.5_

- [x] 8.1 Write property test for submission feedback consistency


  - **Property 10: Submission feedback consistency**
  - **Validates: Requirements 6.4**

- [x] 8.2 Write property test for error state preservation


  - **Property 11: Error state preservation**
  - **Validates: Requirements 6.5**

- [x] 9. Enhance admin products list with showcase indicators





  - Add badge components to display showcase attributes in products list
  - Show "New", "Best Seller", "Offer" badges for products with respective flags
  - Style badges with appropriate colors matching showcase sections
  - Position badges prominently in product list rows
  - _Requirements: 8.1_

- [x] 9.1 Write property test for admin badge visibility


  - **Property 14: Admin badge visibility**
  - **Validates: Requirements 8.1**

- [x] 10. Implement filtering and sorting for showcase attributes in admin panel





  - Add filter dropdown options for New Arrivals, Best Sellers, and Offer Items
  - Implement filter logic to show only products with selected showcase attributes
  - Add sorting options for each showcase attribute
  - Ensure sorting works correctly (true values before false, or vice versa)
  - _Requirements: 8.2, 8.3_

- [x] 10.1 Write property test for sorting correctness


  - **Property 15: Sorting correctness**
  - **Validates: Requirements 8.3**

- [x] 11. Add bulk edit functionality for showcase attributes





  - Add bulk action dropdown in admin products list
  - Implement "Set as New Arrival", "Set as Best Seller", "Set as Offer Item" bulk actions
  - Implement "Remove from New Arrivals", etc. bulk actions
  - Update multiple products simultaneously with selected attributes
  - Show confirmation dialog before bulk update
  - Display success message with count of updated products
  - _Requirements: 8.4_

- [x] 11.1 Write property test for bulk update consistency


  - **Property 16: Bulk update consistency**
  - **Validates: Requirements 8.4**

- [x] 12. Add product statistics display in admin panel





  - Create statistics widget showing counts for each showcase section
  - Display: "X New Arrivals", "X Best Sellers", "X Offer Items"
  - Position statistics prominently on admin dashboard or products page
  - Update counts dynamically when products are modified
  - _Requirements: 8.5_

- [x] 12.1 Write property test for statistics accuracy


  - **Property 17: Statistics accuracy**
  - **Validates: Requirements 8.5**

- [x] 13. Optimize performance and responsive design















  - Implement lazy loading for product images in showcase sections
  - Add responsive breakpoints for grid layouts (mobile, tablet, desktop)
  - Test and adjust spacing for different screen sizes
  - Optimize database queries with proper indexing
  - Add loading skeletons for better perceived performance
  - _Requirements: 5.1, 5.2, 5.3, 7.1, 7.2_

- [x] 14. Final checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.
