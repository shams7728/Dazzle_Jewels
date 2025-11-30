"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, Share2, ShoppingBag, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reel {
  id: string;
  video_url: string;
  description?: string;
  likes_count: number;
  product?: {
    id: string;
    title: string;
    base_price: number;
  };
}

interface ReelProps {
  reel: Reel;
  isActive: boolean;
}

export function ReelCard({ reel, isActive }: ReelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => {
        // Autoplay failed (likely due to sound), ensure muted
        video.muted = true;
        video.play();
      });
    } else {
      video.pause();
    }
  }, [isActive]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    // TODO: Sync with backend
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reel.product) {
        // Note: This is a simplified product object from the reel
        // In a real scenario, you'd fetch the full product details
        alert("Added to cart!");
    }
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full snap-start bg-black md:h-[calc(100vh-5rem)] md:w-[400px] md:rounded-2xl md:border md:border-neutral-800">
      {/* Video Player */}
      <div className="absolute inset-0 cursor-pointer" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={reel.video_url}
          className="h-full w-full object-cover md:rounded-2xl"
          loop
          muted={isMuted}
          playsInline
        />
      </div>

      {/* Overlay Controls */}
      <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/20 via-transparent to-black/80 p-4 pb-6 safe-area-inset-bottom md:rounded-2xl md:pb-4">
        {/* Top Right: Mute Toggle */}
        <div className="flex justify-end pt-2">
          <button
            onClick={toggleMute}
            className="rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>

        {/* Bottom Info */}
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1 space-y-2 pb-2">
            {reel.product && (
              <Link href={`/products/${reel.product.id}`} className="group block">
                <div className="flex items-center gap-2 rounded-lg bg-black/50 p-2 backdrop-blur-sm transition-colors hover:bg-black/70">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-neutral-800">
                     {/* Use product image if available, else placeholder */}
                     <div className="h-full w-full bg-neutral-700" /> 
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white line-clamp-1 group-hover:text-yellow-500 sm:text-sm">
                      {reel.product.title}
                    </p>
                    <p className="text-xs font-bold text-yellow-500">
                      ₹{reel.product.base_price}
                    </p>
                  </div>
                </div>
              </Link>
            )}
            <p className="text-xs text-neutral-200 line-clamp-2 sm:text-sm">
              {reel.description || "Check out this amazing piece! ✨"}
            </p>
          </div>

          {/* Right Actions */}
          <div className="flex flex-col items-center gap-3 pb-1">
            <button className="group flex flex-col items-center gap-0.5" onClick={handleLike}>
              <div className={cn("rounded-full bg-black/50 p-2.5 backdrop-blur-sm transition-all group-hover:bg-black/70", isLiked && "text-red-500")}>
                <Heart className={cn("h-5 w-5 sm:h-6 sm:w-6", isLiked && "fill-current")} />
              </div>
              <span className="text-[10px] font-medium text-white sm:text-xs">{reel.likes_count + (isLiked ? 1 : 0)}</span>
            </button>

            <button className="group flex flex-col items-center gap-0.5">
              <div className="rounded-full bg-black/50 p-2.5 backdrop-blur-sm transition-all group-hover:bg-black/70">
                <Share2 className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              <span className="text-[10px] font-medium text-white sm:text-xs">Share</span>
            </button>
            
             {reel.product && (
                <button className="group flex flex-col items-center" onClick={handleAddToCart}>
                <div className="rounded-full bg-yellow-500 p-2.5 text-black transition-all hover:bg-yellow-400">
                    <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
