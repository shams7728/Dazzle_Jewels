"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ReelCard } from "@/components/reels/reel-card";
import { Loader2 } from "lucide-react";

interface Reel {
    id: string;
    video_url: string;
    likes_count: number;
    product?: {
        id: string;
        title: string;
        base_price: number;
    };
}

export default function ReelsPage() {
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeReelIndex, setActiveReelIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchReels();
    }, []);

    const fetchReels = async () => {
        try {
            const { data, error } = await supabase
                .from("reels")
                .select(`
          *,
          product:products(*)
        `)
                .eq("is_approved", true)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setReels(data || []);
        } catch (error) {
            console.error("Error fetching reels:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle scroll to detect active reel
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const index = Math.round(container.scrollTop / container.clientHeight);
            setActiveReelIndex(index);
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [reels]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] justify-center bg-background">
            <div
                ref={containerRef}
                className="h-full w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth md:w-auto no-scrollbar"
            >
                {reels.length > 0 ? (
                    reels.map((reel, index) => (
                        <div key={reel.id} className="flex h-full w-full items-center justify-center snap-start">
                            <ReelCard reel={reel} isActive={index === activeReelIndex} />
                        </div>
                    ))
                ) : (
                    <div className="flex h-full items-center justify-center text-neutral-500">
                        No reels available yet.
                    </div>
                )}
            </div>
        </div>
    );
}
