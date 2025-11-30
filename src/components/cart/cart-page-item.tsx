"use client";

import { useState, memo, useCallback } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { CartItem as CartItemType } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { useScreenReaderAnnouncement } from "@/hooks/useScreenReaderAnnouncement";

interface CartPageItemProps {
    item: CartItemType;
    onQuantityChange: (newQuantity: number) => void;
    onRemove: () => void;
}

function CartPageItemComponent({ item, onQuantityChange, onRemove }: CartPageItemProps) {
    const [isRemoving, setIsRemoving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { announce } = useScreenReaderAnnouncement();
    const { product, variant, quantity } = item;

    let basePrice = product.base_price;
    const originalBasePrice = product.base_price;
    const hasDiscount = product.discount_price && product.discount_price < product.base_price;

    if (hasDiscount) {
        basePrice = product.discount_price!;
    }

    const price = variant
        ? basePrice + variant.price_adjustment
        : basePrice;

    const originalPrice = variant
        ? originalBasePrice + variant.price_adjustment
        : originalBasePrice;

    const image = variant?.images?.[0] || "/placeholder.png";

    const handleRemove = useCallback(() => {
        setIsRemoving(true);
        announce(`Removing ${product.title} from cart`);
        // Delay to allow animation to play
        setTimeout(() => {
            onRemove();
            announce(`${product.title} removed from cart`);
        }, 300);
    }, [product.title, onRemove, announce]);

    const handleQuantityDecrease = useCallback(() => {
        if (quantity > 1) {
            onQuantityChange(quantity - 1);
            announce(`${product.title} quantity decreased to ${quantity - 1}`);
        }
    }, [quantity, product.title, onQuantityChange, announce]);

    const handleQuantityIncrease = useCallback(() => {
        onQuantityChange(quantity + 1);
        announce(`${product.title} quantity increased to ${quantity + 1}`);
    }, [quantity, product.title, onQuantityChange, announce]);

    return (
        <div 
            className={`
                group flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 
                bg-neutral-900/50 rounded-lg border border-neutral-800
                hover:border-yellow-500/30 hover:bg-neutral-900/70
                transition-all duration-300
                ${isRemoving ? 'opacity-0 scale-95 -translate-x-4' : 'opacity-100 scale-100 translate-x-0'}
            `}
            role="article"
            aria-label={`Cart item: ${product.title}`}
        >
            {/* Product Image */}
            <div className="relative h-32 w-full sm:h-40 sm:w-40 flex-shrink-0 overflow-hidden rounded-md border border-neutral-800 bg-neutral-900">
                <Image
                    src={image}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 160px"
                />
            </div>

            {/* Product Details */}
            <div className="flex flex-1 flex-col justify-between min-w-0">
                <div className="space-y-2">
                    <h3 className="font-semibold text-white text-lg sm:text-xl line-clamp-2 group-hover:text-yellow-500 transition-colors">
                        {product.title}
                    </h3>
                    {variant && (
                        <div className="flex flex-wrap gap-2 text-sm text-neutral-400">
                            {variant.color && (
                                <span className="px-2 py-1 bg-neutral-800 rounded text-neutral-300">
                                    Color: <span className="text-white font-medium">{variant.color}</span>
                                </span>
                            )}
                            {variant.material && (
                                <span className="px-2 py-1 bg-neutral-800 rounded text-neutral-300">
                                    Material: <span className="text-white font-medium">{variant.material}</span>
                                </span>
                            )}
                        </div>
                    )}
                    {product.description && (
                        <p className="text-sm text-neutral-400 line-clamp-2">
                            {product.description}
                        </p>
                    )}
                </div>

                {/* Price and Controls */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-400" id={`quantity-label-${product.id}`}>Quantity:</span>
                        <div className="flex items-center gap-2 bg-neutral-800 rounded-lg p-1" role="group" aria-labelledby={`quantity-label-${product.id}`}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 min-h-[44px] min-w-[44px] hover:bg-neutral-700 hover:text-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                                onClick={handleQuantityDecrease}
                                disabled={quantity <= 1}
                                aria-label={`Decrease quantity of ${product.title}`}
                                tabIndex={0}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-white font-semibold w-8 text-center" aria-live="polite" aria-atomic="true">
                                {quantity}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 min-h-[44px] min-w-[44px] hover:bg-neutral-700 hover:text-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                                onClick={handleQuantityIncrease}
                                aria-label={`Increase quantity of ${product.title}`}
                                tabIndex={0}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Price and Remove */}
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="flex flex-col items-start sm:items-end">
                            <span className="font-bold text-yellow-500 text-xl">
                                ₹{(price * quantity).toFixed(2)}
                            </span>
                            {hasDiscount && (
                                <span className="text-sm text-neutral-500 line-through">
                                    ₹{(originalPrice * quantity).toFixed(2)}
                                </span>
                            )}
                            <span className="text-xs text-neutral-400">
                                ₹{price.toFixed(2)} each
                            </span>
                        </div>

                        {/* Remove Button */}
                        {showConfirm ? (
                            <div className="flex gap-2" role="group" aria-label="Confirm removal">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowConfirm(false)}
                                    className="text-xs border-neutral-700 hover:border-neutral-600 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                                    aria-label="Cancel removal"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleRemove}
                                    className="text-xs min-h-[44px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                                    aria-label={`Confirm remove ${product.title} from cart`}
                                >
                                    Confirm
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowConfirm(true)}
                                className="text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                                aria-label={`Remove ${product.title} from cart`}
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Memoize component to prevent unnecessary re-renders
export const CartPageItem = memo(CartPageItemComponent);
