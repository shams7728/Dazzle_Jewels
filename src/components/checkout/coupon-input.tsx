"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Tag, X, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cache, CacheKeys, CacheTTL } from "@/lib/utils/cache";

interface AppliedCoupon {
    code: string;
    discount_value: number;
    discount_type: "percentage" | "fixed";
}

interface CouponInputProps {
    subtotal: number;
    onCouponApplied: (discount: number, couponCode: string) => void;
    onCouponRemoved: () => void;
    appliedCoupon?: AppliedCoupon | null;
}

export function CouponInput({
    subtotal,
    onCouponApplied,
    onCouponRemoved,
    appliedCoupon = null,
}: CouponInputProps) {
    const [couponCode, setCouponCode] = useState("");
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [suggestedCoupons, setSuggestedCoupons] = useState<string[]>([]);

    const calculateDiscount = (coupon: AppliedCoupon, orderSubtotal: number): number => {
        if (coupon.discount_type === "percentage") {
            return (orderSubtotal * coupon.discount_value) / 100;
        } else {
            return Math.min(coupon.discount_value, orderSubtotal);
        }
    };

    const fetchAlternativeCoupons = async () => {
        try {
            // Try to get from cache first
            const cacheKey = CacheKeys.activeCoupons();
            const cachedCoupons = cache.get<string[]>(cacheKey);
            
            if (cachedCoupons) {
                // Filter cached coupons by subtotal
                const eligible = cachedCoupons.slice(0, 3);
                setSuggestedCoupons(eligible);
                return;
            }

            // Fetch active coupons that the user might be eligible for
            const { data: coupons } = await supabase
                .from("coupons")
                .select("code")
                .eq("is_active", true)
                .lte("min_order_value", subtotal)
                .gte("valid_until", new Date().toISOString())
                .limit(3);

            if (coupons && coupons.length > 0) {
                const codes = coupons.map(c => c.code);
                setSuggestedCoupons(codes);
                
                // Cache the results
                cache.set(cacheKey, codes, CacheTTL.activeCoupons);
            }
        } catch (err) {
            console.error("Error fetching alternative coupons:", err);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setError("Please enter a coupon code");
            setSuggestedCoupons([]);
            return;
        }

        setValidating(true);
        setError("");
        setSuggestedCoupons([]);

        try {
            const upperCode = couponCode.toUpperCase();
            
            // Try to get from cache first
            const cacheKey = CacheKeys.couponByCode(upperCode);
            let coupon = cache.get<any>(cacheKey);
            
            if (!coupon) {
                // Fetch coupon from database
                const { data, error: fetchError } = await supabase
                    .from("coupons")
                    .select("*")
                    .eq("code", upperCode)
                    .eq("is_active", true)
                    .single();
                
                coupon = data;
                
                // Cache the coupon if found
                if (coupon && !fetchError) {
                    cache.set(cacheKey, coupon, CacheTTL.coupon);
                }
            }
            
            const fetchError = !coupon;

            if (fetchError || !coupon) {
                setError("Invalid coupon code. Please check the code and try again.");
                // Fetch alternative coupons
                await fetchAlternativeCoupons();
                setValidating(false);
                return;
            }

            // Check validity dates first
            const now = new Date();
            const validFrom = new Date(coupon.valid_from);
            const validUntil = new Date(coupon.valid_until);

            if (now < validFrom) {
                const startDate = validFrom.toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                });
                setError(`This coupon will be valid from ${startDate}. Please try again after that date.`);
                await fetchAlternativeCoupons();
                setValidating(false);
                return;
            }

            if (now > validUntil) {
                const expiryDate = validUntil.toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                });
                setError(`This coupon expired on ${expiryDate}. Try one of our active coupons below.`);
                await fetchAlternativeCoupons();
                setValidating(false);
                return;
            }

            // Validate minimum order value
            if (coupon.min_order_value && subtotal < coupon.min_order_value) {
                const remaining = coupon.min_order_value - subtotal;
                setError(
                    `Add ₹${remaining.toFixed(2)} more to your cart to use this coupon. Minimum order value: ₹${coupon.min_order_value.toFixed(2)}`
                );
                setValidating(false);
                return;
            }

            // Check usage limit
            if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
                setError("This coupon has reached its maximum usage limit. Try one of our other active coupons below.");
                await fetchAlternativeCoupons();
                setValidating(false);
                return;
            }

            // Calculate discount
            const appliedCouponData: AppliedCoupon = {
                code: coupon.code,
                discount_value: coupon.discount_value,
                discount_type: coupon.discount_type,
            };

            const discount = calculateDiscount(appliedCouponData, subtotal);

            // Apply coupon
            onCouponApplied(discount, coupon.code);
            
            // Show success animation
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
            
            // Clear input and suggestions
            setCouponCode("");
            setSuggestedCoupons([]);
        } catch (err) {
            console.error("Error validating coupon:", err);
            setError("Unable to validate coupon at the moment. Please try again or contact support.");
        } finally {
            setValidating(false);
        }
    };

    const handleApplySuggestedCoupon = (code: string) => {
        setCouponCode(code);
        setError("");
        setSuggestedCoupons([]);
        // Auto-apply after a short delay
        setTimeout(() => {
            handleApplyCoupon();
        }, 100);
    };

    const handleRemoveCoupon = () => {
        onCouponRemoved();
        setError("");
        setShowSuccess(false);
        setSuggestedCoupons([]);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !appliedCoupon) {
            handleApplyCoupon();
        }
    };

    return (
        <div className="space-y-3">
            {/* Coupon Input */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setError("");
                        }}
                        onKeyPress={handleKeyPress}
                        disabled={!!appliedCoupon || validating}
                        className="pl-10 uppercase"
                        aria-label="Coupon code input"
                        aria-invalid={!!error}
                        aria-describedby={error ? "coupon-error" : undefined}
                    />
                </div>

                {appliedCoupon ? (
                    <Button
                        variant="destructive"
                        onClick={handleRemoveCoupon}
                        className="min-h-[44px]"
                        aria-label="Remove applied coupon"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Remove
                    </Button>
                ) : (
                    <Button
                        variant="secondary"
                        onClick={handleApplyCoupon}
                        disabled={validating || !couponCode.trim()}
                        className="min-h-[44px]"
                        aria-label="Apply coupon code"
                    >
                        {validating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Validating...
                            </>
                        ) : (
                            "Apply"
                        )}
                    </Button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="space-y-2">
                    <div
                        id="coupon-error"
                        className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500"
                        role="alert"
                    >
                        <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                    
                    {/* Suggested Alternative Coupons */}
                    {suggestedCoupons.length > 0 && (
                        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                            <p className="text-sm font-medium text-green-500 mb-2">
                                💡 Try these active coupons instead:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {suggestedCoupons.map((code) => (
                                    <button
                                        key={code}
                                        onClick={() => handleApplySuggestedCoupon(code)}
                                        className="rounded-md border border-green-500/30 bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/30 hover:text-green-300"
                                    >
                                        {code}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Applied Coupon Display */}
            {appliedCoupon && (
                <div
                    className={`flex items-start gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-500 transition-all ${
                        showSuccess ? "scale-105" : "scale-100"
                    }`}
                    role="status"
                    aria-live="polite"
                >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-medium">
                            Coupon "{appliedCoupon.code}" applied successfully!
                        </p>
                        <p className="mt-1 text-xs text-green-400">
                            You're saving{" "}
                            {appliedCoupon.discount_type === "percentage"
                                ? `${appliedCoupon.discount_value}%`
                                : `₹${appliedCoupon.discount_value}`}{" "}
                            on this order
                        </p>
                    </div>
                </div>
            )}

            {/* Coupon Tips */}
            {!appliedCoupon && !error && (
                <div className="text-xs text-neutral-500">
                    <p>💡 Tip: Coupon codes are case-insensitive</p>
                </div>
            )}
        </div>
    );
}
