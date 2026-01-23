"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import {
    Award,
    Gem,
    ShieldCheck,
    Truck,
    Sparkles,
    Heart,
    Users,
    Globe,
    TrendingUp,
    Star,
    CheckCircle2
} from "lucide-react";

const stats = [
    { value: "50K+", label: "Happy Customers" },
    { value: "15+", label: "Years Experience" },
    { value: "1000+", label: "Unique Designs" },
    { value: "99%", label: "Satisfaction Rate" }
];

const timeline = [
    { year: "2014", title: "Global Expansion", description: "Opened stores in 5 countries, reaching customers worldwide" },
    { year: "2019", title: "Innovation Award", description: "Recognized for sustainable and ethical sourcing practices" },
    { year: "2024", title: "Digital Excellence", description: "Launched our advanced e-commerce platform" }
];

const values = [
    {
        icon: Gem,
        title: "Premium Quality",
        description: "Certified gemstones and hallmark gold for lasting value and brilliance."
    },
    {
        icon: Award,
        title: "Expert Craftsmanship",
        description: "Handcrafted by master artisans with decades of experience."
    },
    {
        icon: ShieldCheck,
        title: "Lifetime Warranty",
        description: "We stand behind the quality of every piece we create."
    },
    {
        icon: Truck,
        title: "Secure Shipping",
        description: "Insured and tracked delivery to your doorstep."
    },
    {
        icon: Heart,
        title: "Ethical Sourcing",
        description: "Conflict-free diamonds and responsibly sourced materials."
    },
    {
        icon: Sparkles,
        title: "Custom Design",
        description: "Personalized pieces tailored to your unique vision."
    }
];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background text-foreground overflow-hidden">
            {/* Hero Section with Parallax Effect */}
            <section className="relative h-screen w-full overflow-hidden">
                <motion.div
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    <Image
                        src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop"
                        alt="Luxury Jewelry Workshop"
                        fill
                        className="object-cover opacity-40"
                        priority
                    />
                </motion.div>

                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />

                {/* Floating particles effect */}
                <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-yellow-500/30 rounded-full"
                            initial={{
                                x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1920,
                                y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1080,
                                scale: 0
                            }}
                            animate={{
                                y: [null, Math.random() * -100],
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                        />
                    ))}
                </div>

                <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                    <div className="max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="inline-block mb-6"
                            >
                                <Sparkles className="w-12 h-12 text-yellow-500 mx-auto animate-pulse" />
                            </motion.div>

                            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-foreground mb-6">
                                <span className="inline-block">Our</span>{" "}
                                <span className="inline-block bg-gradient-to-r from-primary via-pink-400 to-primary bg-clip-text text-transparent animate-shimmer">
                                    Story
                                </span>
                            </h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.8 }}
                                className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mb-8"
                            >
                                Crafting Timeless Elegance
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 1 }}
                                className="flex flex-wrap gap-4 justify-center"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors"
                                >
                                    Explore Collection
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary/10 transition-colors"
                                >
                                    Contact Us
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.5 }}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-6 h-10 border-2 border-yellow-500/50 rounded-full flex justify-center pt-2"
                    >
                        <motion.div className="w-1 h-2 bg-yellow-500 rounded-full" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-background/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <ScrollReveal key={index} delay={index * 0.1}>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all shadow-sm"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                    >
                                        <h3 className="text-4xl md:text-5xl font-bold text-primary mb-2">
                                            {stat.value}
                                        </h3>
                                        <p className="text-muted-foreground text-sm md:text-base">{stat.label}</p>
                                    </motion.div>
                                </motion.div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="container mx-auto px-4 py-20 md:py-32">
                <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                    <ScrollReveal>
                        <div className="space-y-6">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: "4rem" }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                                className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-300"
                            />

                            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                                The <span className="text-primary">Dazzle</span> Difference
                            </h2>

                            <p className="text-lg text-muted-foreground leading-relaxed">
                                At Dazzle Jewels, we believe that jewelry is more than just an accessory—it&apos;s an expression of your unique personality and style. Our journey began with a simple mission: to create exquisite, handcrafted pieces that blend timeless tradition with modern aesthetics.
                            </p>

                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Each piece in our collection is meticulously designed and crafted by skilled artisans who pour their heart and soul into every detail. We source only the finest materials, ensuring that every gemstone sparkles with brilliance and every metal shines with purity.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Certified Authentic</span>
                                </div>
                                <div className="flex items-center gap-2 text-primary">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Ethically Sourced</span>
                                </div>
                                <div className="flex items-center gap-2 text-primary">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Lifetime Support</span>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2}>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                            className="relative aspect-square overflow-hidden rounded-3xl border border-neutral-800 group"
                        >
                            <Image
                                src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2075&auto=format&fit=crop"
                                alt="Jewelry Craftsmanship"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-background py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                                Why Choose <span className="text-primary">Us</span>
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                We combine traditional craftsmanship with modern innovation to deliver exceptional jewelry experiences
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {values.map((value, index) => (
                            <ScrollReveal key={index} delay={index * 0.1}>
                                <motion.div
                                    whileHover={{ y: -8 }}
                                    className="group relative p-8 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
                                >
                                    {/* Animated background gradient */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        initial={false}
                                    />

                                    <div className="relative z-10">
                                        <motion.div
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6 }}
                                            className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors"
                                        >
                                            <value.icon className="h-8 w-8 text-primary" />
                                        </motion.div>

                                        <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                                            {value.title}
                                        </h3>

                                        <p className="text-muted-foreground leading-relaxed">
                                            {value.description}
                                        </p>
                                    </div>
                                </motion.div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="container mx-auto px-4 py-20 md:py-32">
                <ScrollReveal>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                            Our <span className="text-primary">Journey</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            A timeline of milestones that shaped our legacy
                        </p>
                    </div>
                </ScrollReveal>

                <div className="max-w-4xl mx-auto">
                    {timeline.map((item, index) => (
                        <ScrollReveal key={index} delay={index * 0.1}>
                            <motion.div
                                whileHover={{ x: 10 }}
                                className="relative pl-8 md:pl-32 pb-12 border-l-2 border-neutral-800 last:border-l-0 group"
                            >
                                {/* Timeline dot */}
                                <motion.div
                                    whileHover={{ scale: 1.5 }}
                                    className="absolute left-0 top-0 w-4 h-4 bg-primary rounded-full -translate-x-[9px] group-hover:shadow-lg group-hover:shadow-primary/50 transition-shadow"
                                />

                                {/* Year badge */}
                                <div className="absolute left-0 md:left-8 top-0 md:-translate-x-full md:pr-8">
                                    <span className="inline-block px-4 py-1 bg-primary/10 border border-primary/30 rounded-full text-primary font-semibold text-sm">
                                        {item.year}
                                    </span>
                                </div>

                                <div className="pt-8 md:pt-0">
                                    <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-yellow-300/5 to-yellow-500/10" />

                <div className="container mx-auto px-4 relative z-10">
                    <ScrollReveal>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="max-w-4xl mx-auto text-center p-12 md:p-16 rounded-3xl border border-primary/30 bg-card/50 backdrop-blur-sm"
                        >
                            <Star className="w-16 h-16 text-yellow-500 mx-auto mb-6 animate-pulse" />

                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                Ready to Find Your Perfect Piece?
                            </h2>

                            <p className="text-neutral-300 text-lg mb-8 max-w-2xl mx-auto">
                                Explore our exquisite collection and discover jewelry that tells your unique story
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                >
                                    Shop Now
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary/10 transition-colors"
                                >
                                    Book Consultation
                                </motion.button>
                            </div>
                        </motion.div>
                    </ScrollReveal>
                </div>
            </section>
        </main>
    );
}
