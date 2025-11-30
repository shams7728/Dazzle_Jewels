"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);

    const fetchCategory = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;

            setName(data.name);
            setSlug(data.slug);
            setDescription(data.description || "");
            setExistingImage(data.image_url);
        } catch (error) {
            console.error("Error fetching category:", error);
            alert("Error loading category");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCategory();
    }, [fetchCategory]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        // Only auto-update slug if it hasn't been manually edited to something else (simplification: just update it)
        // Or better, don't auto-update slug on edit to avoid breaking links, unless user wants to.
        // Let's NOT auto-update slug on edit.
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            let imageUrl = existingImage;

            if (imageFile) {
                const fileExt = imageFile.name.split(".").pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `categories/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("products") // Reusing products bucket
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from("products")
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            // Generate slug if empty (e.g. if user cleared it or it was never set)
            let finalSlug = slug;
            if (!finalSlug) {
                finalSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            }

            if (!finalSlug) {
                finalSlug = `category-${Date.now()}`;
            }

            const { error } = await supabase
                .from("categories")
                .update({
                    name,
                    slug: finalSlug,
                    description,
                    image_url: imageUrl,
                })
                .eq("id", id);

            if (error) throw error;

            router.push("/admin/categories");
            router.refresh();
        } catch (error) {
            console.error("Error updating category:", error);
            alert("Failed to update category: " + (error instanceof Error ? error.message : "Unknown error"));
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
        <div className="max-w-2xl">
            <Link
                href="/admin/categories"
                className="mb-6 inline-flex items-center text-sm text-neutral-400 hover:text-white"
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Categories
            </Link>

            <h1 className="mb-8 text-3xl font-bold text-white">Edit Category</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Image Upload */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-neutral-400">
                        Category Image
                    </label>
                    <div className="flex items-center gap-6">
                        <div className="relative h-40 w-40 overflow-hidden rounded-xl border border-dashed border-neutral-700 bg-neutral-900">
                            {imagePreview ? (
                                <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                            ) : existingImage ? (
                                <Image
                                    src={existingImage}
                                    alt="Existing"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-neutral-600">
                                    <Upload className="h-8 w-8" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                                id="category-image"
                            />
                            <label
                                htmlFor="category-image"
                                className="inline-flex cursor-pointer items-center rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {existingImage || imagePreview ? "Change Image" : "Choose Image"}
                            </label>
                            <p className="mt-2 text-xs text-neutral-500">
                                Recommended size: 800x1000px. JPG, PNG or WebP.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-400">Name</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={handleNameChange}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none"
                        placeholder="e.g. Engagement Rings"
                    />
                </div>



                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-400">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none"
                        placeholder="Optional description for this collection..."
                    />
                </div>

                <Button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-yellow-500 text-black hover:bg-yellow-400"
                >
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </Button>
            </form>
        </div>
    );
}
