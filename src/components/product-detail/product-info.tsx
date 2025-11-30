'use client';

import { useState } from 'react';
import { ProductInfoProps } from '@/types/product-detail';
import { Button } from '@/components/ui/button';
import { VariantSelector } from './variant-selector';
import { Heart, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  calculateEffectivePrice,
  calculateDiscountPercentage,
  formatPrice,
  hasDiscount,
  getStockStatus,
} from '@/lib/utils/product-detail';
import { useWishlistStore } from '@/lib/store/wishlist';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast';
import { usePrefersReducedMotion } from '@/lib/utils/animations';

export function ProductInfo({
  product,
  variants,
  selectedVariant,
  onVariantChange,
  onAddToWishlist,
}: ProductInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  
  // Get wishlist store actions
  const { toggleItem, isInWishlist: checkIsInWishlist } = useWishlistStore();
  
  // Check if product is in wishlist
  const isInWishlist = checkIsInWishlist(product.id);
  
  // Detect reduced motion preference
  const prefersReducedMotion = usePrefersReducedMotion();

  // Calculate current price
  const currentPrice = calculateEffectivePrice(product, selectedVariant);
  const originalPrice = product.base_price + (selectedVariant?.price_adjustment ?? 0);
  
  // Check if product has discount
  const showDiscount = hasDiscount(product);
  const discountPercentage = showDiscount
    ? calculateDiscountPercentage(product.base_price, product.discount_price!)
    : 0;

  // Get stock status
  const stockQuantity = selectedVariant?.stock_quantity ?? 0;
  const stockStatus = getStockStatus(stockQuantity);

  // Check if description is long (more than 200 characters)
  const isLongDescription = (product.description?.length ?? 0) > 200;
  const displayDescription = isLongDescription && !isExpanded
    ? product.description?.substring(0, 200) + '...'
    : product.description;

  // Handle wishlist toggle
  const handleWishlistClick = async () => {
    setIsTogglingWishlist(true);
    
    try {
      // Toggle in wishlist store
      toggleItem(product);
      
      // Show success feedback
      if (isInWishlist) {
        showSuccessToast('Removed from wishlist');
      } else {
        showSuccessToast('Added to wishlist!');
      }
      
      // Call parent callback if provided
      if (onAddToWishlist) {
        onAddToWishlist();
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showErrorToast('Failed to update wishlist. Please try again.');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white" data-testid="product-title">
          {product.title}
        </h1>
      </div>

      {/* Pricing */}
      <div 
        className={cn(
          "space-y-2",
          !prefersReducedMotion && "transition-all duration-300"
        )}
        style={{
          transitionDuration: prefersReducedMotion ? '0ms' : '300ms',
        }}
      >
        {showDiscount ? (
          <div className="flex items-center gap-4 flex-wrap">
            <p
              className={cn(
                "text-3xl md:text-4xl font-bold text-yellow-500",
                !prefersReducedMotion && "transition-all duration-300"
              )}
              style={{
                transitionDuration: prefersReducedMotion ? '0ms' : '300ms',
              }}
              data-testid="discounted-price"
            >
              {formatPrice(currentPrice)}
            </p>
            <p
              className={cn(
                "text-xl text-neutral-500 line-through",
                !prefersReducedMotion && "transition-all duration-300"
              )}
              style={{
                transitionDuration: prefersReducedMotion ? '0ms' : '300ms',
              }}
              data-testid="original-price"
            >
              {formatPrice(originalPrice)}
            </p>
            <span
              className={cn(
                "rounded-full bg-green-500/10 px-3 py-1 text-sm font-bold text-green-500",
                !prefersReducedMotion && "transition-all duration-300"
              )}
              style={{
                transitionDuration: prefersReducedMotion ? '0ms' : '300ms',
              }}
              data-testid="savings-percent"
            >
              {discountPercentage}% OFF
            </span>
          </div>
        ) : (
          <p 
            className={cn(
              "text-3xl md:text-4xl font-bold text-yellow-500",
              !prefersReducedMotion && "transition-all duration-300"
            )}
            style={{
              transitionDuration: prefersReducedMotion ? '0ms' : '300ms',
            }}
            data-testid="product-price"
          >
            {formatPrice(currentPrice)}
          </p>
        )}
      </div>

      {/* Stock Status */}
      <div 
        data-testid="stock-status" 
        className={cn(
          !prefersReducedMotion && "transition-all duration-300"
        )}
        style={{
          transitionDuration: prefersReducedMotion ? '0ms' : '300ms',
        }}
      >
        {stockStatus === 'in_stock' && (
          <p 
            className={cn(
              "text-green-500 text-sm font-medium",
              !prefersReducedMotion && "transition-all duration-300"
            )}
            style={{
              transitionDuration: prefersReducedMotion ? '0ms' : '300ms',
            }}
          >
            ✓ In Stock
          </p>
        )}
        {stockStatus === 'low_stock' && (
          <p 
            className={cn(
              "text-yellow-500 text-sm font-medium",
              !prefersReducedMotion && "transition-all duration-300"
            )}
            style={{
              transitionDuration: prefersReducedMotion ? '0ms' : '300ms',
            }}
          >
            ⚠ Only {stockQuantity} left in stock
          </p>
        )}
        {stockStatus === 'out_of_stock' && (
          <p 
            className={cn(
              "text-red-500 text-sm font-medium",
              !prefersReducedMotion && "transition-all duration-300"
            )}
            style={{
              transitionDuration: prefersReducedMotion ? '0ms' : '300ms',
            }}
          >
            ✗ Out of Stock
          </p>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div className="space-y-2">
          <p className="text-neutral-300 leading-relaxed" data-testid="product-description">
            {displayDescription}
          </p>
          {isLongDescription && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "text-yellow-500 hover:text-yellow-400 text-sm font-medium",
                !prefersReducedMotion && "transition-colors duration-200"
              )}
              style={{
                transitionDuration: prefersReducedMotion ? '0ms' : '200ms',
              }}
              data-testid="read-more-button"
            >
              {isExpanded ? 'Read Less' : 'Read More'}
            </button>
          )}
        </div>
      )}

      {/* Features List */}
      {'features' in product && Array.isArray(product.features) && product.features.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-400">Key Features</h3>
          <ul className="space-y-2" data-testid="features-list">
            {product.features.map((feature: string, index: number) => (
              <li
                key={index}
                className="flex items-start gap-3 text-neutral-300"
                data-testid={`feature-item-${index}`}
              >
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Variant Selection */}
      {variants && variants.length > 0 && (
        <div className="space-y-4" data-testid="variant-selector">
          {/* Color Variants */}
          {variants.some((v) => v.color) && (
            <VariantSelector
              variants={variants}
              selectedVariant={selectedVariant}
              onSelect={onVariantChange}
              type="color"
            />
          )}

          {/* Material Variants */}
          {variants.some((v) => v.material) && (
            <VariantSelector
              variants={variants}
              selectedVariant={selectedVariant}
              onSelect={onVariantChange}
              type="material"
            />
          )}
        </div>
      )}

      {/* Wishlist Button */}
      <div className="flex" data-testid="wishlist-section">
        <Button
          size="lg"
          variant="outline"
          className={cn(
            'w-full sm:w-auto border-neutral-800 hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation',
            !prefersReducedMotion && 'transition-all duration-200',
            isInWishlist && 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20'
          )}
          style={{
            transitionDuration: prefersReducedMotion ? '0ms' : '200ms',
          }}
          onClick={handleWishlistClick}
          disabled={isTogglingWishlist}
          data-testid="wishlist-button"
        >
          {isTogglingWishlist ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Heart 
                className={cn(
                  'h-5 w-5',
                  !prefersReducedMotion && 'transition-all duration-200',
                  isInWishlist && 'fill-current'
                )}
                style={{
                  transitionDuration: prefersReducedMotion ? '0ms' : '200ms',
                }}
              />
              <span className="ml-2">
                {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
