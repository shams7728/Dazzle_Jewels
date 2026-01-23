'use client';

import { useState, memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant } from '@/types';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ShoppingCart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cart';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast';
import { useScreenReaderAnnouncement } from '@/hooks/useScreenReaderAnnouncement';

interface ProductActionsProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  quantity: number;
}

function ProductActionsComponent({
  product,
  selectedVariant,
  quantity,
}: ProductActionsProps) {
  const router = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const { announce } = useScreenReaderAnnouncement();

  // Get cart store methods
  const { addItem, isProductInCart, createCheckoutSession } = useCartStore();

  // Check if product is already in cart
  const isInCart = isProductInCart(product.id, selectedVariant?.id);

  // Handle Add to Cart / Go to Cart action
  const handleCartAction = useCallback(() => {
    if (isInCart) {
      // Navigate to cart page
      announce('Navigating to shopping cart');
      router.push('/cart');
    } else {
      // Add to cart
      setIsAddingToCart(true);

      try {
        // Add item to cart with specified quantity
        for (let i = 0; i < quantity; i++) {
          addItem(product, selectedVariant || undefined);
        }

        // Show success feedback
        const message = `Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`;
        showSuccessToast(message);
        announce(message);
      } catch (error) {
        console.error('Error adding to cart:', error);
        const errorMessage = 'Failed to add to cart. Please try again.';
        showErrorToast(errorMessage);
        announce(errorMessage, 'assertive');
      } finally {
        // Reset button state
        setTimeout(() => setIsAddingToCart(false), 300);
      }
    }
  }, [isInCart, quantity, product, selectedVariant, addItem, announce, router]);

  // Handle Buy Now action
  const handleBuyNow = useCallback(() => {
    // Validate variant selection if product has variants
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      const errorMessage = 'Please select a variant before proceeding.';
      showErrorToast(errorMessage);
      announce(errorMessage, 'assertive');
      return;
    }

    setIsBuyingNow(true);
    announce('Processing Buy Now, navigating to checkout');

    try {
      // Create a temporary cart item for Buy Now
      const buyNowItem = {
        product,
        variant: selectedVariant || undefined,
        quantity,
      };

      // Create checkout session with single item
      const checkoutSession = createCheckoutSession([buyNowItem]);

      console.log('Buy Now - Created checkout session:', checkoutSession);

      // Navigate to checkout with session data
      // Store session in sessionStorage to pass to checkout page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('buyNowSession', JSON.stringify(checkoutSession));
        console.log('Buy Now - Stored session in sessionStorage');

        // Small delay to ensure sessionStorage is written
        setTimeout(() => {
          router.push('/checkout');
        }, 100);
      } else {
        router.push('/checkout');
      }
    } catch (error) {
      console.error('Error processing Buy Now:', error);
      const errorMessage = 'Failed to process Buy Now. Please try again.';
      showErrorToast(errorMessage);
      announce(errorMessage, 'assertive');
      setIsBuyingNow(false);
    }
  }, [product, selectedVariant, quantity, createCheckoutSession, announce, router]);

  return (
    <div className="flex flex-col sm:flex-row gap-3" data-testid="product-actions">
      {/* Add to Cart / Go to Cart Button */}
      <Button
        size="lg"
        className={cn(
          'group flex-1 transition-all duration-300 touch-manipulation relative overflow-hidden',
          'text-base md:text-sm min-h-[44px] font-bold',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transform active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
          isInCart
            ? 'bg-gradient-to-r from-primary via-pink-500 to-primary text-white hover:from-primary/90 hover:via-pink-500/90 hover:to-primary/90 shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 border border-pink-400/50'
            : 'bg-card text-foreground hover:bg-muted hover:shadow-lg shadow-md border border-border'
        )}
        onClick={handleCartAction}
        disabled={isAddingToCart}
        data-testid="cart-action-button"
        aria-label={isInCart ? 'Go to shopping cart' : 'Add product to cart'}
        aria-disabled={isAddingToCart}
      >
        {/* Shine effect for "Go to Cart" state */}
        {isInCart && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
        )}

        {isAddingToCart ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin relative z-10" />
            <span className="relative z-10">Adding...</span>
          </>
        ) : isInCart ? (
          <>
            <ShoppingCart className="mr-2 h-5 w-5 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12 relative z-10" />
            <span className="relative z-10 tracking-wide">Go to Cart</span>
          </>
        ) : (
          <>
            <ShoppingBag className="mr-2 h-5 w-5 transition-transform duration-200 group-hover:scale-110 relative z-10" />
            <span className="relative z-10">Add to Cart</span>
          </>
        )}
      </Button>

      {/* Buy Now Button */}
      <Button
        size="lg"
        className={cn(
          'group flex-1 transition-all duration-200 touch-manipulation',
          'text-base md:text-sm min-h-[44px]',
          'bg-gradient-to-r from-primary to-pink-600 text-white hover:from-primary/90 hover:to-pink-600/90 active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transform hover:shadow-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 font-semibold',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background'
        )}
        onClick={handleBuyNow}
        disabled={isBuyingNow}
        data-testid="buy-now-button"
        aria-label="Buy now and proceed to checkout"
        aria-disabled={isBuyingNow}
      >
        {isBuyingNow ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <span>Buy Now</span>
        )}
      </Button>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export const ProductActions = memo(ProductActionsComponent);
