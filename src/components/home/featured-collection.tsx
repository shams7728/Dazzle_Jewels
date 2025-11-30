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
                <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
            </div>
        );
    }

    if (products.length === 0) {
        return null; // Don't show section if no featured products
    }

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-black via-neutral-950 to-black py-20">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/10 via-transparent to-transparent" />
            <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-yellow-500/5 blur-3xl" />
            <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-yellow-500/5 blur-3xl" />

            <div className="container relative mx-auto px-4">
                <ScrollReveal>
                    <div className="mb-12 text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 backdrop-blur-sm">
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-semibold uppercase tracking-wider text-yellow-500">
                                Curated Collection
                            </span>
                        </div>
                        <h2 className="mb-4 bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                            Featured Jewelry
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-neutral-400">
                            Handpicked luxury pieces crafted with precision and elegance
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                    {products.map((product, index) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            index={index}
                            featured={true}
                        />
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/products"
                        className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-4 font-semibold text-black shadow-lg shadow-yellow-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/40"
                    >
                        Explore All Products
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
