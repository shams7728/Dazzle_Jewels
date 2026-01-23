"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ProductCard } from "@/components/products/product-card";

export function FeaturedCollection() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedProducts();
    }, []);

    const fetchFeaturedProducts = async () => {
        try {
            const { data, error } = await supabase
                .from("products")
                .select(`
          *,
          variants:product_variants(*)
        `)
                .eq("is_featured", true)
                .limit(4); // Limit to 4 for the home page

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error("Error fetching featured products:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (products.length === 0) {
        return null; // Don't show section if no featured products
    }

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background py-20">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
            <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-pink-400/5 blur-3xl" />

            <div className="container relative mx-auto px-4">
                <ScrollReveal>
                    <div className="mb-12 text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 backdrop-blur-sm">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                                Curated Collection
                            </span>
                        </div>
                        <h2 className="mb-4 bg-gradient-to-r from-primary via-pink-400 to-primary bg-clip-text text-4xl font-bold text-transparent md:text-5xl drop-shadow-sm">
                            Featured Jewelry
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                            Handpicked luxury pieces crafted with precision and elegance
                        </p>
                    </div>
                </ScrollReveal>

                {/* Horizontal Scrolling Product Container */}
                <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
                    {/* Gradient Fade Edges */}
                    <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-background to-transparent sm:w-12 lg:w-16" />
                    <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-background to-transparent sm:w-12 lg:w-16" />

                    {/* Scrollable Product Container */}
                    <div className="flex gap-3 overflow-x-auto px-4 pb-4 sm:gap-4 sm:px-6 lg:gap-5 lg:px-8 xl:gap-6 scrollbar-hide snap-x snap-mandatory scroll-smooth">
                        {products.map((product, index) => (
                            <div
                                key={product.id}
                                className="flex-none w-[160px] xs:w-[180px] sm:w-[220px] md:w-[260px] lg:w-[280px] xl:w-[300px] snap-start transform transition-all duration-300 hover:scale-105"
                                style={{
                                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                }}
                            >
                                <ProductCard
                                    product={product}
                                    index={index}
                                    featured={true}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/products"
                        className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-pink-600 px-8 py-4 font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
                    >
                        Explore All Products
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
