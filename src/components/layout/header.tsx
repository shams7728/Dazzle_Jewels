"use client";

import Link from "next/link";
import { ShoppingBag, Menu, Search, User, Heart, Sparkles, ChevronDown } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Category } from "@/types";

function WishlistBadge() {
    const items = useWishlistStore((state) => state.items);

    if (items.length === 0) return null;

    return (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {items.length}
        </span>
    );
}

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SearchModal } from "@/components/search/search-modal";
import { useSearchStore } from "@/lib/store/search";

export function Header() {
    const { items } = useCartStore();
    const setSearchOpen = useSearchStore((state) => state.setIsOpen);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);

    // Fetch categories from database
    useEffect(() => {
        async function fetchCategories() {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });
            
            if (data && !error) {
                setCategories(data);
            }
        }
        fetchCategories();
    }, []);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-neutral-800/50 bg-black/95 backdrop-blur-xl">
                <div className="container mx-auto px-4">
                    {/* Main Header */}
                    <div className="flex h-16 sm:h-18 lg:h-20 items-center justify-between gap-2 sm:gap-4">
                        {/* Mobile Menu */}
                        <div className="lg:hidden">
                            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="lg:hidden">
                                        <Menu className="h-6 w-6 text-white" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[300px] bg-black border-neutral-800">
                                    <SheetHeader>
                                        <SheetTitle className="text-left text-yellow-500 font-bold">Menu</SheetTitle>
                                    </SheetHeader>
                                    <nav className="flex flex-col gap-4 mt-8">
                                        <Link
                                            href="/"
                                            className="flex items-center gap-3 text-lg font-medium text-white hover:text-yellow-500 transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Sparkles className="h-5 w-5" />
                                            Home
                                        </Link>
                                        
                                        {/* Mobile Categories */}
                                        <div className="flex flex-col gap-2 border-t border-neutral-800 pt-4">
                                            <span className="text-sm font-semibold text-yellow-500/70 uppercase tracking-wider">Categories</span>
                                            {categories.map((category) => (
                                                <Link
                                                    key={category.id}
                                                    href={`/products?category=${category.slug}`}
                                                    className="text-base font-medium text-neutral-300 hover:text-yellow-500 transition-colors pl-4"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    {category.name}
                                                </Link>
                                            ))}
                                        </div>

                                        <Link
                                            href="/collections"
                                            className="text-lg font-medium text-white hover:text-yellow-500 transition-colors border-t border-neutral-800 pt-4"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Collections
                                        </Link>
                                        <Link
                                            href="/about"
                                            className="text-lg font-medium text-white hover:text-yellow-500 transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            About
                                        </Link>
                                        <Link
                                            href="/reels"
                                            className="text-lg font-medium text-yellow-500 hover:text-yellow-400 transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Reels
                                        </Link>

                                        {/* Mobile-only links */}
                                        <div className="flex flex-col gap-4 border-t border-neutral-800 pt-4 mt-4">
                                            <Link
                                                href="/wishlist"
                                                className="flex items-center gap-3 text-lg font-medium text-white hover:text-yellow-500 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <Heart className="h-5 w-5" />
                                                Wishlist
                                                <WishlistBadge />
                                            </Link>
                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-3 text-lg font-medium text-white hover:text-yellow-500 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <User className="h-5 w-5" />
                                                Profile
                                            </Link>
                                        </div>
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Logo - Optimized for Mobile */}
                        <Link href="/" className="group flex items-center gap-2 sm:gap-3 relative flex-1 lg:flex-initial">
                            {/* Animated glow effect - Desktop only */}
                            <div className="hidden lg:block absolute -inset-3 bg-gradient-to-r from-yellow-500/20 via-yellow-400/30 to-yellow-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                            
                            {/* Logo container with animation */}
                            <div className="relative h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 overflow-hidden rounded-full border-2 border-yellow-500/40 group-hover:border-yellow-400/80 transition-all duration-300 lg:duration-500 lg:group-hover:scale-110 lg:group-hover:rotate-[360deg] shadow-lg lg:shadow-xl shadow-yellow-500/30 group-hover:shadow-yellow-400/50 flex-shrink-0">
                                <img 
                                    src="/logo-white.jpg" 
                                    alt="Dazzle Jewels Logo" 
                                    className="h-full w-full object-cover"
                                />
                                
                                {/* Shimmer overlay on hover - Desktop only */}
                                <div className="hidden lg:block absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />
                                
                                {/* Sparkle effect - Desktop only */}
                                <div className="hidden lg:block absolute top-1 right-1 opacity-0 group-hover:opacity-100">
                                    <Sparkles className="h-3 w-3 text-yellow-300 animate-sparkle" />
                                </div>
                            </div>
                            
                            {/* Brand name - Always visible, responsive sizing */}
                            <div className="flex flex-col justify-center">
                                <span className="text-base sm:text-lg lg:text-2xl font-bold tracking-tight bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent group-hover:from-yellow-300 group-hover:via-yellow-400 group-hover:to-yellow-300 transition-all duration-300 lg:duration-500 flex items-center gap-1 sm:gap-2 animate-shimmer bg-[length:200%_auto] leading-tight">
                                    Dazzle Jewels
                                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-sparkle" />
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-8">
                            <Link 
                                href="/" 
                                className="text-sm font-medium text-neutral-300 hover:text-yellow-500 transition-colors relative group"
                            >
                                Home
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300" />
                            </Link>

                            {/* Categories Dropdown */}
                            <div 
                                className="relative"
                                onMouseEnter={() => setShowCategoriesDropdown(true)}
                                onMouseLeave={() => setShowCategoriesDropdown(false)}
                            >
                                <button className="text-sm font-medium text-neutral-300 hover:text-yellow-500 transition-colors flex items-center gap-1 group">
                                    Categories
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showCategoriesDropdown ? 'rotate-180' : ''}`} />
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300" />
                                </button>

                                {/* Mega Menu Dropdown */}
                                {showCategoriesDropdown && categories.length > 0 && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] bg-neutral-900/98 backdrop-blur-xl border border-neutral-800 rounded-xl shadow-2xl shadow-yellow-500/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="p-6">
                                            <h3 className="text-sm font-semibold text-yellow-500 uppercase tracking-wider mb-4">Shop by Category</h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                {categories.map((category) => (
                                                    <Link
                                                        key={category.id}
                                                        href={`/products?category=${category.slug}`}
                                                        className="group/item flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-neutral-800/50 transition-all duration-300"
                                                        onClick={() => setShowCategoriesDropdown(false)}
                                                    >
                                                        {category.image_url ? (
                                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-neutral-700 group-hover/item:border-yellow-500 transition-all duration-300 group-hover/item:scale-110">
                                                                <img 
                                                                    src={category.image_url} 
                                                                    alt={category.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-2 border-neutral-700 group-hover/item:border-yellow-500 transition-all duration-300 group-hover/item:scale-110 flex items-center justify-center">
                                                                <Sparkles className="h-6 w-6 text-yellow-500" />
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-medium text-neutral-300 group-hover/item:text-yellow-500 transition-colors text-center">
                                                            {category.name}
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-neutral-800/50 px-6 py-3 border-t border-neutral-700">
                                            <Link 
                                                href="/products" 
                                                className="text-sm text-yellow-500 hover:text-yellow-400 font-medium flex items-center gap-2 group/all"
                                                onClick={() => setShowCategoriesDropdown(false)}
                                            >
                                                View All Products
                                                <span className="group-hover/all:translate-x-1 transition-transform">→</span>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link 
                                href="/collections" 
                                className="text-sm font-medium text-neutral-300 hover:text-yellow-500 transition-colors relative group"
                            >
                                Collections
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300" />
                            </Link>
                            <Link 
                                href="/about" 
                                className="text-sm font-medium text-neutral-300 hover:text-yellow-500 transition-colors relative group"
                            >
                                About
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300" />
                            </Link>
                            <Link 
                                href="/reels" 
                                className="text-sm font-medium text-yellow-500 hover:text-yellow-400 transition-colors relative group"
                            >
                                Reels
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300" />
                            </Link>
                        </nav>

                        {/* Actions - Optimized for Mobile */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setSearchOpen(true)}
                                className="hover:bg-neutral-800 transition-colors h-9 w-9 sm:h-10 sm:w-10"
                            >
                                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                asChild
                                className="hover:bg-neutral-800 transition-colors h-9 w-9 sm:h-10 sm:w-10 hidden sm:flex"
                            >
                                <Link href="/wishlist" className="relative">
                                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    <WishlistBadge />
                                </Link>
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                asChild
                                className="hover:bg-neutral-800 transition-colors h-9 w-9 sm:h-10 sm:w-10 hidden sm:flex"
                            >
                                <Link href="/profile">
                                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative hover:bg-neutral-800 transition-colors h-9 w-9 sm:h-10 sm:w-10"
                                asChild
                            >
                                <Link href="/cart">
                                    <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    {items.length > 0 && (
                                        <span className="absolute -right-0.5 -top-0.5 sm:-right-1 sm:-top-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-yellow-500 text-[9px] sm:text-[10px] font-bold text-black">
                                            {items.length}
                                        </span>
                                    )}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>
            <SearchModal />
        </>
    );
}
