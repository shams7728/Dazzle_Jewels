"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Package, User, Heart, LogOut, LayoutDashboard, ChevronRight, Calendar, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/lib/store/wishlist";
import gsap from "gsap";

interface UserProfile {
    id: string;
    full_name: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    role: string | null;
}

interface OrderItem {
    id: string;
    quantity: number;
    price_at_purchase: number;
    variant?: {
        images?: string[];
        product?: {
            title: string;
        };
    };
}

interface Order {
    id: string;
    order_number: string;
    created_at: string;
    total: number;
    status: string;
    payment_status: string;
    items?: OrderItem[];
}

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "settings">("orders");
    const wishlistItems = useWishlistStore((state) => state.items);
    const contentRef = useRef<HTMLDivElement>(null);
    const orderCardsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", user.id)
                        .single();

                    setProfile(profile);

                    const { data: orders } = await supabase
                        .from("orders")
                        .select("*, items:order_items(*, variant:product_variants(*, product:products(*)))")
                        .eq("user_id", user.id)
                        .order("created_at", { ascending: false });
                    
                    setOrders(orders || []);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // GSAP animations for tab changes
    useEffect(() => {
        if (contentRef.current) {
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
            );
        }
    }, [activeTab]);

    // GSAP animations for order cards
    useEffect(() => {
        if (orders.length > 0 && activeTab === "orders") {
            gsap.fromTo(
                orderCardsRef.current.filter(Boolean),
                { opacity: 0, y: 30, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power3.out",
                }
            );
        }
    }, [orders, activeTab]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
                <div className="h-24 w-24 rounded-full bg-neutral-900 flex items-center justify-center mb-6 border border-neutral-800">
                    <User className="h-12 w-12 text-yellow-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Welcome to Dazzle Jewels</h1>
                <p className="text-neutral-400 max-w-md mb-8 text-lg">
                    Sign in to view your orders, manage your wishlist, and access exclusive offers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                    <Link href="/login" className="w-full">
                        <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold h-12 text-base">
                            Log In
                        </Button>
                    </Link>
                    <Link href="/signup" className="w-full">
                        <Button variant="outline" className="w-full border-neutral-700 text-white hover:bg-neutral-800 hover:text-white h-12 text-base">
                            Sign Up
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* ... (header) ... */}

            <div className="grid gap-8 lg:grid-cols-4">
                {/* Sidebar */}
                <div className="space-y-2 lg:col-span-1">
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${activeTab === "orders"
                            ? "bg-yellow-500 text-black"
                            : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                            }`}
                    >
                        <Package className="h-5 w-5" />
                        <span className="font-medium">Orders</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("wishlist")}
                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${activeTab === "wishlist"
                            ? "bg-yellow-500 text-black"
                            : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                            }`}
                    >
                        <Heart className="h-5 w-5" />
                        <span className="font-medium">Wishlist</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${activeTab === "settings"
                            ? "bg-yellow-500 text-black"
                            : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                            }`}
                    >
                        <User className="h-5 w-5" />
                        <span className="font-medium">Settings</span>
                    </button>

                    {profile?.role === 'admin' && (
                        <Link
                            href="/admin"
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-yellow-500 hover:bg-neutral-900 hover:text-yellow-400 transition-colors"
                        >
                            <LayoutDashboard className="h-5 w-5" />
                            <span className="font-medium">Admin Dashboard</span>
                        </Link>
                    )}

                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            router.push("/login");
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-red-500 hover:bg-neutral-900 hover:text-red-400 transition-colors mt-4 border-t border-neutral-800 pt-4"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Log Out</span>
                    </button>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    {activeTab === "orders" ? (
                        <div ref={contentRef} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">Order History</h2>
                                <p className="text-sm text-neutral-400">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
                            </div>
                            {orders.length > 0 ? (
                                <div className="space-y-4">
                                    {orders.map((order, index) => {
                                        const statusColors = {
                                            pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                                            confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                                            processing: "bg-purple-500/10 text-purple-500 border-purple-500/20",
                                            shipped: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
                                            delivered: "bg-green-500/10 text-green-500 border-green-500/20",
                                            cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
                                        };
                                        
                                        return (
                                            <div
                                                key={order.id}
                                                ref={(el) => { orderCardsRef.current[index] = el; }}
                                                className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-900/90 to-neutral-900/50 backdrop-blur-sm transition-all duration-300 hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/5"
                                            >
                                                {/* Decorative gradient overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                                
                                                <div className="relative p-3 sm:p-4">
                                                    {/* Header */}
                                                    <div className="mb-3 flex flex-col gap-2.5 border-b border-neutral-800/50 pb-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <Package className="h-3.5 w-3.5 text-yellow-500" />
                                                                <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Order Number</p>
                                                            </div>
                                                            <p className="font-mono text-base font-bold text-white">{order.order_number}</p>
                                                        </div>
                                                        
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <div className="flex items-center gap-1.5 rounded-lg bg-neutral-800/50 px-2.5 py-1.5">
                                                                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                                                                <span className="text-xs text-neutral-300">
                                                                    {new Date(order.created_at).toLocaleDateString('en-US', { 
                                                                        month: 'short', 
                                                                        day: 'numeric', 
                                                                        year: 'numeric' 
                                                                    })}
                                                                </span>
                                                            </div>
                                                            
                                                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusColors[order.status as keyof typeof statusColors] || statusColors.pending}`}>
                                                                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Order Items */}
                                                    <div className="mb-3 space-y-1.5">
                                                        {order.items?.slice(0, 1).map((item: OrderItem) => {
                                                            const productImage = item.variant?.images?.[0];
                                                            const itemPrice = Number(item.price_at_purchase) || 0;
                                                            const itemTotal = item.quantity * itemPrice;
                                                            
                                                            return (
                                                                <div key={item.id} className="flex items-center gap-2.5 rounded-lg bg-neutral-800/30 p-2 transition-colors hover:bg-neutral-800/50">
                                                                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-neutral-800">
                                                                        {productImage ? (
                                                                            <Image
                                                                                src={productImage}
                                                                                alt={item.variant?.product?.title || "Product"}
                                                                                fill
                                                                                className="object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="flex h-full items-center justify-center">
                                                                                <Package className="h-4 w-4 text-neutral-600" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-white truncate">
                                                                            {item.variant?.product?.title || "Product"}
                                                                        </p>
                                                                        <p className="text-xs text-neutral-400">
                                                                            Qty: {item.quantity}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        {order.items && order.items.length > 1 && (
                                                            <p className="text-center text-xs text-neutral-400 py-0.5">
                                                                +{order.items.length - 1} more {order.items.length - 1 === 1 ? 'item' : 'items'}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="flex flex-col gap-2 border-t border-neutral-800/50 pt-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="flex items-center gap-3 sm:gap-5">
                                                            <div>
                                                                <p className="text-xs text-neutral-400">Payment</p>
                                                                <div className="mt-0.5 flex items-center gap-1">
                                                                    <CreditCard className="h-3 w-3 text-neutral-400" />
                                                                    <span className="text-xs font-medium capitalize text-neutral-300">
                                                                        {order.payment_status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-neutral-400">Total Amount</p>
                                                                <p className="mt-0.5 text-lg font-bold text-yellow-500">₹{Number(order.total).toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="group/btn h-8 border-neutral-700 bg-neutral-800/50 text-xs text-white hover:border-yellow-500 hover:bg-yellow-500 hover:text-black"
                                                        >
                                                            View Details
                                                            <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 p-16 text-center backdrop-blur-sm">
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800/50">
                                        <Package className="h-10 w-10 text-neutral-600" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-white">No orders yet</h3>
                                    <p className="mb-6 text-neutral-400">
                                        Start shopping to see your orders here
                                    </p>
                                    <Button 
                                        className="bg-yellow-500 text-black hover:bg-yellow-400"
                                        onClick={() => router.push("/products")}
                                    >
                                        Browse Products
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : activeTab === "wishlist" ? (
                        <div ref={contentRef} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">My Wishlist</h2>
                                <p className="text-sm text-neutral-400">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}</p>
                            </div>
                            {wishlistItems.length > 0 ? (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {wishlistItems.map((product) => {
                                        const image = product.variants?.[0]?.images?.[0] || "/placeholder.svg";
                                        return (
                                            <Link
                                                key={product.id}
                                                href={`/products/${product.id}`}
                                                className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900/90 to-neutral-900/50 backdrop-blur-sm transition-all duration-300 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10"
                                            >
                                                <div className="relative aspect-square overflow-hidden bg-neutral-800">
                                                    <Image
                                                        src={image}
                                                        alt={product.title}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                                </div>
                                                <div className="p-5">
                                                    <h3 className="mb-2 font-semibold text-white line-clamp-2 group-hover:text-yellow-500 transition-colors">{product.title}</h3>
                                                    <p className="text-lg font-bold text-yellow-500">₹{product.base_price}</p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 p-16 text-center backdrop-blur-sm">
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800/50">
                                        <Heart className="h-10 w-10 text-neutral-600" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-white">Your wishlist is empty</h3>
                                    <p className="mb-6 text-neutral-400">
                                        Save your favorite items to view them here
                                    </p>
                                    <Button 
                                        className="bg-yellow-500 text-black hover:bg-yellow-400"
                                        onClick={() => router.push("/products")}
                                    >
                                        Browse Products
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div ref={contentRef} className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Account Settings</h2>
                            <div className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900/90 to-neutral-900/50 p-8 backdrop-blur-sm">
                                <form className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-neutral-300">Full Name</Label>
                                            <Input 
                                                defaultValue={profile?.full_name || ""} 
                                                disabled 
                                                className="border-neutral-700 bg-neutral-800/50 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-neutral-300">Email</Label>
                                            <Input 
                                                defaultValue={user?.email || ""} 
                                                disabled 
                                                className="border-neutral-700 bg-neutral-800/50 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-neutral-300">Phone</Label>
                                            <Input 
                                                defaultValue={profile?.phone || ""} 
                                                placeholder="Add phone number" 
                                                className="border-neutral-700 bg-neutral-800/50 text-white placeholder:text-neutral-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-neutral-300">Role</Label>
                                            <Input 
                                                defaultValue={profile?.role || "customer"} 
                                                disabled 
                                                className="border-neutral-700 bg-neutral-800/50 text-white capitalize"
                                            />
                                        </div>
                                    </div>
                                    <Button disabled className="bg-neutral-700 text-neutral-400">
                                        Save Changes (Coming Soon)
                                    </Button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
