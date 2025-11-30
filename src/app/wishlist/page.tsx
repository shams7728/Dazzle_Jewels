"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart, ArrowLeft } from "lucide-react";
import { WishlistButton } from "@/components/products/wishlist-button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function WishlistPage() {
    const { items } = useWishlistStore();
    const { addItem } = useCartStore();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
                <div className="h-20 w-20 rounded-full bg-neutral-900 flex items-center justify-center mb-6">
                    <Heart className="h-10 w-10 text-neutral-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Your wishlist is empty</h1>
                <p className="text-neutral-400 mb-8 max-w-md">
                    Save items you love to your wishlist. Review them anytime and easily move them to the bag.
                </p>
                <Link href="/products">
                    <Button className="bg-yellow-500 text-black hover:bg-yellow-400">
                        Start Shopping
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <ScrollReveal>
                <Link href="/products" className="mb-8 inline-flex items-center text-sm text-neutral-400 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
                </Link>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">My Wishlist ({items.length})</h1>
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((product, index) => {
                    // Use first variant image or placeholder
                    // @ts-ignore
                    const firstVariant = product.variants?.[0];
                    const image = firstVariant?.images?.[0] || "/placeholder.svg";
                    const price = firstVariant
                        ? product.base_price + firstVariant.price_adjustment
                        : product.base_price;

                    return (
                        <ScrollReveal key={product.id} delay={index * 0.05}>
                            <div className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 transition-all hover:border-yellow-500/50 h-full flex flex-col">
                                <Link href={`/products/${product.id}`} className="flex flex-col h-full">
                                    <div className="relative aspect-square overflow-hidden bg-neutral-800">
                                        <Image
                                            src={image}
                                            alt={product.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute top-2 right-2 z-10">
                                            <WishlistButton product={product} />
                                        </div>
                                    </div>
                                    <div className="p-3 sm:p-4 flex flex-col flex-grow">
                                        <h3 className="mb-1 text-sm sm:text-lg font-medium text-white hover:text-yellow-500 transition-colors truncate">{product.title}</h3>
                                        <p className="mb-2 sm:mb-4 text-xs sm:text-sm text-neutral-400 line-clamp-2">{product.description}</p>
                                        <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                                            <div className="flex flex-col">
                                                {product.discount_price && product.discount_price < product.base_price ? (
                                                    <>
                                                        <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
                                                            <span className="text-sm sm:text-lg font-bold text-yellow-500">
                                                                ₹{firstVariant ? product.discount_price + firstVariant.price_adjustment : product.discount_price}
                                                            </span>
                                                            <span className="text-xs sm:text-sm text-neutral-500 line-through">
                                                                ₹{price}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] sm:text-xs font-medium text-green-500">
                                                            {Math.round(((product.base_price - product.discount_price) / product.base_price) * 100)}% OFF
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm sm:text-lg font-bold text-yellow-500">₹{price}</span>
                                                )}
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addItem(product, firstVariant);
                                                }}
                                                className="w-full sm:w-auto bg-white text-black hover:bg-neutral-200 h-8 text-xs sm:h-9 sm:text-sm"
                                            >
                                                <ShoppingBag className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </ScrollReveal>
                    );
                })}
            </div>
        </div>
    );
}
