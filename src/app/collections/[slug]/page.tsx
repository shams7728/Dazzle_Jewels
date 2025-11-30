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
            const { data: productsData, error: productsError } = await supabase
                .from("products")
                .select(`
                    *,
                    variants:product_variants(*)
                `)
                .eq("category_id", categoryData.id);

            if (productsError) throw productsError;
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
        <div className="relative overflow-hidden bg-gradient-to-b from-black via-neutral-950 to-black py-12">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/10 via-transparent to-transparent" />
            <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-yellow-500/5 blur-3xl" />
            <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-yellow-500/5 blur-3xl" />

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
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                index={index}
                                featured={product.is_featured}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
