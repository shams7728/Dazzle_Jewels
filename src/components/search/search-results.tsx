"use client";

import { useMemo } from 'react';
import { useSearchStore } from '@/lib/store/search';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { ProductCard } from '@/components/products/product-card';

export function SearchResults() {
  const { 
    query, 
    isLoading, 
    getFilteredProducts, 
    getActiveFilterCount,
    clearAllFilters,
    products
  } = useSearchStore();

  // Memoize filtered products based on dependencies
  const filteredProducts = useMemo(() => {
    return getFilteredProducts();
  }, [getFilteredProducts]);

  // Memoize result count
  const resultCount = useMemo(() => {
    return filteredProducts.length;
  }, [filteredProducts.length]);

  // Memoize active filter count
  const activeFilterCount = useMemo(() => {
    return getActiveFilterCount();
  }, [getActiveFilterCount]);

  // Get popular/featured products for empty state (memoized)
  const popularProducts = useMemo(() => {
    return products
      .filter(p => p.is_featured || p.averageRating >= 4)
      .slice(0, 8);
  }, [products]);

  // Loading State
  if (isLoading) {
    return <SearchResultsLoading />;
  }

  // Empty State - No Results with filters active
  if (resultCount === 0 && (query.length > 0 || activeFilterCount > 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
        <Package className="w-16 h-16 text-neutral-600" />
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white">No products found</h3>
          <p className="text-neutral-400 max-w-md">
            {query.length > 0 
              ? `We couldn't find any products matching &ldquo;${query}&rdquo;.`
              : "No products match your current filters."}
          </p>
          {activeFilterCount > 0 && (
            <p className="text-sm text-neutral-500">
              Try removing some filters to see more results.
            </p>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            onClick={clearAllFilters}
            variant="outline"
            className="bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700"
          >
            Clear All Filters
          </Button>
        )}
      </div>
    );
  }

  // Empty State - No Query, show popular products
  if (query.length === 0 && resultCount === 0 && popularProducts.length > 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold text-white mb-2">Popular Products</h3>
          <p className="text-neutral-400">
            Start typing to search, or browse our featured collection below
          </p>
        </div>
        
        {/* Popular Products Responsive Grid */}
        <div className="grid grid-cols-2 gap-3 xs:gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {popularProducts.map((product, index) => (
            <div 
              key={product.id}
              style={{ 
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              <ProductCard
                product={product}
                index={index}
                featured={product.is_featured}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback empty state
  if (resultCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
        <Package className="w-16 h-16 text-neutral-600" />
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Start searching</h3>
          <p className="text-neutral-400 max-w-md">
            Type in the search box above to find jewelry, rings, necklaces, and more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Screen reader announcement for result count */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {resultCount} {resultCount === 1 ? 'product' : 'products'} found
        {query && ` matching ${query}`}
        {activeFilterCount > 0 && ` with ${activeFilterCount} ${activeFilterCount === 1 ? 'filter' : 'filters'} applied`}
      </div>

      {/* Result Count - Enhanced with real-time updates */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-white" aria-hidden="true">
            {resultCount} {resultCount === 1 ? 'Product' : 'Products'}
          </p>
          {query && (
            <p className="text-xs text-neutral-500">
              matching &ldquo;{query}&rdquo;
            </p>
          )}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-neutral-500">•</span>
              <span className="text-xs text-yellow-500">
                {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
              </span>
            </div>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            onClick={clearAllFilters}
            variant="ghost"
            size="sm"
            className="text-xs text-neutral-400 hover:text-white h-7"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Responsive Product Grid */}
      <div 
        className="grid grid-cols-2 gap-3 xs:gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
        role="list"
        aria-label="Search results"
      >
        {filteredProducts.map((product, index) => (
          <div 
            key={product.id}
            style={{ 
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
            }}
          >
            <ProductCard
              product={product}
              index={index}
              featured={product.is_featured}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading Skeleton Component
function ProductCardSkeleton() {
  return (
    <div className="group relative rounded-xl p-[2px] overflow-hidden bg-neutral-800">
      <div className="relative h-full bg-neutral-900 rounded-xl overflow-hidden flex flex-col">
        {/* Image Skeleton */}
        <div className="relative aspect-square overflow-hidden bg-neutral-800 animate-pulse" />
        
        {/* Content Skeleton */}
        <div className="p-3 flex flex-col flex-grow space-y-2">
          {/* Title Skeleton */}
          <div className="h-4 bg-neutral-800 rounded animate-pulse w-3/4" />
          
          {/* Description Skeleton */}
          <div className="space-y-1">
            <div className="h-3 bg-neutral-800 rounded animate-pulse w-full" />
            <div className="h-3 bg-neutral-800 rounded animate-pulse w-2/3" />
          </div>
          
          {/* Price and Button Skeleton */}
          <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
            <div className="h-5 bg-neutral-800 rounded animate-pulse w-20" />
            <div className="h-8 sm:h-9 bg-neutral-800 rounded animate-pulse w-full sm:w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading State with Skeletons
export function SearchResultsLoading() {
  return (
    <div className="space-y-4">
      {/* Result Count Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 bg-neutral-800 rounded animate-pulse w-32" />
      </div>

      {/* Product Grid with Skeletons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}