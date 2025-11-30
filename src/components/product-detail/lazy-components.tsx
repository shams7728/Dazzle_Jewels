'use client';

import dynamic from 'next/dynamic';
import { 
  ProductGallerySkeleton, 
  ProductInfoSkeleton, 
  RelatedProductsSkeleton,
  ReviewsSectionSkeleton 
} from '@/components/ui/skeleton';

// Lazy load heavy components with loading skeletons
export const LazyProductGallery = dynamic(
  () => import('./product-gallery').then(mod => ({ default: mod.ProductGallery })),
  {
    loading: () => <ProductGallerySkeleton />,
    ssr: true, // Enable SSR for SEO
  }
);

export const LazyProductTabs = dynamic(
  () => import('./product-tabs').then(mod => ({ default: mod.ProductTabs })),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="flex gap-4 border-b border-neutral-800">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 w-32 animate-pulse bg-neutral-800/50 rounded-t-lg" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 animate-pulse bg-neutral-800/50 rounded" />
          ))}
        </div>
      </div>
    ),
    ssr: false, // Tabs don't need SSR
  }
);

export const LazyRelatedProducts = dynamic(
  () => import('@/components/products/related-products').then(mod => ({ default: mod.RelatedProducts })),
  {
    loading: () => <RelatedProductsSkeleton count={4} />,
    ssr: false, // Related products can be loaded client-side
  }
);

export const LazyReviewsSection = dynamic(
  () => import('@/components/reviews').then(mod => ({ default: mod.ReviewsSection })),
  {
    loading: () => <ReviewsSectionSkeleton />,
    ssr: false, // Reviews can be loaded client-side
  }
);

export const LazyShareButtons = dynamic(
  () => import('./share-buttons').then(mod => ({ default: mod.ShareButtons })),
  {
    loading: () => (
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-10 animate-pulse bg-neutral-800/50 rounded-full" />
        ))}
      </div>
    ),
    ssr: false,
  }
);

// Lazy load 3D viewer (heavy component)
export const Lazy3DViewer = dynamic(
  () => import('@/components/3d/product-viewer').then(mod => ({ default: mod.ProductViewer })),
  {
    loading: () => (
      <div className="aspect-square w-full rounded-lg bg-neutral-900 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-neutral-700 border-t-yellow-500" />
          <p className="text-sm text-neutral-500">Loading 3D viewer...</p>
        </div>
      </div>
    ),
    ssr: false, // 3D viewer should only load client-side
  }
);
