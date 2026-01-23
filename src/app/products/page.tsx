"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import { useSearchStore } from "@/lib/store/search";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const setSearchOpen = useSearchStore((state) => state.setIsOpen);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from("products")
                .select(`
          *,
          variants:product_variants(*)
        `);
            // .eq("is_active", true);

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error("Error fetching products:", JSON.stringify(error, null, 2));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
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
                <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 backdrop-blur-sm">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                                Premium Collection
                            </span>
                        </div>
                        <h1 className="mb-2 bg-gradient-to-r from-primary via-pink-400 to-primary bg-clip-text text-4xl font-bold text-transparent md:text-5xl drop-shadow-sm">
                            All Products
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Discover our complete range of exquisite jewelry
                        </p>
                    </div>
                    <Button
                        onClick={() => setSearchOpen(true)}
                        className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-pink-600 px-6 py-6 font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
                    >
                        <Search className="h-5 w-5" />
                        <span>Search & Filter</span>
                    </Button>
                </div>

                {/* Responsive Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
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
            </div>
        </div>
    );
}
