"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { CartPageItem } from "@/components/cart/cart-page-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { EmptyCart } from "@/components/cart/empty-cart";
import { useEffect, useState, useMemo } from "react";

// Note: Metadata export is not supported in client components
// The page title is set dynamically via useEffect below

export default function CartPage() {
    const { items, updateQuantity, removeItem, calculateSubtotal, calculateDiscount, calculateTax, getItemCount } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const [animateItems, setAnimateItems] = useState(false);

    // Memoized calculations - only recalculate when items change
    const subtotal = useMemo(() => calculateSubtotal(), [items, calculateSubtotal]);
    const discount = useMemo(() => calculateDiscount(subtotal), [subtotal, calculateDiscount]);
    const subtotalAfterDiscount = useMemo(() => subtotal - discount, [subtotal, discount]);
    const tax = useMemo(() => calculateTax(subtotalAfterDiscount), [subtotalAfterDiscount, calculateTax]);
    const total = useMemo(() => subtotalAfterDiscount + tax, [subtotalAfterDiscount, tax]);
    const itemCount = useMemo(() => getItemCount(), [items, getItemCount]);

    // Handle hydration and page title
    useEffect(() => {
        setMounted(true);
        // Trigger stagger animation after mount
        setTimeout(() => setAnimateItems(true), 50);
        
        // Update page title dynamically
        const itemCount = items.reduce((count, item) => count + item.quantity, 0);
        document.title = itemCount > 0 
            ? `Shopping Cart (${itemCount}) | Dazzle Jewels`
            : 'Shopping Cart | Dazzle Jewels';
        
        // Cleanup: restore default title on unmount
        return () => {
            document.title = 'Dazzle Jewels | Premium Jewelry Collection';
        };
    }, [items]);

    if (!mounted) {
        return (
            <div className="relative min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black pt-24 pb-12 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/5 via-transparent to-transparent pointer-events-none" />
                
                <div className="container relative mx-auto px-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 w-48 bg-neutral-800 rounded" />
                        <div className="h-64 bg-neutral-800 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    // Handle empty cart state
    if (items.length === 0) {
        return (
            <div className="relative min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black pt-24 pb-12 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/5 via-transparent to-transparent pointer-events-none" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />
                
                <EmptyCart />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black pt-24 pb-12 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />
            
            <div className="container relative mx-auto px-4">
                {/* Page Header */}
                <header className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
                            Shopping Cart
                        </h1>
                        <Link 
                            href="/products"
                            className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1"
                            aria-label="Continue shopping for more products"
                        >
                            ← Continue Shopping
                        </Link>
                    </div>
                    <p className="text-neutral-400 text-base" aria-live="polite" aria-atomic="true">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                    </p>
                </header>

                {/* Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items - Left Column (2/3 on desktop) */}
                    <section className="lg:col-span-2 space-y-4" aria-label="Cart items">
                        {items.map((item, index) => (
                            <div
                                key={`${item.product.id}-${item.variant?.id || 'no-variant'}-${index}`}
                                className={`
                                    transition-all duration-500 ease-out
                                    ${animateItems 
                                        ? 'opacity-100 translate-y-0' 
                                        : 'opacity-0 translate-y-4'
                                    }
                                `}
                                style={{
                                    transitionDelay: `${index * 100}ms`
                                }}
                            >
                                <CartPageItem
                                    item={item}
                                    onQuantityChange={(newQuantity) =>
                                        updateQuantity(item.product.id, item.variant?.id, newQuantity)
                                    }
                                    onRemove={() => removeItem(item.product.id, item.variant?.id)}
                                />
                            </div>
                        ))}
                    </section>

                    {/* Cart Summary - Right Column (1/3 on desktop, sticky) */}
                    <div className={`
                        lg:col-span-1 transition-all duration-500 ease-out
                        ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                    `}
                    style={{ transitionDelay: '200ms' }}
                    >
                        <CartSummary
                            subtotal={subtotal}
                            tax={tax}
                            discount={discount}
                            total={total}
                            itemCount={itemCount}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
