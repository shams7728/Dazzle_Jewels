"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { CartItem } from "./cart-item";

export function CartSheet() {
    const { items, isOpen, setIsOpen, getCartTotal } = useCartStore();
    const total = getCartTotal();

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg bg-background border-l-2 border-border shadow-2xl">
                <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b border-border">
                    <SheetTitle className="text-foreground text-xl font-bold">Shopping Cart ({items.length})</SheetTitle>
                </SheetHeader>

                {items.length > 0 ? (
                    <>
                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 min-h-0">
                            <div className="divide-y divide-border">
                                {items.map((item) => (
                                    <CartItem
                                        key={`${item.product.id}-${item.variant?.id || "base"}`}
                                        item={item}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex-shrink-0 space-y-4 px-4 sm:px-6 pt-4 pb-6 border-t border-border">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold text-foreground">Total</span>
                                <span className="text-lg font-semibold text-primary" aria-live="polite" aria-atomic="true">
                                    ₹{total.toFixed(2)}
                                </span>
                            </div>
                            <Link href="/cart" onClick={() => setIsOpen(false)} tabIndex={-1}>
                                <Button
                                    variant="outline"
                                    className="w-full border-primary text-primary hover:bg-primary/10 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background min-h-[44px]"
                                    aria-label="View full shopping cart"
                                >
                                    View Full Cart
                                </Button>
                            </Link>
                            <Link href="/checkout" onClick={() => setIsOpen(false)} tabIndex={-1}>
                                <Button
                                    className="w-full bg-gradient-to-r from-primary to-pink-600 text-primary-foreground hover:from-primary/90 hover:to-pink-600/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background min-h-[44px]"
                                    size="lg"
                                    aria-label={`Proceed to checkout with ${items.length} ${items.length === 1 ? 'item' : 'items'}`}
                                >
                                    Proceed to Checkout
                                </Button>
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center space-y-4 px-4 sm:px-6">
                        <div className="relative">
                            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10 blur-xl" />
                            <ShoppingBag className="relative h-16 w-16 text-primary/50" aria-hidden="true" />
                        </div>
                        <span className="text-lg font-semibold text-muted-foreground">
                            Your cart is empty
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="text-primary border-primary hover:bg-primary/10 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background min-h-[44px]"
                            aria-label="Continue shopping for products"
                        >
                            Continue Shopping
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
