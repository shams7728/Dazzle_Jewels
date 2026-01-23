"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { StarRating } from "./star-rating";
import { ReviewForm } from "./review-form";
import { User, ThumbsUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface RatingDistribution {
    [key: number]: number;
}

interface ReviewsSectionProps {
    productId: string;
}

type SortOption = "most_recent" | "highest_rated" | "lowest_rated";

const REVIEWS_PER_PAGE = 5;

export function ReviewsSection({ productId }: ReviewsSectionProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution>({
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
    });
    const [sortBy, setSortBy] = useState<SortOption>("most_recent");
    const [currentPage, setCurrentPage] = useState(1);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("reviews")
                .select(`
                    *,
                    profile:profiles(full_name)
                `)
                .eq("product_id", productId);

            if (error) throw error;

            const reviewsData = data || [];
            setReviews(reviewsData);
            setTotalReviews(reviewsData.length);

            // Calculate average rating
            if (reviewsData.length > 0) {
                const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
                setAverageRating(sum / reviewsData.length);

                // Calculate rating distribution
                const distribution: RatingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                reviewsData.forEach((review) => {
                    distribution[review.rating as keyof RatingDistribution]++;
                });
                setRatingDistribution(distribution);
            } else {
                setAverageRating(0);
                setRatingDistribution({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews, refreshTrigger]);

    // Sort and paginate reviews
    useEffect(() => {
        let sortedReviews = [...reviews];

        switch (sortBy) {
            case "highest_rated":
                sortedReviews.sort((a, b) => b.rating - a.rating);
                break;
            case "lowest_rated":
                sortedReviews.sort((a, b) => a.rating - b.rating);
                break;
            case "most_recent":
            default:
                sortedReviews.sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                break;
        }

        setDisplayedReviews(sortedReviews.slice(0, currentPage * REVIEWS_PER_PAGE));
    }, [reviews, sortBy, currentPage]);

    const handleLoadMore = () => {
        setCurrentPage((prev) => prev + 1);
    };

    const handleReviewSubmitted = () => {
        setRefreshTrigger((prev) => prev + 1);
        setCurrentPage(1);
    };

    const hasMoreReviews = displayedReviews.length < reviews.length;

    if (loading) {
        return <div className="text-neutral-500">Loading reviews...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Aggregate Rating Display */}
            {totalReviews > 0 && (
                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Left: Overall Rating */}
                        <div className="flex flex-col items-center justify-center space-y-2 border-b border-border pb-6 md:border-b-0 md:border-r md:pb-0">
                            <div className="text-5xl font-bold text-foreground">
                                {averageRating.toFixed(1)}
                            </div>
                            <StarRating rating={Math.round(averageRating)} readonly size="lg" />
                            <p className="text-sm text-muted-foreground">
                                Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                            </p>
                        </div>

                        {/* Right: Rating Distribution */}
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                                const count = ratingDistribution[rating as keyof RatingDistribution];
                                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                                return (
                                    <div key={rating} className="flex items-center gap-3">
                                        <span className="w-8 text-sm text-muted-foreground">{rating}★</span>
                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="w-12 text-right text-sm text-muted-foreground">
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Review Form */}
            <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />

            {/* Reviews List */}
            {totalReviews > 0 ? (
                <div className="space-y-6">
                    {/* Sort Options */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
                        <h3 className="text-base md:text-lg font-semibold text-foreground">
                            All Reviews ({totalReviews})
                        </h3>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value as SortOption);
                                    setCurrentPage(1);
                                }}
                                className="rounded-md border border-input bg-background px-3 py-2.5 md:py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] md:min-h-[40px] flex-1 sm:flex-initial touch-manipulation"
                            >
                                <option value="most_recent">Most Recent</option>
                                <option value="highest_rated">Highest Rated</option>
                                <option value="lowest_rated">Lowest Rated</option>
                            </select>
                        </div>
                    </div>

                    {/* Individual Reviews */}
                    <div className="space-y-6">
                        {displayedReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>

                    {/* Load More Button */}
                    {hasMoreReviews && (
                        <div className="flex justify-center pt-4">
                            <Button
                                variant="outline"
                                onClick={handleLoadMore}
                                className="border-border bg-card text-foreground hover:bg-muted"
                            >
                                Load More Reviews
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-8 text-center text-neutral-500">
                    No reviews yet. Be the first to review!
                </div>
            )}
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
            // In a real implementation, you would update the database
            // For now, we'll just update the local state
            setHelpfulCount((prev) => prev + 1);
            setHasVoted(true);

            // TODO: Implement actual database update
            // await supabase.from('reviews').update({ helpful_count: helpfulCount + 1 }).eq('id', review.id);
        } catch (error) {
            console.error("Error updating helpful count:", error);
        }
    };

    return (
        <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-medium text-foreground">
                            {review.profile?.full_name || "Anonymous User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
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

            <p className="mb-4 text-muted-foreground leading-relaxed">{review.comment}</p>

            <div className="flex items-center gap-4 border-t border-neutral-800 pt-4">
                <button
                    onClick={handleHelpfulClick}
                    disabled={hasVoted}
                    className={`flex items-center gap-2 text-sm transition-colors px-3 py-2 rounded-lg min-h-[44px] touch-manipulation ${hasVoted
                        ? "cursor-not-allowed text-neutral-600 bg-neutral-800/30"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                        }`}
                >
                    <ThumbsUp className={`h-4 w-4 ${hasVoted ? "fill-yellow-500 text-yellow-500" : ""}`} />
                    <span>Helpful ({helpfulCount})</span>
                </button>
            </div>
        </div>
    );
}
