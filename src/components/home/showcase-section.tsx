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

      // Fetch products with optimized query
      // The WHERE clause uses indexed columns for fast filtering
      const { data, error: productsError } = await supabase
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
        .limit(limit);

      if (productsError) throw productsError;

      setProducts((data || []) as Product[]);
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
      <section className="relative overflow-hidden bg-background py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-7 md:mb-8 text-center">
            {/* Skeleton Badge */}
            <div className="mb-3 inline-flex h-7 w-24 animate-pulse rounded-full bg-muted" />
            {/* Skeleton Title */}
            <div className="mx-auto mb-2 h-8 w-48 animate-pulse rounded bg-muted" />
            {/* Skeleton Subtitle */}
            <div className="mx-auto h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
          </div>

          {/* Skeleton Horizontal Scroll */}
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="flex gap-3 overflow-x-auto px-4 pb-4 sm:gap-4 sm:px-6 lg:gap-5 lg:px-8 xl:gap-6 scrollbar-hide snap-x snap-mandatory">
              {Array.from({ length: limit }).map((_, i) => (
                <div
                  key={i}
                  className="flex-none w-[160px] xs:w-[180px] sm:w-[220px] md:w-[260px] lg:w-[280px] xl:w-[300px] overflow-hidden rounded-xl border border-border bg-card snap-start"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {/* Skeleton Image */}
                  <div className="aspect-square animate-pulse bg-muted" />
                  {/* Skeleton Content */}
                  <div className="p-2 sm:p-3 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
                    <div className="mt-3 flex items-center justify-between">
                      <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                      <div className="h-7 w-16 animate-pulse rounded-full bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
  // Show "View All" button if showViewAll is true and there are products
  const shouldShowViewAll = showViewAll && products.length > 0;



  return (
    <section className="relative overflow-hidden bg-background py-8 sm:py-10 md:py-12 lg:py-16">
      {/* Animated Pink Shimmer Background - Enhanced for Mobile */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent sm:from-primary/5" />

      {/* Animated Pink Particles - More visible on mobile */}
      <div className="absolute inset-0">
        <div className="absolute left-[10%] top-[20%] h-24 w-24 sm:h-32 sm:w-32 animate-pulse rounded-full bg-primary/20 sm:bg-primary/10 blur-2xl sm:blur-3xl" />
        <div className="absolute right-[15%] top-[40%] h-28 w-28 sm:h-40 sm:w-40 animate-pulse rounded-full bg-pink-400/20 sm:bg-pink-400/10 blur-2xl sm:blur-3xl animation-delay-1000" />
        <div className="absolute left-[20%] bottom-[30%] h-26 w-26 sm:h-36 sm:w-36 animate-pulse rounded-full bg-pink-600/20 sm:bg-pink-600/10 blur-2xl sm:blur-3xl animation-delay-2000" />
        <div className="absolute right-[25%] bottom-[20%] h-24 w-24 sm:h-32 sm:w-32 animate-pulse rounded-full bg-primary/20 sm:bg-primary/10 blur-2xl sm:blur-3xl animation-delay-3000" />
      </div>

      {/* Diagonal Shine Effect - More visible on mobile */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/10 to-transparent opacity-70 sm:via-primary/5 sm:opacity-50" />

      {/* Animated Sparkle Lines - More visible on mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-1/4 h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent sm:via-primary/30 animate-shimmer" />
        <div className="absolute left-0 top-2/4 h-px w-full bg-gradient-to-r from-transparent via-pink-400/40 to-transparent sm:via-pink-400/20 animate-shimmer animation-delay-1000" />
        <div className="absolute left-0 top-3/4 h-px w-full bg-gradient-to-r from-transparent via-pink-600/40 to-transparent sm:via-pink-600/20 animate-shimmer animation-delay-2000" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-6 sm:mb-7 md:mb-8 text-center">
            {/* Accent Badge */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-gradient-to-r from-primary/10 to-pink-600/10 px-3 py-1.5 backdrop-blur-sm shadow-lg shadow-primary/20">
              <BadgeIcon className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent">
                {config.badgeText}
              </span>
            </div>

            {/* Gradient Title */}
            <h2 className="mb-2 bg-gradient-to-r from-pink-300 via-primary to-pink-300 bg-clip-text text-2xl font-bold text-transparent md:text-3xl drop-shadow-sm">
              {config.title}
            </h2>

            <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
              {config.subtitle}
            </p>
          </div>
        </ScrollReveal>

        {/* Horizontal Scrolling Container with Smooth Animations */}
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
          {/* Gradient Fade Edges */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-background to-transparent sm:w-12 lg:w-16" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-background to-transparent sm:w-12 lg:w-16" />

          {/* Scrollable Product Container */}
          <div className="flex gap-3 overflow-x-auto px-4 pb-4 sm:gap-4 sm:px-6 lg:gap-5 lg:px-8 xl:gap-6 scrollbar-hide snap-x snap-mandatory scroll-smooth">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex-none w-[160px] xs:w-[180px] sm:w-[220px] md:w-[260px] lg:w-[280px] xl:w-[300px] snap-start transform transition-all duration-300 hover:scale-105"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <ProductCard
                  product={product}
                  index={index}
                  priority={priority && index < 4}
                />
              </div>
            ))}
          </div>
        </div>

        {/* View All Link with Gold Theme */}
        {shouldShowViewAll && (
          <div className="mt-6 sm:mt-7 md:mt-8 text-center">
            <Link
              href={`/products?${config.filterKey}=true`}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-pink-600 px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/50 hover:from-primary/90 hover:to-pink-600/90"
            >
              View All {config.title}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </section>
  );
}
