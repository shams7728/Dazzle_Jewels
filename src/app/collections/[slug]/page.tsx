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
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!category) {
        return notFound();
    }

    return (
        <div className="relative overflow-hidden bg-background py-12 min-h-screen">
            {/* Animated Background - Pink Theme */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

            {/* Animated Particles */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-[10%] top-[20%] h-24 w-24 animate-pulse rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute right-[15%] top-[40%] h-28 w-28 animate-pulse rounded-full bg-pink-400/5 blur-3xl animation-delay-1000" />
            </div>

            <div className="container relative mx-auto px-4">
                <ScrollReveal>
                    <Link href="/collections" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                        <ArrowLeft className="h-4 w-4" /> Back to Collections
                    </Link>

                    <div className="mb-12">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 backdrop-blur-sm">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                                Collection
                            </span>
                        </div>
                        <h1 className="mb-4 bg-gradient-to-r from-primary via-pink-400 to-primary bg-clip-text text-4xl font-bold text-transparent md:text-5xl drop-shadow-sm capitalize">
                            {category.name}
                        </h1>
                        {category.description && (
                            <p className="max-w-2xl text-lg text-muted-foreground">
                                {category.description}
                            </p>
                        )}
                        <p className="mt-2 text-sm text-muted-foreground">
                            {products.length} {products.length === 1 ? 'product' : 'products'} found
                        </p>
                    </div>
                </ScrollReveal>

                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
                        <p className="mb-4 text-lg text-muted-foreground">No products found in this collection.</p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-pink-600 px-6 py-3 font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:scale-105"
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
