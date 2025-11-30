"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Category } from "@/types";
import { Sparkles, ArrowRight, Grid3x3 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function CategoriesShowcase() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });
            
            if (data && !error) {
                setCategories(data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || categories.length === 0) return null;

    return (
        <div className="relative w-full bg-gradient-to-b from-black via-neutral-950 to-black py-12 md:py-16 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent pointer-events-none" />
            
            {/* Animated grid pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(212, 175, 55, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="mb-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20"
                    >
                        <Grid3x3 className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-semibold text-yellow-500 uppercase tracking-wider">Shop by Category</span>
                    </motion.div>
                    
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 flex items-center justify-center gap-3"
                    >
                        Explore Collections
                        <Sparkles className="h-7 w-7 text-yellow-500 animate-pulse" />
                    </motion.h2>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto"
                    >
                        Discover our curated selection of premium jewelry across various styles
                    </motion.p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                            <Link href={`/products?category=${category.slug}`}>
                                <div className="group relative">
                                    {/* Card */}
                                    <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-neutral-800 hover:border-yellow-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-yellow-500/20 cursor-pointer bg-gradient-to-br from-neutral-900 to-neutral-800">
                                        {/* Image/Icon Container */}
                                        <div className="absolute inset-0">
                                            {category.image_url ? (
                                                <>
                                                    <img 
                                                        src={category.image_url} 
                                                        alt={category.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    {/* Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-70 group-hover:opacity-80 transition-opacity" />
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-500/20 to-yellow-600/10">
                                                    <Sparkles className="h-12 w-12 md:h-16 md:w-16 text-yellow-500/50 group-hover:text-yellow-500 transition-colors" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Glow effect on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/0 via-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:via-yellow-500/5 transition-all duration-300" />

                                        {/* Content */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-end p-3 md:p-4">
                                            <div className="text-center w-full">
                                                <h3 className="text-white font-bold text-sm md:text-base lg:text-lg mb-1 group-hover:text-yellow-500 transition-colors line-clamp-2">
                                                    {category.name}
                                                </h3>
                                                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <span className="text-xs text-yellow-500 font-medium">Explore</span>
                                                    <ArrowRight className="h-3 w-3 text-yellow-500 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shimmer Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                                        {/* Corner accent */}
                                        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    {/* Floating sparkle on hover */}
                                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* View All Categories Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-10 flex justify-center"
                >
                    <Link href="/products">
                        <button className="group relative px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-full overflow-hidden shadow-lg shadow-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105">
                            {/* Button glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <span className="relative flex items-center gap-2">
                                View All Products
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>

                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
