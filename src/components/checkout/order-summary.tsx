"use client";

import Image from "next/image";
import { CartItem } from "@/lib/store/cart";
import { CouponInput } from "./coupon-input";
import { Sparkles } from "lucide-react";

interface OrderSummaryProps {
    items: CartItem[];
    subtotal: number;
    discount: number;
    deliveryCharge: number;
    tax: number;
    total: number;
    couponCode?: string;
    onCouponApplied: (discount: number, couponCode: string) => void;
    onCouponRemoved: () => void;
    showCouponInput?: boolean;
}

export function OrderSummary({
    items,
    subtotal,
    discount,
    deliveryCharge,
    tax,
    total,
    couponCode,
    onCouponApplied,
    onCouponRemoved,
    showCouponInput = true,
}: OrderSummaryProps) {
    const calculateItemPrice = (item: CartItem): number => {
        let basePrice = item.product.base_price;
        if (item.product.discount_price && item.product.discount_price < basePrice) {
            basePrice = item.product.discount_price;
        }

        const price = item.variant
            ? basePrice + item.variant.price_adjustment
            : basePrice;

        return price * item.quantity;
    };

    const appliedCoupon = couponCode
        ? {
              code: couponCode,
              discount_value: discount,
              discount_type: "fixed" as const,
          }
        : null;

    return (
        <div className="space-y-6">
            {/* Items List */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-neutral-400">Order Items</h3>
                <div className="space-y-3">
                    {items.map((item) => {
                        const itemPrice = calculateItemPrice(item);
                        const unitPrice = itemPrice / item.quantity;

                        return (
                            <div
                                key={`${item.product.id}-${item.variant?.id || "default"}`}
                                className="flex gap-3"
                            >
                                {/* Product Image */}
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                                    {item.variant?.images?.[0] ? (
                                        <Image
                                            src={item.variant.images[0]}
                                            alt={item.product.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-neutral-600">
                                            <Sparkles className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>

                                {/* Product Details */}
                                <div className="flex flex-1 flex-col justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {item.product.title}
                                        </p>
                                        {item.variant && (
                                            <p className="text-xs text-neutral-400">
                                                {item.variant.color && `Color: ${item.variant.color}`}
                                                {item.variant.material && ` • ${item.variant.material}`}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-neutral-400">
                                            Qty: {item.quantity}
                                        </span>
                                        <span className="text-sm font-medium text-white">
                                            ₹{unitPrice.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Item Total */}
                                <div className="flex items-center">
                                    <span className="text-sm font-semibold text-white">
                                        ₹{itemPrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Coupon Input */}
            {showCouponInput && (
                <div>
                    <h3 className="mb-3 text-sm font-medium text-neutral-400">Apply Coupon</h3>
                    <CouponInput
                        subtotal={subtotal}
                        onCouponApplied={onCouponApplied}
                        onCouponRemoved={onCouponRemoved}
                        appliedCoupon={appliedCoupon}
                    />
                </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-3 border-t border-neutral-800 pt-4">
                <h3 className="text-sm font-medium text-neutral-400">Price Details</h3>
                
                <div className="space-y-2">
                    {/* Subtotal */}
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Subtotal</span>
                        <span className="text-white">₹{subtotal.toFixed(2)}</span>
                    </div>

                    {/* Discount */}
                    {discount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-green-500">
                                Discount {couponCode && `(${couponCode})`}
                            </span>
                            <span className="text-green-500">-₹{discount.toFixed(2)}</span>
                        </div>
                    )}

                    {/* Delivery Charge */}
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Delivery Charges</span>
                        <span className="text-white">
                            {deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : 'FREE'}
                        </span>
                    </div>

                    {/* Tax */}
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Tax (GST)</span>
                        <span className="text-white">₹{tax.toFixed(2)}</span>
                    </div>
                </div>

                {/* Total Savings */}
                {discount > 0 && (
                    <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-500">
                                Total Savings
                            </span>
                            <span className="text-sm font-bold text-green-500">
                                ₹{discount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Free Shipping Message */}
                {deliveryCharge === 0 && subtotal >= 500 && (
                    <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                        <p className="text-center text-sm font-medium text-green-500">
                            🎉 You're getting FREE delivery!
                        </p>
                    </div>
                )}

                {/* Total */}
                <div className="flex justify-between border-t border-neutral-800 pt-3">
                    <span className="text-lg font-bold text-white">Total Amount</span>
                    <span className="text-lg font-bold text-yellow-500">
                        ₹{total.toFixed(2)}
                    </span>
                </div>

                {/* Savings Summary */}
                {(discount > 0 || deliveryCharge === 0) && (
                    <div className="text-center text-xs text-neutral-400">
                        You're saving ₹
                        {(discount + (deliveryCharge === 0 ? 50 : 0)).toFixed(2)} on this order
                    </div>
                )}
            </div>
        </div>
    );
}
