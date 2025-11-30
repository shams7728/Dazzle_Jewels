"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Loader2, Trash } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { ShowcaseStatistics } from '@/components/admin/showcase-statistics';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [showcaseFilter, setShowcaseFilter] = useState("All Products");
    const [sortBy, setSortBy] = useState("created_at");
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [bulkAction, setBulkAction] = useState("");
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingBulkAction, setPendingBulkAction] = useState("");
    const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsResponse, categoriesResponse] = await Promise.all([
                supabase
                    .from('products')
                    .select(`
                        *,
                        variants:product_variants(*)
                    `)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('categories')
                    .select('id, name')
                    .order('name')
            ]);

            if (productsResponse.error) {
                console.error('Products query error:', productsResponse.error);
                throw productsResponse.error;
            }
            if (categoriesResponse.error) {
                console.error('Categories query error:', categoriesResponse.error);
                throw categoriesResponse.error;
            }

            setProducts(productsResponse.data || []);
            setCategories(categoriesResponse.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const { error } = await supabase
                .from("products")
                .delete()
                .eq("id", id);

            if (error) throw error;
            setProducts(products.filter((p) => p.id !== id));
            // Trigger statistics refresh
            setStatsRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error deleting product:", JSON.stringify(error, null, 2));
            alert(`Failed to delete product: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    const toggleProductSelection = (productId: string) => {
        const newSelection = new Set(selectedProducts);
        if (newSelection.has(productId)) {
            newSelection.delete(productId);
        } else {
            newSelection.add(productId);
        }
        setSelectedProducts(newSelection);
    };

    const toggleAllProducts = () => {
        if (selectedProducts.size === sortedProducts.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(sortedProducts.map(p => p.id)));
        }
    };

    const handleBulkActionChange = (action: string) => {
        if (!action || selectedProducts.size === 0) return;
        setPendingBulkAction(action);
        setShowConfirmDialog(true);
    };

    const executeBulkAction = async () => {
        if (!pendingBulkAction || selectedProducts.size === 0) return;

        setShowConfirmDialog(false);
        setLoading(true);

        try {
            const updates: Partial<Product> = {};
            
            switch (pendingBulkAction) {
                case "set_new_arrival":
                    updates.is_new_arrival = true;
                    break;
                case "remove_new_arrival":
                    updates.is_new_arrival = false;
                    break;
                case "set_best_seller":
                    updates.is_best_seller = true;
                    break;
                case "remove_best_seller":
                    updates.is_best_seller = false;
                    break;
                case "set_offer_item":
                    updates.is_offer_item = true;
                    break;
                case "remove_offer_item":
                    updates.is_offer_item = false;
                    break;
                default:
                    return;
            }

            const productIds = Array.from(selectedProducts);
            
            const { error } = await supabase
                .from('products')
                .update(updates)
                .in('id', productIds);

            if (error) throw error;

            // Update local state
            setProducts(products.map(product => {
                if (selectedProducts.has(product.id)) {
                    return { ...product, ...updates };
                }
                return product;
            }));

            alert(`Successfully updated ${selectedProducts.size} product(s)`);
            setSelectedProducts(new Set());
            setBulkAction("");
            setPendingBulkAction("");
            // Trigger statistics refresh
            setStatsRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error executing bulk action:", error);
            alert(`Failed to update products: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    const cancelBulkAction = () => {
        setShowConfirmDialog(false);
        setPendingBulkAction("");
        setBulkAction("");
    };

    const getBulkActionLabel = (action: string): string => {
        const labels: Record<string, string> = {
            "set_new_arrival": "Set as New Arrival",
            "remove_new_arrival": "Remove from New Arrivals",
            "set_best_seller": "Set as Best Seller",
            "remove_best_seller": "Remove from Best Sellers",
            "set_offer_item": "Set as Offer Item",
            "remove_offer_item": "Remove from Offer Items"
        };
        return labels[action] || action;
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All Categories" || product.category_id === selectedCategory;
        
        // Showcase filter logic
        let matchesShowcase = true;
        if (showcaseFilter === "New Arrivals") {
            matchesShowcase = product.is_new_arrival === true;
        } else if (showcaseFilter === "Best Sellers") {
            matchesShowcase = product.is_best_seller === true;
        } else if (showcaseFilter === "Offer Items") {
            matchesShowcase = product.is_offer_item === true;
        }
        
        return matchesSearch && matchesCategory && matchesShowcase;
    });

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === "created_at") {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (sortBy === "is_new_arrival") {
            return (b.is_new_arrival ? 1 : 0) - (a.is_new_arrival ? 1 : 0);
        } else if (sortBy === "is_best_seller") {
            return (b.is_best_seller ? 1 : 0) - (a.is_best_seller ? 1 : 0);
        } else if (sortBy === "is_offer_item") {
            return (b.is_offer_item ? 1 : 0) - (a.is_offer_item ? 1 : 0);
        }
        return 0;
    });

    const getCategoryName = (categoryId: string) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : '-';
    };

    return (
        <div className="space-y-6 lg:space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white lg:text-3xl">Products</h1>
                    <p className="text-sm text-neutral-400 lg:text-base">Manage your jewelry collection.</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="flex items-center justify-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-400 lg:text-base"
                >
                    <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
                    Add Product
                </Link>
            </div>

            {/* Showcase Statistics */}
            <ShowcaseStatistics refreshTrigger={statsRefreshTrigger} />

            {/* Filters & Search */}
            <div className="space-y-3 rounded-xl border border-neutral-800 bg-black p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 lg:h-5 lg:w-5" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg bg-neutral-900 py-2 pl-9 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 lg:pl-10 lg:text-base"
                    />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 lg:text-base"
                    >
                        <option>All Categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={showcaseFilter}
                        onChange={(e) => setShowcaseFilter(e.target.value)}
                        className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 lg:text-base"
                    >
                        <option>All Products</option>
                        <option>New Arrivals</option>
                        <option>Best Sellers</option>
                        <option>Offer Items</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 sm:col-span-2 lg:col-span-1 lg:text-base"
                    >
                        <option value="created_at">Sort by Date</option>
                        <option value="is_new_arrival">Sort by New Arrival</option>
                        <option value="is_best_seller">Sort by Best Seller</option>
                        <option value="is_offer_item">Sort by Offer Item</option>
                    </select>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.size > 0 && (
                <div className="flex flex-col gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 sm:flex-row sm:items-center">
                    <span className="text-xs font-medium text-white sm:text-sm">
                        {selectedProducts.size} product(s) selected
                    </span>
                    <select
                        value={bulkAction}
                        onChange={(e) => {
                            setBulkAction(e.target.value);
                            handleBulkActionChange(e.target.value);
                        }}
                        className="rounded-lg bg-neutral-900 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 sm:flex-1 sm:text-sm"
                    >
                        <option value="">Select Bulk Action</option>
                        <option value="set_new_arrival">Set as New Arrival</option>
                        <option value="remove_new_arrival">Remove from New Arrivals</option>
                        <option value="set_best_seller">Set as Best Seller</option>
                        <option value="remove_best_seller">Remove from Best Sellers</option>
                        <option value="set_offer_item">Set as Offer Item</option>
                        <option value="remove_offer_item">Remove from Offer Items</option>
                    </select>
                    <button
                        onClick={() => setSelectedProducts(new Set())}
                        className="rounded-lg bg-neutral-800 px-4 py-2 text-xs text-white hover:bg-neutral-700 sm:text-sm"
                    >
                        Clear Selection
                    </button>
                </div>
            )}

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-6">
                        <h3 className="mb-4 text-xl font-bold text-white">Confirm Bulk Action</h3>
                        <p className="mb-6 text-neutral-400">
                            Are you sure you want to <strong className="text-white">{getBulkActionLabel(pendingBulkAction)}</strong> for {selectedProducts.size} product(s)?
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={executeBulkAction}
                                className="flex-1 rounded-lg bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-400"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={cancelBulkAction}
                                className="flex-1 rounded-lg bg-neutral-800 px-4 py-2 font-medium text-white hover:bg-neutral-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Products - Mobile Card View */}
            <div className="block lg:hidden">
                {loading ? (
                    <div className="flex items-center justify-center rounded-xl border border-neutral-800 bg-black p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
                    </div>
                ) : sortedProducts.length === 0 ? (
                    <div className="rounded-xl border border-neutral-800 bg-black p-8 text-center text-sm text-neutral-500">
                        No products found.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedProducts.map((product) => {
                            const firstVariant = product.variants?.[0];
                            const firstImage = firstVariant?.images?.[0];
                            
                            return (
                                <div key={product.id} className="rounded-xl border border-neutral-800 bg-black p-4">
                                    <div className="flex gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.has(product.id)}
                                            onChange={() => toggleProductSelection(product.id)}
                                            className="mt-1 h-4 w-4 flex-shrink-0 rounded border-neutral-700 bg-neutral-800 text-yellow-500 focus:ring-2 focus:ring-yellow-500"
                                        />
                                        {firstImage ? (
                                            <img
                                                src={firstImage}
                                                alt={product.title}
                                                className="h-20 w-20 flex-shrink-0 rounded-lg object-cover bg-neutral-800"
                                            />
                                        ) : (
                                            <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-600 text-xs">
                                                No Image
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-white text-sm truncate">{product.title}</h3>
                                            <p className="text-xs text-neutral-500 mt-0.5">
                                                {product.category_id ? getCategoryName(product.category_id) : 'No category'}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-sm font-bold text-yellow-500">₹{product.base_price}</span>
                                                <span className="text-xs text-neutral-500">• {product.variants?.length || 0} variants</span>
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {product.is_featured && (
                                                    <span className="inline-flex rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-500">
                                                        Featured
                                                    </span>
                                                )}
                                                {product.is_new_arrival && (
                                                    <span className="inline-flex rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-500">
                                                        New
                                                    </span>
                                                )}
                                                {product.is_best_seller && (
                                                    <span className="inline-flex rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-500">
                                                        Best Seller
                                                    </span>
                                                )}
                                                {product.is_offer_item && (
                                                    <span className="inline-flex rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-500">
                                                        Offer
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-2 border-t border-neutral-800 pt-3">
                                        <Link href={`/admin/products/${product.id}`} className="flex-1">
                                            <button className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800">
                                                Edit
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => deleteProduct(product.id)}
                                            className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/20"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Products - Desktop Table View */}
            <div className="hidden overflow-hidden rounded-xl border border-neutral-800 bg-black lg:block">
                <table className="w-full text-left text-sm text-neutral-400">
                    <thead className="bg-neutral-900 text-neutral-200">
                        <tr>
                            <th className="px-6 py-4 font-medium">
                                <input
                                    type="checkbox"
                                    checked={sortedProducts.length > 0 && selectedProducts.size === sortedProducts.length}
                                    onChange={toggleAllProducts}
                                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-yellow-500 focus:ring-2 focus:ring-yellow-500"
                                />
                            </th>
                            <th className="px-6 py-4 font-medium">Product</th>
                            <th className="px-6 py-4 font-medium">Category</th>
                            <th className="px-6 py-4 font-medium">Price</th>
                            <th className="px-6 py-4 font-medium">Variants</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-yellow-500" />
                                </td>
                            </tr>
                        ) : sortedProducts.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            sortedProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-neutral-900/50">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.has(product.id)}
                                            onChange={() => toggleProductSelection(product.id)}
                                            className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-yellow-500 focus:ring-2 focus:ring-yellow-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {(() => {
                                                // Get first image from variants
                                                const firstVariant = product.variants?.[0];
                                                const firstImage = firstVariant?.images?.[0];

                                                return firstImage ? (
                                                    <img
                                                        src={firstImage}
                                                        alt={product.title}
                                                        className="h-12 w-12 rounded-lg object-cover bg-neutral-800"
                                                        onError={(e) => {
                                                            // Fallback to placeholder on error
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-600 text-xs">
                                                        No Image
                                                    </div>
                                                );
                                            })()}
                                            <div className="hidden h-12 w-12 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-600 text-xs">
                                                Error
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{product.title}</div>
                                                <div className="text-xs">ID: {product.id.slice(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{product.category_id ? getCategoryName(product.category_id) : '-'}</td>
                                    <td className="px-6 py-4">₹{product.base_price}</td>
                                    <td className="px-6 py-4">
                                        {product.variants?.length || 0}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {product.is_featured && (
                                                <span className="inline-flex rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500">
                                                    Featured
                                                </span>
                                            )}
                                            {product.is_new_arrival && (
                                                <span className="inline-flex rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500">
                                                    New
                                                </span>
                                            )}
                                            {product.is_best_seller && (
                                                <span className="inline-flex rounded-full bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-500">
                                                    Best Seller
                                                </span>
                                            )}
                                            {product.is_offer_item && (
                                                <span className="inline-flex rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500">
                                                    Offer
                                                </span>
                                            )}
                                            {!product.is_featured && !product.is_new_arrival && !product.is_best_seller && !product.is_offer_item && (
                                                <span className="inline-flex rounded-full bg-neutral-800 px-2 py-1 text-xs font-medium text-neutral-400">
                                                    Standard
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/products/${product.id}`}>
                                                <button className="rounded p-2 text-neutral-500 hover:bg-neutral-800 hover:text-white">
                                                    Edit
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => deleteProduct(product.id)}
                                                className="rounded p-2 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
