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
                <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
                    {/* Gradient Fade Edges */}
                    <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-black to-transparent sm:w-12 lg:w-16" />
                    <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-black to-transparent sm:w-12 lg:w-16" />
                    
                    {/* Scrollable Collections Container */}
                    <div className="flex gap-6 overflow-x-auto px-4 pb-4 sm:gap-8 sm:px-6 lg:px-8 scrollbar-hide snap-x snap-mandatory scroll-smooth">
                        {categories.map((category, index) => (
                            <ScrollReveal key={category.id} delay={index * 0.1}>
                                <div 
                                    className="group relative rounded-2xl p-[2px] overflow-hidden flex-none w-[280px] sm:w-[320px] md:w-[360px] lg:w-[400px] snap-start"
                                    style={{ 
                                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                    }}
                                >
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
                </div>
            )}
        </div >
    );
}
