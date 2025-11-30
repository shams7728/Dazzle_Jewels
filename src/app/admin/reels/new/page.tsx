"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { Loader2, Upload, Video } from "lucide-react";

export default function NewReelPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Array<{ id: string; title: string }>>([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data } = await supabase.from("products").select("id, title"); // .eq("is_active", true);
        setProducts(data || []);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setVideoFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoFile || !selectedProduct) {
            alert("Please select a video and a product");
            return;
        }

        setLoading(true);
        try {
            // 1. Upload Video to Supabase Storage
            const fileExt = videoFile.name.split(".").pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `videos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("reels")
                .upload(filePath, videoFile, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from("reels")
                .getPublicUrl(filePath);

            // 3. Insert into DB
            const { error: dbError } = await supabase.from("reels").insert([
                {
                    product_id: selectedProduct,
                    video_url: publicUrl,
                    is_approved: true, // Auto-approve for now
                },
            ]);

            if (dbError) throw dbError;

            router.push("/admin/reels");
            router.refresh();
        } catch (error) {
            console.error("Error uploading reel:", error);
            alert("Error uploading reel: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white">Upload New Reel</h1>

            <div className="rounded-xl border border-neutral-800 bg-black p-6">
                <form onSubmit={handleUpload} className="space-y-6">
                    {/* Product Selection */}
                    <div className="space-y-2">
                        <Label>Link Product</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            required
                        >
                            <option value="">Select a product...</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Video Upload */}
                    <div className="space-y-2">
                        <Label>Video File (Vertical 9:16 recommended)</Label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-neutral-800 border-dashed rounded-lg cursor-pointer bg-neutral-900/50 hover:bg-neutral-900 hover:border-yellow-500/50 transition-all">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {videoFile ? (
                                        <>
                                            <Video className="w-10 h-10 mb-3 text-yellow-500" />
                                            <p className="mb-2 text-sm text-white">{videoFile.name}</p>
                                            <p className="text-xs text-neutral-400">
                                                {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 mb-3 text-neutral-400" />
                                            <p className="mb-2 text-sm text-neutral-400">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-neutral-500">MP4, WebM (Max 50MB)</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="video/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            "Upload Reel"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
