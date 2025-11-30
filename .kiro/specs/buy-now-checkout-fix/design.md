# Design Document

## Overview

This design addresses a critical race condition in the Buy Now checkout flow. Currently, when users click "Buy Now" on a product page, they are incorrectly redirected to the home page because the redirect logic executes before the Buy Now session is loaded from sessionStorage. This design eliminates the race condition by restructuring the initialization logic to load the Buy Now session synchronously before any redirect checks occur.

## Architecture

The fix involves modifying the checkout page component (`src/app/checkout/page.tsx`) to:

1. Initialize checkout state synchronously from sessionStorage during component mount
2. Defer redirect checks until after the checkout type is determined
3. Use a loading state to prevent premature redirects

### Component State Flow

```
Component Mount
    ↓
Check sessionStorage (synchronous)
    ↓
├─ Buy Now Session Found → Set checkoutType="buyNow", items=session.items
│                          ↓
│                          Render checkout with Buy Now items
│
└─ No Buy Now Session → Set checkoutType="cart", items=cartItems
                        ↓
                        Check if cart is empty
                        ↓
                        ├─ Empty → Redirect to home
                        └─ Not Empty → Render checkout with cart items
```

## Components and Interfaces

### Modified Component: CheckoutPage

**File:** `src/app/checkout/page.tsx`

**Key Changes:**

1. **Initialization State**: Add a new state variable to track whether initialization is complete
2. **Synchronous Session Loading**: Move Buy Now session loading to happen immediately and synchronously
3. **Conditional Redirect**: Only perform redirect checks after initialization is complete and only for cart checkout

### State Variables

```typescript
// Existing states
const [checkoutType, setCheckoutType] = useState<"cart" | "buyNow">("cart");
const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);

// New state to track initialization
const [isInitialized, setIsInitialized] = useState(false);
```

## Data Models

### CheckoutSession (Existing)

```typescript
interface CheckoutSession {
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    sessionId: string;
    createdAt: Date;
}
```

### CartItem (Existing)

```typescript
interface CartItem {
    product: Product;
    variant?: ProductVariant;
    quantity: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Session loading precedes redirect checks

*For any* checkout page load with a Buy Now session in sessionStorage, the session data should be loaded, parsed, and the checkout type should be set to "buyNow" synchronously before any redirect logic executes.

**Validates: Requirements 1.5, 2.1, 3.1, 3.2, 3.3**

### Property 2: No redirect for Buy Now checkout

*For any* checkout page load where the checkout type is "buyNow", no redirect to the home page should occur regardless of the cart state (empty or not).

**Validates: Requirements 1.3, 2.4**

### Property 3: Checkout type determines item source

*For any* checkout page load, if a Buy Now session exists, the checkout type should be "buyNow" and items should come from the session; if no Buy Now session exists, the checkout type should be "cart" and items should come from the cart store.

**Validates: Requirements 2.2, 2.3**

### Property 4: Cart preservation during Buy Now

*For any* completed Buy Now checkout with any cart state, the user's shopping cart should remain unchanged (not cleared) after the order is created.

**Validates: Requirements 1.4**

### Property 5: Session cleanup after loading

*For any* Buy Now session loaded from sessionStorage, the session data should be removed from sessionStorage immediately after being read to prevent stale data issues.

**Validates: Requirements 3.5**

### Property 6: Redirect for empty cart checkout

*For any* checkout page load where the checkout type is "cart" and both the cart items and checkout items are empty, a redirect to the home page should occur.

**Validates: Requirements 2.5**

### Property 7: Correct product display from session

*For any* checkout page load with a Buy Now session containing valid product data, the displayed checkout items should match the products from the session with correct quantities and variant information.

**Validates: Requirements 1.2**

## Error Handling

### sessionStorage Parse Errors

**Scenario:** Buy Now session data in sessionStorage is corrupted or invalid JSON

**Handling:**
- Catch JSON.parse errors
- Log error to console for debugging
- Fall back to cart checkout mode
- Clear corrupted session data from sessionStorage

### Missing Product Data

**Scenario:** Buy Now session contains incomplete product information

**Handling:**
- Validate session structure before using
- Check for required fields (product, quantity)
- Fall back to cart checkout if validation fails

### Browser Compatibility

**Scenario:** sessionStorage is not available (older browsers, privacy mode)

**Handling:**
- Check for sessionStorage availability before accessing
- Gracefully fall back to cart checkout if unavailable
- Log warning for debugging

## Testing Strategy

### Unit Tests

Unit tests will verify specific scenarios and edge cases:

1. **Buy Now Session Loading**: Test that a valid Buy Now session is correctly loaded from sessionStorage
2. **Fallback to Cart**: Test that invalid or missing Buy Now sessions fall back to cart checkout
3. **Session Cleanup**: Test that Buy Now session is removed from sessionStorage after loading
4. **Redirect Logic**: Test that redirects only occur for empty cart checkouts, not Buy Now checkouts

### Property-Based Tests

Property-based tests will verify universal behaviors across many inputs using **fast-check** (JavaScript/TypeScript property testing library). Each test will run a minimum of 100 iterations.

1. **Property 1 Test**: Generate random valid checkout sessions and verify they load before redirect checks
2. **Property 2 Test**: Generate random checkout states and verify redirect behavior matches checkout type
3. **Property 3 Test**: Generate random cart states and Buy Now sessions, complete checkout, verify cart unchanged for Buy Now
4. **Property 4 Test**: Generate random session data and verify cleanup after loading

### Integration Tests

Integration tests will verify the complete Buy Now flow:

1. Click "Buy Now" on product page → Navigate to checkout → Verify product displayed
2. Complete Buy Now checkout → Verify order created → Verify cart unchanged
3. Click "Buy Now" with items in cart → Complete checkout → Verify cart still contains original items

### Manual Testing Checklist

- [ ] Click "Buy Now" on product page without items in cart
- [ ] Click "Buy Now" on product page with items in cart
- [ ] Complete Buy Now checkout and verify cart unchanged
- [ ] Test with browser privacy mode (sessionStorage restrictions)
- [ ] Test with slow network to verify no race conditions
