"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Poster {
    id: string;
    title: string | null;
    description: string | null;
    link: string | null;
    image_url: string;
    background_type: string;
    text_position: string;
    text_color: string;
    animation_style: string;
    theme_style: string;
    is_active: boolean;
}

interface ProfessionalPosterProps {
    posters: Poster[];
    autoPlay?: boolean;
    interval?: number;
}

export default function ProfessionalPoster({
    posters,
    autoPlay = true,
    interval = 5000
}: ProfessionalPosterProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (!autoPlay || posters.length <= 1) return;

        const timer = setInterval(() => {
            nextSlide();
        }, interval);

        return () => clearInterval(timer);
    }, [currentIndex, autoPlay, interval, posters.length]);

    const nextSlide = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % posters.length);
        setTimeout(() => setIsAnimating(false), 800);
    };

    const prevSlide = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev - 1 + posters.length) % posters.length);
        setTimeout(() => setIsAnimating(false), 800);
    };

    const goToSlide = (index: number) => {
        if (isAnimating || index === currentIndex) return;
        setIsAnimating(true);
        setCurrentIndex(index);
        setTimeout(() => setIsAnimating(false), 800);
    };

    if (!posters || posters.length === 0) {
        return null;
    }

    const currentPoster = posters[currentIndex];

    const getThemeClasses = (theme: string) => {
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

    const getAnimationClasses = (animation: string) => {
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

    const getTextColorClasses = (color: string) => {
        switch (color) {
            case "black":
                return "text-black";
            case "yellow":
                return "text-yellow-500";
            default:
                return "text-white";
        }
    };

    const getTextPositionClasses = (position: string) => {
        switch (position) {
            case "left":
                return "items-start text-left";
            case "right":
                return "items-end text-right";
            default:
                return "items-center text-center";
        }
    };

    const PosterContent = ({ poster }: { poster: Poster }) => {
        const content = (
            <div className={`relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-2xl ${poster.background_type === 'preset' ? poster.image_url : 'bg-background'}`}>
                {/* Background Image */}
                {poster.background_type === 'image' && (
                    <Image
                        src={poster.image_url}
                        alt={poster.title || "Poster"}
                        fill
                        className="object-cover"
                        priority={currentIndex === 0}
                    />
                )}

                {/* Overlay for better text readability */}
                {poster.background_type === 'image' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                )}

                {/* Text Content */}
                <div className={`absolute inset-0 flex flex-col justify-center p-6 md:p-12 lg:p-16 ${getTextPositionClasses(poster.text_position)}`}>
                    <div
                        key={currentIndex}
                        className={`
                            ${poster.background_type === 'image' ? 'bg-black/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl' : ''} 
                            ${getAnimationClasses(poster.animation_style)} 
                            ${getThemeClasses(poster.theme_style)}
                            max-w-2xl
                        `}
                    >
                        {poster.title && (
                            <h2 className={`
                                text-3xl md:text-4xl lg:text-5xl xl:text-6xl 
                                font-bold mb-3 md:mb-4 
                                ${getTextColorClasses(poster.text_color)}
                                drop-shadow-lg
                            `}>
                                {poster.title}
                            </h2>
                        )}
                        {poster.description && (
                            <p className={`
                                text-base md:text-lg lg:text-xl 
                                ${poster.text_color === 'black' ? 'text-black/90' : poster.text_color === 'yellow' ? 'text-primary' : 'text-foreground/90'}
                                drop-shadow-md
                                mb-6
                            `}>
                                {poster.description}
                            </p>
                        )}
                        {poster.link && (
                            <Button
                                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 py-3 md:px-8 md:py-4 text-base md:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                Shop Now
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );

        if (poster.link) {
            return <Link href={poster.link}>{content}</Link>;
        }

        return content;
    };

    return (
        <div className="relative w-full group">
            {/* Main Poster */}
            <PosterContent poster={currentPoster} />

            {/* Navigation Arrows */}
            {posters.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        disabled={isAnimating}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                        aria-label="Previous poster"
                    >
                        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        disabled={isAnimating}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                        aria-label="Next poster"
                    >
                        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {posters.length > 1 && (
                <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {posters.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            disabled={isAnimating}
                            className={`
                                h-2 rounded-full transition-all duration-300
                                ${index === currentIndex
                                    ? 'w-8 bg-yellow-500'
                                    : 'w-2 bg-white/50 hover:bg-white/70'
                                }
                                disabled:cursor-not-allowed
                            `}
                            aria-label={`Go to poster ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
