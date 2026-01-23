"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative h-screen w-full overflow-hidden bg-background">
            {/* Background Video/Image Placeholder */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
                {/* Replace this video src with your actual premium video asset */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover opacity-50"
                    poster="/placeholder.svg" // Fallback
                >
                    <source src="https://cdn.coverr.co/videos/coverr-jewelry-making-close-up-5386/1080p.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Content */}
            <div className="relative z-20 flex h-full flex-col items-center justify-center text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <h2 className="mb-4 text-sm font-medium tracking-[0.2em] text-primary uppercase">
                        New Collection 2025
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-7xl md:text-8xl">
                        TIMELESS <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-primary to-pink-300">ELEGANCE</span>
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="max-w-xl"
                >
                    <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
                        Discover our exclusive range of handcrafted jewelry, designed to make you shine on every occasion.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex flex-col gap-4 sm:flex-row"
                >
                    <Link href="/products">
                        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-full">
                            Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/collections">
                        <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg rounded-full">
                            View Collections
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
