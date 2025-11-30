# Design Document

## Overview

The Order Management & Payment System is a comprehensive e-commerce solution that handles the complete order lifecycle from checkout to delivery. The system integrates with Razorpay for payment processing, implements intelligent delivery charge calculation based on geographic distance, provides real-time order tracking, and includes a robust notification system. The architecture is designed to be modular, scalable, and maintainable, with clear separation between payment processing, order management, and delivery logistics.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Next.js)                   │
├─────────────────────────────────────────────────────────────┤
│  Checkout Page  │  Order Tracking  │  Admin Panel           │
│  - Address Form │  - Status View   │  - Order List          │
│  - Payment UI   │  - Timeline      │  - Status Updates      │
│  - Map Display  │  - Tracking Link │  - Reports             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js API)                   │
├─────────────────────────────────────────────────────────────┤
│  /api/orders/*     │  /api/payment/*   │  /api/delivery/*   │
│  /api/coupons/*    │  /api/notifications/*                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
├─────────────────────────────────────────────────────────────┤
│  OrderService      │  PaymentService   │  DeliveryService   │
│  CouponService     │  NotificationService                    │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Supabase   │   │   Razorpay   │   │  Geolocation │
│   Database   │   │   Payment    │   │   Services   │
│              │   │   Gateway    │   │  (Maps API)  │
└──────────────┘   └──────────────┘   └──────────────┘
```

### Data Flow

**1. Checkout Flow:**
```
User adds items to cart
  → Navigate to checkout
  → Enter/GPS-fetch shipping address
  → View location on map
  → System calculates delivery charges (pincode-based)
  → Apply coupon (optional)
  → Review order summary
  → Select payment method
  → Razorpay payment processing
  → Create order in database
  → Send confirmation notifications
  → Redirect to success page
```

**2. Order Management Flow:**
```
Admin views orders list
  → Filter/sort/search orders
  → Click order to view details
  → Update order status
  → System triggers notification
  → Customer receives email
  → Status reflected in customer's order tracking
```

**3. Delivery Tracking Flow:**
```
Customer views order
  → System displays current status
  → Shows timeline with timestamps
  → When shipped: displays tracking info
  → Customer clicks tracking link
  → Redirected to courier tracking page
```

## Components and Interfaces

### 1. Checkout Page Component

**Location:** `src/app/checkout/page.tsx`

**Features:**
- Multi-step checkout process (Address → Payment → Review)
- Responsive layout for mobile/tablet/desktop
- Real-time validation
- Progress indicator

**Sub-components:**
- `AddressForm` - Manual address entry with GPS option
- `MapDisplay` - Shows delivery location
- `OrderSummary` - Items, prices, charges breakdown
- `PaymentSelector` - Payment method selection
- `CouponInput` - Discount code application

### 2. Address Form Component

**Location:** `src/components/checkout/address-form.tsx`

**Props:**
```typescript
interface AddressFormProps {
  onAddressChange: (address: ShippingAddress) => void;
  initialAddress?: ShippingAddress;
  onDeliveryChargeCalculated: (charge: number) => void;
}
```

**Features:**
- Manual input fields (name, phone, street, city, state, pincode)
- "Locate Me" button for GPS auto-fill
- Real-time pincode validation
- Delivery charge calculation on pincode change
- Form validation with error messages

**State Management:**
- Track form field values
- GPS loading state
- Validation errors
- Delivery charge loading

### 3. Map Display Component

**Location:** `src/components/checkout/map-display.tsx`

**Props:**
```typescript
interface MapDisplayProps {
  address: ShippingAddress;
  onLocationAdjust?: (lat: number, lng: number) => void;
  interactive?: boolean;
}
```

**Features:**
- Embedded map (Google Maps or Mapbox)
- Marker showing delivery location
- Auto-update when address changes
- Optional marker dragging for fine-tuning
- Responsive sizing

**Integration:**
- Use Google Maps JavaScript API or Mapbox GL JS
- Geocoding API for address → coordinates
- Reverse geocoding for GPS → address

### 4. Payment Selector Component

**Location:** `src/components/checkout/payment-selector.tsx`

**Props:**
```typescript
interface PaymentSelectorProps {
  amount: number;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: Error) => void;
}
```

**Features:**
- Display available payment methods (UPI, Cards, Net Banking, Wallets)
- Razorpay integration
- Payment method icons
- Secure payment processing
- Loading states during payment

**Razorpay Integration:**
```typescript
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: amount * 100, // Convert to paise
  currency: 'INR',
  name: 'Your Store Name',
  description: 'Order Payment',
  order_id: razorpayOrderId,
  handler: function (response) {
    // Verify payment on backend
    onPaymentSuccess(response.razorpay_payment_id);
  },
  prefill: {
    name: customerName,
    email: customerEmail,
    contact: customerPhone
  },
  theme: {
    color: '#FBBF24' // Yellow accent
  }
};
```

### 5. Coupon Input Component

**Location:** `src/components/checkout/coupon-input.tsx`

**Props:**
```typescript
interface CouponInputProps {
  subtotal: number;
  onCouponApplied: (discount: number, couponCode: string) => void;
  onCouponRemoved: () => void;
}
```

**Features:**
- Input field for coupon code
- "Apply" button
- Display applied coupon with discount amount
- "Remove" button for applied coupons
- Error messages for invalid coupons
- Success animation when applied

### 6. Order List Component (Admin)

**Location:** `src/components/admin/order-list.tsx`

**Features:**
- Paginated table of orders
- Columns: Order #, Customer, Date, Total, Status, Actions
- Filter by status dropdown
- Date range picker
- Search by order number/customer
- Sort by date/amount/status
- Click row to view details

**Props:**
```typescript
interface OrderListProps {
  initialFilters?: OrderFilters;
}

interface OrderFilters {
  status?: OrderStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
}
```

### 7. Order Detail Component (Admin)

**Location:** `src/components/admin/order-detail.tsx`

**Props:**
```typescript
interface OrderDetailProps {
  orderId: string;
}
```

**Features:**
- Comprehensive order information display
- Customer details section
- Items list with images and prices
- Pricing breakdown (subtotal, discount, delivery, tax, total)
- Payment information (method, transaction ID, status)
- Shipping address with map
- Order timeline with status history
- Status update dropdown
- Print invoice button
- Tracking information (when shipped)

### 8. Order Status Update Component

**Location:** `src/components/admin/order-status-update.tsx`

**Props:**
```typescript
interface OrderStatusUpdateProps {
  currentStatus: OrderStatus;
  orderId: string;
  onStatusUpdated: (newStatus: OrderStatus) => void;
}
```

**Features:**
- Dropdown with available next statuses
- Confirmation dialog for status changes
- Tracking info input (when marking as shipped)
- Loading state during update
- Success/error feedback

**Status Flow:**
```
pending → confirmed → processing → shipped → delivered
                ↓
            cancelled (only from pending/confirmed)
```

### 9. Order Tracking Component (Customer)

**Location:** `src/components/orders/order-tracking.tsx`

**Props:**
```typescript
interface OrderTrackingProps {
  orderId: string;
}
```

**Features:**
- Visual progress indicator (stepper/timeline)
- Current status highlighted
- Timestamps for each status
- Estimated delivery date
- Tracking link (when shipped)
- Order details summary
- Cancel order button (if eligible)

### 10. Notification Service

**Location:** `src/lib/services/notification-service.ts`

**Interface:**
```typescript
interface NotificationService {
  sendOrderConfirmation(order: Order): Promise<void>;
  sendStatusUpdate(order: Order, newStatus: OrderStatus): Promise<void>;
  sendShippingNotification(order: Order, trackingInfo: TrackingInfo): Promise<void>;
  sendDeliveryConfirmation(order: Order): Promise<void>;
  sendAdminNewOrderAlert(order: Order): Promise<void>;
  sendCancellationConfirmation(order: Order): Promise<void>;
}
```

**Implementation:**
- Use email service (SendGrid, Resend, or Supabase Auth emails)
- Template-based emails with order details
- Retry logic for failed sends (up to 3 attempts)
- Log all notification attempts
- Queue system for batch notifications

## Data Models

### Order Model

```typescript
interface Order {
  id: string;
  order_number: string; // e.g., "ORD-2024-001234"
  user_id: string;
  
  // Items
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  discount: number;
  coupon_code?: string;
  delivery_charge: number;
  tax: number;
  total: number;
  
  // Shipping
  shipping_address: ShippingAddress;
  delivery_pincode: string;
  estimated_delivery_date?: Date;
  
  // Payment
  payment_method: 'razorpay' | 'cod';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_id?: string; // Razorpay payment ID
  razorpay_order_id?: string;
  
  // Status
  status: OrderStatus;
  status_history: StatusHistoryEntry[];
  
  // Tracking
  tracking_number?: string;
  tracking_url?: string;
  courier_name?: string;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  cancelled_at?: Date;
  cancellation_reason?: string;
}

type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  price: number; // Price at time of order
  subtotal: number; // price * quantity
}

interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: Date;
  updated_by: string; // user_id of admin or 'system'
  notes?: string;
}
```

### Coupon Model

```typescript
interface Coupon {
  id: string;
  code: string; // e.g., "SAVE20"
  description: string;
  
  // Discount
  discount_type: 'percentage' | 'fixed';
  discount_value: number; // 20 for 20% or 100 for ₹100
  
  // Constraints
  min_order_value?: number;
  max_discount?: number; // For percentage coupons
  usage_limit?: number; // Total uses allowed
  usage_count: number; // Current uses
  per_user_limit?: number;
  
  // Validity
  valid_from: Date;
  valid_until: Date;
  is_active: boolean;
  
  // Metadata
  created_at: Date;
  created_by: string;
}
```

### Delivery Settings Model

```typescript
interface DeliverySettings {
  id: string;
  
  // Business location
  business_pincode: string;
  business_city: string;
  business_state: string;
  business_latitude: number;
  business_longitude: number;
  
  // Pricing zones (distance-based)
  local_delivery_charge: number; // Within 10km
  city_delivery_charge: number; // Within city
  state_delivery_charge: number; // Within state
  national_delivery_charge: number; // Other states
  
  // Free shipping
  free_shipping_threshold: number; // Order value for free shipping
  free_shipping_enabled: boolean;
  
  // Metadata
  updated_at: Date;
  updated_by: string;
}
```

### Payment Gateway Abstraction

```typescript
interface PaymentGateway {
  createOrder(amount: number, currency: string, metadata: any): Promise<PaymentOrder>;
  verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean>;
  refundPayment(paymentId: string, amount: number): Promise<RefundResponse>;
  getPaymentDetails(paymentId: string): Promise<PaymentDetails>;
}

interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

interface RazorpayGateway implements PaymentGateway {
  // Razorpay-specific implementation
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Acceptance Criteria Testing Prework

[Prework analysis completed - see context for full analysis]

### Property Reflection

After reviewing all properties identified in the prework, I've identified the following consolidations:

- Properties for notification sending (9.1, 9.2, 9.3, 9.4, 10.1) can be consolidated into a single comprehensive "Notification triggering" property
- Properties for order detail display (4.3, 7.1, 7.2, 7.3, 7.4) can be consolidated into "Order detail completeness" property
- Properties for delivery charge calculation (3.1, 3.3, 3.4) can be consolidated into "Delivery charge calculation correctness" property
- Properties for coupon validation (2.2, 2.3, 2.4, 2.5) can be consolidated into "Coupon application correctness" property
- Properties for status updates (8.2, 8.3, 8.4) can be consolidated into "Status update completeness" property

### Correctness Properties

**Property 1: Payment gateway initialization**
*For any* payment method selection, the system should initialize the correct payment gateway module
**Validates: Requirements 1.2**

**Property 2: Order creation on successful payment**
*For any* successful payment transaction, the system should create an order record with status "confirmed" and all payment details
**Validates: Requirements 1.4**

**Property 3: Form data persistence on payment failure**
*For any* payment failure, the checkout form should retain all previously entered data
**Validates: Requirements 1.5**

**Property 4: Coupon application correctness**
*For any* valid coupon code, the system should correctly calculate the discount based on coupon type (percentage or fixed), apply usage limits, and update the order total
**Validates: Requirements 2.2, 2.3, 2.4, 2.5**

**Property 5: Invalid coupon handling**
*For any* invalid, expired, or usage-exceeded coupon, the system should reject the coupon and maintain the original order total
**Validates: Requirements 2.4, 2.5**

**Property 6: Delivery charge calculation correctness**
*For any* valid pincode, the system should calculate delivery charges based on distance from business location, apply the correct zone rate, and update the total in real-time when address changes
**Validates: Requirements 3.1, 3.3, 3.4**

**Property 7: Free shipping threshold application**
*For any* order where subtotal exceeds the configured free shipping threshold, delivery charges should be set to zero
**Validates: Requirements 3.2**

**Property 8: GPS address auto-fill completeness**
*For any* successful geolocation fetch, the system should populate all address fields (street, city, state, pincode) with the reverse-geocoded address
**Validates: Requirements 3A.3, 3A.4**

**Property 9: Map display reactivity**
*For any* address change, the embedded map should update the marker position to reflect the new location
**Validates: Requirements 3B.1, 3B.2**

**Property 10: Delivery settings persistence and application**
*For any* delivery settings update by admin, the new values should be persisted and immediately applied to all subsequent delivery charge calculations
**Validates: Requirements 3C.2, 3C.4, 3C.5**

**Property 11: Order list sorting and completeness**
*For any* customer's order list, orders should be sorted by date (newest first) and each order should display all required fields (order number, date, total, status)
**Validates: Requirements 4.1, 4.2**

**Property 12: Order detail completeness**
*For any* order viewed by customer or admin, the detail page should display all required information including items, quantities, prices, shipping address, payment details, and status history with timestamps
**Validates: Requirements 4.3, 7.1, 7.2, 7.3, 7.4**

**Property 13: Order status tracking display**
*For any* order, the tracking page should display current status with visual progress indicator, timestamps for each status change, and tracking information when shipped
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

**Property 14: Admin order search functionality**
*For any* search query in admin panel, the system should filter orders by order number, customer name, or email and return matching results
**Validates: Requirements 6.5**

**Property 15: Status update completeness**
*For any* order status update by admin, the system should persist the new status, record timestamp and admin user ID, and trigger a customer notification
**Validates: Requirements 8.2, 8.3, 8.4**

**Property 16: Notification triggering**
*For any* order lifecycle event (confirmation, status change, shipping, delivery, cancellation), the system should send an appropriate email notification to the customer
**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 11.5**

**Property 17: Notification retry logic**
*For any* failed notification send, the system should log the error and retry up to three times before giving up
**Validates: Requirements 9.5**

**Property 18: Admin notification on new orders**
*For any* new order creation, the system should send an email notification to the configured admin email address with order details
**Validates: Requirements 10.1, 10.2**

**Property 19: Priority notification triggering**
*For any* order requiring attention (payment failed, customer inquiry), the system should send a priority notification to administrators
**Validates: Requirements 10.3**

**Property 20: Notification batching**
*For any* scenario where multiple orders are placed within a short time window, the system should batch notifications to prevent email flooding
**Validates: Requirements 10.4**

**Property 21: Order cancellation eligibility**
*For any* order with status "pending" or "confirmed", the system should display a cancel button; for orders with status "processing" or "shipped", the cancel button should be hidden
**Validates: Requirements 11.1, 11.4**

**Property 22: Cancellation processing**
*For any* confirmed order cancellation, the system should update status to "cancelled", initiate refund if payment was processed, and send confirmation email
**Validates: Requirements 11.3, 11.5**

**Property 23: Order data persistence completeness**
*For any* order creation, the system should store all required data (customer info, items, prices, payment details, shipping address, timestamps) with a unique order number
**Validates: Requirements 12.1, 12.2**

**Property 24: Payment data security**
*For any* order with payment information, the system should store only the transaction ID and last four card digits, never storing full card numbers or CVV
**Validates: Requirements 12.3**

**Property 25: Audit trail maintenance**
*For any* order modification, the system should record the change in status history with timestamp and user ID
**Validates: Requirements 12.4**

**Property 26: Row-level security enforcement**
*For any* order query by a customer, the system should only return orders belonging to that customer
**Validates: Requirements 12.5**

**Property 27: Payment gateway fallback**
*For any* payment gateway failure, the system should attempt to use a configured fallback gateway if available
**Validates: Requirements 13.4**

**Property 28: Order summary completeness**
*For any* checkout payment step, the order summary should display all items with quantities and prices, plus subtotal, discounts, delivery charges, tax, and final total
**Validates: Requirements 14.1, 14.2, 14.3, 14.5**

**Property 29: Report metrics calculation**
*For any* generated report, the system should calculate and display total orders, total revenue, average order value, and order status breakdown
**Validates: Requirements 15.2**

**Property 30: Report export functionality**
*For any* report export request, the system should generate a downloadable file in the requested format (CSV or PDF)
**Validates: Requirements 15.4**

**Property 31: Async report processing**
*For any* report generation request with large datasets, the system should process asynchronously and notify when complete
**Validates: Requirements 15.5**

## Error Handling

### Payment Errors

1. **Payment Gateway Timeout:**
   - Show user-friendly error message
   - Preserve form data
   - Provide retry option
   - Log error for admin review

2. **Payment Declined:**
   - Display specific decline reason if available
   - Suggest alternative payment methods
   - Allow immediate retry
   - Don't create order record

3. **Payment Gateway Unavailable:**
   - Attempt fallback gateway if configured
   - Show maintenance message if all gateways down
   - Queue order for manual processing
   - Notify admin immediately

### Delivery Calculation Errors

1. **Invalid Pincode:**
   - Display inline error message
   - Highlight pincode field
   - Prevent checkout
   - Suggest nearby valid pincodes

2. **Geolocation Failure:**
   - Show friendly error message
   - Fall back to manual address entry
   - Don't block checkout
   - Log error for debugging

3. **Map API Failure:**
   - Hide map component gracefully
   - Allow checkout to continue
   - Log error
   - Don't affect delivery charge calculation

### Coupon Errors

1. **Invalid Coupon Code:**
   - Display "Invalid coupon code" message
   - Clear coupon input
   - Maintain original total
   - Log attempt for fraud detection

2. **Expired Coupon:**
   - Display "This coupon has expired" with expiry date
   - Suggest active coupons if available
   - Clear coupon input

3. **Usage Limit Exceeded:**
   - Display "This coupon has reached its usage limit"
   - Clear coupon input
   - Suggest alternative coupons

### Order Management Errors

1. **Status Update Failure:**
   - Show error toast
   - Revert UI to previous status
   - Log error with order details
   - Provide retry option

2. **Notification Send Failure:**
   - Log error with full details
   - Retry up to 3 times with exponential backoff
   - Store notification in database for manual retry
   - Alert admin if all retries fail

3. **Concurrent Order Updates:**
   - Implement optimistic locking
   - Show conflict message if detected
   - Reload latest order data
   - Ask admin to retry update

### Database Errors

1. **Connection Failure:**
   - Show maintenance page
   - Queue operations for retry
   - Log error with full context
   - Alert admin immediately

2. **Constraint Violation:**
   - Show user-friendly error
   - Log technical details
   - Provide guidance to resolve
   - Don't expose database details

## Testing Strategy

### Unit Tests

1. **Service Layer Tests:**
   - Order creation logic
   - Coupon validation and discount calculation
   - Delivery charge calculation by zone
   - Payment gateway integration
   - Notification sending
   - Status transition validation

2. **Component Tests:**
   - Address form validation
   - Map display and interaction
   - Payment selector UI
   - Order list filtering and sorting
   - Status update dropdown
   - Coupon input and application

3. **Utility Function Tests:**
   - Pincode validation
   - Distance calculation
   - Order number generation
   - Price formatting
   - Date/time formatting

### Property-Based Tests

We will use **fast-check** for property-based testing in TypeScript/React. Each property test should run a minimum of 100 iterations.

**Property Test 1: Coupon discount calculation**
- Generate random orders with various subtotals
- Generate random coupons (percentage and fixed)
- Apply coupons and verify discount calculation
- Verify max discount caps are respected
- **Feature: order-management-system, Property 4: Coupon application correctness**

**Property Test 2: Delivery charge calculation**
- Generate random pincodes at various distances
- Calculate delivery charges
- Verify correct zone rate is applied
- Verify charges update when address changes
- **Feature: order-management-system, Property 6: Delivery charge calculation correctness**

**Property Test 3: Free shipping threshold**
- Generate random order totals
- Apply free shipping threshold
- Verify delivery charges are zero when threshold exceeded
- Verify charges apply when below threshold
- **Feature: order-management-system, Property 7: Free shipping threshold application**

**Property Test 4: Order total calculation**
- Generate random orders with items, coupons, delivery charges
- Calculate total
- Verify total = subtotal - discount + delivery + tax
- Verify calculation updates reactively
- **Feature: order-management-system, Property 28: Order summary completeness**

**Property Test 5: Status transition validation**
- Generate random orders with various statuses
- Attempt status transitions
- Verify only valid transitions are allowed
- Verify audit trail is created
- **Feature: order-management-system, Property 15: Status update completeness**

**Property Test 6: Order data persistence**
- Generate random orders with all fields
- Save to database
- Retrieve and verify all fields match
- Verify unique order numbers
- **Feature: order-management-system, Property 23: Order data persistence completeness**

**Property Test 7: Row-level security**
- Generate random users and orders
- Query orders as different users
- Verify users only see their own orders
- Verify admins see all orders
- **Feature: order-management-system, Property 26: Row-level security enforcement**

**Property Test 8: Notification triggering**
- Generate random order lifecycle events
- Verify appropriate notifications are triggered
- Verify notification content includes required fields
- **Feature: order-management-system, Property 16: Notification triggering**

**Property Test 9: Payment data security**
- Generate random payment information
- Store in database
- Verify only transaction ID and last 4 digits are stored
- Verify full card numbers are never stored
- **Feature: order-management-system, Property 24: Payment data security**

**Property Test 10: Cancellation eligibility**
- Generate random orders with various statuses
- Check cancel button visibility
- Verify button shown only for pending/confirmed
- Verify button hidden for processing/shipped
- **Feature: order-management-system, Property 21: Order cancellation eligibility**

### Integration Tests

1. **Complete Checkout Flow:**
   - Add items to cart
   - Navigate to checkout
   - Enter shipping address
   - Apply coupon
   - Verify delivery charges calculated
   - Complete payment (test mode)
   - Verify order created
   - Verify notifications sent

2. **Order Management Flow:**
   - Admin logs in
   - Views order list
   - Filters by status
   - Clicks order to view details
   - Updates status to "shipped"
   - Enters tracking info
   - Verify customer notification sent
   - Customer views updated status

3. **GPS Address Flow:**
   - Click "Locate Me"
   - Grant geolocation permission
   - Verify address fields populated
   - Verify map displays location
   - Verify delivery charges calculated

4. **Cancellation Flow:**
   - Customer views order
   - Clicks cancel button
   - Confirms cancellation
   - Verify status updated
   - Verify refund initiated
   - Verify notification sent

### Manual Testing Checklist

- [ ] Test Razorpay integration in test mode
- [ ] Test with various Indian pincodes (local, state, national)
- [ ] Test GPS location on mobile devices (iOS, Android)
- [ ] Test map display on different screen sizes
- [ ] Test coupon application with various discount types
- [ ] Test free shipping threshold edge cases
- [ ] Test order status transitions
- [ ] Test email notifications (check spam folder)
- [ ] Test admin order filtering and search
- [ ] Test report generation and export
- [ ] Test with slow network (3G simulation)
- [ ] Test accessibility with screen reader
- [ ] Test keyboard navigation throughout checkout
- [ ] Test payment failure scenarios
- [ ] Test concurrent order updates by multiple admins

## Performance Considerations

### Database Optimization

1. **Indexes:**
   - Index on `orders.user_id` for customer order queries
   - Index on `orders.status` for admin filtering
   - Index on `orders.created_at` for date sorting
   - Index on `orders.order_number` for search
   - Composite index on `(user_id, created_at)` for customer order history

2. **Query Optimization:**
   - Use pagination for order lists (limit 20 per page)
   - Implement cursor-based pagination for infinite scroll
   - Use database views for complex report queries
   - Cache delivery settings in memory

3. **Connection Pooling:**
   - Configure Supabase connection pool size
   - Implement connection retry logic
   - Monitor connection usage

### API Performance

1. **Caching:**
   - Cache delivery settings (5 minute TTL)
   - Cache active coupons (1 minute TTL)
   - Cache pincode to coordinates mapping
   - Use SWR for client-side caching

2. **Rate Limiting:**
   - Limit coupon validation attempts (5 per minute)
   - Limit order creation (10 per minute per user)
   - Limit status updates (30 per minute per admin)

3. **Async Processing:**
   - Process notifications asynchronously
   - Generate reports in background jobs
   - Send batch notifications via queue

### Frontend Performance

1. **Code Splitting:**
   - Lazy load checkout components
   - Lazy load admin panel
   - Lazy load map library

2. **Optimistic Updates:**
   - Update UI immediately for status changes
   - Show loading states during API calls
   - Revert on error

3. **Image Optimization:**
   - Use Next.js Image component
   - Lazy load product images in order lists
   - Optimize invoice images for printing

## Security Considerations

### Payment Security

1. **PCI Compliance:**
   - Never store full card numbers
   - Use Razorpay's secure payment form
   - Store only transaction IDs
   - Implement HTTPS everywhere

2. **Payment Verification:**
   - Verify Razorpay signatures on backend
   - Validate payment amounts match order totals
   - Check payment status before order confirmation
   - Log all payment attempts

### Data Security

1. **Row-Level Security:**
   - Implement RLS policies on orders table
   - Customers can only read their own orders
   - Admins can read/update all orders
   - Prevent order tampering

2. **Input Validation:**
   - Validate all form inputs on backend
   - Sanitize address fields
   - Validate pincode format
   - Prevent SQL injection

3. **Authentication:**
   - Require authentication for checkout
   - Verify user identity before order access
   - Implement admin role checks
   - Use secure session management

### API Security

1. **Rate Limiting:**
   - Prevent brute force coupon guessing
   - Limit order creation attempts
   - Throttle status update requests

2. **CORS Configuration:**
   - Whitelist allowed origins
   - Restrict API access to frontend domain
   - Validate request origins

3. **Error Handling:**
   - Don't expose sensitive error details
   - Log errors securely
   - Return generic error messages to clients

## Accessibility

### Keyboard Navigation

1. **Checkout Flow:**
   - All form fields keyboard accessible
   - Logical tab order
   - Skip links for long forms
   - Enter key submits forms

2. **Order Management:**
   - Keyboard shortcuts for common actions
   - Focus management in modals
   - Escape key closes dialogs

### Screen Reader Support

1. **ARIA Labels:**
   - Label all form fields
   - Describe button purposes
   - Announce status changes
   - Describe map locations

2. **Live Regions:**
   - Announce delivery charge updates
   - Announce coupon application results
   - Announce order status changes
   - Announce error messages

### Visual Accessibility

1. **Color Contrast:**
   - Ensure WCAG AA compliance
   - Don't rely solely on color for status
   - Use icons with status text
   - High contrast mode support

2. **Focus Indicators:**
   - Visible focus outlines
   - High contrast focus states
   - Focus visible on all interactive elements

## Deployment Considerations

### Environment Variables

```env
# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=xxxxx

# Email
SENDGRID_API_KEY=xxxxx
ADMIN_EMAIL=admin@example.com

# Business
BUSINESS_PINCODE=400001
BUSINESS_LATITUDE=19.0760
BUSINESS_LONGITUDE=72.8777
```

### Database Migrations

1. Create orders table with all fields
2. Create order_items table
3. Create coupons table
4. Create delivery_settings table
5. Create notification_log table
6. Set up RLS policies
7. Create indexes
8. Create database functions for order number generation

### Third-Party Setup

1. **Razorpay:**
   - Create account
   - Get API keys (test and live)
   - Configure webhooks for payment status
   - Set up webhook signature verification

2. **Google Maps:**
   - Enable Maps JavaScript API
   - Enable Geocoding API
   - Enable Places API
   - Restrict API key to domain

3. **Email Service:**
   - Set up SendGrid or Resend account
   - Verify sender domain
   - Create email templates
   - Configure DKIM/SPF records

## Future Enhancements

1. **Multi-Currency Support:**
   - Support international orders
   - Currency conversion
   - Regional payment gateways

2. **Advanced Shipping:**
   - Multiple shipping addresses
   - Gift wrapping options
   - Scheduled delivery
   - Express shipping

3. **Order Modifications:**
   - Edit order before shipping
   - Add items to existing order
   - Change delivery address

4. **Customer Communication:**
   - In-app chat with support
   - Order-specific messaging
   - SMS notifications

5. **Analytics:**
   - Revenue dashboards
   - Customer lifetime value
   - Conversion funnel analysis
   - Abandoned cart recovery

6. **Loyalty Program:**
   - Points on purchases
   - Tier-based benefits
   - Referral rewards

7. **Subscription Orders:**
   - Recurring deliveries
   - Subscription management
   - Auto-renewal

8. **Returns Management:**
   - Return request flow
   - Return shipping labels
   - Refund processing
   - Exchange handling
