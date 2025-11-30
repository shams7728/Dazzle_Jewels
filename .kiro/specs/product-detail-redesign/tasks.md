# Implementation Plan

- [x] 1. Set up component structure and shared utilities





  - Create directory structure for new product detail components
  - Implement shared types and interfaces for product detail page
  - Create utility functions for price calculations and formatting
  - Set up custom hooks for product state management
  - _Requirements: 2.1, 2.2, 3.2_

- [x] 1.1 Write unit tests for utility functions


  - Test price calculation with variants
  - Test discount percentage calculations
  - Test image URL transformations
  - _Requirements: 2.1, 2.2_

- [x] 2. Implement ProductGallery component with image navigation






  - Create ProductGallery component with main image display
  - Implement thumbnail navigation with active state styling
  - Add click handlers for thumbnail selection
  - Implement image state management (selectedImageIndex)
  - Add navigation arrows for previous/next image
  - Implement image indicators (dots) for current position
  - _Requirements: 1.1, 1.2, 1.5_

- [ ]* 2.1 Write property test for gallery thumbnail navigation




  - **Property 1: Gallery renders with thumbnails**
  - **Property 2: Thumbnail selection updates main image**
  - **Property 5: Navigation elements conditional on image count**
  - **Validates: Requirements 1.1, 1.2, 1.5**

- [x] 2.2 Add zoom functionality to main image




  - Implement hover zoom state management
  - Create zoom overlay with magnified image view
  - Add mouse position tracking for zoom focus
  - Handle zoom on touch devices with pinch gesture
  - _Requirements: 1.3_

- [ ]* 2.3 Write property test for zoom functionality
  - **Property 3: Hover triggers zoom state**
  - **Validates: Requirements 1.3**

- [x] 2.3 Implement swipe gestures for mobile

  - Add touch event handlers for swipe detection
  - Implement swipe left/right to change images
  - Add swipe threshold and velocity detection
  - Prevent default scroll behavior during swipe
  - _Requirements: 1.4_

- [ ]* 2.4 Write property test for swipe navigation
  - **Property 4: Swipe gestures navigate images**
  - **Validates: Requirements 1.4**

- [x] 2.4 Create fullscreen lightbox component


  - Implement lightbox modal with fullscreen image display
  - Add keyboard navigation (arrow keys, escape)
  - Create close button and click-outside-to-close
  - Add smooth open/close animations
  - Implement image navigation within lightbox
  - _Requirements: 1.6_

- [ ]* 2.5 Write property test for lightbox functionality
  - **Property 6: Click opens lightbox**
  - **Validates: Requirements 1.6**

- [x] 3. Implement ProductInfo component with pricing and variants






  - Create ProductInfo component structure
  - Display product title, description, and pricing
  - Implement discount display with original price strikethrough
  - Calculate and display discount percentage
  - Add stock status indicator
  - _Requirements: 2.1, 2.2, 8.3_

- [ ]* 3.1 Write property tests for product information display


  - **Property 7: Required information elements present**
  - **Property 8: Discount display completeness**
  - **Property 34: Stock status displays**
  - **Validates: Requirements 2.1, 2.2, 8.3**

- [x] 3.2 Implement "Read More" expansion for long descriptions

  - Add character count check for description length
  - Create expandable/collapsible description component
  - Implement toggle button with smooth transition
  - Show full description in expanded state
  - _Requirements: 2.4_

- [ ]* 3.3 Write property test for description expansion
  - **Property 9: Long descriptions show expansion control**
  - **Validates: Requirements 2.4**

- [x] 3.4 Add product features list with icons

  - Create features list component
  - Map features to bullet points with icons
  - Style features with appropriate spacing
  - Make features responsive for mobile
  - _Requirements: 2.5_

- [ ]* 3.5 Write property test for features rendering
  - **Property 10: Features render as list**
  - **Validates: Requirements 2.5**

- [ ] 4. Implement VariantSelector component





  - Create VariantSelector component with visual selectors
  - Implement color swatch rendering for color variants
  - Create button groups for material/size variants
  - Add active state styling for selected variant
  - Implement disabled state for out-of-stock variants
  - Handle variant selection and state updates
  - _Requirements: 3.1, 3.3, 3.4_

- [x] 4.1 Write property tests for variant selection


  - **Property 11: Variants render selectors**
  - **Property 13: Out of stock variants disabled**
  - **Property 14: Color variants render as swatches**
  - **Validates: Requirements 3.1, 3.3, 3.4**

- [x] 4.2 Implement variant selection side effects


  - Update displayed images when variant changes
  - Recalculate price with variant adjustment
  - Update stock status for selected variant
  - Trigger smooth transitions for changes
  - _Requirements: 3.2_

- [x] 4.3 Write property test for variant selection updates

  - **Property 12: Variant selection updates dependent values**
  - **Validates: Requirements 3.2**

- [x] 4.4 Add variant hover preview


  - Implement hover state detection
  - Show variant preview on hover
  - Display variant details in tooltip
  - Add smooth fade-in animation
  - _Requirements: 3.5_

- [x] 4.5 Write property test for variant preview

  - **Property 15: Hover shows variant preview**
  - **Validates: Requirements 3.5**
-

- [x] 5. Implement action buttons (Cart, Wishlist)




  - Create action button group component
  - Implement "Add to Cart" button with cart store integration
  - Create "Add to Wishlist" button with wishlist store integration
  - Add loading states for async actions
  - Implement success feedback with toast notifications
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 5.1 Write property tests for action buttons


  - **Property 16: Action buttons present**
  - **Property 17: Add to cart updates store**
  - **Property 18: Wishlist toggle state**
  - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 5.2 Implement out-of-stock button state


  - Check stock quantity before rendering button
  - Replace "Add to Cart" with "Notify When Available" when out of stock
  - Disable cart button for zero stock
  - Add email notification form for stock alerts
  - _Requirements: 4.4_

- [x] 5.3 Write property test for out-of-stock button

  - **Property 19: Out of stock changes button text**
  - **Validates: Requirements 4.4**

- [x] 5.4 Create sticky mobile action bar


  - Implement sticky bottom bar for mobile viewports
  - Add action buttons to sticky bar
  - Show price in sticky bar
  - Handle scroll detection for sticky behavior
  - _Requirements: 4.5_

- [x] 6. Implement ProductTabs component for detailed information








  - Create ProductTabs component with tab navigation
  - Implement tabs for Description, Specifications, Shipping & Returns
  - Add active tab state management
  - Create tab content panels with smooth transitions
  - Style tabs with active state indicators
  - _Requirements: 12.1, 12.2_

<!-- - [ ] 6.1 Write property tests for tabs functionality
  - **Property 44: Specifications render in organized format**
  - **Property 45: Tab click changes active state**
  - **Validates: Requirements 12.1, 12.2** -->

- [x] 6.2 Implement specifications table


  - Format specifications as key-value pairs
  - Create table layout for specifications
  - Add responsive styling for mobile
  - Handle missing or optional specifications
  - _Requirements: 12.3_

<!-- - [ ] 6.3 Write property test for specifications formatting
  - **Property 46: Specifications formatted as key-value pairs**
  - **Validates: Requirements 12.3** -->

- [x] 6.4 Create accordion layout for mobile


  - Implement accordion component for mobile viewports
  - Add expand/collapse functionality
  - Use smooth height transitions
  - Allow multiple sections open simultaneously
  - _Requirements: 12.4_

- [x] 7. Enhance ReviewsSection component



  - Update ReviewsSection with aggregate rating display
  - Implement star visualization for ratings
  - Add rating distribution chart
  - Display total review count
  - _Requirements: 5.1, 5.2_

<!-- - [ ] 7.1 Write property tests for reviews display
  - **Property 20: Rating displays as stars**
  - **Property 21: Reviews show count and distribution**
  - **Validates: Requirements 5.1, 5.2** -->

- [x] 7.2 Implement individual review display

  - Create review card component
  - Display rating, date, user name for each review
  - Add helpful vote buttons
  - Implement sort options (most recent, highest rated)
  - _Requirements: 5.3_

<!-- - [ ] 7.3 Write property test for review fields
  - **Property 22: Individual reviews include required fields**
  - **Validates: Requirements 5.3** -->


- [x] 7.4 Update review form component
  - Ensure form has rating and comment fields
  - Add form validation
  - Implement submission with loading state
  - Show success/error feedback
  - _Requirements: 5.4_

<!-- - [ ] 7.5 Write property test for review form
  - **Property 23: Review form has required fields**
  - **Validates: Requirements 5.4** -->

- [x] 7.6 Implement review pagination


  - Add pagination controls for many reviews
  - Implement "Load More" button as alternative
  - Set threshold for pagination trigger
  - Handle page state in URL
  - _Requirements: 5.5_

<!-- - [ ] 7.7 Write property test for review pagination
  - **Property 24: Many reviews trigger pagination**
  - **Validates: Requirements 5.5** -->

- [x] 8. Implement RelatedProducts component





  - Create RelatedProducts component
  - Fetch related products from same category
  - Display products in grid layout (desktop)
  - Implement horizontal carousel for mobile
  - Show product image, title, and price for each
  - _Requirements: 6.1, 6.2_

<!-- - [ ] 8.1 Write property tests for related products
  - **Property 25: Related products section renders**
  - **Property 26: Related products have required data**
  - **Validates: Requirements 6.1, 6.2** -->

- [x] 8.2 Add navigation to related products


  - Implement click handlers for product cards
  - Navigate to product detail page on click
  - Add hover effects for better UX
  - Preload product data on hover
  - _Requirements: 6.3_

<!-- - [ ] 8.3 Write property test for related product navigation
  - **Property 27: Related product click navigates**
  - **Validates: Requirements 6.3** -->


- [x] 8.4 Implement fallback for empty related products

  - Check if related products exist
  - Fetch popular or featured products as fallback
  - Display fallback with clear labeling
  - Handle loading and error states
  - _Requirements: 6.5_

<!-- - [ ] 8.5 Write property test for fallback behavior
  - **Property 28: Empty related products shows fallback**
  - **Validates: Requirements 6.5** -->

- [x] 9. Implement breadcrumb navigation





  - Create Breadcrumb component
  - Build breadcrumb hierarchy (Home > Category > Product)
  - Implement navigation links for each breadcrumb
  - Add structured data for SEO
  - Style with separators and hover states
  - _Requirements: 7.1, 7.2_

<!-- - [ ] 9.1 Write property tests for breadcrumbs
  - **Property 29: Breadcrumbs render hierarchy**
  - **Property 30: Breadcrumb click navigates**
  - **Validates: Requirements 7.1, 7.2** -->

- [x] 9.2 Add "Back to Products" link

  - Create back link component
  - Position prominently at top of page
  - Add back arrow icon
  - Implement navigation to products listing
  - _Requirements: 7.4_

<!-- - [ ] 9.3 Write property test for back link
  - **Property 31: Back link present**
  - **Validates: Requirements 7.4** -->

- [x] 9.3 Implement mobile back button

  - Add back button to mobile header
  - Use browser history for navigation
  - Style consistently with mobile UI
  - Handle edge cases (no history)
  - _Requirements: 7.3_

- [x] 10. Implement TrustBadges component





  - Create TrustBadges component
  - Display badges for secure checkout, returns, warranty
  - Add icons for each badge
  - Implement tooltip with badge details
  - Style badges prominently
  - _Requirements: 8.1_

<!-- - [ ] 10.1 Write property test for trust badges
  - **Property 32: Trust badges render**
  - **Validates: Requirements 8.1** -->

- [x] 10.2 Add shipping information display

  - Create shipping info component
  - Display estimated delivery time
  - Show shipping costs
  - Handle conditional display based on data availability
  - _Requirements: 8.2_

<!-- - [ ] 10.3 Write property test for shipping info
  - **Property 33: Shipping info displays when available**
  - **Validates: Requirements 8.2** -->


- [ ] 10.4 Display payment method icons
  - Create payment methods component
  - Render icons for accepted payment methods
  - Add tooltips with payment method names
  - Style icons in a row
  - _Requirements: 8.4_

<!-- - [ ] 10.5 Write property test for payment methods
  - **Property 35: Payment methods render as icons**
  - **Validates: Requirements 8.4** -->


- [ ] 10.6 Add guarantee information display
  - Create guarantee info component
  - Display warranty or guarantee details
  - Add icon and prominent styling
  - Handle conditional rendering
  - _Requirements: 8.5_

<!-- - [ ] 10.7 Write property test for guarantee display
  - **Property 36: Guarantee info displays when present**
  - **Validates: Requirements 8.5** -->

- [x] 11. Implement ShareButtons component





  - Create ShareButtons component
  - Add buttons for Facebook, Twitter, WhatsApp, Pinterest
  - Implement share URL generation for each platform
  - Include product title, image, and price in share data
  - Style buttons with platform colors
  - _Requirements: 11.1, 11.2, 11.4_

<!-- - [ ] 11.1 Write property tests for sharing functionality
  - **Property 39: Share buttons present**
  - **Property 40: Share click generates correct URL**
  - **Property 42: Share data includes required fields**
  - **Validates: Requirements 11.1, 11.2, 11.4** -->

- [x] 11.2 Implement copy link functionality

  - Add "Copy Link" button
  - Implement clipboard API integration
  - Show visual confirmation toast
  - Handle clipboard API errors gracefully
  - _Requirements: 11.3_

<!-- - [ ] 11.3 Write property test for copy confirmation
  - **Property 41: Copy provides confirmation**
  - **Validates: Requirements 11.3** -->


- [x] 11.4 Add native share for mobile

  - Detect navigator.share API availability
  - Use native share when available
  - Fallback to custom share buttons
  - Pass product data to native share
  - _Requirements: 11.5_

<!-- - [ ] 11.5 Write property test for native share
  - **Property 43: Native share used when available**
  - **Validates: Requirements 11.5** -->
-

- [x] 12. Implement responsive design and mobile optimizations




  - Apply responsive breakpoints to all components
  - Implement single-column layout for mobile
  - Create two-column layout for tablet
  - Optimize desktop layout with full width
  - Test all breakpoints thoroughly
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 12.2 Ensure touch target sizes


  - Audit all interactive elements
  - Set minimum 44px touch targets
  - Add appropriate padding to buttons
  - Test on actual mobile devices
  - _Requirements: 9.5_

<!-- - [ ] 12.3 Write property test for touch targets
  - **Property 37: Touch targets meet minimum size**
  - **Validates: Requirements 9.5** -->

- [x] 13. Implement animations and transitions




  - Add page load animations with staggered timing
  - Implement button hover and active states
  - Create smooth image transition effects
  - Add modal open/close animations
  - Use CSS transitions for performance
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 13.2 Respect reduced motion preferences


  - Detect prefers-reduced-motion media query
  - Disable animations when preference is set
  - Provide instant transitions as fallback
  - Test with system settings
  - _Requirements: 10.5_

<!-- - [ ] 13.3 Write property test for reduced motion
  - **Property 38: Reduced motion respected**
  - **Validates: Requirements 10.5** -->

- [x] 14. Implement SEO and meta tags





  - Add dynamic meta tags for product title and description
  - Implement Open Graph tags for social sharing
  - Add structured data (JSON-LD) for product schema
  - Set canonical URLs
  - Add image alt text for all product images
  - Generate dynamic sitemap entries

- [ ] 15. Optimize performance




  - Implement image lazy loading with Next.js Image
  - Add image optimization and WebP format
  - Implement code splitting for heavy components
  - Prefetch related products on hover
  - Add loading skeletons for better perceived performance
  - Optimize bundle size
- [x] 16. Add error handling and loading states




- [ ] 16. Add error handling and loading states

  - Implement loading skeleton for initial page load
  - Add error boundaries for component failures
  - Create 404 page for product not found
  - Handle network errors with retry logic
  - Add fallback images for failed image loads
  - Implement toast notifications for user actions

- [x] 17. Integrate all components into main product detail page





  - Update src/app/products/[id]/page.tsx with new components
  - Wire up all component interactions
  - Implement data fetching with error handling
  - Add loading states during data fetch
  - Test complete user flows
  - Ensure backward compatibility with existing features

- [ ] 18. Final checkpoint - Ensure all tests pass
  - Run all unit tests and verify they pass
  - Run all property-based tests and verify they pass
  - Fix any failing tests
  - Check test coverage
  - Ask the user if questions arise
