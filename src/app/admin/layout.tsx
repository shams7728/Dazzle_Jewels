"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Ticket, Video, Users, Settings, Loader2, Menu, X } from 'lucide-react';
import { supabase } from "@/lib/supabase";

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Package, label: 'Products', href: '/admin/products' },
    { icon: Package, label: 'Categories', href: '/admin/categories' },
    { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
    { icon: Ticket, label: 'Coupons', href: '/admin/coupons' },
    { icon: Video, label: 'Reels', href: '/admin/reels' },
    { icon: Ticket, label: 'Posters', href: '/admin/posters' },
    { icon: Users, label: 'Customers', href: '/admin/customers' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAdmin();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkAdmin = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            console.log('Admin Check - User:', user);
            console.log('Admin Check - User ID:', user?.id);

            if (!user) {
                console.log('Admin Check - No user found, redirecting to login');
                router.push('/login');
                return;
            }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            console.log('Admin Check - Profile Data:', profile);
            console.log('Admin Check - Profile Role:', profile?.role);
            console.log('Admin Check - Error:', error);
            console.log('Admin Check - Error Message:', error?.message);
            console.log('Admin Check - Error Details:', JSON.stringify(error, null, 2));

            if (error) {
                console.error('Admin Check - Query failed with error:', error);
                router.push('/unauthorized');
                return;
            }

            if (!profile) {
                console.error('Admin Check - No profile found for user');
                router.push('/unauthorized');
                return;
            }

            if (profile?.role !== 'admin') {
                console.log('Admin Check - Not admin, role is:', profile?.role);
                router.push('/unauthorized');
                return;
            }

            console.log('Admin Check - SUCCESS! User is admin');
            setIsAdmin(true);
        } catch (error) {
            console.error('Error checking admin status (catch block):', error);
            router.push('/unauthorized');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="flex h-screen bg-neutral-900 text-white">
            {/* Mobile Header */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-neutral-800 bg-black p-4 lg:hidden">
                <span className="text-xl font-bold tracking-tight text-white">Admin Dashboard</span>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-900 hover:text-white"
                >
                    {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-64 border-r border-neutral-800 bg-black p-6
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                lg:block
            `}>
                <div className="mb-8 hidden lg:block">
                    <h1 className="text-xl font-bold tracking-tight text-white">Admin Panel</h1>
                </div>
                <nav className="space-y-2 mt-16 lg:mt-0">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                                    isActive
                                        ? 'bg-neutral-900 text-yellow-500'
                                        : 'text-neutral-400 hover:bg-neutral-900 hover:text-yellow-500'
                                }`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-neutral-950 p-4 pt-20 lg:p-8 lg:pt-8">
                <div className="mx-auto max-w-6xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
