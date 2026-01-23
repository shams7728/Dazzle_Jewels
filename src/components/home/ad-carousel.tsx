"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Poster {
    id: string;
    title: string | null;
    description: string | null;
    image_url: string;
    background_type: string;
    text_position: string | null;
    text_color?: string | null;
    animation_style?: string | null;
    theme_style?: string | null;
    link?: string | null;
    type?: string;
}

export function AdCarousel() {
    const [posters, setPosters] = useState<Poster[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        fetchPosters();
    }, []);

    const fetchPosters = async () => {
        try {
            const { data } = await supabase
                .from("posters")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            if (data && data.length > 0) {
                setPosters(data);
            } else {
                // Fallback to default ads if no posters found
                setPosters([
                    {
                        id: "default-1",
                        title: "Buy 2 Get 2",
                        description: "Limited time offer on all diamond jewelry",
                        image_url: "bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900",
                        background_type: "preset",
                        text_position: "center",
                        type: "default"
                    },
                    {
                        id: "default-2",
                        title: "New Arrivals",
                        description: "Discover our latest gold necklace collection",
                        image_url: "bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900",
                        background_type: "preset",
                        text_position: "center",
                        type: "default"
                    },
                    {
                        id: "default-3",
                        title: "Exclusive Designs",
                        description: "Handcrafted pieces that tell your story",
                        image_url: "bg-gradient-to-br from-amber-900 via-yellow-900 to-orange-900",
                        background_type: "preset",
                        text_position: "center",
                        type: "default"
                    }
                ]);
            }
        } catch (error) {
            console.error("Error fetching posters:", error);
        } finally {
            setLoading(false);
        }
    };

    const nextSlide = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % posters.length);
    }, [posters.length]);

    const prevSlide = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + posters.length) % posters.length);
    }, [posters.length]);

    const goToSlide = useCallback((index: number) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    }, [currentIndex]);

    useEffect(() => {
        if (posters.length <= 1) return;
        const timer = setInterval(() => {
            nextSlide();
        }, 4000);
        return () => clearInterval(timer);
    }, [nextSlide, posters.length]);

    if (loading) return null;
    if (posters.length === 0) return null;

    const currentPoster = posters[currentIndex];

    // Helper to determine text alignment classes
    const getAlignmentClass = (position: string) => {
        switch (position) {
            case 'left': return 'items-start text-left justify-start';
            case 'right': return 'items-end text-right justify-end';
            default: return 'items-center text-center justify-center';
        }
    };

    // Helper for theme classes
    const getThemeClasses = (theme?: string | null) => {
        switch (theme) {
            case "elegant":
                return "font-serif";
            case "bold":
                return "font-black tracking-tight";
            case "minimal":
                return "font-light tracking-wide";
            default:
                return "font-sans";
        }
    };

    // Helper for text color classes
    const getTextColorClasses = (color?: string | null) => {
        switch (color) {
            case "black":
                return "text-black";
            case "yellow":
                return "text-primary";
            default:
                return "text-white";
        }
    };

    // Helper for animation classes
    const getAnimationClasses = (animation?: string | null) => {
        switch (animation) {
            case "fade-in":
                return "animate-fade-in";
            case "slide-up":
                return "animate-slide-up";
            case "zoom-in":
                return "animate-zoom-in";
            case "bounce":
                return "animate-bounce-in";
            default:
                return "";
        }
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.8
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.8
        })
    };

    return (
        <div className="relative w-full overflow-hidden bg-background py-8 md:py-12">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                            <Tag className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Special Offers</h2>
                            <p className="text-sm text-muted-foreground">Don&apos;t miss out on our exclusive deals</p>
                        </div>
                    </div>
                    <Sparkles className="h-6 w-6 text-primary animate-pulse hidden md:block" />
                </div>

                <div className="relative h-[300px] md:h-[400px] lg:h-[450px] w-full overflow-hidden rounded-3xl border-2 border-border shadow-2xl shadow-primary/10">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={currentPoster.id}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.4 },
                                scale: { duration: 0.4 }
                            }}
                            className="absolute inset-0 h-full w-full"
                        >
                            <div className={`relative h-full w-full flex flex-col ${getAlignmentClass(currentPoster.text_position || 'center')} p-6 md:p-10 lg:p-12 ${currentPoster.background_type === 'preset' ? currentPoster.image_url : ''}`}>

                                {/* Background Image */}
                                {currentPoster.background_type === 'image' && (
                                    <>
                                        <Image
                                            src={currentPoster.image_url}
                                            alt={currentPoster.title || "Poster"}
                                            fill
                                            className="object-cover z-0"
                                            priority
                                        />
                                        {/* Dark overlay for better text readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent z-[1]" />
                                    </>
                                )}

                                {/* Animated particles background */}
                                <div className="absolute inset-0 z-[2] pointer-events-none">
                                    <div className="absolute top-10 left-10 w-2 h-2 bg-primary/30 rounded-full animate-ping" />
                                    <div className="absolute top-20 right-20 w-3 h-3 bg-pink-400/20 rounded-full animate-pulse" />
                                    <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-primary/40 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                                    <div className="absolute bottom-32 right-1/3 w-2 h-2 bg-pink-400/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                                </div>

                                {/* Content */}
                                <div className={`relative z-10 max-w-3xl ${currentPoster.text_position === 'left' ? 'mr-auto' : currentPoster.text_position === 'right' ? 'ml-auto' : 'mx-auto'} ${getThemeClasses(currentPoster.theme_style)} ${getAnimationClasses(currentPoster.animation_style)}`}>
                                    {/* Badge */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30"
                                    >
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Limited Time</span>
                                    </motion.div>

                                    {/* Title */}
                                    {currentPoster.title && (
                                        <motion.h3
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className={`mb-3 text-3xl md:text-4xl lg:text-5xl font-bold ${getTextColorClasses(currentPoster.text_color)} drop-shadow-2xl leading-tight`}
                                        >
                                            {currentPoster.title}
                                        </motion.h3>
                                    )}

                                    {/* Description */}
                                    {currentPoster.description && (
                                        <motion.p
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className={`mb-6 text-base md:text-lg lg:text-xl ${currentPoster.text_color === 'black' ? 'text-black/90' : currentPoster.text_color === 'yellow' ? 'text-primary' : 'text-white/90'} drop-shadow-lg max-w-2xl`}
                                        >
                                            {currentPoster.description}
                                        </motion.p>
                                    )}

                                    {/* CTA Button */}
                                    {currentPoster.link && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <Link href={currentPoster.link}>
                                                <Button
                                                    size="lg"
                                                    className="group bg-gradient-to-r from-primary to-pink-600 text-white hover:from-primary/90 hover:to-pink-600/90 px-6 py-3 md:px-8 md:py-4 text-base md:text-lg rounded-full shadow-2xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/50 font-semibold"
                                                >
                                                    Shop Now
                                                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </Link>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Controls */}
                    {posters.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 rounded-full bg-black/40 backdrop-blur-md p-3 md:p-4 text-white border border-white/10 transition-all hover:bg-black/60 hover:scale-110 hover:border-primary/50 z-20 group"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft className="h-6 w-6 md:h-7 md:w-7 group-hover:text-primary transition-colors" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 rounded-full bg-black/40 backdrop-blur-md p-3 md:p-4 text-white border border-white/10 transition-all hover:bg-black/60 hover:scale-110 hover:border-primary/50 z-20 group"
                                aria-label="Next slide"
                            >
                                <ChevronRight className="h-6 w-6 md:h-7 md:w-7 group-hover:text-primary transition-colors" />
                            </button>

                            {/* Progress Bar */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-20">
                                <motion.div
                                    key={currentIndex}
                                    className="h-full bg-gradient-to-r from-primary to-pink-600"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 4, ease: "linear" }}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Thumbnail Preview (Optional - for desktop) */}
                {posters.length > 1 && (
                    <div className="hidden lg:flex gap-4 mt-6 justify-center">
                        {posters.map((poster, index) => (
                            <button
                                key={poster.id}
                                onClick={() => goToSlide(index)}
                                className={`relative w-32 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                                    ? 'border-primary scale-105 shadow-lg shadow-primary/30'
                                    : 'border-neutral-700 hover:border-neutral-600 opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <div className={`w-full h-full ${poster.background_type === 'preset' ? poster.image_url : 'bg-neutral-800'}`}>
                                    {poster.background_type === 'image' && (
                                        <Image
                                            src={poster.image_url}
                                            alt={poster.title || "Thumbnail"}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                {index === currentIndex && (
                                    <div className="absolute inset-0 bg-primary/20" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
