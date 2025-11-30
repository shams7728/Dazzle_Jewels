"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { StarRating } from "./star-rating";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
    productId: string;
    onReviewSubmitted: () => void;
}

export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (rating === 0) {
            setError("Please select a rating");
            return;
        }

        if (!comment.trim()) {
            setError("Please write a comment");
            return;
        }

        if (comment.trim().length < 10) {
            setError("Comment must be at least 10 characters long");
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError("You must be logged in to leave a review");
                return;
            }

            const { error: dbError } = await supabase.from("reviews").insert([
                {
                    user_id: user.id,
                    product_id: productId,
                    rating,
                    comment: comment.trim(),
                },
            ]);

            if (dbError) throw dbError;

            // Reset form
            setRating(0);
            setComment("");
            setError("");
            setSuccess(true);
            
            // Hide success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
            
            onReviewSubmitted();
        } catch (err) {
            console.error("Error submitting review:", err);
            setError(err instanceof Error ? err.message : "Failed to submit review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Write a Review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm text-neutral-400">Rating</label>
                    <StarRating rating={rating} onRatingChange={setRating} size="lg" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-neutral-400">Comment</label>
                    <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="Share your thoughts about this product..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-green-500">Review submitted successfully!</p>}

                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        "Submit Review"
                    )}
                </Button>
            </form>
        </div>
    );
}
