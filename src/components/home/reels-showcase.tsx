"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Reel } from "@/types";
import { Play, Heart, Eye, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function ReelsShowcase() {
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);
    const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchReels();
    }, []);

    const fetchReels = async () => {
        try {
            const { data, error } = await supabase
                .from('reels')
                .select('*, product:products(*)')
                .eq('is_approved', true)
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (data && !error) {
                setReels(data);
            }
        } catch (error) {
            console.error("Error fetching reels:", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-scroll functionality
    useEffect(() => {
        if (!scrollContainerRef.current || reels.length === 0 || !isAutoScrolling) return;

        const container = scrollContainerRef.current;
        let scrollDirection = 1; // 1 for right, -1 for left

        const autoScroll = () => {
            if (!container) return;

            const maxScroll = container.scrollWidth - container.clientWidth;
            const currentScroll = container.scrollLeft;

            // Change direction at boundaries
            if (currentScroll >= maxScroll - 10) {
                scrollDirection = -1;
            } else if (currentScroll <= 10) {
                scrollDirection = 1;
            }

            // Smooth scroll
            container.scrollBy({
                left: scrollDirection * 1,
                behavior: 'auto'
            });
        };

        autoScrollIntervalRef.current = setInterval(autoScroll, 30);

        return () => {
            if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current);
            }
        };
    }, [reels, isAutoScrolling]);

    // Pause auto-scroll on user interaction
    const handleUserInteraction = () => {
        setIsAutoScrolling(false);
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
        }
        
        // Resume after 3 seconds of no interaction
        setTimeout(() => {
            setIsAutoScrolling(true);
        }, 3000);
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400;
            const newScrollLeft = scrollContainerRef.current.scrollLeft + 
                (direction === 'left' ? -scrollAmount : scrollAmount);
            
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
            handleUserInteraction();
        }
    };

    if (loading || reels.length === 0) return null;

    return (
        <div className="relative w-full bg-black py-12 md:py-16 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-500/5 to-transparent pointer-events-none" />
            
            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30">
                            <Play className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white flex items-center gap-2">
                                Trending Reels
                                <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                            </h2>
                            <p className="text-sm md:text-base text-neutral-400 mt-1">
                                Discover our jewelry in action
                            </p>
                        </div>
                    </div>
                    
                    {/* View All Button - Desktop */}
                    <Link href="/reels" className="hidden md:block">
                        <Button 
                            variant="outline" 
                            className="group border-yellow-500/30 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all duration-300"
                        >
                            View All Reels
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                {/* Reels Container */}
                <div className="relative">
                    {/* Navigation Buttons */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-black/80 backdrop-blur-md border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all duration-300 hover:scale-110 shadow-lg"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-black/80 backdrop-blur-md border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all duration-300 hover:scale-110 shadow-lg"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Scrollable Reels */}
                    <div 
                        ref={scrollContainerRef}
                        className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        onTouchStart={handleUserInteraction}
                        onMouseDown={handleUserInteraction}
                        onWheel={handleUserInteraction}
                    >
                        {reels.map((reel, index) => (
                            <motion.div
                                key={reel.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex-shrink-0 group"
                            >
                                <Link href={`/reels?id=${reel.id}`}>
                                    <div className="relative w-[180px] md:w-[220px] h-[320px] md:h-[390px] rounded-2xl overflow-hidden border-2 border-neutral-800 hover:border-yellow-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-yellow-500/20 cursor-pointer">
                                        {/* Video Preview - Auto-playing, looping, muted */}
                                        <div className="absolute inset-0">
                                            <video 
                                                src={reel.video_url}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="w-full h-full object-cover"
                                                poster={reel.thumbnail_url}
                                            />
                                        </div>

                                        {/* Play Button Overlay - Shows on hover */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-sm">
                                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-yellow-500 flex items-center justify-center shadow-2xl shadow-yellow-500/50 group-hover:scale-110 transition-transform">
                                                <Play className="h-7 w-7 md:h-8 md:w-8 text-black fill-black ml-1" />
                                            </div>
                                        </div>

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                        {/* Content */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-10">
                                            {/* Stats */}
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="flex items-center gap-1.5 text-white/90">
                                                    <Eye className="h-4 w-4" />
                                                    <span className="text-xs md:text-sm font-medium">
                                                        {reel.likes_count > 1000 
                                                            ? `${(reel.likes_count / 1000).toFixed(1)}K` 
                                                            : reel.likes_count}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-white/90">
                                                    <Heart className="h-4 w-4" />
                                                    <span className="text-xs md:text-sm font-medium">
                                                        {Math.floor(reel.likes_count * 0.8)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Product Info */}
                                            {reel.product && (
                                                <div className="space-y-1">
                                                    <h3 className="text-white font-semibold text-sm md:text-base line-clamp-2 group-hover:text-yellow-500 transition-colors">
                                                        {reel.product.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-yellow-500 font-bold text-base md:text-lg">
                                                            ₹{reel.product.discount_price || reel.product.base_price}
                                                        </span>
                                                        {reel.product.discount_price && (
                                                            <span className="text-neutral-400 text-xs md:text-sm line-through">
                                                                ₹{reel.product.base_price}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Featured Badge */}
                                        {reel.product?.is_featured && (
                                            <div className="absolute top-3 right-3 z-10">
                                                <div className="px-3 py-1 rounded-full bg-yellow-500/90 backdrop-blur-sm border border-yellow-400 flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3 text-black" />
                                                    <span className="text-xs font-bold text-black">Featured</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Shimmer Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Fade edges for scroll indication */}
                    <div className="absolute left-0 top-0 bottom-4 w-8 md:w-16 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
                    <div className="absolute right-0 top-0 bottom-4 w-8 md:w-16 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
                </div>

                {/* View All Button - Mobile */}
                <div className="mt-8 flex justify-center md:hidden">
                    <Link href="/reels">
                        <Button 
                            className="group bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 px-8 py-6 text-base rounded-full shadow-lg shadow-yellow-500/30"
                        >
                            View All Reels
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
