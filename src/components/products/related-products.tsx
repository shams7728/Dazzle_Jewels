"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "./product-card";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface RelatedProductsProps {
  currentProductId: string;
  categoryId?: string;
  limit?: number;
}

export function RelatedProducts({
  currentProductId,
  categoryId,
  limit = 8,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768;
    setIsMobile(checkMobile());

    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Preload product data on hover with debounce
  const handleProductHover = (productId: string) => {
    // Prefetch the product page route
    router.prefetch(`/products/${productId}`);

    // Preload product images
    const product = products.find(p => p.id === productId);
    if (product?.variants?.[0]?.images?.[0]) {
      const img = new window.Image();
      img.src = product.variants[0].images[0];
    }
  };

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from("products")
          .select(`
            *,
            category:categories(*),
            variants:product_variants(*)
          `)
          .neq("id", currentProductId)
          .limit(limit);

        // Try to fetch products from the same category first
        if (categoryId) {
          query = query.eq("category_id", categoryId);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        // If no related products found in the same category, fetch popular/featured products
        if (!data || data.length === 0) {
          setIsFallback(true);
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("products")
            .select(`
              *,
              category:categories(*),
              variants:product_variants(*)
            `)
            .neq("id", currentProductId)
            .or("is_featured.eq.true,is_best_seller.eq.true")
            .limit(limit);

          if (fallbackError) throw fallbackError;
          setProducts(fallbackData || []);
        } else {
          setIsFallback(false);
          setProducts(data);
        }
      } catch (err) {
        console.error("Error fetching related products:", err);
        setError("Failed to load related products");
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, categoryId, limit]);

  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("related-products-scroll");
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.8;
    const newPosition =
      direction === "left"
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(
          container.scrollWidth - container.offsetWidth,
          scrollPosition + scrollAmount
        );

    container.scrollTo({ left: newPosition, behavior: "smooth" });
    setScrollPosition(newPosition);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const showNavigation = isMobile && products.length > 2;

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            {isFallback ? "You May Also Like" : categoryId ? "Related Products" : "You May Also Like"}
          </h2>
          <p className="mt-1 text-sm md:text-base text-muted-foreground">
            {isFallback
              ? "Featured products you might love"
              : "Discover similar items you might love"}
          </p>
        </div>

        {/* Desktop Navigation */}
        {!isMobile && products.length > 4 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleScroll("left")}
              disabled={scrollPosition === 0}
              className="rounded-full border-input bg-background hover:bg-muted touch-manipulation"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleScroll("right")}
              className="rounded-full border-input bg-background hover:bg-muted touch-manipulation"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Products Grid/Carousel */}
      <div className="relative">
        {/* Mobile: Horizontal Carousel */}
        {isMobile ? (
          <div className="relative">
            <div
              id="related-products-scroll"
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
            >
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="w-[160px] sm:w-[200px] flex-shrink-0 snap-start"
                  onMouseEnter={() => handleProductHover(product.id)}
                >
                  <ProductCard product={product} index={index} />
                </div>
              ))}
            </div>

            {/* Mobile Navigation Arrows */}
            {showNavigation && (
              <>
                <button
                  onClick={() => handleScroll("left")}
                  disabled={scrollPosition === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3 text-white backdrop-blur-sm transition-opacity hover:bg-black/90 disabled:opacity-30 min-h-[44px] min-w-[44px] touch-manipulation z-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleScroll("right")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3 text-white backdrop-blur-sm transition-opacity hover:bg-black/90 min-h-[44px] min-w-[44px] touch-manipulation z-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        ) : (
          /* Desktop: Grid Layout */
          <div
            id="related-products-scroll"
            className="grid grid-cols-2 gap-6 overflow-x-auto scrollbar-hide md:grid-cols-3 lg:grid-cols-4"
            onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
          >
            <AnimatePresence>
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => handleProductHover(product.id)}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
