/**
 * Lazy-loaded cart components for performance optimization
 * These components are loaded on-demand to reduce initial bundle size
 */

import dynamic from 'next/dynamic';

// Lazy load CartPageItem with loading fallback
export const LazyCartPageItem = dynamic(
  () => import('./cart-page-item').then(mod => ({ default: mod.CartPageItem })),
  {
    loading: () => (
      <div className="animate-pulse bg-neutral-900/50 rounded-lg border border-neutral-800 p-6 h-48" />
    ),
    ssr: true,
  }
);

// Lazy load CartSummary with loading fallback
export const LazyCartSummary = dynamic(
  () => import('./cart-summary').then(mod => ({ default: mod.CartSummary })),
  {
    loading: () => (
      <div className="animate-pulse bg-neutral-900/50 rounded-lg border border-neutral-800 p-6 h-96" />
    ),
    ssr: true,
  }
);

// Lazy load EmptyCart with loading fallback
export const LazyEmptyCart = dynamic(
  () => import('./empty-cart').then(mod => ({ default: mod.EmptyCart })),
  {
    loading: () => (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse h-24 w-24 rounded-full bg-neutral-800" />
      </div>
    ),
    ssr: true,
  }
);
