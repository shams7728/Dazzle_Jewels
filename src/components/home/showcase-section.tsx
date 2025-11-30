"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Product, ShowcaseConfig } from "@/types";
import { ArrowRight, Sparkles, TrendingUp, Tag, LucideIcon } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ProductCard } from "@/components/products/product-card";

// Icon mapping for resolving icon names to components
const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  TrendingUp,
  Tag,
};

interface ShowcaseSectionProps {
  config: ShowcaseConfig;
  limit?: number;
  showViewAll?: boolean;
  priority?: boolean; // For above-the-fold images
}

export function ShowcaseSection({
  config,
  limit = 8,
  showViewAll = true,
  priority = false,
}: ShowcaseSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  /**
   * Optimized product fetching with performance enhancements:
   * - Parallel queries for products and count
   * - Indexed column filtering (is_new_arrival, is_best_seller, is_offer_item)
   * - Limited field selection to reduce payload size
   * - Inner join on variants for better query performance
   */
  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch products and count in parallel for better performance
      // Optimized query: only fetch necessary fields, use indexes
      const [productsResponse, countResponse] = await Promise.all([
        // Fetch limited products with only necessary fields
        // The WHERE clause uses indexed columns for fast filtering
        supabase
          .from("products")
          .select(`
            id,
            title,
            description,
            base_price,
            discount_price,
            is_featured,
            is_new_arrival,
            is_best_seller,
            is_offer_item,
            created_at,
            variants:product_variants!inner(
              id,
              product_id,
              images,
              price_adjustment,
              stock_quantity,
              created_at
            )
          `)
          .eq(config.filterKey, true)
          .order('created_at', { ascending: false })
          .limit(limit),
        
        // Get total count separately using indexed column
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq(config.filterKey, true)
      ]);

      if (productsResponse.error) throw productsResponse.error;
      if (countResponse.error) throw countResponse.error;

      setProducts((productsResponse.data || []) as Product[]);
      setTotalCount(countResponse.count || 0);
    } catch (error) {
      console.error(`Error fetching ${config.filterKey} products:`, error);
      setError('Unable to load products. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [config.filterKey, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Loading state with skeleton loaders
  if (loading) {
    return (
      <section className="relative overflow-hidden bg-black py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-7 md:mb-8 text-center">
            {/* Skeleton Badge */}
            <div className="mb-3 inline-flex h-7 w-24 animate-pulse rounded-full bg-neutral-800" />
            {/* Skeleton Title */}
            <div className="mx-auto mb-2 h-8 w-48 animate-pulse rounded bg-neutral-800" />
            {/* Skeleton Subtitle */}
            <div className="mx-auto h-4 w-96 max-w-full animate-pulse rounded bg-neutral-800" />
          </div>
          
          {/* Skeleton Grid - Optimized Responsive Breakpoints */}
          {/* Mobile: 2 cols, Tablet: 3 cols, Desktop: 4 cols, Large: 4 cols */}
          <div className="grid grid-cols-2 gap-3 xs:gap-3.5 sm:grid-cols-3 sm:gap-4 md:gap-4.5 lg:grid-cols-4 lg:gap-5 xl:gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Skeleton Image */}
                <div className="aspect-square animate-pulse bg-neutral-800" />
                {/* Skeleton Content */}
                <div className="p-2 sm:p-3 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-800" />
                  <div className="h-3 w-full animate-pulse rounded bg-neutral-800" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-800" />
                  <div className="mt-3 flex items-center justify-between">
                    <div className="h-5 w-20 animate-pulse rounded bg-neutral-800" />
                    <div className="h-7 w-16 animate-pulse rounded-full bg-neutral-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-4 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Hide section if no products
  if (products.length === 0) {
    return null;
  }

  const BadgeIcon = typeof config.badgeIcon === 'string' 
    ? iconMap[config.badgeIcon] || Sparkles 
    : config.badgeIcon;
  const shouldShowViewAll = showViewAll && totalCount > limit;



  return (
    <section className="relative overflow-hidden bg-black py-8 sm:py-10 md:py-12 lg:py-16">
      {/* Animated Gold Shimmer Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent" />
      
      {/* Animated Gold Particles */}
      <div className="absolute inset-0">
        <div className="absolute left-[10%] top-[20%] h-32 w-32 animate-pulse rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute right-[15%] top-[40%] h-40 w-40 animate-pulse rounded-full bg-yellow-400/10 blur-3xl animation-delay-1000" />
        <div className="absolute left-[20%] bottom-[30%] h-36 w-36 animate-pulse rounded-full bg-yellow-600/10 blur-3xl animation-delay-2000" />
        <div className="absolute right-[25%] bottom-[20%] h-32 w-32 animate-pulse rounded-full bg-yellow-500/10 blur-3xl animation-delay-3000" />
      </div>

      {/* Diagonal Gold Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-yellow-500/5 to-transparent opacity-50" />
      
      {/* Animated Sparkle Lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-1/4 h-px w-full bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent animate-shimmer" />
        <div className="absolute left-0 top-2/4 h-px w-full bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-shimmer animation-delay-1000" />
        <div className="absolute left-0 top-3/4 h-px w-full bg-gradient-to-r from-transparent via-yellow-600/20 to-transparent animate-shimmer animation-delay-2000" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-6 sm:mb-7 md:mb-8 text-center">
            {/* Gold Accent Badge */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 px-3 py-1.5 backdrop-blur-sm shadow-lg shadow-yellow-500/20">
              <BadgeIcon className="h-3.5 w-3.5 text-yellow-500" />
              <span className="text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                {config.badgeText}
              </span>
            </div>
            
            {/* Gold Gradient Title */}
            <h2 className="mb-2 bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 bg-clip-text text-2xl font-bold text-transparent md:text-3xl drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              {config.title}
            </h2>
            
            <p className="mx-auto max-w-2xl text-sm text-neutral-300">
              {config.subtitle}
            </p>
          </div>
        </ScrollReveal>

        {/* Responsive Grid with Optimized Breakpoints and Spacing */}
        {/* Mobile (< 640px): 2 columns, gap-3 (12px) */}
        {/* Tablet (640px - 1024px): 3 columns, gap-4 (16px) */}
        {/* Desktop (> 1024px): 4 columns, gap-5 (20px) */}
        {/* Large Desktop (> 1280px): 4 columns, gap-6 (24px) */}
        <div className="grid grid-cols-2 gap-3 xs:gap-3.5 sm:grid-cols-3 sm:gap-4 md:gap-4.5 lg:grid-cols-4 lg:gap-5 xl:gap-6">
          {products.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              index={index}
              priority={priority && index < 4}
            />
          ))}
        </div>

        {/* View All Link with Gold Theme */}
        {shouldShowViewAll && (
          <div className="mt-6 sm:mt-7 md:mt-8 text-center">
            <Link
              href={`/products?${config.filterKey}=true`}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-yellow-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/50 hover:from-yellow-400 hover:to-yellow-500"
            >
              View All {config.title}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Gold Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
    </section>
  );
}
