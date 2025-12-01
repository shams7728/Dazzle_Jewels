"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Eye, Sparkles, Star } from "lucide-react";
import { WishlistButton } from "@/components/products/wishlist-button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
  featured?: boolean;
  priority?: boolean; // For above-the-fold images
}

export function ProductCard({ product, index = 0, featured = false, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, isProductInCart } = useCartStore();
  const router = useRouter();

  // Detect mobile on mount - optimized to run only once
  useState(() => {
    const checkMobile = () => window.innerWidth < 768;
    setIsMobile(checkMobile());
  });

  const firstVariant = product.variants?.[0];
  const image = firstVariant?.images?.[0] || "/placeholder.svg";
  const secondImage = firstVariant?.images?.[1] || image;
  
  const basePrice = firstVariant
    ? product.base_price + firstVariant.price_adjustment
    : product.base_price;
  
  const discountPrice = product.discount_price
    ? firstVariant
      ? product.discount_price + firstVariant.price_adjustment
      : product.discount_price
    : null;

  const discountPercentage = discountPrice
    ? Math.round(((basePrice - discountPrice) / basePrice) * 100)
    : 0;

  const isInStock = firstVariant ? firstVariant.stock_quantity > 0 : false;

  const isInCart = isProductInCart(product.id, firstVariant?.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInCart) {
      // Navigate to cart if already in cart
      router.push('/cart');
      return;
    }
    
    if (!isInStock) {
      toast.error("Out of stock", {
        description: "This item is currently unavailable",
      });
      return;
    }
    
    setIsAdding(true);
    try {
      addItem(product, firstVariant);
      toast.success("Added to cart!", {
        description: product.title,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error("Failed to add to cart", {
        description: "Please try again",
      });
    } finally {
      setTimeout(() => setIsAdding(false), 300);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: isMobile ? 0.3 : 0.4, 
        delay: isMobile ? Math.min(index * 0.05, 0.4) : index * 0.1,
        ease: "easeOut"
      }}
      onHoverStart={() => !isMobile && setIsHovered(true)}
      onHoverEnd={() => !isMobile && setIsHovered(false)}
      className="group relative h-full"
    >
      {/* Animated Border Gradient - Visible on mobile too */}
      <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-yellow-500/0 via-yellow-500/30 to-yellow-500/0 sm:via-yellow-500/50 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100 group-active:opacity-100" />
      
      {/* Shimmer Effect - Visible on mobile too */}
      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent bg-[length:200%_100%] opacity-0 transition-opacity duration-500 group-hover:animate-shimmer group-hover:opacity-100 group-active:animate-shimmer group-active:opacity-100" />

      <div className="relative h-full overflow-hidden rounded-xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-black transition-all duration-300 group-hover:border-yellow-500/30 group-hover:shadow-xl group-hover:shadow-yellow-500/10">
        <Link href={`/products/${product.id}`} className="flex h-full flex-col">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-neutral-800">
            {/* Main Image - Optimized with lazy loading */}
            <motion.div
              animate={{ opacity: isHovered && !isMobile ? 0 : 1 }}
              transition={{ duration: isMobile ? 0 : 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={image}
                alt={product.title}
                fill
                priority={priority && index < 4}
                loading={priority && index < 4 ? undefined : "lazy"}
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                quality={85}
              />
            </motion.div>

            {/* Hover Image - Desktop Only, lazy loaded */}
            {!isMobile && (
              <motion.div
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src={secondImage}
                  alt={`${product.title} - alternate view`}
                  fill
                  loading="lazy"
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  quality={85}
                />
              </motion.div>
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Badges - Enhanced animations for mobile */}
            <div className="absolute left-1.5 top-1.5 z-10 flex flex-wrap gap-1 max-w-[calc(100%-3rem)]">
              {featured && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: isMobile ? Math.min(index * 0.05 + 0.2, 0.5) : 0.2, 
                    type: "spring", 
                    stiffness: isMobile ? 150 : 200,
                    damping: isMobile ? 12 : 10
                  }}
                  className="flex items-center gap-0.5 rounded bg-gradient-to-r from-yellow-500 to-yellow-600 px-1 py-0.5 shadow-lg shadow-yellow-500/30 sm:shadow-md sm:shadow-yellow-500/20"
                >
                  <Sparkles className="h-2 w-2 text-black" />
                  <span className="text-[8px] font-bold uppercase tracking-wide text-black">
                    Featured
                  </span>
                </motion.div>
              )}
              
              {discountPrice && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: isMobile ? Math.min(index * 0.05 + 0.3, 0.6) : 0.3, 
                    type: "spring", 
                    stiffness: isMobile ? 150 : 200,
                    damping: isMobile ? 12 : 10
                  }}
                  className="rounded bg-gradient-to-r from-red-500 to-pink-500 px-1 py-0.5 shadow-lg shadow-red-500/30 sm:shadow-md sm:shadow-red-500/20"
                >
                  <span className="text-[8px] font-bold uppercase tracking-wide text-white">
                    {discountPercentage}% OFF
                  </span>
                </motion.div>
              )}

              {!isInStock && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: isMobile ? Math.min(index * 0.05 + 0.4, 0.7) : 0.4, 
                    type: "spring", 
                    stiffness: isMobile ? 150 : 200,
                    damping: isMobile ? 12 : 10
                  }}
                  className="rounded bg-neutral-800/90 px-1 py-0.5 backdrop-blur-sm shadow-lg sm:shadow-md"
                >
                  <span className="text-[8px] font-bold uppercase tracking-wide text-neutral-400">
                    Out of Stock
                  </span>
                </motion.div>
              )}
            </div>

            {/* Wishlist Button - Enhanced animation for mobile */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ 
                delay: isMobile ? Math.min(index * 0.05 + 0.15, 0.4) : 0.2,
                type: "spring",
                stiffness: isMobile ? 150 : 200,
                damping: isMobile ? 12 : 10
              }}
              className="absolute right-2 top-2 z-10"
            >
              <WishlistButton product={product} />
            </motion.div>

            {/* Quick View Button - Desktop Only */}
            {!isMobile && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2"
              >
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-1.5 rounded-full bg-white/90 text-black backdrop-blur-sm hover:bg-white h-7 px-3"
                >
                  <Eye className="h-3 w-3" />
                  <span className="text-[10px] font-semibold">Quick View</span>
                </Button>
              </motion.div>
            )}

            {/* Shine Effect - Works on mobile tap too */}
            <motion.div
              animate={{
                x: (isHovered || (isMobile && index === 0)) ? ["0%", "200%"] : "0%",
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </div>

          {/* Content - Compact responsive spacing */}
          <div className="flex flex-1 flex-col p-2 sm:p-3">
            {/* Title */}
            <h3 className="mb-1 line-clamp-1 text-xs sm:text-sm font-semibold text-white transition-colors group-hover:text-yellow-500">
              {product.title}
            </h3>

            {/* Description - Hidden on mobile for compactness */}
            <p className="mb-1.5 line-clamp-1 text-[10px] sm:text-xs text-neutral-400 hidden sm:block">
              {product.description}
            </p>

            {/* Rating */}
            <div className="mb-1.5 flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-2 w-2 sm:h-2.5 sm:w-2.5",
                    i < 4 ? "fill-yellow-500 text-yellow-500" : "text-neutral-600"
                  )}
                />
              ))}
              <span className="ml-0.5 text-[9px] sm:text-[10px] text-neutral-500">(4.0)</span>
            </div>

            {/* Price and Add to Cart */}
            <div className="mt-auto flex items-end justify-between gap-1">
              <div className="flex flex-col">
                {discountPrice ? (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs sm:text-sm font-bold text-yellow-500">
                        ₹{discountPrice.toLocaleString()}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-neutral-500 line-through">
                        ₹{basePrice.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-medium text-green-500">
                      Save ₹{(basePrice - discountPrice).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-xs sm:text-sm font-bold text-yellow-500">
                    ₹{basePrice.toLocaleString()}
                  </span>
                )}
              </div>

              <motion.div
                whileHover={!isMobile ? { scale: 1.05 } : {}}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={!isInStock || isAdding}
                  className={cn(
                    "relative gap-1.5 rounded-lg transition-all duration-300 h-8 sm:h-9 px-3 sm:px-4 font-bold overflow-hidden group/btn",
                    !isInStock
                      ? "cursor-not-allowed bg-neutral-800 text-neutral-500 border border-neutral-700"
                      : isInCart
                      ? "bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-black hover:from-yellow-500 hover:via-yellow-400 hover:to-yellow-500 shadow-lg shadow-yellow-500/40 hover:shadow-xl hover:shadow-yellow-500/50 border border-yellow-400/50"
                      : "bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black hover:from-yellow-400 hover:via-yellow-300 hover:to-yellow-400 shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40 border border-yellow-400/30"
                  )}
                >
                  {/* Shine effect */}
                  {isInStock && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-700" />
                  )}
                  
                  <ShoppingBag className={cn(
                    "h-3.5 w-3.5 sm:h-4 sm:w-4 relative z-10 transition-transform duration-300",
                    isInCart && "group-hover/btn:rotate-12"
                  )} />
                  <span className="text-[10px] sm:text-xs font-bold relative z-10 tracking-wide">
                    {!isInStock ? "Sold Out" : isInCart ? "View Cart" : isAdding ? "Adding..." : "Add to Cart"}
                  </span>
                </Button>
              </motion.div>
            </div>
          </div>
        </Link>
      </div>

      {/* Floating Particles Effect - Always Visible */}
      <>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0], y: -50 }}
          transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
          className="pointer-events-none absolute left-1/4 top-1/4 h-1 w-1 rounded-full bg-yellow-500"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.5, 0], scale: [0, 1, 0], y: -50 }}
          transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 + 0.5 }}
          className="pointer-events-none absolute right-1/4 top-1/3 h-1 w-1 rounded-full bg-yellow-400"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.4, 0], scale: [0, 1, 0], y: -50 }}
          transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 + 1 }}
          className="pointer-events-none absolute left-1/3 top-1/2 h-1 w-1 rounded-full bg-yellow-300"
        />
      </>
    </motion.div>
  );
}
