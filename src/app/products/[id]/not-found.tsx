import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, Search } from "lucide-react";

/**
 * Product-specific 404 page
 * Shown when a product ID doesn't exist in the database
 */
export default function ProductNotFound() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                <div className="rounded-full bg-neutral-900 p-8 mb-6 border border-neutral-800">
                    <Package className="h-16 w-16 text-yellow-500" />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Product Not Found
                </h1>
                
                <p className="text-neutral-400 max-w-md mb-8 text-lg leading-relaxed">
                    We couldn&apos;t find the product you&apos;re looking for. It may have been removed, 
                    sold out, or the link might be incorrect.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <Link href="/products" className="flex-1">
                        <Button 
                            className="w-full bg-white text-black hover:bg-neutral-200 font-semibold h-12"
                        >
                            <Search className="mr-2 h-5 w-5" />
                            Browse All Products
                        </Button>
                    </Link>
                    
                    <Link href="/" className="flex-1">
                        <Button 
                            variant="outline"
                            className="w-full border-neutral-700 hover:bg-neutral-800 h-12"
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back to Home
                        </Button>
                    </Link>
                </div>

                {/* Helpful suggestions */}
                <div className="mt-12 p-6 bg-neutral-900/50 border border-neutral-800 rounded-lg max-w-md">
                    <h3 className="text-white font-semibold mb-3">What you can do:</h3>
                    <ul className="text-sm text-neutral-400 space-y-2 text-left">
                        <li className="flex items-start">
                            <span className="text-yellow-500 mr-2">•</span>
                            Check if the product URL is correct
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-500 mr-2">•</span>
                            Browse our collection for similar items
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-500 mr-2">•</span>
                            Contact support if you need assistance
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
