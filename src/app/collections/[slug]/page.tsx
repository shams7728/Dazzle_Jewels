"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ProductCard } from "@/components/products/product-card";

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategoryAndProducts = useCallback(async () => {
        try {
            // 1. Fetch Category
            const { data: categoryData, error: categoryError } = await supabase
                .from("categories")
                .select("*")
                .eq("slug", slug)
                .single();

            if (categoryError || !categoryData) {
                console.error("Error fetching category:", categoryError);
                return; // Will trigger notFound() check
            }

            setCategory(categoryData);

            // 2. Fetch Products for this Category
            console.log('Fetching products for category:', categoryData.name, 'with ID:', categoryData.id);
            
            const { data: productsData, error: productsError } = await supabase
                .from("products")
                .select(`
                    *,
                    variants:product_variants(*)
                `)
                .eq("category_id", categoryData.id);

            if (productsError) throw productsError;
            
            console.log('Found products:', productsData?.length || 0);
            setProducts(productsData || []);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchCategoryAndProducts();
    }, [fetchCategoryAndProducts]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
        );
    }

    if (!category) {
        return notFound();
    }

    return (
        <div className="relative overflow-hidden bg-black py-12 min-h-screen">
            {/* Animated Gold Shimmer Background - Enhanced for Mobile */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent sm:from-yellow-500/5" />
            
            {/* Animated Gold Particles - More visible on mobile */}
            <div className="absolute inset-0">
                <div className="absolute left-[10%] top-[20%] h-24 w-24 sm:h-32 sm:w-32 animate-pulse rounded-full bg-yellow-500/20 sm:bg-yellow-500/10 blur-2xl sm:blur-3xl" />
                <div className="absolute right-[15%] top-[40%] h-28 w-28 sm:h-40 sm:w-40 animate-pulse rounded-full bg-yellow-400/20 sm:bg-yellow-400/10 blur-2xl sm:blur-3xl animation-delay-1000" />
                <div className="absolute left-[20%] bottom-[30%] h-26 w-26 sm:h-36 sm:w-36 animate-pulse rounded-full bg-yellow-600/20 sm:bg-yellow-600/10 blur-2xl sm:blur-3xl animation-delay-2000" />
                <div className="absolute right-[25%] bottom-[20%] h-24 w-24 sm:h-32 sm:w-32 animate-pulse rounded-full bg-yellow-500/20 sm:bg-yellow-500/10 blur-2xl sm:blur-3xl animation-delay-3000" />
            </div>

            {/* Diagonal Gold Shine Effect - More visible on mobile */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-yellow-500/10 to-transparent opacity-70 sm:via-yellow-500/5 sm:opacity-50" />
            
            {/* Animated Sparkle Lines - More visible on mobile */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-0 top-1/4 h-px w-full bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent sm:via-yellow-500/30 animate-shimmer" />
                <div className="absolute left-0 top-2/4 h-px w-full bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent sm:via-yellow-400/20 animate-shimmer animation-delay-1000" />
                <div className="absolute left-0 top-3/4 h-px w-full bg-gradient-to-r from-transparent via-yellow-600/40 to-transparent sm:via-yellow-600/20 animate-shimmer animation-delay-2000" />
            </div>

            <div className="container relative mx-auto px-4">
                <ScrollReveal>
                    <Link href="/collections" className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-yellow-500">
                        <ArrowLeft className="h-4 w-4" /> Back to Collections
                    </Link>

                    <div className="mb-12">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 backdrop-blur-sm">
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-semibold uppercase tracking-wider text-yellow-500">
                                Collection
                            </span>
                        </div>
                        <h1 className="mb-4 bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                            {category.name}
                        </h1>
                        {category.description && (
                            <p className="max-w-2xl text-lg text-neutral-400">
                                {category.description}
                            </p>
                        )}
                        <p className="mt-2 text-sm text-neutral-500">
                            {products.length} {products.length === 1 ? 'product' : 'products'} found
                        </p>
                    </div>
                </ScrollReveal>

                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/50 py-16 text-center">
                        <p className="mb-4 text-lg text-neutral-400">No products found in this collection.</p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-3 font-semibold text-black shadow-lg shadow-yellow-500/30 transition-all hover:scale-105"
                        >
                            Browse All Products
                        </Link>
                    </div>
                ) : (
                    // Responsive Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop
                    <div className="grid grid-cols-2 gap-3 xs:gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:gap-7">
                        {products.map((product, index) => (
                            <div 
                                key={product.id}
                                style={{ 
                                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                }}
                            >
                                <ProductCard
                                    product={product}
                                    index={index}
                                    featured={product.is_featured}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
