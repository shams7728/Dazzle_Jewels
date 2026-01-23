"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartSummaryProps {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    itemCount: number;
}

function CartSummaryComponent({ subtotal, tax, discount, total, itemCount }: CartSummaryProps) {
    const [isNavigating, setIsNavigating] = useState(false);
    const [previousTotal, setPreviousTotal] = useState(total);
    const [animatePrice, setAnimatePrice] = useState(false);

    // Animate when total changes
    useEffect(() => {
        if (previousTotal !== total && previousTotal !== 0) {
            setAnimatePrice(true);
            const timer = setTimeout(() => setAnimatePrice(false), 500);
            return () => clearTimeout(timer);
        }
        setPreviousTotal(total);
    }, [total, previousTotal]);

    return (
        <div className="lg:sticky lg:top-24 space-y-6">
            {/* Summary Card */}
            <section
                className="bg-card rounded-lg border border-border hover:border-primary/20 p-6 space-y-4 transition-colors shadow-sm"
                aria-labelledby="order-summary-heading"
            >
                <h2 id="order-summary-heading" className="text-xl font-bold text-foreground flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" aria-hidden="true" />
                    Order Summary
                </h2>

                <dl className="space-y-3 py-4 border-y border-border">
                    {/* Subtotal */}
                    <div className="flex justify-between text-muted-foreground">
                        <dt>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</dt>
                        <dd className="font-medium text-foreground">₹{subtotal.toFixed(2)}</dd>
                    </div>

                    {/* Discount - only show if applicable */}
                    {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <dt>Discount</dt>
                            <dd className="font-medium">-₹{discount.toFixed(2)}</dd>
                        </div>
                    )}

                    {/* Tax */}
                    <div className="flex justify-between text-muted-foreground">
                        <dt>Tax (10%)</dt>
                        <dd className="font-medium text-foreground">₹{tax.toFixed(2)}</dd>
                    </div>
                </dl>

                {/* Total */}
                <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <span
                        className={`
                            text-2xl font-bold text-primary transition-all duration-300
                            ${animatePrice ? 'scale-110' : 'scale-100'}
                        `}
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        ₹{total.toFixed(2)}
                    </span>
                </div>

                {/* Checkout Button */}
                <Link href="/checkout" onClick={() => setIsNavigating(true)} tabIndex={-1}>
                    <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-primary to-pink-600 text-white hover:from-primary/90 hover:to-pink-600/90 font-semibold text-base group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background min-h-[44px]"
                        disabled={isNavigating || itemCount === 0}
                        aria-label={`Proceed to checkout with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
                        aria-disabled={isNavigating || itemCount === 0}
                    >
                        {isNavigating ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Processing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Proceed to Checkout
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>
                </Link>

                {/* Additional Info */}
                <div className="space-y-2 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                        <span className="text-green-600 font-bold">✓</span>
                        Free shipping on orders over ₹999
                    </p>
                    <p className="flex items-center gap-1.5">
                        <span className="text-green-600 font-bold">✓</span>
                        Secure checkout with encryption
                    </p>
                    <p className="flex items-center gap-1.5">
                        <span className="text-green-500 font-bold">✓</span>
                        Easy returns within 30 days
                    </p>
                </div>
            </section>

            {/* Continue Shopping Link */}
            <Link
                href="/products"
                className="block text-center text-sm text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-1"
                aria-label="Continue shopping for more products"
            >
                ← Continue Shopping
            </Link>
        </div>
    );
}

// Memoize component to prevent unnecessary re-renders
export const CartSummary = memo(CartSummaryComponent);
