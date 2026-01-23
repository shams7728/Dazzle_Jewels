import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
    return (
        <footer className="border-t border-border bg-muted text-muted-foreground">
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-primary">Dazzle Jewels</h3>
                        <p className="text-sm">
                            Exquisite handcrafted jewelry for those who appreciate timeless elegance and luxury.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="hover:text-primary transition-colors">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-foreground">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/products" className="hover:text-primary transition-colors">
                                    Shop All
                                </Link>
                            </li>
                            <li>
                                <Link href="/collections" className="hover:text-primary transition-colors">
                                    Collections
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-primary transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/reels" className="hover:text-primary transition-colors">
                                    Reels
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-foreground">Customer Service</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/profile" className="hover:text-primary transition-colors">
                                    My Account
                                </Link>
                            </li>
                            <li>
                                <Link href="/wishlist" className="hover:text-primary transition-colors">
                                    Wishlist
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors">
                                    Shipping Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors">
                                    Returns & Exchanges
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-foreground">Stay Updated</h4>
                        <p className="text-sm">Subscribe to our newsletter for exclusive offers and new arrivals.</p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter your email"
                                className="bg-background border-input focus:border-primary"
                            />
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-border pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} Dazzle Jewels. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
