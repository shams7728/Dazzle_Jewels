"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ExternalLink } from "lucide-react";

interface Poster {
    id: string;
    title: string | null;
    description: string | null;
    link: string | null;
    image_url: string;
    background_type: string;
    text_position: string;
    text_color: string;
    is_active: boolean;
    created_at: string;
}

export default function AdminPostersPage() {
    const [posters, setPosters] = useState<Poster[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosters();
    }, []);

    const fetchPosters = async () => {
        try {
            const { data, error } = await supabase
                .from("posters")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setPosters(data || []);
        } catch (error) {
            console.error("Error fetching posters:", error);
        } finally {
            setLoading(false);
        }
    };

    const deletePoster = async (id: string) => {
        if (!confirm("Are you sure you want to delete this poster?")) return;

        try {
            const { error } = await supabase.from("posters").delete().eq("id", id);
            if (error) throw error;
            fetchPosters();
        } catch (error) {
            console.error("Error deleting poster:", error);
            alert("Failed to delete poster");
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("posters")
                .update({ is_active: !currentStatus })
                .eq("id", id);

            if (error) throw error;
            fetchPosters();
        } catch (error) {
            console.error("Error updating poster:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Manage Posters</h1>
                <Link href="/admin/posters/new">
                    <Button className="bg-yellow-500 text-black hover:bg-yellow-400">
                        <Plus className="mr-2 h-4 w-4" /> Add New Poster
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="text-white">Loading...</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {posters.map((poster) => (
                        <div key={poster.id} className="overflow-hidden rounded-xl border border-neutral-800 bg-black">
                            <div className="relative aspect-video w-full bg-neutral-900">
                                <Image
                                    src={poster.image_url}
                                    alt={poster.title || "Poster"}
                                    fill
                                    className="object-cover"
                                />
                                {!poster.is_active && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                        <span className="rounded-full bg-red-500/20 px-3 py-1 text-sm font-medium text-red-500 border border-red-500/50">
                                            Inactive
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="mb-1 font-medium text-white">{poster.title || "Untitled Poster"}</h3>
                                <div className="mb-4 flex items-center gap-2 text-sm text-neutral-400">
                                    <ExternalLink className="h-3 w-3" />
                                    <span className="truncate">{poster.link || "No link"}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`flex-1 ${poster.is_active ? "border-green-500/50 text-green-500 hover:bg-green-500/10" : "border-neutral-700 text-neutral-400"}`}
                                        onClick={() => toggleActive(poster.id, poster.is_active)}
                                    >
                                        {poster.is_active ? "Active" : "Inactive"}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => deletePoster(poster.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
