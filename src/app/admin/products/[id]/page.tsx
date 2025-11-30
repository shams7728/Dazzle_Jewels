"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash, Upload, X, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { validateOfferItem, validateProductForm } from "@/lib/utils/product-validation";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        base_price: "",
        discount_price: "",
        category_id: "",
        is_featured: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_offer_item: false,
    });

    interface Variant {
        id: string | null;
        color: string;
        material: string;
        price_adjustment: string | number;
        stock_quantity: string | number;
        imageFiles: File[];
        imagePreviews: string[];
        existingImages: string[];
        images?: string[];
    }

    const [variants, setVariants] = useState<Variant[]>([
        {
            id: null,
            color: "",
            material: "",
            price_adjustment: "",
            stock_quantity: "",
            imageFiles: [],
            imagePreviews: [],
            existingImages: [],
        },
    ]);

    const [variantsToDelete, setVariantsToDelete] = useState<string[]>([]);

    const fetchCategories = async () => {
        const { data } = await supabase.from("categories").select("id, name").order("name");
        setCategories(data || []);
    };

    const fetchProduct = useCallback(async () => {
        try {
            const { data: product, error } = await supabase
                .from("products")
                .select(`
                    *,
                    variants:product_variants(*)
                `)
                .eq("id", id)
                .single();

            if (error) throw error;

            setFormData({
                title: product.title,
                description: product.description || "",
                base_price: product.base_price.toString(),
                discount_price: product.discount_price ? product.discount_price.toString() : "",
                category_id: product.category_id || "",
                is_featured: product.is_featured || false,
                is_new_arrival: product.is_new_arrival || false,
                is_best_seller: product.is_best_seller || false,
                is_offer_item: product.is_offer_item || false,
            });

            if (product.variants && product.variants.length > 0) {
                setVariants(product.variants.map((v: Variant) => ({
                    id: v.id,
                    color: v.color || "",
                    material: v.material || "",
                    price_adjustment: v.price_adjustment.toString(),
                    stock_quantity: v.stock_quantity.toString(),
                    imageFiles: [],
                    imagePreviews: [],
                    existingImages: v.images || [],
                })));
            } else {
                // If no variants, keep the empty initial state or clear it? 
                // Let's keep one empty variant row if none exist, or just empty array.
                // Keeping empty array is safer for "Edit".
                setVariants([]);
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            showErrorToast("Error loading product. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCategories();
        fetchProduct();
    }, [fetchProduct]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);
        
        // Real-time validation
        const validation = validateProductForm(newFormData);
        setValidationErrors(validation.errors);
    };

    const handleCheckboxChange = (field: string, checked: boolean) => {
        const newFormData = { ...formData, [field]: checked };
        setFormData(newFormData);
        
        // Real-time validation on checkbox change
        const validation = validateProductForm(newFormData);
        setValidationErrors(validation.errors);
    };

    const handleVariantChange = (index: number, field: keyof Variant, value: string | number) => {
        const newVariants = [...variants];
        newVariants[index][field] = value as never;
        setVariants(newVariants);
    };

    const handleImageUpload = (index: number, files: FileList | null) => {
        if (!files) return;
        const newVariants = [...variants];
        const currentFiles = newVariants[index].imageFiles;
        const currentPreviews = newVariants[index].imagePreviews;

        const newFilesList = Array.from(files);
        const newPreviewsList = newFilesList.map(file => URL.createObjectURL(file));

        newVariants[index].imageFiles = [...currentFiles, ...newFilesList];
        newVariants[index].imagePreviews = [...currentPreviews, ...newPreviewsList];
        setVariants(newVariants);
    };

    const removeNewImage = (variantIndex: number, imageIndex: number) => {
        const newVariants = [...variants];
        newVariants[variantIndex].imageFiles = newVariants[variantIndex].imageFiles.filter((_, i) => i !== imageIndex);
        newVariants[variantIndex].imagePreviews = newVariants[variantIndex].imagePreviews.filter((_, i) => i !== imageIndex);
        setVariants(newVariants);
    };

    const removeExistingImage = (variantIndex: number, imageUrl: string) => {
        const newVariants = [...variants];
        newVariants[variantIndex].existingImages = newVariants[variantIndex].existingImages.filter((img: string) => img !== imageUrl);
        setVariants(newVariants);
    };

    const addVariant = () => {
        setVariants([...variants, { id: null, color: "", material: "", price_adjustment: "", stock_quantity: "", imageFiles: [], imagePreviews: [], existingImages: [] }]);
    };

    const removeVariant = (index: number) => {
        const variantToRemove = variants[index];
        if (variantToRemove.id) {
            setVariantsToDelete([...variantsToDelete, variantToRemove.id]);
        }
        setVariants(variants.filter((_, i) => i !== index));
    };

    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage.from('products').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form before submission
        const validation = validateProductForm(formData);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            showErrorToast("Please fix the validation errors before submitting.");
            return;
        }
        
        setSaving(true);

        try {
            // 1. Update Product
            const { error: productError } = await supabase
                .from("products")
                .update({
                    title: formData.title,
                    description: formData.description,
                    base_price: parseFloat(formData.base_price),
                    discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
                    is_featured: formData.is_featured,
                    is_new_arrival: formData.is_new_arrival,
                    is_best_seller: formData.is_best_seller,
                    is_offer_item: formData.is_offer_item,
                    category_id: formData.category_id || null,
                })
                .eq("id", id);

            if (productError) throw productError;

            // 2. Handle Variants
            // A. Delete removed variants
            if (variantsToDelete.length > 0) {
                const { error: deleteError } = await supabase
                    .from("product_variants")
                    .delete()
                    .in("id", variantsToDelete);
                if (deleteError) throw deleteError;
            }

            // B. Upsert (Update or Insert) variants
            if (variants.length > 0) {
                const variantsToUpsert = await Promise.all(variants.map(async (v) => {
                    let newImageUrls: string[] = [];

                    // Upload new images
                    if (v.imageFiles.length > 0) {
                        newImageUrls = await Promise.all(v.imageFiles.map((file: File) => uploadImage(file)));
                    }

                    // Combine existing and new images
                    const allImages = [...(v.existingImages || []), ...newImageUrls];

                    return {
                        id: v.id, // If null, Supabase will insert. If present, it updates.
                        product_id: id,
                        color: v.color,
                        material: v.material,
                        price_adjustment: parseFloat(v.price_adjustment as string) || 0,
                        stock_quantity: parseInt(v.stock_quantity as string) || 0,
                        images: allImages,
                    };
                }));

                const { error: variantsError } = await supabase
                    .from("product_variants")
                    .upsert(variantsToUpsert);

                if (variantsError) throw variantsError;
            }

            showSuccessToast("Product updated successfully!");
            router.push("/admin/products");
            router.refresh();
        } catch (error) {
            console.error("Error updating product:", error);
            showErrorToast("Error updating product: " + (error instanceof Error ? error.message : "Unknown error"));
            // Form state is preserved automatically by not clearing formData
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/products">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Edit Product</h1>
                    <p className="text-neutral-400">Update product details and variants.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="rounded-xl border border-neutral-800 bg-black p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Basic Details</h2>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-white">Product Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g. Diamond Solitaire Ring"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                className={validationErrors.title ? 'border-red-500' : ''}
                            />
                            {validationErrors.title && (
                                <p className="text-sm text-red-500">{validationErrors.title}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-white">Description</Label>
                            <textarea
                                id="description"
                                name="description"
                                className={`flex min-h-[80px] w-full rounded-md border ${validationErrors.description ? 'border-red-500' : 'border-neutral-800'} bg-black px-3 py-2 text-sm text-white ring-offset-background placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                                placeholder="Product description..."
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                            {validationErrors.description && (
                                <p className="text-sm text-red-500">{validationErrors.description}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="base_price" className="text-white">Original Price (₹)</Label>
                                <Input
                                    id="base_price"
                                    name="base_price"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.base_price}
                                    onChange={handleInputChange}
                                    required
                                    className={validationErrors.base_price ? 'border-red-500' : ''}
                                />
                                {validationErrors.base_price && (
                                    <p className="text-sm text-red-500">{validationErrors.base_price}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discount_price" className="text-white">Sale Price (₹)</Label>
                                <Input
                                    id="discount_price"
                                    name="discount_price"
                                    type="number"
                                    placeholder="Optional"
                                    value={formData.discount_price}
                                    onChange={handleInputChange}
                                />
                                <p className="text-xs text-neutral-500">Leave empty if no discount</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category_id" className="text-white">Category</Label>
                                <select
                                    id="category_id"
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleInputChange}
                                    className="flex h-10 w-full rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 pt-4">
                            <input
                                type="checkbox"
                                id="is_featured"
                                checked={formData.is_featured}
                                onChange={(e) => handleCheckboxChange('is_featured', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                            />
                            <Label htmlFor="is_featured" className="text-white">Featured Product</Label>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-black p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-white">Showcase Settings</h2>
                    <p className="text-sm text-neutral-400">Select which showcase sections this product should appear in</p>
                    <div className="grid gap-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is_new_arrival"
                                checked={formData.is_new_arrival}
                                onChange={(e) => handleCheckboxChange('is_new_arrival', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="is_new_arrival" className="text-white">New Arrival</Label>
                            <span className="text-xs text-neutral-500">- Display in &quot;New Arrivals&quot; section</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is_best_seller"
                                checked={formData.is_best_seller}
                                onChange={(e) => handleCheckboxChange('is_best_seller', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <Label htmlFor="is_best_seller" className="text-white">Best Seller</Label>
                            <span className="text-xs text-neutral-500">- Display in &quot;Best Sellers&quot; section</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is_offer_item"
                                checked={formData.is_offer_item}
                                onChange={(e) => handleCheckboxChange('is_offer_item', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <Label htmlFor="is_offer_item" className="text-white">Offer Item</Label>
                            <span className="text-xs text-neutral-500">- Display in &quot;Special Offers&quot; section</span>
                        </div>
                        {(() => {
                            const offerValidation = validateOfferItem(formData.is_offer_item, formData.discount_price);
                            return offerValidation.shouldShowWarning && (
                                <div className="rounded-md bg-yellow-500/10 border border-yellow-500/20 p-3">
                                    <p className="text-sm text-yellow-500">{offerValidation.warningMessage}</p>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-black p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Variants</h2>
                        <Button type="button" onClick={addVariant} variant="secondary" size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Variant
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {variants.map((variant, index) => (
                            <div key={index} className="relative grid gap-4 rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 md:grid-cols-5">
                                <div className="space-y-2">
                                    <Label className="text-neutral-400">Color</Label>
                                    <Input
                                        placeholder="e.g. Gold"
                                        value={variant.color}
                                        onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-neutral-400">Material</Label>
                                    <Input
                                        placeholder="e.g. 18k Gold"
                                        value={variant.material}
                                        onChange={(e) => handleVariantChange(index, "material", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-neutral-400">Price Adj.</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={variant.price_adjustment}
                                        onChange={(e) => handleVariantChange(index, "price_adjustment", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-neutral-400">Stock</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={variant.stock_quantity}
                                        onChange={(e) => handleVariantChange(index, "stock_quantity", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-5">
                                    <Label className="text-neutral-400">Images</Label>
                                    <div className="grid grid-cols-4 gap-4">
                                        {/* Existing Images */}
                                        {variant.existingImages.map((imgUrl: string, imgIndex: number) => (
                                            <div key={`existing-${imgIndex}`} className="relative aspect-square overflow-hidden rounded-md border border-neutral-700 group">
                                                <Image src={imgUrl} alt="Existing" fill className="object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(index, imgUrl)}
                                                    className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* New Image Previews */}
                                        {variant.imagePreviews.map((preview: string, imgIndex: number) => (
                                            <div key={`new-${imgIndex}`} className="relative aspect-square overflow-hidden rounded-md border border-neutral-700 group">
                                                <Image src={preview} alt="Preview" fill className="object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(index, imgIndex)}
                                                    className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}

                                        <div className="relative aspect-square flex items-center justify-center rounded-md border border-dashed border-neutral-700 hover:border-neutral-500 transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => handleImageUpload(index, e.target.files)}
                                            />
                                            <div className="text-center">
                                                <Upload className="mx-auto h-6 w-6 text-neutral-500" />
                                                <span className="text-xs text-neutral-500">Add Images</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                                    onClick={() => removeVariant(index)}
                                >
                                    <Trash className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
