"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Coupon } from "@/types";
import { Tag, Copy, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function CouponBanner() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCoupons() {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (data && !error) {
                setCoupons(data);
            }
        }
        fetchCoupons();
    }, []);

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (coupons.length === 0) return null;

    // Duplicate coupons for seamless loop
    const duplicatedCoupons = [...coupons, ...coupons, ...coupons];

    return (
        <div className="relative w-full bg-gradient-to-r from-primary/10 via-pink-400/5 to-primary/10 border-y border-primary/20 overflow-hidden py-4">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />

            {/* Sparkle decorations */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </div>

            {/* Scrolling container */}
            <div className="relative flex gap-4 animate-scroll-left hover:pause-animation">
                {duplicatedCoupons.map((coupon, index) => (
                    <motion.div
                        key={`${coupon.id}-${index}`}
                        className="flex-shrink-0 group"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="relative flex items-center gap-3 px-6 py-3 bg-card border border-primary/30 rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer"
                            onClick={() => copyToClipboard(coupon.code)}
                        >
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />

                            {/* Icon */}
                            <div className="relative flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full border border-primary/30 group-hover:border-primary/60 transition-colors">
                                <Tag className="h-5 w-5 text-primary" />
                            </div>

                            {/* Content */}
                            <div className="relative flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-primary tracking-wider">
                                        {coupon.code}
                                    </span>
                                    {copiedCode === coupon.code ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    )}
                                </div>
                                <span className="text-xs text-neutral-400">
                                    {coupon.discount_type === 'percentage'
                                        ? `${coupon.discount_value}% OFF`
                                        : `₹${coupon.discount_value} OFF`}
                                    {coupon.min_order_value > 0 && ` on orders above ₹${coupon.min_order_value}`}
                                </span>
                            </div>

                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-lg" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        </div>
    );
}
