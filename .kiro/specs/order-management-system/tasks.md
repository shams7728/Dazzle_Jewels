# Implementation Plan

## Current Status

**Completed (Tasks 1-7):**
- ✅ Database schema and core data models
- ✅ Core service layer (OrderService, CouponService, DeliveryService, PaymentGateway, NotificationService)
- ✅ All property-based tests for services (23 tests passing)
- ✅ Checkout page and components (AddressForm, MapDisplay, CouponInput, OrderSummary, PaymentSelector)
- ✅ All property-based tests for checkout components (6 tests passing)
- ✅ Checkout API endpoints (calculate-delivery, validate-coupon, create-payment, verify-payment, geocode)
- ✅ Customer order tracking features (order history page, order detail page, OrderTracking component)
- ✅ All property-based tests for order tracking (4 tests passing)
- ✅ Admin order management interface (orders list page, order detail page, OrderStatusUpdate component, delivery settings page)
- ✅ All property-based tests for admin features (3 tests passing)
- ✅ Admin API endpoints (orders, orders/[id], orders/[id]/status, orders/[id]/tracking, delivery-settings)
- ✅ Email templates for all notification types

**Remaining (Tasks 8-15):**
- 🔄 Task 8: Complete notification system integration (templates exist, need to integrate with service and add batching)
- ⏳ Task 9: Build order reports and analytics (not started)
- ⏳ Task 10: Implement additional security measures (payment data security test, input validation, rate limiting)
- ⏳ Task 11: Add enhanced error handling (payment, delivery, coupon, optimistic locking)
- ⏳ Task 12: Optimize performance (verify indexes, add caching, code splitting)
- ⏳ Task 13: Checkpoint - ensure all tests pass
- ⏳ Task 14: Final integration and testing
- ⏳ Task 15: Final checkpoint

---

- [x] 1. Set up database schema and core data models





  - Create orders table with all required fields (id, order_number, user_id, items, pricing, shipping, payment, status, tracking, timestamps)
  - Create order_items table for normalized item storage
  - Create coupons table with discount configuration and usage tracking
  - Create delivery_settings table for shipping configuration
  - Create notification_log table for tracking sent notifications
  - Set up row-level security policies (customers see only their orders, admins see all)
  - Create database indexes for performance (user_id, status, created_at, order_number)
  - Create database function for unique order number generation
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 2. Implement core service layer





- [x] 2.1 Create OrderService with order management logic


  - Implement order creation with validation
  - Implement order retrieval with filtering and pagination
  - Implement order status updates with audit trail
  - Implement order cancellation with refund logic
  - _Requirements: 1.4, 4.1, 4.3, 8.2, 8.3, 11.3_

- [x] 2.2 Write property test for order data persistence


  - **Property 23: Order data persistence completeness**
  - **Validates: Requirements 12.1, 12.2**

- [x] 2.3 Write property test for row-level security


  - **Property 26: Row-level security enforcement**
  - **Validates: Requirements 12.5**

- [x] 2.4 Create CouponService with validation and discount calculation


  - Implement coupon validation (expiry, usage limits, min order value)
  - Implement discount calculation (percentage and fixed)
  - Implement coupon application with max discount caps
  - Track coupon usage count
  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 2.5 Write property test for coupon application


  - **Property 4: Coupon application correctness**
  - **Validates: Requirements 2.2, 2.3, 2.4, 2.5**

- [x] 2.6 Write property test for invalid coupon handling


  - **Property 5: Invalid coupon handling**
  - **Validates: Requirements 2.4, 2.5**

- [x] 2.7 Create DeliveryService with charge calculation


  - Implement pincode validation
  - Implement distance calculation from business location
  - Implement zone-based delivery charge calculation
  - Implement free shipping threshold logic
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 2.8 Write property test for delivery charge calculation


  - **Property 6: Delivery charge calculation correctness**
  - **Validates: Requirements 3.1, 3.3, 3.4**

- [x] 2.9 Write property test for free shipping threshold


  - **Property 7: Free shipping threshold application**
  - **Validates: Requirements 3.2**

- [x] 2.10 Create PaymentGateway abstraction layer


  - Define PaymentGateway interface with standard methods
  - Implement RazorpayGateway with order creation, verification, refund
  - Implement payment signature verification
  - Add support for test/sandbox mode
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 2.11 Write property test for payment gateway initialization


  - **Property 1: Payment gateway initialization**
  - **Validates: Requirements 1.2**

- [x] 2.12 Create NotificationService with email sending


  - Implement email template rendering
  - Implement notification sending with retry logic (3 attempts)
  - Implement notification logging
  - Create templates for order confirmation, status updates, shipping, delivery, cancellation
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2_

- [x] 2.13 Write property test for notification triggering


  - **Property 16: Notification triggering**
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 11.5**

- [x] 2.14 Write property test for notification retry logic


  - **Property 17: Notification retry logic**
  - **Validates: Requirements 9.5**
-

- [x] 3. Build checkout page and components




- [x] 3.1 Create checkout page with multi-step flow

  - Implement checkout page layout with progress indicator
  - Implement step navigation (Address → Payment → Review)
  - Implement form state management across steps
  - Add responsive design for mobile/tablet/desktop
  - _Requirements: 1.1, 14.1, 14.3, 14.4_


- [x] 3.2 Create AddressForm component

  - Implement manual address input fields (name, phone, street, city, state, pincode)
  - Implement form validation with error messages
  - Implement "Locate Me" button for GPS
  - Implement geolocation API integration with permission handling
  - Implement reverse geocoding to convert coordinates to address
  - Auto-fill address fields from GPS data
  - Trigger delivery charge calculation on pincode change
  - _Requirements: 3A.1, 3A.2, 3A.3, 3A.4, 3A.5_


- [x] 3.3 Write property test for GPS address auto-fill

  - **Property 8: GPS address auto-fill completeness**
  - **Validates: Requirements 3A.3, 3A.4**

- [x] 3.4 Create MapDisplay component


  - Integrate Google Maps or Mapbox
  - Display map with marker at address location
  - Implement geocoding to convert address to coordinates
  - Update marker position when address changes
  - Add marker dragging for fine-tuning location
  - Implement responsive map sizing
  - Handle map loading errors gracefully
  - _Requirements: 3B.1, 3B.2, 3B.3, 3B.4, 3B.5_

- [x] 3.5 Write property test for map display reactivity


  - **Property 9: Map display reactivity**
  - **Validates: Requirements 3B.1, 3B.2**

- [x] 3.6 Create CouponInput component


  - Implement coupon code input field
  - Implement "Apply" button with loading state
  - Display applied coupon with discount amount
  - Implement "Remove" button for applied coupons
  - Show error messages for invalid coupons
  - Add success animation when coupon applied
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_


- [x] 3.7 Create OrderSummary component

  - Display all cart items with images, names, quantities, prices
  - Calculate and display subtotal
  - Display applied discount with coupon code
  - Display delivery charges
  - Display tax calculation
  - Display final total with clear breakdown
  - Highlight savings from coupons and free shipping
  - _Requirements: 14.1, 14.2, 14.5_

- [x] 3.8 Write property test for order summary completeness


  - **Property 28: Order summary completeness**
  - **Validates: Requirements 14.1, 14.2, 14.3, 14.5**

- [x] 3.9 Write property test for order total calculation


  - **Property 4 (extended): Order total calculation**
  - Verify total = subtotal - discount + delivery + tax

- [x] 3.10 Create PaymentSelector component


  - Display available payment methods (UPI, Cards, Net Banking, Wallets)
  - Integrate Razorpay SDK
  - Implement payment method selection UI
  - Handle payment success callback
  - Handle payment failure with error display
  - Preserve form data on payment failure
  - Show loading states during payment processing
  - _Requirements: 1.2, 1.3, 1.5_

- [x] 3.11 Write property test for order creation on successful payment


  - **Property 2: Order creation on successful payment**
  - **Validates: Requirements 1.4**

- [x] 3.12 Write property test for form data persistence on payment failure


  - **Property 3: Form data persistence on payment failure**
  - **Validates: Requirements 1.5**


- [x] 4. Implement checkout API endpoints






- [x] 4.1 Create /api/checkout/calculate-delivery endpoint


  - Accept pincode and order details
  - Calculate delivery charges using DeliveryService
  - Return delivery charge and estimated delivery date
  - Handle invalid pincode errors
  - _Requirements: 3.1, 3.4, 3.5_

- [x] 4.2 Create /api/checkout/validate-coupon endpoint


  - Accept coupon code and order subtotal
  - Validate coupon using CouponService
  - Return discount amount and updated total
  - Handle invalid/expired coupon errors
  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 4.3 Create /api/checkout/create-payment endpoint


  - Accept order details and payment method
  - Create Razorpay order using PaymentGateway
  - Return payment order ID for frontend
  - Log payment creation attempt
  - _Requirements: 1.2, 1.3_

- [x] 4.4 Create /api/checkout/verify-payment endpoint


  - Accept Razorpay payment response (payment_id, order_id, signature)
  - Verify payment signature using PaymentGateway
  - Create order in database using OrderService
  - Send order confirmation notification
  - Return order details and success status
  - _Requirements: 1.4, 9.1, 10.1_

- [x] 4.5 Create /api/checkout/geocode endpoint


  - Accept latitude and longitude from GPS
  - Call reverse geocoding API
  - Return formatted address with pincode
  - Handle geocoding errors
  - _Requirements: 3A.3, 3A.4_

- [x] 5. Build customer order tracking features








- [x] 5.1 Create order history page


  - Display list of customer's orders sorted by date
  - Show order number, date, total, status for each order
  - Implement pagination or infinite scroll
  - Add empty state for no orders
  - Link to order detail page
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [x] 5.2 Write property test for order list sorting


  - **Property 11: Order list sorting and completeness**
  - **Validates: Requirements 4.1, 4.2**

- [x] 5.3 Create order detail page for customers


  - Display comprehensive order information
  - Show items with images, quantities, prices
  - Display pricing breakdown (subtotal, discount, delivery, tax, total)
  - Show shipping address
  - Display payment information (method, transaction ID)
  - Show order timeline with status history
  - _Requirements: 4.3, 7.1, 7.2, 7.3, 7.4_

- [x] 5.4 Write property test for order detail completeness


  - **Property 12: Order detail completeness**
  - **Validates: Requirements 4.3, 7.1, 7.2, 7.3, 7.4**

- [x] 5.5 Create OrderTracking component

  - Display visual progress indicator (stepper/timeline)
  - Highlight current status
  - Show timestamps for each status change
  - Display estimated delivery date
  - Show tracking link when order is shipped
  - Add "Cancel Order" button if eligible
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 11.1_

- [x] 5.6 Write property test for order status tracking display


  - **Property 13: Order status tracking display**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

- [x] 5.7 Implement order cancellation flow


  - Add cancel button with eligibility check (pending/confirmed only)
  - Show confirmation dialog with cancellation policy
  - Call cancellation API endpoint
  - Update order status to cancelled
  - Initiate refund if payment was processed
  - Send cancellation confirmation email
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 5.8 Write property test for order cancellation eligibility


  - **Property 21: Order cancellation eligibility**
  - **Validates: Requirements 11.1, 11.4**

- [x] 5.9 Write property test for cancellation processing


  - **Property 22: Cancellation processing**
  - **Validates: Requirements 11.3, 11.5**
-

- [x] 6. Build admin order management interface




- [x] 6.1 Create admin orders list page


  - Display paginated table of all orders
  - Show columns: Order #, Customer, Date, Total, Status, Actions
  - Implement filter by status dropdown
  - Implement date range picker
  - Implement search by order number/customer name/email
  - Implement sorting by date/amount/status
  - Add click handler to navigate to order detail
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 6.2 Write property test for admin order search


  - **Property 14: Admin order search functionality**
  - **Validates: Requirements 6.5**

- [x] 6.3 Create admin order detail page


  - Display comprehensive order information
  - Show customer details section
  - Display items list with images and prices
  - Show pricing breakdown
  - Display payment information
  - Show shipping address with embedded map
  - Display order timeline with status history
  - Add status update dropdown
  - Add print invoice button
  - Show tracking information when shipped
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6.4 Create OrderStatusUpdate component


  - Display dropdown with available next statuses
  - Implement status flow validation (pending → confirmed → processing → shipped → delivered)
  - Show confirmation dialog for status changes
  - Add tracking info input when marking as shipped
  - Show loading state during update
  - Display success/error feedback
  - _Requirements: 8.1, 8.2, 8.5_


- [x] 6.5 Write property test for status update completeness

  - **Property 15: Status update completeness**
  - **Validates: Requirements 8.2, 8.3, 8.4**


- [x] 6.6 Write property test for status transition validation

  - **Property 5 (extended): Status transition validation**
  - Verify only valid status transitions are allowed


- [x] 6.7 Create delivery settings page

  - Display form for business location (pincode, city, state, coordinates)
  - Add fields for delivery charge rates by zone (local, city, state, national)
  - Add field for free shipping threshold
  - Add toggle for enabling/disabling free shipping
  - Implement save functionality with validation
  - Show confirmation message on save
  - _Requirements: 3C.1, 3C.2, 3C.3, 3C.4, 3C.5_



- [x] 6.8 Write property test for delivery settings persistence

  - **Property 10: Delivery settings persistence and application**
  - **Validates: Requirements 3C.2, 3C.4, 3C.5**

- [x] 7. Implement admin API endpoints





- [x] 7.1 Create /api/admin/orders endpoint


  - Accept filter parameters (status, date range, search query)
  - Accept pagination parameters (page, limit)
  - Query orders with filters using OrderService
  - Return paginated order list with total count
  - Enforce admin role check
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_


- [x] 7.2 Create /api/admin/orders/[id] endpoint

  - Accept order ID parameter
  - Retrieve full order details using OrderService
  - Return comprehensive order data
  - Enforce admin role check
  - _Requirements: 7.1, 7.2, 7.3, 7.4_


- [x] 7.3 Create /api/admin/orders/[id]/status endpoint

  - Accept order ID and new status
  - Validate status transition
  - Update order status using OrderService
  - Record status change in audit trail
  - Trigger customer notification
  - Return updated order
  - Enforce admin role check
  - _Requirements: 8.1, 8.2, 8.3, 8.4_


- [x] 7.4 Create /api/admin/orders/[id]/tracking endpoint

  - Accept order ID and tracking information
  - Update order with tracking number, URL, courier name
  - Trigger shipping notification to customer
  - Return updated order
  - Enforce admin role check
  - _Requirements: 8.5, 9.3_

- [x] 7.5 Create /api/admin/delivery-settings endpoint


  - Accept delivery settings data
  - Validate and save settings
  - Return updated settings
  - Enforce admin role check
  - _Requirements: 3C.1, 3C.2, 3C.4, 3C.5_

- [x] 8. Implement notification system




- [x] 8.1 Set up email service integration
  - Configure SendGrid or Resend API
  - Create email templates for all notification types
  - Implement template rendering with order data
  - Add email sending utility with error handling
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.1, 10.2_

- [x] 8.2 Integrate email templates with notification service









  - Replace placeholder template methods with actual email template functions
  - Integrate Resend API for actual email sending
  - Test email sending in development mode
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.1, 10.2_

- [-] 8.3 Implement notification batching logic

  - Add batch window tracking for multiple orders
  - Implement batch notification sending to prevent email flooding
  - Add configuration for batch window duration
  - _Requirements: 10.4_

- [ ] 8.4 Write property test for admin notification on new orders
  - **Property 18: Admin notification on new orders**
  - **Validates: Requirements 10.1, 10.2**

- [ ] 8.5 Write property test for priority notification triggering
  - **Property 19: Priority notification triggering**
  - **Validates: Requirements 10.3**

- [ ] 8.6 Write property test for notification batching
  - **Property 20: Notification batching**
  - **Validates: Requirements 10.4**

- [-] 9. Build order reports and analytics




- [x] 9.1 Create /api/admin/reports endpoint

  - Accept date range and filter parameters
  - Query orders and calculate metrics (total orders, revenue, average order value)
  - Calculate order status breakdown
  - Return report data
  - Enforce admin role check
  - _Requirements: 15.1, 15.2_


- [x] 9.2 Write property test for report metrics calculation

  - **Property 29: Report metrics calculation**
  - **Validates: Requirements 15.2**

- [x] 9.3 Create reports page in admin panel


  - Display date range picker
  - Add filter options (status, product)
  - Show report generation button
  - Display loading state during generation
  - _Requirements: 15.1_

- [x] 9.4 Create report display component


  - Display total orders, total revenue, average order value
  - Show order status breakdown with counts
  - Add visual charts for revenue trends
  - Display order status distribution chart
  - _Requirements: 15.2, 15.3_

- [x] 9.5 Implement report export functionality


  - Add export buttons for CSV and PDF
  - Generate CSV file with order data
  - Generate PDF file with formatted report
  - Trigger download in browser
  - _Requirements: 15.4_

- [-] 9.6 Write property test for report export functionality

  - **Property 30: Report export functionality**
  - **Validates: Requirements 15.4**

- [x] 9.7 Implement async report processing for large datasets












  - Add job queue for large report generation
  - Process reports asynchronously
  - Notify admin when report is ready
  - Return job ID for async processing
  - _Requirements: 15.5_

- [ ] 9.8 Write property test for async report processing
  - **Property 31: Async report processing**
  - **Validates: Requirements 15.5**

- [x] 10. Implement security and data protection






- [x] 10.1 Write property test for payment data security


  - **Property 24: Payment data security**
  - **Validates: Requirements 12.3**


- [x] 10.2 Add comprehensive input validation to API endpoints

  - Validate all form inputs on backend (checkout, admin endpoints)
  - Sanitize address fields to prevent injection
  - Validate pincode format in delivery calculation
  - Validate email and phone formats
  - Add validation error responses
  - _Requirements: 1.1, 3A.4_


- [x] 10.3 Implement rate limiting middleware

  - Add rate limiting to coupon validation endpoint (5 per minute)
  - Add rate limiting to order creation endpoint (10 per minute per user)
  - Add rate limiting to status update endpoint (30 per minute per admin)
  - Return 429 Too Many Requests when limit exceeded
  - _Requirements: 2.2, 1.4, 8.2_

- [x] 11. Add error handling and edge cases




- [x] 11.1 Enhance payment error handling in checkout

  - Add user-friendly error messages for payment gateway timeout
  - Display specific error messages for payment declined
  - Implement retry option for failed payments
  - Ensure form data is preserved on all payment errors
  - _Requirements: 1.5, 13.4_

<!-- - [ ] 11.2 Write property test for payment gateway fallback
  - **Property 27: Payment gateway fallback**
  - **Validates: Requirements 13.4** -->


- [x] 11.3 Enhance delivery calculation error handling

  - Improve error messages for invalid pincode
  - Add fallback UI when geolocation fails
  - Handle map API failures gracefully without blocking checkout
  - _Requirements: 3.5, 3A.5, 3B.3_



- [x] 11.4 Enhance coupon error handling
  - Display clear error messages for invalid coupon codes
  - Show expiry date when coupon is expired
  - Suggest alternative coupons when usage limit exceeded
  - _Requirements: 2.4, 2.5_


- [x] 11.5 Implement optimistic locking for concurrent order updates


  - Add version field to orders table
  - Check version before updating order status
  - Return conflict error if version mismatch
  - Display conflict message to admin with option to reload
  - _Requirements: 8.2_

- [x] 12. Optimize performance




- [x] 12.1 Verify database indexes are in place

  - Verify index on orders.user_id exists
  - Verify index on orders.status exists
  - Verify index on orders.created_at exists
  - Verify index on orders.order_number exists
  - Verify composite index on (user_id, created_at) exists
  - Add any missing indexes via migration
  - _Requirements: 4.1, 6.1, 6.5_


- [x] 12.2 Implement additional caching strategies

  - Implement active coupons caching (1 minute TTL)
  - Implement pincode to coordinates mapping cache
  - Add SWR for client-side order list caching
  - Add cache invalidation on settings updates
  - _Requirements: 3.1, 2.2, 3A.3_


- [x] 12.3 Implement code splitting for large components

  - Lazy load map library in checkout
  - Lazy load chart libraries in admin reports
  - Lazy load PDF generation library
  - _Requirements: 1.1, 6.1, 3B.1_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Run all unit tests and verify they pass
  - Run all property-based tests and verify they pass
  - Fix any failing tests
  - Ask the user if questions arise

- [ ] 14. Final integration and testing
- [ ] 14.1 Test complete checkout flow end-to-end
  - Test with Razorpay in test mode
  - Test coupon application
  - Test delivery charge calculation
  - Test GPS address auto-fill
  - Test order creation and confirmation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 3A.1_

- [ ] 14.2 Test admin order management flow
  - Test order list filtering and search
  - Test order detail display
  - Test status updates
  - Test tracking information entry
  - Test notifications sent to customers
  - _Requirements: 6.1, 6.5, 7.1, 8.1, 8.2, 8.4, 9.2_

- [ ] 14.3 Test customer order tracking
  - Test order history display
  - Test order detail page
  - Test order status tracking
  - Test order cancellation
  - _Requirements: 4.1, 4.3, 5.1, 5.2, 11.1, 11.3_

- [ ] 14.4 Verify accessibility
  - Test keyboard navigation throughout checkout
  - Test screen reader support
  - Verify ARIA labels on all interactive elements
  - Test color contrast compliance
  - _Requirements: All UI requirements_

- [ ] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise
