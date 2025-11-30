# Design Document: Advanced Product Search and Filtering System

## Overview

The Advanced Product Search and Filtering System is a comprehensive solution that enhances product discovery on the Dazzle Jewels e-commerce platform. The system provides real-time search capabilities with intelligent filtering across multiple product attributes including price, material, color, category, ratings, and stock availability. The design emphasizes performance, user experience, and maintainability while integrating seamlessly with the existing Next.js and Supabase architecture.

### Key Features
- Real-time keyword search with debouncing
- Multi-faceted filtering (price, material, color, category, ratings, availability)
- Dynamic sort options (relevance, price, date, popularity)
- Search suggestions and autocomplete
- Active filter management with visual feedback
- Mobile-responsive design with optimized UX
- Result count tracking and filter availability indicators

## Architecture

### High-Level Architecture

The system follows a client-side filtering architecture with server-side data fetching, leveraging React's state management and Supabase's query capabilities.

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
├─────────────────────────────────────────────────────────────┤
│  SearchModal Component                                       │
│  ├── SearchInput (with debounce)                            │
│  ├── SearchSuggestions                                      │
│  ├── FilterPanel                                            │
│  │   ├── PriceRangeFilter                                  │
│  │   ├── MaterialFilter                                    │
│  │   ├── ColorFilter                                       │
│  │   ├── CategoryFilter                                    │
│  │   ├── RatingFilter                                      │
│  │   └── AvailabilityFilter                               │
│  ├── ActiveFilters                                          │
│  ├── SortDropdown                                           │
│  └── SearchResults (ProductGrid)                            │
├─────────────────────────────────────────────────────────────┤
│  State Management (Zustand Store)                           │
│  ├── searchQuery                                            │
│  ├── filters (price, material, color, category, etc.)      │
│  ├── sortBy                                                 │
│  ├── products (cached results)                             │
│  └── filteredProducts (computed)                           │
├─────────────────────────────────────────────────────────────┤
│  Data Layer (Supabase Client)                               │
│  ├── fetchProducts()                                        │
│  ├── fetchCategories()                                      │
│  └── fetchProductReviews()                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Backend                            │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                         │
│  ├── products table                                         │
│  ├── product_variants table                                │
│  ├── categories table                                       │
│  └── reviews table                                          │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

**1. SearchModal Component**
- Main container for the search interface
- Manages modal open/close state
- Coordinates between child components
- Handles keyboard shortcuts (Cmd+K / Ctrl+K)

**2. SearchInput Component**
- Text input with debounced onChange handler
- Displays search icon and clear button
- Triggers search suggestions
- Handles keyboard navigation

**3. FilterPanel Component**
- Container for all filter components
- Collapsible sections for each filter type
- Displays filter counts
- Mobile: renders as slide-up drawer

**4. Individual Filter Components**
- PriceRangeFilter: Dual-handle slider
- MaterialFilter: Checkbox list
- ColorFilter: Visual color swatches
- CategoryFilter: Radio buttons or chips
- RatingFilter: Star rating selector
- AvailabilityFilter: Toggle or checkbox

**5. ActiveFilters Component**
- Displays applied filters as removable chips
- "Clear All" button
- Updates dynamically as filters change

**6. SortDropdown Component**
- Dropdown menu with sort options
- Highlights active sort method
- Updates results immediately on selection

**7. SearchResults Component**
- Grid layout of product cards
- Infinite scroll or pagination
- Loading states and skeletons
- Empty state with suggestions

## Components and Interfaces

### TypeScript Interfaces

```typescript
// Search and Filter State
interface SearchFilters {
  query: string;
  priceRange: { min: number; max: number };
  materials: string[];
  colors: string[];
  categories: string[];
  minRating: number | null;
  availability: 'all' | 'in_stock' | 'out_of_stock';
}

interface SortOption {
  value: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular';
  label: string;
}

// Extended Product Type with computed fields
interface SearchableProduct extends Product {
  effectivePrice: number; // base_price or discount_price
  averageRating: number;
  reviewCount: number;
  isInStock: boolean;
  availableMaterials: string[];
  availableColors: string[];
  relevanceScore?: number;
}

// Filter Options with counts
interface FilterOption {
  value: string;
  label: string;
  count: number;
  disabled: boolean;
}

// Search Suggestion
interface SearchSuggestion {
  type: 'product' | 'category' | 'query';
  text: string;
  productId?: string;
  categoryId?: string;
}
```

### Zustand Store Interface

```typescript
interface SearchStore {
  // State
  isOpen: boolean;
  query: string;
  filters: SearchFilters;
  sortBy: SortOption['value'];
  products: SearchableProduct[];
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  
  // Computed
  filteredProducts: SearchableProduct[];
  activeFilterCount: number;
  resultCount: number;
  
  // Actions
  setIsOpen: (isOpen: boolean) => void;
  setQuery: (query: string) => void;
  updateFilter: (filterType: keyof SearchFilters, value: any) => void;
  clearFilter: (filterType: keyof SearchFilters) => void;
  clearAllFilters: () => void;
  setSortBy: (sortBy: SortOption['value']) => void;
  fetchProducts: () => Promise<void>;
  fetchSuggestions: (query: string) => Promise<void>;
}
```

## Data Models

### Database Schema Extensions

No new tables are required. The system uses existing tables:

**products table** (existing)
- Used for: title, description, base_price, discount_price, category_id, is_featured, created_at

**product_variants table** (existing)
- Used for: color, material, stock_quantity, price_adjustment

**categories table** (existing)
- Used for: name, slug for category filtering

**reviews table** (existing)
- Used for: rating aggregation for rating filter

### Computed Data Models

**Price Calculation**
```typescript
function getEffectivePrice(product: Product, variant?: ProductVariant): number {
  const basePrice = product.discount_price && product.discount_price < product.base_price
    ? product.discount_price
    : product.base_price;
  
  return variant ? basePrice + variant.price_adjustment : basePrice;
}
```

**Stock Availability**
```typescript
function isProductInStock(product: Product): boolean {
  if (!product.variants || product.variants.length === 0) return false;
  return product.variants.some(v => v.stock_quantity > 0);
}
```

**Average Rating**
```typescript
function calculateAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / reviews.length;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Acceptance Criteria Testing Prework

1.1 WHEN a user types in the search input field THEN the Search System SHALL execute a search query after a 300ms debounce period
  Thoughts: This is testing timing behavior - that search doesn't execute immediately but waits 300ms. We can test this by simulating typing events and checking that the search function is called after the debounce period.
  Testable: yes - property

1.2 WHEN a search query is executed THEN the Search System SHALL return products where the title or description contains the search keywords
  Thoughts: This is a core search functionality that should work for any search query. We can generate random search terms and verify that all returned products contain those terms in title or description.
  Testable: yes - property

1.3 WHEN search results are displayed THEN the Search System SHALL highlight matching keywords in product titles
  Thoughts: This is about UI rendering - ensuring highlighted text appears. We can test that the rendered output contains highlight markup around matching keywords.
  Testable: yes - property

1.4 WHEN no products match the search query THEN the Search System SHALL display a "no results found" message
  Thoughts: This is testing a specific edge case - empty results.
  Testable: edge-case

1.5 WHEN the search input is empty THEN the Search System SHALL display popular products or recent searches
  Thoughts: This is testing the default state behavior.
  Testable: yes - example

2.2 WHEN a user adjusts the price range slider THEN the Search System SHALL update the product list to show only products within the selected price range
  Thoughts: This is a filtering rule that should apply to any price range. We can generate random price ranges and verify all returned products fall within that range.
  Testable: yes - property

2.3 WHEN products have discount prices THEN the Search System SHALL use the discounted price for filtering
  Thoughts: This is ensuring the correct price is used for comparison. We can test with products that have discounts and verify filtering uses discount_price.
  Testable: yes - property

2.4 WHEN a price filter is applied THEN the Search System SHALL display the active price range in the filter summary
  Thoughts: This is testing UI state reflection. We can verify that applied filters appear in the summary section.
  Testable: yes - property

2.5 WHEN a user clears the price filter THEN the Search System SHALL reset the price range to show all products
  Thoughts: This is a round-trip property - applying then clearing a filter should return to original state.
  Testable: yes - property

3.2 WHEN a user selects one or more material filters THEN the Search System SHALL display only products with variants matching the selected materials
  Thoughts: This is a filtering rule for any set of materials. We can generate random material selections and verify all products have at least one variant with those materials.
  Testable: yes - property

3.3 WHEN a material filter option is displayed THEN the Search System SHALL show the count of products available for that material
  Thoughts: This is testing that counts are accurate. For any material, the displayed count should equal the actual number of products with that material.
  Testable: yes - property

3.5 WHEN a user deselects all material filters THEN the Search System SHALL show all products regardless of material
  Thoughts: This is a round-trip property - selecting then deselecting should return to original state.
  Testable: yes - property

4.2 WHEN a user selects one or more color filters THEN the Search System SHALL display only products with variants matching the selected colors
  Thoughts: This is a filtering rule for any set of colors. Similar to materials, should work for any color combination.
  Testable: yes - property

4.3 WHEN a color filter option is displayed THEN the Search System SHALL show the count of products available in that color
  Thoughts: Count accuracy for any color option.
  Testable: yes - property

4.4 WHEN multiple colors are selected THEN the Search System SHALL show products matching any of the selected colors
  Thoughts: This is testing OR logic in filtering - products should match at least one selected color.
  Testable: yes - property

5.2 WHEN a user selects a category filter THEN the Search System SHALL display only products belonging to that category
  Thoughts: Filtering rule for any category.
  Testable: yes - property

5.3 WHEN a category filter is applied THEN the Search System SHALL display the category name in the active filters section
  Thoughts: UI state reflection for active filters.
  Testable: yes - property

6.2 WHEN a user selects a rating filter THEN the Search System SHALL display only products with average ratings equal to or greater than the selected threshold
  Thoughts: Filtering rule for any rating threshold.
  Testable: yes - property

6.3 WHEN a product has no reviews THEN the Search System SHALL exclude it from rating-filtered results
  Thoughts: Edge case for products without reviews.
  Testable: edge-case

7.2 WHEN a user selects "Price: Low to High" THEN the Search System SHALL sort products by ascending price
  Thoughts: Sorting property - for any product list, sorting should produce ascending order.
  Testable: yes - property

7.3 WHEN a user selects "Price: High to Low" THEN the Search System SHALL sort products by descending price
  Thoughts: Sorting property for descending order.
  Testable: yes - property

7.4 WHEN a user selects "Newest First" THEN the Search System SHALL sort products by creation date in descending order
  Thoughts: Sorting property by date.
  Testable: yes - property

8.1 WHEN filters are applied THEN the Search System SHALL display the total count of matching products
  Thoughts: For any filter combination, the displayed count should equal the actual number of filtered products.
  Testable: yes - property

9.1 WHEN filters are applied THEN the Search System SHALL display all active filters in a summary section
  Thoughts: For any set of applied filters, they should all appear in the summary.
  Testable: yes - property

9.2 WHEN a user clicks on an active filter tag THEN the Search System SHALL remove that specific filter
  Thoughts: Clicking any active filter should remove only that filter.
  Testable: yes - property

11.2 WHEN a user selects "In Stock" THEN the Search System SHALL display only products with at least one variant having stock_quantity greater than zero
  Thoughts: Stock filtering rule that should work for any product set.
  Testable: yes - property

12.1 WHEN a user types at least 2 characters in the search input THEN the Search System SHALL display a dropdown with search suggestions
  Thoughts: For any query with 2+ characters, suggestions should appear.
  Testable: yes - property

### Property Reflection

After reviewing all testable properties, I've identified the following consolidations:

**Redundancy Analysis:**
- Properties 2.5, 3.5, and similar "clear filter" properties can be consolidated into a single "Filter Clear Round-Trip" property
- Properties 2.4, 5.3 and similar "display in active filters" can be consolidated into "Active Filter Display Consistency"
- Properties 3.3, 4.3 and similar count properties can be consolidated into "Filter Count Accuracy"
- Properties 3.2, 4.2, 5.2, 6.2, 11.2 are all filter application properties but test different filter types, so they should remain separate

**Consolidated Properties:**
1. Search keyword matching (1.2)
2. Search debounce timing (1.1)
3. Keyword highlighting (1.3)
4. Price range filtering (2.2)
5. Discount price usage (2.3)
6. Filter clear round-trip (consolidates 2.5, 3.5, 4.5, 5.5, 6.5)
7. Material filtering (3.2)
8. Color filtering with OR logic (4.2, 4.4 combined)
9. Category filtering (5.2)
10. Rating filtering (6.2)
11. Stock availability filtering (11.2)
12. Sort order correctness (7.2, 7.3, 7.4 as separate sub-properties)
13. Result count accuracy (8.1)
14. Active filter display (consolidates 2.4, 5.3, 9.1)
15. Active filter removal (9.2)
16. Filter count accuracy (consolidates 3.3, 4.3)
17. Search suggestions display (12.1)

### Correctness Properties

Property 1: Search keyword matching
*For any* search query and product database, all returned products must have the search keywords present in either the title or description fields
**Validates: Requirements 1.2**

Property 2: Search debounce timing
*For any* sequence of keystrokes in the search input, the search function must not execute until 300ms have elapsed since the last keystroke
**Validates: Requirements 1.1**

Property 3: Keyword highlighting consistency
*For any* search query and matching product, the rendered product title must contain highlight markup around all instances of the search keywords
**Validates: Requirements 1.3**

Property 4: Price range filtering correctness
*For any* price range [min, max] and product set, all filtered products must have an effective price (considering discounts) within the range min ≤ price ≤ max
**Validates: Requirements 2.2**

Property 5: Discount price precedence
*For any* product with both base_price and discount_price where discount_price < base_price, the filtering and sorting operations must use discount_price as the effective price
**Validates: Requirements 2.3**

Property 6: Filter clear round-trip
*For any* filter type (price, material, color, category, rating), applying a filter then clearing it must return the product list to the same state as before the filter was applied
**Validates: Requirements 2.5, 3.5, 4.5, 5.5, 6.5**

Property 7: Material filtering correctness
*For any* set of selected materials, all filtered products must have at least one variant where the material field matches one of the selected materials
**Validates: Requirements 3.2**

Property 8: Color filtering with OR logic
*For any* set of selected colors, all filtered products must have at least one variant where the color field matches one of the selected colors
**Validates: Requirements 4.2, 4.4**

Property 9: Category filtering correctness
*For any* selected category, all filtered products must have a category_id that matches the selected category
**Validates: Requirements 5.2**

Property 10: Rating threshold filtering
*For any* minimum rating threshold, all filtered products must have an average rating greater than or equal to the threshold, and products with no reviews must be excluded
**Validates: Requirements 6.2, 6.3**

Property 11: Stock availability filtering
*For any* product set, when "In Stock" filter is applied, all returned products must have at least one variant with stock_quantity > 0
**Validates: Requirements 11.2**

Property 12: Sort order correctness - Price ascending
*For any* product list, when sorted by "Price: Low to High", each product's effective price must be less than or equal to the next product's effective price
**Validates: Requirements 7.2**

Property 13: Sort order correctness - Price descending
*For any* product list, when sorted by "Price: High to Low", each product's effective price must be greater than or equal to the next product's effective price
**Validates: Requirements 7.3**

Property 14: Sort order correctness - Newest first
*For any* product list, when sorted by "Newest First", each product's created_at timestamp must be greater than or equal to the next product's created_at timestamp
**Validates: Requirements 7.4**

Property 15: Result count accuracy
*For any* combination of active filters, the displayed result count must equal the actual number of products in the filtered result set
**Validates: Requirements 8.1**

Property 16: Active filter display completeness
*For any* set of applied filters, all active filters must appear in the active filters summary section with correct labels
**Validates: Requirements 2.4, 5.3, 9.1**

Property 17: Active filter removal isolation
*For any* active filter, clicking its removal button must remove only that specific filter while leaving all other active filters unchanged
**Validates: Requirements 9.2**

Property 18: Filter count accuracy
*For any* filter option (material, color, etc.), the displayed count must equal the actual number of products that would be returned if that filter were applied
**Validates: Requirements 3.3, 4.3**

Property 19: Search suggestions trigger
*For any* search query with 2 or more characters, the system must display a suggestions dropdown with up to 5 relevant suggestions
**Validates: Requirements 12.1**

## Error Handling

### Client-Side Error Handling

**1. Network Errors**
- Scenario: Supabase query fails due to network issues
- Handling: Display error toast, retry with exponential backoff, cache last successful results
- User Experience: Show cached results with "offline" indicator

**2. Invalid Filter State**
- Scenario: Price range min > max, or invalid filter combinations
- Handling: Validate filter state before applying, reset to valid state
- User Experience: Show validation message, prevent invalid states

**3. Empty Results**
- Scenario: No products match current filters
- Handling: Display empty state with suggestions to remove filters
- User Experience: Show "No results found" with active filters and "Clear filters" button

**4. Search Query Errors**
- Scenario: Special characters or extremely long queries
- Handling: Sanitize input, limit query length to 100 characters
- User Experience: Show character count, truncate gracefully

**5. Debounce Race Conditions**
- Scenario: Multiple rapid searches causing out-of-order results
- Handling: Cancel previous requests, use request IDs to ignore stale responses
- User Experience: Always show results for the latest query

### Data Validation

**Filter Validation**
```typescript
function validateFilters(filters: SearchFilters): boolean {
  // Price range validation
  if (filters.priceRange.min < 0 || filters.priceRange.max < 0) return false;
  if (filters.priceRange.min > filters.priceRange.max) return false;
  
  // Rating validation
  if (filters.minRating !== null && (filters.minRating < 1 || filters.minRating > 5)) {
    return false;
  }
  
  return true;
}
```

**Search Query Sanitization**
```typescript
function sanitizeSearchQuery(query: string): string {
  // Remove special SQL characters
  // Trim whitespace
  // Limit length
  return query
    .replace(/[;'"\\]/g, '')
    .trim()
    .slice(0, 100);
}
```

### Error Recovery Strategies

1. **Graceful Degradation**: If advanced filtering fails, fall back to basic search
2. **Cached Results**: Maintain last successful search results for offline scenarios
3. **Retry Logic**: Implement exponential backoff for transient failures
4. **User Feedback**: Clear error messages with actionable next steps

## Testing Strategy

### Unit Testing Approach

**Test Framework**: Jest with React Testing Library

**Key Unit Tests:**
1. Filter logic functions (price range, material matching, etc.)
2. Sort comparison functions
3. Search query sanitization
4. Debounce utility
5. Price calculation with discounts
6. Stock availability checks
7. Filter state management

**Example Unit Test:**
```typescript
describe('priceRangeFilter', () => {
  it('should filter products within price range', () => {
    const products = [
      { id: '1', base_price: 100, discount_price: 80 },
      { id: '2', base_price: 200, discount_price: null },
      { id: '3', base_price: 150, discount_price: 120 }
    ];
    
    const filtered = applyPriceFilter(products, { min: 100, max: 150 });
    
    expect(filtered).toHaveLength(2);
    expect(filtered.map(p => p.id)).toEqual(['1', '3']);
  });
});
```

### Property-Based Testing Approach

**Test Framework**: fast-check (JavaScript property-based testing library)

**Configuration**: Each property test will run a minimum of 100 iterations with randomly generated inputs.

**Property Test Tagging**: Each property-based test must include a comment with the format:
`// Feature: advanced-search-filtering, Property {number}: {property_text}`

**Key Property Tests:**

1. **Property 1: Search keyword matching**
   - Generate: Random search queries and product databases
   - Verify: All results contain keywords in title or description

2. **Property 4: Price range filtering**
   - Generate: Random price ranges and product sets
   - Verify: All filtered products fall within range

3. **Property 6: Filter clear round-trip**
   - Generate: Random filter states
   - Verify: Apply → Clear returns to original state

4. **Property 7-11: Various filter types**
   - Generate: Random filter selections
   - Verify: Filtered results match criteria

5. **Property 12-14: Sort order correctness**
   - Generate: Random product lists
   - Verify: Sorted lists maintain correct order

**Example Property Test:**
```typescript
// Feature: advanced-search-filtering, Property 4: Price range filtering correctness
describe('Property: Price range filtering', () => {
  it('should only return products within the specified price range', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary),
        fc.integer({ min: 0, max: 10000 }),
        fc.integer({ min: 0, max: 10000 }),
        (products, min, max) => {
          const priceRange = { 
            min: Math.min(min, max), 
            max: Math.max(min, max) 
          };
          
          const filtered = applyPriceFilter(products, priceRange);
          
          return filtered.every(product => {
            const price = getEffectivePrice(product);
            return price >= priceRange.min && price <= priceRange.max;
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Test Scenarios:**
1. Full search flow: Type query → Apply filters → Sort → View results
2. Filter combinations: Multiple filters applied simultaneously
3. Mobile responsive behavior: Filter drawer, touch interactions
4. Performance: Large product sets (1000+ products)
5. Edge cases: Empty results, no filters, all filters

### Component Testing

**React Component Tests:**
1. SearchModal: Open/close, keyboard shortcuts
2. SearchInput: Debounce behavior, clear button
3. FilterPanel: Expand/collapse, mobile drawer
4. Individual filters: User interactions, state updates
5. ActiveFilters: Display, removal, clear all
6. SearchResults: Loading states, empty states, grid layout

### Performance Testing

**Metrics to Monitor:**
1. Search execution time (target: < 200ms)
2. Filter application time (target: < 100ms)
3. UI responsiveness during filtering
4. Memory usage with large datasets
5. Mobile scroll performance

**Performance Optimization Strategies:**
1. Memoization of filtered results
2. Virtual scrolling for large result sets
3. Debounced filter updates
4. Lazy loading of filter options
5. Indexed search on key fields

## Implementation Notes

### Technology Stack

- **UI Framework**: React 19 with Next.js 16
- **State Management**: Zustand (consistent with existing cart/wishlist stores)
- **Styling**: Tailwind CSS with existing design system
- **UI Components**: Radix UI primitives (Dialog, Slider, Checkbox, etc.)
- **Database**: Supabase PostgreSQL
- **Testing**: Jest, React Testing Library, fast-check

### Performance Considerations

1. **Client-Side Filtering**: Filter operations happen in-browser for instant feedback
2. **Initial Data Load**: Fetch all products once, cache in Zustand store
3. **Incremental Updates**: Only re-filter when filters change
4. **Debouncing**: 300ms debounce on search input to reduce unnecessary operations
5. **Memoization**: Use React.useMemo for expensive computations

### Accessibility

1. **Keyboard Navigation**: Full keyboard support for all interactions
2. **Screen Readers**: ARIA labels on all interactive elements
3. **Focus Management**: Proper focus trapping in modal
4. **Color Contrast**: WCAG AA compliance for all text
5. **Mobile Touch Targets**: Minimum 44x44px touch targets

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

