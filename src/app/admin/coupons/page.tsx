"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Loader2, Trash, Percent, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_value: number;
    is_active: boolean;
    valid_from: string;
    valid_until: string;
    created_at: string;
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const { data, error } = await supabase
                .from("coupons")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setCoupons(data || []);
        } catch (error) {
            console.error("Error fetching coupons:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteCoupon = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;

        try {
            const { error } = await supabase
                .from("coupons")
                .delete()
                .eq("id", id);

            if (error) throw error;
            setCoupons(coupons.filter((c) => c.id !== id));
        } catch (error) {
            console.error("Error deleting coupon:", error);
            alert("Failed to delete coupon");
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("coupons")
                .update({ is_active: !currentStatus })
                .eq("id", id);

            if (error) throw error;

            setCoupons(coupons.map(c =>
                c.id === id ? { ...c, is_active: !currentStatus } : c
            ));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    const filteredCoupons = coupons.filter(coupon =>
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Coupons</h1>
                    <p className="text-neutral-400">Manage discount codes and promotions.</p>
                </div>
                <Link
                    href="/admin/coupons/new"
                    className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-400"
                >
                    <Plus className="h-5 w-5" />
                    Create Coupon
                </Link>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-black p-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search coupons by code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg bg-neutral-900 py-2 pl-10 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                </div>
            </div>

            {/* Coupons Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                    </div>
                ) : filteredCoupons.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-neutral-500">
                        No coupons found.
                    </div>
                ) : (
                    filteredCoupons.map((coupon) => (
                        <div
                            key={coupon.id}
                            className={`group relative overflow-hidden rounded-xl border p-6 transition-all ${coupon.is_active
                                    ? "border-neutral-800 bg-neutral-900/50 hover:border-yellow-500/50"
                                    : "border-neutral-800 bg-neutral-950 opacity-60"
                                }`}
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${coupon.discount_type === 'percentage'
                                            ? "bg-blue-500/10 text-blue-500"
                                            : "bg-green-500/10 text-green-500"
                                        }`}>
                                        {coupon.discount_type === 'percentage' ? <Percent className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-mono text-lg font-bold text-white tracking-wider">{coupon.code}</h3>
                                        <p className="text-xs text-neutral-400">
                                            {coupon.discount_type === 'percentage' ? 'Percentage Discount' : 'Fixed Amount'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                                        className={`rounded-full px-2 py-1 text-xs font-medium transition-colors ${coupon.is_active
                                                ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                                            }`}
                                    >
                                        {coupon.is_active ? "Active" : "Inactive"}
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6 space-y-2">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">
                                        {coupon.discount_type === 'fixed' ? '₹' : ''}{coupon.discount_value}{coupon.discount_type === 'percentage' ? '%' : ''}
                                    </span>
                                    <span className="text-sm text-neutral-400">OFF</span>
                                </div>
                                {coupon.min_order_value > 0 && (
                                    <p className="text-sm text-neutral-400">
                                        Min. order: ₹{coupon.min_order_value}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 border-t border-neutral-800 pt-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-neutral-500">Valid until:</span>
                                    <span className={`font-medium ${new Date(coupon.valid_until) < new Date() ? 'text-red-400' : 'text-neutral-300'}`}>
                                        {new Date(coupon.valid_until).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-neutral-500">
                                        Created {new Date(coupon.created_at).toLocaleDateString()}
                                    </span>
                                    <button
                                        onClick={() => deleteCoupon(coupon.id)}
                                        className="rounded p-2 text-neutral-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                        title="Delete Coupon"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
