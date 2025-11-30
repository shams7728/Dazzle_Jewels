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
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden bg-gradient-to-b from-black via-neutral-950 to-black py-12">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/10 via-transparent to-transparent" />
            <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-yellow-500/5 blur-3xl" />
            <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-yellow-500/5 blur-3xl" />

            <div className="container relative mx-auto px-4">
                <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 backdrop-blur-sm">
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-semibold uppercase tracking-wider text-yellow-500">
                                Premium Collection
                            </span>
                        </div>
                        <h1 className="mb-2 bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                            All Products
                        </h1>
                        <p className="text-lg text-neutral-400">
                            Discover our complete range of exquisite jewelry
                        </p>
                    </div>
                    <Button
                        onClick={() => setSearchOpen(true)}
                        className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-6 font-semibold text-black shadow-lg shadow-yellow-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/40"
                    >
                        <Search className="h-5 w-5" />
                        <span>Search & Filter</span>
                    </Button>
                </div>

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
            </div>
        </div>
    );
}
