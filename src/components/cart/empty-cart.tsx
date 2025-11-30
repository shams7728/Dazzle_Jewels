"use client";

import { memo } from "react";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function EmptyCartComponent() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-8 px-4 py-12" role="region" aria-label="Empty cart">
            <div className="relative" aria-hidden="true">
                <div className="absolute inset-0 animate-pulse rounded-full bg-yellow-500/20 blur-3xl" />
                <div className="relative rounded-full bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 p-8 border border-yellow-500/20">
                    <ShoppingBag className="h-24 w-24 text-yellow-500" strokeWidth={1.5} />
                </div>
            </div>
            
            <div className="space-y-3 text-center">
                <h2 className="text-3xl font-bold text-white">Your cart is empty</h2>
                <p className="text-neutral-400 max-w-md text-lg">
                    Looks like you haven't added anything to your cart yet. Start shopping to find amazing products!
                </p>
            </div>

            <Link href="/products" tabIndex={-1}>
                <Button 
                    size="lg"
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 font-semibold px-8 shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:shadow-yellow-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-black min-h-[44px]"
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
