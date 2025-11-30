# Implementation Plan

- [x] 1. Set up search state management and core utilities



  - Create Zustand store for search state (query, filters, sort, products)
  - Implement debounce utility function
  - Implement search query sanitization function
  - Create filter validation utilities
  - _Requirements: 1.1, 1.2_

- [ ]* 1.1 Write property test for debounce timing
  - **Property 2: Search debounce timing**





  - **Validates: Requirements 1.1**

- [ ] 2. Implement core filtering logic
- [ ] 2.1 Create price range filter function
  - Implement getEffectivePrice helper (handles discount_price)
  - Create applyPriceFilter function
  - Handle edge cases (null prices, invalid ranges)
  - _Requirements: 2.2, 2.3_

- [ ]* 2.2 Write property test for price range filtering
  - **Property 4: Price range filtering correctness**
  - **Validates: Requirements 2.2**


- [ ]* 2.3 Write property test for discount price precedence
  - **Property 5: Discount price precedence**
  - **Validates: Requirements 2.3**

- [ ] 2.4 Create material filter function
  - Extract materials from product variants
  - Implement applyMaterialFilter with OR logic

  - _Requirements: 3.2_

- [ ]* 2.5 Write property test for material filtering
  - **Property 7: Material filtering correctness**
  - **Validates: Requirements 3.2**

- [ ] 2.6 Create color filter function
  - Extract colors from product variants

  - Implement applyColorFilter with OR logic
  - _Requirements: 4.2, 4.4_

- [ ]* 2.7 Write property test for color filtering
  - **Property 8: Color filtering with OR logic**
  - **Validates: Requirements 4.2, 4.4**

- [x] 2.8 Create category filter function

  - Implement applyCategoryFilter
  - Handle products without categories
  - _Requirements: 5.2_

- [ ]* 2.9 Write property test for category filtering
  - **Property 9: Category filtering correctness**
  - **Validates: Requirements 5.2**

- [x] 2.10 Create rating filter function

  - Calculate average rating from reviews
  - Implement applyRatingFilter
  - Exclude products with no reviews
  - _Requirements: 6.2, 6.3_

- [-]* 2.11 Write property test for rating filtering

  - **Property 10: Rating threshold filtering**
  - **Validates: Requirements 6.2, 6.3**

- [ ] 2.12 Create stock availability filter function
  - Check variant stock quantities
  - Implement applyAvailabilityFilter
  - _Requirements: 11.2_

- [ ]* 2.13 Write property test for stock filtering
  - **Property 11: Stock availability filtering**
  - **Validates: Requirements 11.2**

- [x] 3. Implement search and sort functionality


- [x] 3.1 Create keyword search function


  - Implement case-insensitive search in title and description
  - Add relevance scoring
  - _Requirements: 1.2_

- [ ]* 3.2 Write property test for keyword matching
  - **Property 1: Search keyword matching**
  - **Validates: Requirements 1.2**

- [x] 3.3 Create keyword highlighting function

  - Implement text highlighting with HTML markup
  - Handle multiple keyword matches
  - _Requirements: 1.3_

- [ ]* 3.4 Write property test for keyword highlighting
  - **Property 3: Keyword highlighting consistency**
  - **Validates: Requirements 1.3**

- [x] 3.5 Implement sort functions

  - Create sortByPriceAsc function
  - Create sortByPriceDesc function
  - Create sortByNewest function
  - Create sortByPopularity function (views + purchases + ratings)
  - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [ ]* 3.6 Write property test for price ascending sort
  - **Property 12: Sort order correctness - Price ascending**
  - **Validates: Requirements 7.2**

- [ ]* 3.7 Write property test for price descending sort
  - **Property 13: Sort order correctness - Price descending**
  - **Validates: Requirements 7.3**

- [ ]* 3.8 Write property test for newest first sort
  - **Property 14: Sort order correctness - Newest first**
  - **Validates: Requirements 7.4**

- [x] 4. Build Zustand search store



- [x] 4.1 Implement store state and actions


  - Define SearchStore interface
  - Implement setQuery, updateFilter, clearFilter actions
  - Implement setSortBy action
  - Add computed selectors (filteredProducts, resultCount)
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1_

- [x] 4.2 Implement filter application logic

  - Combine all filter functions
  - Apply filters in correct order
  - Update filteredProducts on state change
  - _Requirements: 2.2, 3.2, 4.2, 5.2, 6.2, 11.2_

- [x] 4.3 Implement filter count calculation

  - Calculate counts for each filter option
  - Update counts when other filters change
  - _Requirements: 3.3, 4.3, 8.1_

- [ ]* 4.4 Write property test for result count accuracy
  - **Property 15: Result count accuracy**
  - **Validates: Requirements 8.1**

- [ ]* 4.5 Write property test for filter count accuracy
  - **Property 18: Filter count accuracy**
  - **Validates: Requirements 3.3, 4.3**

- [x] 4.6 Implement filter clear functionality

  - Create clearAllFilters action
  - Implement individual filter clear
  - _Requirements: 2.5, 3.5, 4.5, 5.5, 6.5, 9.3_

- [ ]* 4.7 Write property test for filter clear round-trip
  - **Property 6: Filter clear round-trip**
  - **Validates: Requirements 2.5, 3.5, 4.5, 5.5, 6.5**

- [x] 5. Create SearchModal component



- [x] 5.1 Build modal structure


  - Use Radix UI Dialog component
  - Implement open/close state management
  - Add keyboard shortcut (Cmd+K / Ctrl+K)
  - Handle focus trapping
  - _Requirements: 1.1, 10.1, 10.4_

- [x] 5.2 Implement mobile responsive layout

  - Full-screen modal on mobile
  - Slide-up filter drawer
  - Touch-friendly interactions
  - _Requirements: 10.1, 10.2, 10.3_

- [ ]* 5.3 Write unit tests for SearchModal
  - Test open/close behavior
  - Test keyboard shortcuts
  - Test mobile layout rendering

- [x] 6. Create SearchInput component


- [x] 6.1 Build search input with debounce


  - Create controlled input component
  - Integrate debounce utility
  - Add search icon and clear button
  - _Requirements: 1.1, 1.2_

- [x] 6.2 Implement search suggestions

  - Fetch suggestions on input change (min 2 chars)
  - Display dropdown with suggestions
  - Handle keyboard navigation (arrow keys, Enter)
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ]* 6.3 Write property test for search suggestions
  - **Property 19: Search suggestions trigger**
  - **Validates: Requirements 12.1**

- [ ]* 6.4 Write unit tests for SearchInput
  - Test debounce behavior
  - Test clear button
  - Test keyboard navigation

- [x] 7. Create filter components


- [x] 7.1 Build PriceRangeFilter component

  - Use Radix UI Slider for dual-handle range
  - Display min/max values
  - Update store on change
  - _Requirements: 2.1, 2.2_

- [x] 7.2 Build MaterialFilter component

  - Fetch unique materials from products
  - Render checkbox list
  - Display product counts per material
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 7.3 Build ColorFilter component

  - Fetch unique colors from products
  - Render color swatches with labels
  - Display product counts per color
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 7.4 Build CategoryFilter component

  - Fetch categories from database
  - Render as radio buttons or chips
  - Update immediately on selection
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 7.5 Build RatingFilter component

  - Render rating options (4+, 3+, 2+, 1+)
  - Display as star icons with labels
  - _Requirements: 6.1, 6.2_

- [x] 7.6 Build AvailabilityFilter component

  - Render "In Stock" / "Out of Stock" options
  - Use checkbox or toggle
  - _Requirements: 11.1, 11.2_

- [ ]* 7.7 Write unit tests for filter components
  - Test user interactions
  - Test state updates
  - Test count displays

- [x] 8. Create FilterPanel component


- [x] 8.1 Build filter panel container

  - Organize filters in collapsible sections
  - Implement expand/collapse behavior
  - Add "Clear All Filters" button
  - _Requirements: 2.1, 3.1, 4.1, 5.1, 6.1, 11.1_

- [x] 8.2 Implement mobile filter drawer

  - Slide-up drawer on mobile
  - Filter count badge on button
  - Apply/Cancel buttons
  - _Requirements: 10.2, 10.5_

- [ ]* 8.3 Write unit tests for FilterPanel
  - Test expand/collapse
  - Test mobile drawer
  - Test clear all functionality

- [x] 9. Create ActiveFilters component


- [x] 9.1 Build active filters display

  - Render active filters as removable chips
  - Display filter labels clearly
  - Add individual remove buttons
  - Hide section when no filters active
  - _Requirements: 9.1, 9.2, 9.5_

- [x] 9.2 Implement filter removal

  - Remove individual filter on click
  - Update store state
  - _Requirements: 9.2_

- [ ]* 9.3 Write property test for active filter display
  - **Property 16: Active filter display completeness**
  - **Validates: Requirements 2.4, 5.3, 9.1**

- [ ]* 9.4 Write property test for filter removal
  - **Property 17: Active filter removal isolation**
  - **Validates: Requirements 9.2**

- [ ]* 9.5 Write unit tests for ActiveFilters
  - Test chip rendering
  - Test removal behavior
  - Test clear all

- [x] 10. Create SortDropdown component



- [x] 10.1 Build sort dropdown

  - Use Radix UI Select component
  - Display sort options (Relevance, Price Low-High, Price High-Low, Newest, Popular)
  - Highlight active sort
  - Update store on selection
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ]* 10.2 Write unit tests for SortDropdown
  - Test option selection
  - Test active state display

- [x] 11. Create SearchResults component


- [x] 11.1 Build results grid





  - Reuse existing ProductCard component
  - Implement responsive grid layout
  - Add loading skeleton states
  - _Requirements: 1.2, 8.1, 10.3_

- [x] 11.2 Implement empty states

  - "No results found" message
  - Suggest removing filters
  - Display popular products when query is empty
  - _Requirements: 1.4, 1.5, 8.4_

- [x] 11.3 Add result count display


  - Show total matching products
  - Update in real-time
  - _Requirements: 8.1, 8.3, 8.5_

- [ ]* 11.4 Write unit tests for SearchResults
  - Test grid rendering
  - Test empty states
  - Test loading states

- [x] 12. Integrate search with existing UI





- [x] 12.1 Update Header component


  - Connect search button to SearchModal
  - Ensure existing SearchModal is replaced/updated
  - _Requirements: 1.1_

- [x] 12.2 Update products page


  - Add option to open search from products page
  - Maintain URL state for filters (optional enhancement)
  - _Requirements: 1.1_

- [x] 13. Add data fetching and caching




- [x] 13.1 Implement product fetching


  - Fetch all products with variants on mount
  - Cache in Zustand store
  - Handle loading and error states
  - _Requirements: 1.2, 2.2, 3.2, 4.2, 5.2_

- [x] 13.2 Implement category fetching


  - Fetch categories for filter options
  - Cache in store
  - _Requirements: 5.1, 5.2_

- [x] 13.3 Implement review aggregation


  - Fetch reviews for rating calculations
  - Calculate average ratings
  - Cache results
  - _Requirements: 6.2_

- [ ]* 13.4 Write integration tests for data fetching
  - Test product loading
  - Test error handling
  - Test caching behavior

- [x] 14. Implement error handling





- [x] 14.1 Add network error handling


  - Implement retry logic with exponential backoff
  - Display error toasts
  - Show cached results when offline
  - _Requirements: All_

- [x] 14.2 Add filter validation


  - Validate price ranges
  - Validate rating values
  - Prevent invalid filter states
  - _Requirements: 2.1, 6.1_

- [x] 14.3 Add search query sanitization


  - Remove special characters
  - Limit query length
  - Trim whitespace
  - _Requirements: 1.2_

- [ ]* 14.4 Write unit tests for error handling
  - Test retry logic
  - Test validation functions
  - Test sanitization

- [x] 15. Add accessibility features




- [x] 15.1 Implement keyboard navigation


  - Tab through all interactive elements
  - Arrow key navigation in suggestions
  - Escape to close modal
  - _Requirements: 12.4_


- [x] 15.2 Add ARIA labels

  - Label all form controls
  - Add role attributes
  - Announce filter changes to screen readers
  - _Requirements: All_


- [x] 15.3 Ensure color contrast

  - Verify WCAG AA compliance
  - Test with contrast checker
  - _Requirements: All_

- [ ]* 15.4 Write accessibility tests
  - Test keyboard navigation
  - Test ARIA attributes
  - Test screen reader announcements

- [x] 16. Optimize performance







- [x] 16.1 Add memoization

  - Memoize filtered products calculation
  - Memoize filter counts
  - Memoize sort operations
  - _Requirements: All_


- [x] 16.2 Implement virtual scrolling (if needed)

  - Add for large result sets (1000+ products)
  - Use react-window or similar
  - _Requirements: 10.3_


- [x] 16.3 Optimize mobile performance

  - Reduce re-renders
  - Optimize touch interactions
  - Test on real devices
  - _Requirements: 10.1, 10.2, 10.3_

- [ ]* 16.4 Write performance tests
  - Measure filter application time
  - Measure search execution time
  - Test with large datasets

- [ ] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
