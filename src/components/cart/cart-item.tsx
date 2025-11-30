"use client";

import { Minus, Plus, Trash } from "lucide-react";
import Image from "next/image";
import { useCartStore, CartItem as CartItemType } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";

interface CartItemProps {
    item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeItem } = useCartStore();
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

    const image = variant?.images?.[0] || "/placeholder.png"; // TODO: Add a real placeholder

    return (
        <div className="flex gap-3 py-4" role="article" aria-label={`Cart item: ${product.title}`}>
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-neutral-800 bg-neutral-900">
                <Image
                    src={image}
                    alt={product.title}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="flex flex-1 flex-col justify-between min-w-0">
                <div className="space-y-1">
                    <h3 className="font-semibold text-white text-sm sm:text-base line-clamp-1">{product.title}</h3>
                    {variant && (
                        <p className="text-xs sm:text-sm text-neutral-400 line-clamp-1">
                            <span className="text-neutral-500">{variant.color}</span> / <span className="text-neutral-500">{variant.material}</span>
                        </p>
                    )}
                </div>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2" role="group" aria-label={`Quantity controls for ${product.title}`}>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 min-h-[44px] min-w-[44px] flex-shrink-0 hover:border-yellow-500/50 hover:text-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-black"
                            onClick={() => updateQuantity(product.id, variant?.id, quantity - 1)}
                            disabled={quantity <= 1}
                            aria-label={`Decrease quantity of ${product.title}`}
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-6 text-center text-white font-semibold" aria-live="polite" aria-atomic="true">
                            {quantity}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 min-h-[44px] min-w-[44px] flex-shrink-0 hover:border-yellow-500/50 hover:text-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-black"
                            onClick={() => updateQuantity(product.id, variant?.id, quantity + 1)}
                            aria-label={`Increase quantity of ${product.title}`}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex flex-col items-end">
                            <span className="font-semibold text-yellow-500 text-sm sm:text-base">₹{(price * quantity).toFixed(2)}</span>
                            {hasDiscount && (
                                <span className="text-xs text-neutral-500 line-through">₹{(originalPrice * quantity).toFixed(2)}</span>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(product.id, variant?.id)}
                            className="text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
                            aria-label={`Remove ${product.title} from cart`}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
