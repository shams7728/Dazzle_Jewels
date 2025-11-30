# Error Handling & Loading States - Implementation Guide

## Overview

This document describes the comprehensive error handling and loading state implementation for the product detail page, covering all aspects from initial page load to component failures and network errors.

## Components Implemented

### 1. Error Boundary (`src/components/error-boundary.tsx`)

**Purpose**: Catches React component errors and prevents the entire app from crashing.

**Features**:
- Catches errors in child components
- Displays user-friendly error message
- Provides retry functionality
- Logs errors for debugging
- Supports custom fallback UI

**Usage**:
```tsx
<ErrorBoundary
  fallback={<CustomErrorUI />}
  onError={(error, errorInfo) => {
    // Log to error tracking service
  }}
>
  <YourComponent />
</ErrorBoundary>
```

**Implemented in**:
- Product tabs section
- Reviews section
- Related products section
- Share buttons section

### 2. Network Error Handler (`src/components/network-error.tsx`)

**Purpose**: Handles network-related errors with retry logic and user guidance.

**Features**:
- Automatic retry with exponential backoff
- Visual retry progress indicator
- Network-specific troubleshooting tips
- Compact variant for smaller sections
- Distinguishes between network and other errors

**Usage**:
```tsx
<NetworkError
  error={error}
  onRetry={async () => {
    await fetchData();
  }}
  title="Connection Error"
  message="Failed to load data"
/>
```

### 3. Optimized Image Component (`src/components/ui/optimized-image.tsx`)

**Purpose**: Enhanced image loading with fallback and retry logic.

**Features**:
- Automatic retry on load failure (up to 2 attempts)
- Fallback image support
- Loading skeleton
- Error state visualization
- Cache-busting for retries
- Callbacks for success/error events

**Usage**:
```tsx
<OptimizedImage
  src={imageUrl}
  alt="Product image"
  fallback="/placeholder.svg"
  retryOnError={true}
  maxRetries={2}
  onLoadError={(error) => console.error(error)}
/>
```

**Implemented in**:
- Main product image display

### 4. Product Not Found Page (`src/app/products/[id]/not-found.tsx`)

**Purpose**: Custom 404 page specifically for missing products.

**Features**:
- Clear messaging about missing product
- Navigation options (Browse Products, Back to Home)
- Helpful suggestions for users
- Branded design consistent with site

**Triggered when**:
- Product ID doesn't exist in database
- Database query returns null/error

### 5. Loading Skeleton (`src/app/products/[id]/loading.tsx`)

**Purpose**: Provides visual feedback during initial page load.

**Features**:
- Matches actual page layout
- Smooth skeleton animations
- Responsive design
- Covers all page sections

**Automatically shown**:
- During server-side data fetching
- During navigation to product page
- While Next.js loads the page

## Error Handling Flow

### Initial Page Load

```
User navigates to /products/[id]
         ↓
loading.tsx displays skeleton
         ↓
Server fetches product data
         ↓
   ┌─────┴─────┐
   ↓           ↓
Success     Error/Not Found
   ↓           ↓
Render      not-found.tsx
Product     displays
```

### Component-Level Errors

```
Component renders
       ↓
   Error occurs
       ↓
ErrorBoundary catches
       ↓
Display fallback UI
       ↓
User clicks "Try Again"
       ↓
Component re-renders
```

### Image Loading Errors

```
Image load starts
       ↓
   Load fails
       ↓
Retry attempt 1 (with cache-bust)
       ↓
   Still fails?
       ↓
Retry attempt 2
       ↓
   Still fails?
       ↓
Show fallback image
```

### Network Errors

```
API call initiated
       ↓
   Network error
       ↓
NetworkError component
       ↓
User clicks "Try Again"
       ↓
Retry with exponential backoff
  (1s → 2s → 4s delays)
       ↓
   ┌─────┴─────┐
   ↓           ↓
Success     Max retries
   ↓        exceeded
Render         ↓
Data      Show error
```

## Toast Notifications

Toast notifications are used for user action feedback:

**Success cases**:
- Product added to cart
- Item added to wishlist
- Review submitted

**Error cases**:
- Failed to add to cart
- Network request failures
- Form submission errors

**Implementation**:
```tsx
import { toast } from "sonner";

// Success
toast.success("Added to cart", {
  description: "Product has been added to your cart"
});

// Error
toast.error("Failed to add to cart", {
  description: "Please try again"
});
```

## Retry Logic

### Exponential Backoff Configuration

Located in `src/lib/utils/retry.ts`:

```typescript
{
  maxRetries: 3,
  initialDelay: 1000,      // 1 second
  maxDelay: 10000,         // 10 seconds
  backoffMultiplier: 2     // Double each time
}
```

**Retry sequence**: 1s → 2s → 4s → fail

### When Retries Are Used

1. **Image Loading**: 2 automatic retries with cache-busting
2. **Network Requests**: 3 retries with exponential backoff
3. **Component Errors**: Manual retry via "Try Again" button

## Error Logging

### Development
- Errors logged to browser console
- Full error stack traces available
- Component error info included

### Production
- Errors should be sent to error tracking service (e.g., Sentry)
- User-friendly messages displayed
- Sensitive information filtered

**Implementation point** (in ErrorBoundary):
```typescript
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  // Add your error tracking service here
  // Example: Sentry.captureException(error, { extra: errorInfo });
}
```

## Testing Error States

### Simulate Component Error
```tsx
// Add to any component to test error boundary
if (Math.random() > 0.5) {
  throw new Error("Test error");
}
```

### Simulate Network Error
```tsx
// In your fetch/API call
throw new Error("Network request failed");
```

### Simulate Image Load Error
```tsx
<OptimizedImage
  src="https://invalid-url.com/image.jpg"
  fallback="/placeholder.svg"
/>
```

### Test Loading State
- Use Chrome DevTools Network throttling
- Set to "Slow 3G" or "Offline"
- Navigate to product page

## Best Practices

### 1. Always Wrap Async Operations
```tsx
try {
  await someAsyncOperation();
  toast.success("Success!");
} catch (error) {
  console.error(error);
  toast.error("Operation failed");
}
```

### 2. Provide Fallback UI
```tsx
<ErrorBoundary fallback={<CustomFallback />}>
  <Component />
</ErrorBoundary>
```

### 3. Use Appropriate Error Messages
- Be specific about what failed
- Provide actionable next steps
- Avoid technical jargon for users

### 4. Log Errors Appropriately
- Development: Detailed logs
- Production: Send to monitoring service
- Never expose sensitive data

### 5. Test Error States
- Test with network throttling
- Test with invalid data
- Test component failures
- Test image load failures

## Accessibility

All error states include:
- Proper ARIA labels (`role="alert"`)
- Keyboard navigation support
- Screen reader friendly messages
- Sufficient color contrast
- Focus management

## Performance Considerations

- Error boundaries don't impact normal render performance
- Retry logic uses exponential backoff to avoid overwhelming servers
- Loading skeletons prevent layout shift
- Images lazy load with proper fallbacks

## Future Enhancements

Potential improvements:
1. Integrate with error tracking service (Sentry, LogRocket)
2. Add offline detection and messaging
3. Implement service worker for offline support
4. Add error recovery suggestions based on error type
5. Collect anonymous error statistics
6. A/B test different error messages

## Related Files

- `src/components/error-boundary.tsx` - Error boundary component
- `src/components/network-error.tsx` - Network error handler
- `src/components/ui/optimized-image.tsx` - Image with fallback
- `src/app/products/[id]/not-found.tsx` - Product 404 page
- `src/app/products/[id]/loading.tsx` - Loading skeleton
- `src/lib/utils/retry.ts` - Retry utility with backoff
- `src/lib/utils/toast.ts` - Toast notification utility

## Support

For questions or issues with error handling:
1. Check browser console for detailed errors
2. Review error logs in monitoring service
3. Test with different network conditions
4. Verify error boundaries are properly placed
