# Design Document

## Overview

This feature adds three dynamic product showcase sections to the homepage: New Arrivals, Best Sellers, and Offer Items. Each section displays products based on boolean flags set by administrators through the product management interface. The design follows the existing architecture patterns, using Supabase for data persistence, React components for UI, and Tailwind CSS for styling.

The implementation extends the existing `products` table with three new boolean columns and creates reusable showcase components that mirror the styling and behavior of the existing `FeaturedCollection` component. The admin panel's product form will be enhanced with checkboxes to control these attributes.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
├─────────────────────────────────────────────────────────────┤
│  Homepage (page.tsx)                                         │
│    ├── CategoriesShowcase                                    │
│    ├── NewArrivalsSection (new)                             │
│    ├── BestSellersSection (new)                             │
│    ├── OfferItemsSection (new)                              │
│    └── FeaturedCollection                                    │
├─────────────────────────────────────────────────────────────┤
│  Admin Panel                                                 │
│    └── Product Form (new/edit)                              │
│         └── Showcase Checkboxes (new)                       │
├─────────────────────────────────────────────────────────────┤
│  Shared Components                                           │
│    ├── ProductCard (reused)                                 │
│    └── ShowcaseSection (new, reusable)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
├─────────────────────────────────────────────────────────────┤
│  Database Tables                                             │
│    └── products (extended)                                   │
│         ├── is_new_arrival: boolean                         │
│         ├── is_best_seller: boolean                         │
│         └── is_offer_item: boolean                          │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Admin Product Management**
   - Admin accesses product form (new or edit)
   - Form displays showcase checkboxes with current values
   - Admin selects/deselects showcase attributes
   - Form submits data to Supabase with showcase flags
   - Database updates product record

2. **Homepage Display**
   - Homepage component mounts
   - Each showcase section fetches products with respective flag = true
   - Products are rendered using ProductCard component
   - Sections with no products are hidden
   - User clicks product → navigates to product detail page

## Components and Interfaces

### Database Schema Extension

```sql
-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN is_new_arrival boolean DEFAULT false,
ADD COLUMN is_best_seller boolean DEFAULT false,
ADD COLUMN is_offer_item boolean DEFAULT false;

-- Create indexes for performance
CREATE INDEX idx_products_new_arrival ON products(is_new_arrival) WHERE is_new_arrival = true;
CREATE INDEX idx_products_best_seller ON products(is_best_seller) WHERE is_best_seller = true;
CREATE INDEX idx_products_offer_item ON products(is_offer_item) WHERE is_offer_item = true;
```

### TypeScript Type Extensions

```typescript
// Extend Product type in src/types/index.ts
export type Product = {
  id: string;
  title: string;
  description?: string;
  base_price: number;
  discount_price?: number;
  category_id?: string;
  is_featured: boolean;
  is_new_arrival: boolean;  // NEW
  is_best_seller: boolean;  // NEW
  is_offer_item: boolean;   // NEW
  created_at: string;
  category?: Category;
  variants?: ProductVariant[];
};

// Showcase section configuration type
export type ShowcaseConfig = {
  title: string;
  subtitle: string;
  badgeText: string;
  badgeIcon: React.ComponentType;
  filterKey: 'is_new_arrival' | 'is_best_seller' | 'is_offer_item';
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
};
```

### Component Interfaces

#### ShowcaseSection Component

```typescript
interface ShowcaseSectionProps {
  config: ShowcaseConfig;
  limit?: number;
  showViewAll?: boolean;
}
```

This reusable component handles:
- Fetching products based on filter key
- Loading states
- Empty state (hide section)
- Responsive grid layout
- View all link

#### Admin Form Extension

The existing product form will be extended with:

```typescript
interface ProductFormData {
  // ... existing fields
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_offer_item: boolean;
}
```

## Data Models

### Product Model (Extended)

```typescript
{
  id: "uuid",
  title: "Diamond Solitaire Ring",
  description: "Elegant 18k gold ring...",
  base_price: 45000,
  discount_price: 38000,
  category_id: "uuid",
  is_featured: true,
  is_new_arrival: true,    // NEW
  is_best_seller: false,   // NEW
  is_offer_item: true,     // NEW
  created_at: "2024-01-15T10:30:00Z",
  variants: [...]
}
```

### Showcase Configuration

```typescript
const showcaseConfigs: Record<string, ShowcaseConfig> = {
  newArrivals: {
    title: "New Arrivals",
    subtitle: "Discover our latest collection of exquisite jewelry pieces",
    badgeText: "Just In",
    badgeIcon: Sparkles,
    filterKey: "is_new_arrival",
    gradientFrom: "from-blue-900/10",
    gradientTo: "to-blue-500/5",
    accentColor: "blue-500"
  },
  bestSellers: {
    title: "Best Sellers",
    subtitle: "Customer favorites that define timeless elegance",
    badgeText: "Popular",
    badgeIcon: TrendingUp,
    filterKey: "is_best_seller",
    gradientFrom: "from-purple-900/10",
    gradientTo: "to-purple-500/5",
    accentColor: "purple-500"
  },
  offerItems: {
    title: "Special Offers",
    subtitle: "Exclusive deals on premium jewelry pieces",
    badgeText: "Limited Time",
    badgeIcon: Tag,
    filterKey: "is_offer_item",
    gradientFrom: "from-red-900/10",
    gradientTo: "to-red-500/5",
    accentColor: "red-500"
  }
};
```


## Correctnes
s Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

After reviewing the prework analysis, several properties were identified as redundant and have been consolidated:

- Properties 1.5, 2.5, and 3.5 (navigation behavior) are identical and combined into Property 1
- Properties 1.2, 2.2, and 3.2 (filtering by showcase flags) follow the same pattern and are combined into Property 2
- Properties 1.4, 2.4, and 3.4 (product card rendering) are similar and combined into Property 3

### Property 1: Product navigation consistency
*For any* product displayed in any showcase section, clicking the product should navigate to the product detail page with the correct product ID in the URL.
**Validates: Requirements 1.5, 2.5, 3.5**

### Property 2: Showcase filtering accuracy
*For any* showcase section (New Arrivals, Best Sellers, Offer Items), all displayed products should have the corresponding boolean flag set to true, and no products with the flag set to false should appear.
**Validates: Requirements 1.2, 2.2, 3.2**

### Property 3: Product card completeness
*For any* product displayed in a showcase section, the rendered card should contain all required information fields (image, name, price, and section-specific attributes like badges or discount information).
**Validates: Requirements 1.4, 2.4, 3.4**

### Property 4: Form state persistence
*For any* product with showcase attributes, when the edit form is loaded, the checkboxes should reflect the current database values exactly.
**Validates: Requirements 4.2**

### Property 5: Showcase attribute round-trip
*For any* product, setting showcase attributes in the admin form and saving should result in the database containing exactly those attribute values.
**Validates: Requirements 4.3**

### Property 6: Attribute removal consistency
*For any* product with showcase attributes set to true, unchecking those attributes and saving should result in the database values being set to false.
**Validates: Requirements 4.4**

### Property 7: Offer item validation
*For any* product marked as an offer item without a discount price, the form should display a warning message.
**Validates: Requirements 6.1**

### Property 8: Form validation completeness
*For any* product submission with showcase attributes, if required fields are missing, the form should prevent submission and display validation errors.
**Validates: Requirements 6.2**

### Property 9: Form state reactivity
*For any* showcase checkbox, toggling its value should immediately update the form state without requiring a page reload.
**Validates: Requirements 6.3**

### Property 10: Submission feedback consistency
*For any* product form submission, the system should provide either success or error feedback, never leaving the user without a response.
**Validates: Requirements 6.4**

### Property 11: Error state preservation
*For any* product form submission that fails due to database errors, the form should display an error message and preserve all user-entered values.
**Validates: Requirements 6.5**

### Property 12: Image lazy loading
*For any* product image rendered in showcase sections, the image element should have lazy loading attributes applied.
**Validates: Requirements 7.2**

### Property 13: Display limit enforcement
*For any* showcase section with more products than the display limit, only the limit number of products should be rendered, and a "View All" link should be present.
**Validates: Requirements 7.5**

### Property 14: Admin badge visibility
*For any* product in the admin products list, if the product has showcase attributes set to true, corresponding badges should be visible in the list view.
**Validates: Requirements 8.1**

### Property 15: Sorting correctness
*For any* showcase attribute used for sorting in the admin panel, products should be ordered correctly based on the boolean values (true before false or vice versa depending on sort direction).
**Validates: Requirements 8.3**

### Property 16: Bulk update consistency
*For any* set of selected products in the admin panel, applying showcase attributes in bulk should update all selected products with the same attribute values.
**Validates: Requirements 8.4**

### Property 17: Statistics accuracy
*For any* showcase section, the displayed count should exactly match the number of products with the corresponding boolean flag set to true.
**Validates: Requirements 8.5**

## Error Handling

### Database Errors

**Product Fetch Failures**
- Showcase sections should gracefully handle database query failures
- Display user-friendly error message: "Unable to load products. Please try again later."
- Log detailed error information for debugging
- Allow page to continue loading other sections

**Product Save Failures**
- Admin form should catch database write errors
- Display specific error message based on failure type
- Preserve form state so admin doesn't lose work
- Provide retry option

### Validation Errors

**Offer Item Without Discount**
- Display warning (not blocking): "⚠️ This product is marked as an offer item but has no discount price set."
- Allow save to proceed (warning only)
- Highlight discount price field

**Missing Required Fields**
- Prevent form submission
- Display validation errors next to affected fields
- Scroll to first error
- Maintain showcase checkbox states

### Network Errors

**Image Loading Failures**
- Use placeholder image when product image fails to load
- Retry image load on user interaction
- Log failed image URLs for investigation

**API Timeout**
- Set reasonable timeout (10 seconds) for product queries
- Display timeout message to user
- Provide manual refresh option

### Edge Cases

**No Products in Showcase**
- Hide entire section (not just empty grid)
- No error message needed (expected behavior)

**Concurrent Updates**
- Use optimistic locking or timestamps to detect conflicts
- Warn admin if product was modified by another user
- Offer to reload or force save

**Large Product Sets**
- Implement pagination for admin product list
- Limit showcase sections to configurable number (default: 8 products)
- Provide "View All" link to dedicated page

## Testing Strategy

### Unit Testing

The implementation will use **Vitest** as the testing framework, consistent with the existing Next.js project setup.

**Component Tests**
- Test ShowcaseSection component with various product data
- Test empty state handling (no products)
- Test loading states
- Test error states
- Test admin form checkbox interactions
- Test form validation logic

**Utility Function Tests**
- Test product filtering functions
- Test showcase configuration helpers
- Test validation functions

**Example Unit Tests**
```typescript
describe('ShowcaseSection', () => {
  it('should hide section when no products match filter', () => {
    // Test empty state
  });
  
  it('should display warning for offer item without discount', () => {
    // Test validation warning
  });
  
  it('should preserve form state on save error', () => {
    // Test error handling
  });
});
```

### Property-Based Testing

The implementation will use **fast-check** as the property-based testing library for TypeScript/JavaScript.

**Configuration**
- Each property test should run a minimum of 100 iterations
- Use appropriate generators for product data, boolean flags, and form states
- Tag each test with the corresponding correctness property number

**Property Test Implementation**
- Each correctness property listed above must be implemented as a single property-based test
- Tests must be tagged using the format: `**Feature: product-showcase-sections, Property {number}: {property_text}**`
- Tests should use smart generators that create realistic product data

**Example Property Test**
```typescript
import fc from 'fast-check';

/**
 * Feature: product-showcase-sections, Property 2: Showcase filtering accuracy
 * Validates: Requirements 1.2, 2.2, 3.2
 */
test('showcase sections only display products with matching flags', () => {
  fc.assert(
    fc.property(
      fc.array(productGenerator()), // Generate random products
      fc.constantFrom('is_new_arrival', 'is_best_seller', 'is_offer_item'),
      (products, filterKey) => {
        const filtered = filterProductsByShowcase(products, filterKey);
        // All filtered products should have the flag set to true
        expect(filtered.every(p => p[filterKey] === true)).toBe(true);
        // No products with flag false should be included
        expect(filtered.some(p => p[filterKey] === false)).toBe(false);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

**End-to-End Flows**
- Admin creates product with showcase attributes → Product appears in correct homepage section
- Admin edits product to remove showcase attribute → Product disappears from section
- Multiple showcase sections load simultaneously on homepage
- Responsive behavior across different viewport sizes

**Database Integration**
- Test actual Supabase queries with test database
- Verify indexes are used correctly
- Test concurrent updates

### Testing Priorities

1. **Critical Path** (Must have tests)
   - Showcase filtering accuracy (Property 2)
   - Attribute round-trip (Property 5)
   - Form validation (Property 8)

2. **Important** (Should have tests)
   - Product card completeness (Property 3)
   - Error state preservation (Property 11)
   - Bulk update consistency (Property 16)

3. **Nice to Have** (Optional tests)
   - Image lazy loading (Property 12)
   - Admin badge visibility (Property 14)
   - Statistics accuracy (Property 17)
