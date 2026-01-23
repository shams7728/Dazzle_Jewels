"use client";

import { useState, Suspense } from "react";
import { Product, ProductVariant } from "@/types";
import {
    ProductGallery,
    ProductInfo
} from "@/components/product-detail";
import { ProductActions } from "@/components/product-detail/product-actions";
import {
    LazyProductTabs,
    LazyRelatedProducts,
    LazyReviewsSection,
    LazyShareButtons
} from "@/components/product-detail/lazy-components";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { MobileBackButton } from "@/components/layout/mobile-back-button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import {
    RelatedProductsSkeleton,
    ReviewsSectionSkeleton
} from "@/components/ui/skeleton";
import { ErrorBoundary, ErrorFallback } from "@/components/error-boundary";
import { calculateEffectivePrice } from "@/lib/utils/product-detail";

interface ProductDetailClientProps {
    product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
        product.variants && product.variants.length > 0 ? product.variants[0] : null
    );
    const [quantity, setQuantity] = useState(1);

    // Get current images based on selected variant
    const currentImages = selectedVariant?.images && selectedVariant.images.length > 0
        ? selectedVariant.images
        : ["/placeholder.svg"];

    // Calculate current price
    const currentPrice = calculateEffectivePrice(product, selectedVariant);

    // Build breadcrumb items
    const breadcrumbItems = [];
    if (product.category) {
        breadcrumbItems.push({
            label: product.category.name,
            href: `/collections/${product.category.slug}`
        });
    }
    breadcrumbItems.push({
        label: product.title,
        href: `/products/${product.id}`
    });

    // Handle variant change
    const handleVariantChange = (variant: ProductVariant) => {
        setSelectedVariant(variant);
    };

    return (
        <div className="container mx-auto px-4 py-6 md:py-8">
            {/* Back Button - Visible on all screens */}
            <div className="mb-4">
                <MobileBackButton fallbackHref="/products" />
            </div>

            {/* Breadcrumb Navigation - Hidden on mobile, visible on desktop */}
            <div className="hidden md:block mb-4">
                <Breadcrumb items={breadcrumbItems} />
            </div>

            <div className="grid gap-8 md:gap-12 lg:grid-cols-2 xl:gap-16">
                {/* Left: Product Gallery Component */}
                <ScrollReveal>
                    <ErrorBoundary
                        fallback={
                            <ErrorFallback
                                title="Failed to load product images"
                                message="Unable to display product gallery"
                            />
                        }
                    >
                        <ProductGallery
                            images={currentImages}
                            productTitle={product.title}
                        />
                    </ErrorBoundary>
                </ScrollReveal>

                {/* Right: Product Info Component */}
                <div className="space-y-4 md:space-y-6">
                    <ScrollReveal delay={0.2}>
                        <ErrorBoundary
                            fallback={
                                <ErrorFallback
                                    title="Failed to load product information"
                                    message="Unable to display product details"
                                />
                            }
                        >
                            <ProductInfo
                                product={product}
                                variants={product.variants || []}
                                selectedVariant={selectedVariant}
                                onVariantChange={handleVariantChange}
                                onAddToCart={() => { }}
                                onAddToWishlist={() => { }}
                            />
                        </ErrorBoundary>
                    </ScrollReveal>

                    {/* Product Actions - Buy Now and Add to Cart */}
                    <ScrollReveal delay={0.25}>
                        <ErrorBoundary
                            fallback={
                                <ErrorFallback
                                    title="Failed to load product actions"
                                    message="Unable to display purchase options"
                                />
                            }
                        >
                            <ProductActions
                                product={product}
                                selectedVariant={selectedVariant}
                                quantity={quantity}
                            />
                        </ErrorBoundary>
                    </ScrollReveal>

                    {/* Share Buttons - Lazy Loaded */}
                    <ScrollReveal delay={0.3}>
                        <ErrorBoundary
                            fallback={
                                <div className="text-sm text-neutral-500">Share options unavailable</div>
                            }
                        >
                            <Suspense fallback={
                                <div className="flex gap-2">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-10 w-10 animate-pulse bg-neutral-800/50 rounded-full" />
                                    ))}
                                </div>
                            }>
                                <LazyShareButtons
                                    productUrl={typeof window !== 'undefined' ? window.location.href : `https://dazzlejewels.com/products/${product.id}`}
                                    productTitle={product.title}
                                    productImage={currentImages[0]}
                                    productPrice={currentPrice}
                                />
                            </Suspense>
                        </ErrorBoundary>
                    </ScrollReveal>
                </div>
            </div>

            {/* Product Details Tabs Section - Lazy Loaded */}
            <ScrollReveal delay={0.75}>
                <div className="mt-12 md:mt-16">
                    <h2 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold text-foreground">Product Details</h2>
                    <ErrorBoundary
                        fallback={
                            <ErrorFallback
                                title="Failed to load product details"
                                message="Unable to display product information"
                            />
                        }
                    >
                        <Suspense fallback={
                            <div className="space-y-4">
                                <div className="flex gap-4 border-b border-neutral-800">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-12 w-32 animate-pulse bg-neutral-800/50 rounded-t-lg" />
                                    ))}
                                </div>
                                <div className="space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-4 animate-pulse bg-neutral-800/50 rounded" />
                                    ))}
                                </div>
                            </div>
                        }>
                            <LazyProductTabs
                                description={product.description || "No description available."}
                                specifications={selectedVariant ? {
                                    'Material': selectedVariant.material || 'N/A',
                                    'Color': selectedVariant.color || 'N/A',
                                    'Price Adjustment': `₹${selectedVariant.price_adjustment}`,
                                    'Stock': `${selectedVariant.stock_quantity} units`,
                                } : undefined}
                                shippingInfo="Free shipping on orders over ₹5000. Standard delivery takes 3-5 business days. Express delivery available for ₹200."
                                returnPolicy="30-day hassle-free returns. Items must be in original condition with tags attached. Refund processed within 7-10 business days."
                            />
                        </Suspense>
                    </ErrorBoundary>
                </div>
            </ScrollReveal>

            {/* Reviews Section - Lazy Loaded */}
            <ScrollReveal delay={0.85}>
                <div className="mt-12 md:mt-16 border-t border-neutral-800 pt-8 md:pt-12">
                    <h2 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold text-foreground">Customer Reviews</h2>
                    <ErrorBoundary
                        fallback={
                            <ErrorFallback
                                title="Failed to load reviews"
                                message="Unable to display customer reviews at this time"
                            />
                        }
                    >
                        <Suspense fallback={<ReviewsSectionSkeleton />}>
                            <LazyReviewsSection productId={product.id} />
                        </Suspense>
                    </ErrorBoundary>
                </div>
            </ScrollReveal>

            {/* Related Products Section - Lazy Loaded */}
            <ScrollReveal delay={0.95}>
                <div className="mt-12 md:mt-16 border-t border-neutral-800 pt-8 md:pt-12 mb-20 md:mb-0">
                    <ErrorBoundary
                        fallback={
                            <ErrorFallback
                                title="Failed to load related products"
                                message="Unable to display product recommendations"
                            />
                        }
                    >
                        <Suspense fallback={<RelatedProductsSkeleton count={8} />}>
                            <LazyRelatedProducts
                                currentProductId={product.id}
                                categoryId={product.category_id}
                                limit={8}
                            />
                        </Suspense>
                    </ErrorBoundary>
                </div>
            </ScrollReveal>
        </div>
    );
}
