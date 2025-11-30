# Order Management System Tests

This directory contains property-based tests for the order management system.

## Prerequisites

Before running these tests, you must apply the database schema to your Supabase instance:

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the `order_management_schema.sql` file from the project root

The schema creates:
- `orders` table
- `order_items` table
- `coupons` table
- `delivery_settings` table
- `notification_log` table
- `generate_order_number()` function
- Row-level security policies
- Performance indexes

## Running the Tests

Once the schema is applied, you can run the tests:

```bash
# Run all order service tests
npm test -- src/lib/services/__tests__/order-service

# Run specific test file
npm test -- src/lib/services/__tests__/order-service.list-sorting.test.ts

# Run tests in watch mode
npm run test:watch -- src/lib/services/__tests__/
```

## Test Files

### Property-Based Tests (PBT)

These tests use `fast-check` to verify properties hold across many randomly generated inputs:

- **order-service.list-sorting.test.ts** - Property 11: Order list sorting and completeness
  - Validates: Requirements 4.1, 4.2
  - Verifies orders are sorted by date (newest first)
  - Ensures all required fields are present

- **order-service.detail-completeness.test.ts** - Property 12: Order detail completeness
  - Validates: Requirements 4.3, 7.1, 7.2, 7.3, 7.4
  - Verifies all order information is displayed
  - Checks items, pricing, shipping, payment, and status history

- **order-service.tracking-display.test.ts** - Property 13: Order status tracking display
  - Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
  - Verifies status display with timestamps
  - Checks tracking information when shipped

- **order-service.cancellation-eligibility.test.ts** - Property 21: Order cancellation eligibility
  - Validates: Requirements 11.1, 11.4
  - Verifies only pending/confirmed orders can be cancelled
  - Checks cancel button visibility logic

- **order-service.cancellation-processing.test.ts** - Property 22: Cancellation processing
  - Validates: Requirements 11.3, 11.5
  - Verifies status updates to cancelled
  - Checks refund initiation for completed payments

### Unit Tests

Unit tests for specific service functionality are located in the same directory with similar naming patterns.

## Troubleshooting

### "Could not find the table 'public.orders' in the schema cache"

This error means the database schema hasn't been applied. Follow the prerequisites section above.

### "Failed to generate order number"

The `generate_order_number()` function hasn't been created. Apply the full schema.

### Tests timing out

Property-based tests run 100 iterations by default and may take time. The tests have 60-120 second timeouts configured.

### RLS Policy Errors

If you see "permission denied" errors, ensure:
1. RLS policies are created (included in schema)
2. Your test user has appropriate permissions
3. The `profiles` table exists with a `role` column

## Test Configuration

Tests are configured in:
- `vitest.config.ts` - Test runner configuration
- `vitest.setup.ts` - Global test setup
- `.env.local` - Supabase credentials (required)

Make sure your `.env.local` contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
