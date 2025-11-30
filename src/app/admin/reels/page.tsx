"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Play } from "lucide-react";

interface Reel {
    id: string;
    product_id: string;
    video_url: string;
    likes_count: number;
    is_approved: boolean;
    created_at: string;
    product?: {
        title: string;
    };
}

export default function AdminReelsPage() {
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReels();
    }, []);

    const fetchReels = async () => {
        try {
            const { data, error } = await supabase
                .from("reels")
                .select(`
          *,
          product:products(title)
        `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setReels(data || []);
        } catch (error) {
            console.error("Error fetching reels:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this reel?")) return;

        try {
            const { error } = await supabase.from("reels").delete().eq("id", id);
            if (error) throw error;
            fetchReels();
        } catch (error) {
            console.error("Error deleting reel:", error);
            alert("Failed to delete reel");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Reels Management</h1>
                <Link href="/admin/reels/new">
                    <Button className="bg-yellow-500 text-black hover:bg-yellow-400">
                        <Plus className="mr-2 h-4 w-4" /> Upload Reel
                    </Button>
                </Link>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-black">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-neutral-400">
                        <thead className="border-b border-neutral-800 bg-neutral-900/50 text-xs uppercase text-neutral-200">
                            <tr>
                                <th className="px-6 py-4">Video</th>
                                <th className="px-6 py-4">Linked Product</th>
                                <th className="px-6 py-4">Likes</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {reels.map((reel) => (
                                <tr key={reel.id} className="hover:bg-neutral-900/30">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-16 w-10 overflow-hidden rounded bg-neutral-800">
                                                {/* Thumbnail or Video Placeholder */}
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <Play className="h-4 w-4 text-white" />
                                                </div>
                                            </div>
                                            <span className="font-mono text-xs">{reel.id.slice(0, 8)}...</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white">
                                        {reel.product?.title || "No Product Linked"}
                                    </td>
                                    <td className="px-6 py-4">{reel.likes_count}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${reel.is_approved
                                                    ? "bg-green-500/10 text-green-500"
                                                    : "bg-yellow-500/10 text-yellow-500"
                                                }`}
                                        >
                                            {reel.is_approved ? "Active" : "Draft"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                            onClick={() => handleDelete(reel.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {reels.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-neutral-500">
                                        No reels found. Upload your first one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
