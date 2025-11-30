import { ProductGallerySkeleton, ProductInfoSkeleton, RelatedProductsSkeleton, ReviewsSectionSkeleton } from "@/components/ui/skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for product detail page
 * Shown during initial page load and navigation
 */
export default function ProductLoading() {
    return (
        <div className="container mx-auto px-4 py-6 md:py-8">
            {/* Mobile Back Button Skeleton */}
            <div className="mb-4 md:hidden">
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            {/* Breadcrumb Skeleton - Hidden on mobile */}
            <div className="hidden md:block mb-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16" />
                    <span className="text-neutral-600">/</span>
                    <Skeleton className="h-5 w-24" />
                    <span className="text-neutral-600">/</span>
                    <Skeleton className="h-5 w-32" />
                </div>
            </div>

            {/* Back to Products Link Skeleton */}
            <div className="mb-6 hidden md:block">
                <Skeleton className="h-10 w-40 rounded-lg" />
            </div>

            <div className="grid gap-8 md:gap-12 lg:grid-cols-2 xl:gap-16">
                {/* Left: Image Gallery Skeleton */}
                <ProductGallerySkeleton />

                {/* Right: Product Info Skeleton */}
                <ProductInfoSkeleton />
            </div>

            {/* Product Details Tabs Skeleton */}
            <div className="mt-12 md:mt-16">
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="space-y-4">
                    <div className="flex gap-4 border-b border-neutral-800">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-32 rounded-t-lg" />
                        ))}
                    </div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-4 w-full" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews Section Skeleton */}
            <div className="mt-12 md:mt-16 border-t border-neutral-800 pt-8 md:pt-12">
                <Skeleton className="h-8 w-48 mb-6" />
                <ReviewsSectionSkeleton />
            </div>

            {/* Related Products Skeleton */}
            <div className="mt-12 md:mt-16 border-t border-neutral-800 pt-8 md:pt-12 mb-20 md:mb-0">
                <RelatedProductsSkeleton count={8} />
            </div>
        </div>
    );
}
