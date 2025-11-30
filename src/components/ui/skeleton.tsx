import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-800/50",
        className
      )}
      {...props}
    />
  );
}

// Product Gallery Skeleton
export function ProductGallerySkeleton() {
  return (
    <div className="space-y-4">
      {/* Main Image Skeleton */}
      <Skeleton className="aspect-square w-full rounded-2xl" />
      
      {/* Thumbnails Skeleton */}
      <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// Product Info Skeleton
export function ProductInfoSkeleton() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <Skeleton className="h-10 w-3/4" />
      
      {/* Price */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>
      
      {/* Stock Status */}
      <Skeleton className="h-5 w-24" />
      
      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      {/* Variants */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-24 rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-3">
        <Skeleton className="h-12 flex-1 rounded-lg" />
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </div>
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
    </div>
  );
}

// Related Products Skeleton
export function RelatedProductsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(count)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Reviews Section Skeleton
export function ReviewsSectionSkeleton() {
  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex items-center gap-6">
        <Skeleton className="h-16 w-16" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3 border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
