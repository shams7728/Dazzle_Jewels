"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { StarRating } from "./star-rating";
import { User, ThumbsUp } from "lucide-react";

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    helpful_count?: number;
    profile?: {
        full_name: string | null;
    };
}

interface ReviewListProps {
    productId: string;
    refreshTrigger: number; // Used to trigger re-fetch
    sortBy?: "most_recent" | "highest_rated" | "lowest_rated";
}

export function ReviewList({ productId, refreshTrigger, sortBy = "most_recent" }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = useCallback(async () => {
        try {
            let query = supabase
                .from("reviews")
                .select(`
                    *,
                    profile:profiles(full_name)
                `)
                .eq("product_id", productId);

            // Apply sorting
            switch (sortBy) {
                case "highest_rated":
                    query = query.order("rating", { ascending: false });
                    break;
                case "lowest_rated":
                    query = query.order("rating", { ascending: true });
                    break;
                case "most_recent":
                default:
                    query = query.order("created_at", { ascending: false });
                    break;
            }

            const { data, error } = await query;

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error("Error fetching reviews:", JSON.stringify(error, null, 2));
        } finally {
            setLoading(false);
        }
    }, [productId, sortBy]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews, refreshTrigger]);

    if (loading) {
        return <div className="text-neutral-500">Loading reviews...</div>;
    }

    if (reviews.length === 0) {
        return (
            <div className="py-8 text-center text-neutral-500">
                No reviews yet. Be the first to review!
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
            ))}
        </div>
    );
}

// Individual Review Card Component
function ReviewCard({ review }: { review: Review }) {
    const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0);
    const [hasVoted, setHasVoted] = useState(false);

    const handleHelpfulClick = async () => {
        if (hasVoted) return;

        try {
            // Update local state
            setHelpfulCount((prev) => prev + 1);
            setHasVoted(true);

            // TODO: Implement actual database update when helpful_count column is added
            // await supabase.from('reviews').update({ helpful_count: helpfulCount + 1 }).eq('id', review.id);
        } catch (error) {
            console.error("Error updating helpful count:", error);
        }
    };

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-6">
            <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800">
                        <User className="h-5 w-5 text-neutral-400" />
                    </div>
                    <div>
                        <p className="font-medium text-white">
                            {review.profile?.full_name || "Anonymous User"}
                        </p>
                        <p className="text-xs text-neutral-500">
                            {new Date(review.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                </div>
                <StarRating rating={review.rating} readonly size="sm" />
            </div>

            <p className="mb-4 text-neutral-300 leading-relaxed">{review.comment}</p>

            <div className="flex items-center gap-4 border-t border-neutral-800 pt-4">
                <button
                    onClick={handleHelpfulClick}
                    disabled={hasVoted}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                        hasVoted
                            ? "cursor-not-allowed text-neutral-600"
                            : "text-neutral-400 hover:text-white"
                    }`}
                >
                    <ThumbsUp className={`h-4 w-4 ${hasVoted ? "fill-yellow-500 text-yellow-500" : ""}`} />
                    <span>Helpful ({helpfulCount})</span>
                </button>
            </div>
        </div>
    );
}
