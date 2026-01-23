"use client";

import { memo } from "react";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function EmptyCartComponent() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-8 px-4 py-12" role="region" aria-label="Empty cart">
            <div className="relative" aria-hidden="true">
                <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-3xl" />
                <div className="relative rounded-full bg-primary/10 p-8 border border-primary/20">
                    <ShoppingBag className="h-24 w-24 text-primary" strokeWidth={1.5} />
                </div>
            </div>

            <div className="space-y-3 text-center">
                <h2 className="text-3xl font-bold text-foreground">Your cart is empty</h2>
                <p className="text-muted-foreground max-w-md text-lg">
                    Looks like you haven't added anything to your cart yet. Start shopping to find amazing products!
                </p>
            </div>

            <Link href="/products" tabIndex={-1}>
                <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-pink-600 text-white hover:from-primary/90 hover:to-pink-600/90 font-semibold px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background min-h-[44px]"
                    aria-label="Start shopping for products"
                >
                    Continue Shopping
                </Button>
            </Link>
        </div>
    );
}

// Memoize component to prevent unnecessary re-renders
export const EmptyCart = memo(EmptyCartComponent);
