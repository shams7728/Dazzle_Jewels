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
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-xl">
                <div className="container mx-auto px-4">
                    {/* Main Header */}
                    <div className="flex h-16 sm:h-18 lg:h-20 items-center justify-between gap-2 sm:gap-4">
                        {/* Mobile Menu */}
                        <div className="lg:hidden">
                            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="lg:hidden relative group hover:bg-muted transition-all duration-300"
                                    >
                                        <div className="relative w-6 h-6 flex items-center justify-center">
                                            {/* Animated hamburger icon */}
                                            <div className={`flex flex-col gap-1.5 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}>
                                                <span className={`block h-0.5 bg-gradient-to-r from-primary to-pink-500 transition-all duration-300 ${isMobileMenuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`} />
                                                <span className={`block h-0.5 bg-gradient-to-r from-primary to-pink-500 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 w-0' : 'w-5'}`} />
                                                <span className={`block h-0.5 bg-gradient-to-r from-primary to-pink-500 transition-all duration-300 ${isMobileMenuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-4'}`} />
                                            </div>
                                        </div>
                                        {/* Glow effect on hover */}
                                        <div className="absolute inset-0 rounded-md bg-primary/0 group-hover:bg-primary/10 transition-all duration-300" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="left"
                                    className="w-[320px] sm:w-[380px] bg-background border-r border-border backdrop-blur-xl"
                                >
                                    {/* Header with logo */}
                                    <SheetHeader className="border-b border-border pb-6 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-12 w-12 rounded-full border-2 border-primary/40 overflow-hidden shadow-lg shadow-primary/30">
                                                <img
                                                    src="/logo-white.jpg"
                                                    alt="Dazzle Jewels"
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <SheetTitle className="text-left text-xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                                                    Dazzle Jewels
                                                </SheetTitle>
                                                <span className="text-xs text-muted-foreground">Luxury Jewelry Collection</span>
                                            </div>
                                        </div>
                                    </SheetHeader>

                                    {/* Navigation */}
                                    <nav className="flex flex-col gap-2">
                                        {/* Home Link */}
                                        <Link
                                            href="/"
                                            className="group flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 relative overflow-hidden"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                            <Sparkles className="h-5 w-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                                            <span className="relative z-10">Home</span>
                                        </Link>

                                        {/* Categories Section */}
                                        <div className="flex flex-col gap-1 mt-2">
                                            <div className="flex items-center gap-2 px-4 py-2">
                                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                                                <span className="text-xs font-semibold text-primary/70 uppercase tracking-wider">Categories</span>
                                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                                            </div>
                                            <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto scrollbar-hide">
                                                {categories.map((category, index) => (
                                                    <Link
                                                        key={category.id}
                                                        href={`/collections/${category.slug}`}
                                                        className="group flex items-center gap-3 px-6 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 relative overflow-hidden"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        style={{ animationDelay: `${index * 50}ms` }}
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary group-hover:scale-150 transition-all duration-300" />
                                                        <span className="relative z-10">{category.name}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Main Links */}
                                        <div className="flex flex-col gap-1 mt-2">
                                            <Link
                                                href="/collections"
                                                className="group flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 relative overflow-hidden"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                                <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-all duration-300">
                                                    <div className="w-2 h-2 rounded-sm bg-primary" />
                                                </div>
                                                <span className="relative z-10">Collections</span>
                                            </Link>
                                            <Link
                                                href="/about"
                                                className="group flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 relative overflow-hidden"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                                <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-all duration-300">
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                </div>
                                                <span className="relative z-10">About</span>
                                            </Link>
                                            <Link
                                                href="/reels"
                                                className="group flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium bg-gradient-to-r from-primary/10 to-pink-600/10 text-primary hover:from-primary/20 hover:to-pink-600/20 transition-all duration-300 relative overflow-hidden border border-primary/20"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                                <Sparkles className="h-5 w-5 relative z-10 animate-pulse" />
                                                <span className="relative z-10 font-semibold">Reels</span>
                                            </Link>
                                        </div>

                                        {/* User Actions */}
                                        <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-border">
                                            <Link
                                                href="/wishlist"
                                                className="group flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 relative overflow-hidden"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                                <div className="flex items-center gap-3 relative z-10">
                                                    <Heart className="h-5 w-5 group-hover:fill-primary transition-all duration-300" />
                                                    <span>Wishlist</span>
                                                </div>
                                                <WishlistBadge />
                                            </Link>
                                            <Link
                                                href="/profile"
                                                className="group flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 relative overflow-hidden"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                                <User className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                                                <span className="relative z-10">Profile</span>
                                            </Link>
                                        </div>
                                    </nav>

                                    {/* Footer */}
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-primary/5 to-pink-600/5 border border-primary/20">
                                            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                                            <span className="text-xs text-muted-foreground">Premium Jewelry Experience</span>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Logo - Optimized for Mobile */}
                        <Link href="/" className="group flex items-center gap-2 sm:gap-3 relative flex-1 lg:flex-initial">
                            {/* Animated glow effect - Desktop only */}
                            <div className="hidden lg:block absolute -inset-3 bg-gradient-to-r from-primary/20 via-pink-400/30 to-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />

                            {/* Logo container with animation */}
                            <div className="relative h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 overflow-hidden rounded-full border-2 border-primary/40 group-hover:border-primary/80 transition-all duration-300 lg:duration-500 lg:group-hover:scale-110 lg:group-hover:rotate-[360deg] shadow-lg lg:shadow-xl shadow-primary/30 group-hover:shadow-primary/50 flex-shrink-0">
                                <img
                                    src="/logo-white.jpg"
                                    alt="Dazzle Jewels Logo"
                                    className="h-full w-full object-cover"
                                />

                                {/* Shimmer overlay on hover - Desktop only */}
                                <div className="hidden lg:block absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />

                                {/* Sparkle effect - Desktop only */}
                                <div className="hidden lg:block absolute top-1 right-1 opacity-0 group-hover:opacity-100">
                                    <Sparkles className="h-3 w-3 text-pink-300 animate-sparkle" />
                                </div>
                            </div>

                            {/* Brand name - Always visible, responsive sizing */}
                            <div className="flex flex-col justify-center">
                                <span className="text-base sm:text-lg lg:text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-pink-500 to-primary bg-clip-text text-transparent group-hover:from-pink-400 group-hover:via-primary group-hover:to-pink-400 transition-all duration-300 lg:duration-500 flex items-center gap-1 sm:gap-2 animate-shimmer bg-[length:200%_auto] leading-tight">
                                    Dazzle Jewels
                                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 animate-sparkle" />
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-8">
                            <Link
                                href="/"
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
                            >
                                Home
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                            </Link>

                            {/* Categories Dropdown */}
                            <div
                                className="relative"
                                onMouseEnter={() => setShowCategoriesDropdown(true)}
                                onMouseLeave={() => setShowCategoriesDropdown(false)}
                            >
                                <button className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                                    Categories
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showCategoriesDropdown ? 'rotate-180' : ''}`} />
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                                </button>

                                {/* Mega Menu Dropdown */}
                                {showCategoriesDropdown && categories.length > 0 && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] bg-background/98 backdrop-blur-xl border border-border rounded-xl shadow-2xl shadow-primary/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="p-6">
                                            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Shop by Category</h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                {categories.map((category) => (
                                                    <Link
                                                        key={category.id}
                                                        href={`/collections/${category.slug}`}
                                                        className="group/item flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-muted transition-all duration-300"
                                                        onClick={() => setShowCategoriesDropdown(false)}
                                                    >
                                                        {category.image_url ? (
                                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border group-hover/item:border-primary transition-all duration-300 group-hover/item:scale-110">
                                                                <img
                                                                    src={category.image_url}
                                                                    alt={category.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-pink-600/20 border-2 border-border group-hover/item:border-primary transition-all duration-300 group-hover/item:scale-110 flex items-center justify-center">
                                                                <Sparkles className="h-6 w-6 text-primary" />
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-medium text-muted-foreground group-hover/item:text-primary transition-colors text-center">
                                                            {category.name}
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-muted/50 px-6 py-3 border-t border-border">
                                            <Link
                                                href="/products"
                                                className="text-sm text-primary hover:text-pink-400 font-medium flex items-center gap-2 group/all"
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
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
                            >
                                Collections
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                            </Link>
                            <Link
                                href="/about"
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
                            >
                                About
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                            </Link>
                            <Link
                                href="/reels"
                                className="text-sm font-medium text-primary hover:text-pink-400 transition-colors relative group"
                            >
                                Reels
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-400 group-hover:w-full transition-all duration-300" />
                            </Link>
                        </nav>

                        {/* Actions - Optimized for Mobile */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSearchOpen(true)}
                                className="hover:bg-muted transition-colors h-9 w-9 sm:h-10 sm:w-10"
                            >
                                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="hover:bg-muted transition-colors h-9 w-9 sm:h-10 sm:w-10 hidden sm:flex"
                            >
                                <Link href="/wishlist" className="relative">
                                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                                    <WishlistBadge />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="hover:bg-muted transition-colors h-9 w-9 sm:h-10 sm:w-10 hidden sm:flex"
                            >
                                <Link href="/profile">
                                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative hover:bg-muted transition-colors h-9 w-9 sm:h-10 sm:w-10"
                                asChild
                            >
                                <Link href="/cart">
                                    <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                                    {items.length > 0 && (
                                        <span className="absolute -right-0.5 -top-0.5 sm:-right-1 sm:-top-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary text-[9px] sm:text-[10px] font-bold text-primary-foreground">
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
