"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Tag } from "lucide-react";
import Link from "next/link";

export default function NewCouponPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        discount_type: "percentage", // 'percentage' | 'fixed'
        discount_value: "",
        min_order_value: "0",
        valid_from: new Date().toISOString().split('T')[0], // Today's date
        valid_until: "",
        is_active: true
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === "code") {
            // Force uppercase and remove spaces for code
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase().replace(/\s/g, "") }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!formData.code) throw new Error("Coupon code is required");
            if (!formData.discount_value) throw new Error("Discount value is required");
            if (!formData.valid_until) throw new Error("Expiry date is required");

            const value = parseFloat(formData.discount_value);
            if (isNaN(value) || value <= 0) throw new Error("Invalid discount value");

            if (formData.discount_type === "percentage" && value > 100) {
                throw new Error("Percentage discount cannot exceed 100%");
            }

            // Validate dates
            const validFrom = new Date(formData.valid_from);
            const validUntil = new Date(formData.valid_until);
            
            if (validUntil <= validFrom) {
                throw new Error("Expiry date must be after start date");
            }

            const { error } = await supabase
                .from("coupons")
                .insert([
                    {
                        code: formData.code,
                        discount_type: formData.discount_type,
                        discount_value: value,
                        min_order_value: parseFloat(formData.min_order_value) || 0,
                        valid_from: validFrom.toISOString(),
                        valid_until: validUntil.toISOString(),
                        is_active: formData.is_active
                    },
                ])
                .select();

            if (error) {
                console.error("Supabase error:", error);
                if (error.code === "23505") throw new Error("Coupon code already exists");
                if (error.code === "42501") throw new Error("Permission denied. Please ensure you have admin access.");
                throw new Error(error.message || "Failed to create coupon");
            }

            router.push("/admin/coupons");
            router.refresh();
        } catch (error) {
            console.error("Error creating coupon:", error);
            const message = error instanceof Error ? error.message : "Failed to create coupon";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <Link
                href="/admin/coupons"
                className="mb-6 inline-flex items-center text-sm text-neutral-400 hover:text-white"
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Coupons
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Create Coupon</h1>
                <p className="text-neutral-400">Add a new discount code for your customers.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="rounded-xl border border-neutral-800 bg-black p-6 space-y-6">

                    {/* Code */}
                    <div className="space-y-2">
                        <Label htmlFor="code" className="text-white">Coupon Code</Label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                            <Input
                                id="code"
                                name="code"
                                placeholder="e.g. SUMMER2024"
                                value={formData.code}
                                onChange={handleInputChange}
                                className="pl-10 font-mono uppercase tracking-wider"
                                required
                            />
                        </div>
                        <p className="text-xs text-neutral-500">Codes are uppercase and space-free.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Type */}
                        <div className="space-y-2">
                            <Label htmlFor="discount_type" className="text-white">Discount Type</Label>
                            <select
                                id="discount_type"
                                name="discount_type"
                                value={formData.discount_type}
                                onChange={handleInputChange}
                                className="flex h-10 w-full rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                        </div>

                        {/* Value */}
                        <div className="space-y-2">
                            <Label htmlFor="discount_value" className="text-white">
                                {formData.discount_type === 'percentage' ? 'Percentage Value' : 'Amount Value'}
                            </Label>
                            <Input
                                id="discount_value"
                                name="discount_value"
                                type="number"
                                placeholder={formData.discount_type === 'percentage' ? "20" : "500"}
                                value={formData.discount_value}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Min Order Value */}
                    <div className="space-y-2">
                        <Label htmlFor="min_order_value" className="text-white">Minimum Order Value (₹)</Label>
                        <Input
                            id="min_order_value"
                            name="min_order_value"
                            type="number"
                            placeholder="0"
                            value={formData.min_order_value}
                            onChange={handleInputChange}
                        />
                        <p className="text-xs text-neutral-500">Minimum cart total required to apply this coupon.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Valid From */}
                        <div className="space-y-2">
                            <Label htmlFor="valid_from" className="text-white">Valid From</Label>
                            <Input
                                id="valid_from"
                                name="valid_from"
                                type="date"
                                value={formData.valid_from}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {/* Valid Until */}
                        <div className="space-y-2">
                            <Label htmlFor="valid_until" className="text-white">Valid Until</Label>
                            <Input
                                id="valid_until"
                                name="valid_until"
                                type="date"
                                value={formData.valid_until}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                            className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                        />
                        <Label htmlFor="is_active" className="text-white">Active immediately</Label>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-yellow-500 text-black hover:bg-yellow-400"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        "Create Coupon"
                    )}
                </Button>
            </form>
        </div>
    );
}
