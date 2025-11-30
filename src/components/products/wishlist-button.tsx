"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlist";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WishlistButtonProps {
    product: Product;
    className?: string;
}

export function WishlistButton({ product, className }: WishlistButtonProps) {
    const { toggleItem } = useWishlistStore();
    
    // Select items directly from store to make it reactive
    const items = useWishlistStore((state) => state.items);
    const isWishlisted = items.some((i) => i.id === product.id);

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn(
                "rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-all",
                isWishlisted ? "text-red-500 hover:text-red-600" : "text-white hover:text-white",
                className
            )}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleItem(product);
            }}
        >
            <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
        </Button>
    );
}
