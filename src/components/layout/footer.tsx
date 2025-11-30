import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
    return (
        <footer className="border-t border-neutral-800 bg-black text-neutral-400">
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-yellow-500">Dazzle Jewels</h3>
                        <p className="text-sm">
                            Exquisite handcrafted jewelry for those who appreciate timeless elegance and luxury.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="hover:text-yellow-500 transition-colors">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="hover:text-yellow-500 transition-colors">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="hover:text-yellow-500 transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/products" className="hover:text-yellow-500 transition-colors">
                                    Shop All
                                </Link>
                            </li>
                            <li>
                                <Link href="/collections" className="hover:text-yellow-500 transition-colors">
                                    Collections
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-yellow-500 transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/reels" className="hover:text-yellow-500 transition-colors">
                                    Reels
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Customer Service</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/profile" className="hover:text-yellow-500 transition-colors">
                                    My Account
                                </Link>
                            </li>
                            <li>
                                <Link href="/wishlist" className="hover:text-yellow-500 transition-colors">
                                    Wishlist
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-yellow-500 transition-colors">
                                    Shipping Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-yellow-500 transition-colors">
                                    Returns & Exchanges
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Stay Updated</h4>
                        <p className="text-sm">Subscribe to our newsletter for exclusive offers and new arrivals.</p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter your email"
                                className="bg-neutral-900 border-neutral-800 focus:border-yellow-500"
                            />
                            <Button className="bg-yellow-500 text-black hover:bg-yellow-400">
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-neutral-800 pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} Dazzle Jewels. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
