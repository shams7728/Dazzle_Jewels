"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface Category {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    description?: string;
}

export default function CollectionsPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("name");

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
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
        <div className="container mx-auto px-4 py-12">
            <ScrollReveal>
                <h1 className="mb-4 text-4xl font-bold text-white">Collections</h1>
                <p className="mb-12 text-lg text-neutral-400">
                    Explore our curated collections of fine jewelry.
                </p>
            </ScrollReveal>

            {categories.length === 0 ? (
                <div className="text-center text-neutral-400">
                    <p>No collections found.</p>
                </div>
            ) : (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category, index) => (
                        <ScrollReveal key={category.id} delay={index * 0.1}>
                            <div className="group relative rounded-2xl p-[2px] overflow-hidden">
                                {/* Animated Gold Border */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700] via-50% to-transparent bg-[length:200%_100%] animate-border-shine" />

                                <Link
                                    href={`/collections/${category.slug}`}
                                    className="relative block h-full overflow-hidden rounded-2xl bg-neutral-900"
                                >
                                    <div className="relative aspect-[4/5] w-full overflow-hidden">
                                        <Image
                                            src={category.image_url || "/placeholder.svg"}
                                            alt={category.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                                    </div>

                                    <div className="absolute bottom-0 left-0 w-full p-6">
                                        <h2 className="mb-2 text-2xl font-bold text-white transition-colors group-hover:text-yellow-500">
                                            {category.name}
                                        </h2>
                                        <div className="flex items-center text-sm font-medium text-white/80 opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
                                            View Collection <ArrowRight className="ml-2 h-4 w-4" />
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            )}
        </div >
    );
}
