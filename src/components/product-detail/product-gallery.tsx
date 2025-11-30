'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductGalleryProps } from '@/types/product-detail';
import { useGalleryState } from '@/hooks/useGalleryState';
import { usePrefersReducedMotion, getTransitionDuration } from '@/lib/utils/animations';

export function ProductGallery({
  images,
  productTitle,
  onImageChange,
}: ProductGalleryProps) {
  const {
    selectedIndex,
    isLightboxOpen,
    isZoomed,
    zoomPosition,
    selectImage,
    nextImage,
    previousImage,
    openLightbox,
    closeLightbox,
    toggleZoom,
    setZoomPosition,
  } = useGalleryState(images);

  const mainImageRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const initialPinchDistance = useRef<number>(0);
  const isPinching = useRef<boolean>(false);
  
  // Detect reduced motion preference
  const prefersReducedMotion = usePrefersReducedMotion();
  const transitionDuration = getTransitionDuration(300, prefersReducedMotion);

  // Notify parent of image changes
  useEffect(() => {
    onImageChange?.(selectedIndex);
  }, [selectedIndex, onImageChange]);

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    selectImage(index);
  };

  // Handle main image click to open lightbox
  const handleMainImageClick = () => {
    openLightbox();
  };

  // Handle mouse move for zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !mainImageRef.current) return;

    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition(x, y);
  };

  // Handle mouse enter/leave for zoom
  const handleMouseEnter = () => {
    if (!isLightboxOpen) {
      toggleZoom();
    }
  };

  const handleMouseLeave = () => {
    if (isZoomed) {
      toggleZoom();
    }
  };

  // Helper function to calculate distance between two touch points
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Touch handlers for swipe gestures and pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture detected
      isPinching.current = true;
      initialPinchDistance.current = getTouchDistance(e.touches);
      e.preventDefault();
    } else if (e.touches.length === 1) {
      // Single touch for swipe
      isPinching.current = false;
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && isPinching.current) {
      // Handle pinch zoom
      const currentDistance = getTouchDistance(e.touches);
      const distanceChange = currentDistance - initialPinchDistance.current;
      
      // Threshold for activating zoom
      if (Math.abs(distanceChange) > 30) {
        if (distanceChange > 0 && !isZoomed) {
          // Pinch out - zoom in
          toggleZoom();
          
          // Calculate zoom center based on midpoint between fingers
          if (mainImageRef.current) {
            const rect = mainImageRef.current.getBoundingClientRect();
            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const x = ((midX - rect.left) / rect.width) * 100;
            const y = ((midY - rect.top) / rect.height) * 100;
            setZoomPosition(x, y);
          }
        } else if (distanceChange < 0 && isZoomed) {
          // Pinch in - zoom out
          toggleZoom();
        }
        initialPinchDistance.current = currentDistance;
      }
      e.preventDefault();
    } else if (e.touches.length === 1 && !isPinching.current) {
      // Handle swipe
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    if (!isPinching.current) {
      // Handle swipe gesture
      const swipeThreshold = 50;
      const diff = touchStartX.current - touchEndX.current;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left - next image
          nextImage();
        } else {
          // Swipe right - previous image
          previousImage();
        }
      }
    }

    // Reset touch state
    touchStartX.current = 0;
    touchEndX.current = 0;
    isPinching.current = false;
    initialPinchDistance.current = 0;
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          previousImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'Escape':
          closeLightbox();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, nextImage, previousImage, closeLightbox]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-neutral-900 rounded-lg flex items-center justify-center">
        <p className="text-neutral-500">No images available</p>
      </div>
    );
  }

  const showNavigation = images.length > 1;

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Main Image Display */}
        <div className="relative aspect-square bg-neutral-900 rounded-lg overflow-hidden group">
          <div
            ref={mainImageRef}
            className="relative w-full h-full cursor-pointer"
            onClick={handleMainImageClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={images[selectedIndex]}
              alt={`${productTitle} - Image ${selectedIndex + 1}`}
              fill
              className={cn(
                'object-contain',
                !prefersReducedMotion && 'transition-transform duration-300',
                isZoomed && 'scale-150'
              )}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      transitionDuration: prefersReducedMotion ? '0ms' : '300ms',
                    }
                  : {
                      transitionDuration: prefersReducedMotion ? '0ms' : '300ms',
                    }
              }
              priority={selectedIndex === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
            />

            {/* Zoom indicator */}
            {!isZoomed && (
              <div 
                className={cn(
                  "absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100",
                  !prefersReducedMotion && "transition-opacity duration-200"
                )}
                style={{
                  transitionDuration: prefersReducedMotion ? '0ms' : '200ms',
                }}
              >
                <ZoomIn className="w-5 h-5 text-white" />
              </div>
            )}

            {/* Zoom overlay hint for touch devices */}
            {isZoomed && (
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs md:hidden">
                Pinch to zoom out
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {showNavigation && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  previousImage();
                }}
                className={cn(
                  "absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full p-3 min-h-[44px] min-w-[44px] opacity-0 group-hover:opacity-100 md:opacity-100 touch-manipulation",
                  !prefersReducedMotion && "transition-all duration-200"
                )}
                style={{
                  transitionDuration: prefersReducedMotion ? '0ms' : '200ms',
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className={cn(
                  "absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full p-3 min-h-[44px] min-w-[44px] opacity-0 group-hover:opacity-100 md:opacity-100 touch-manipulation",
                  !prefersReducedMotion && "transition-all duration-200"
                )}
                style={{
                  transitionDuration: prefersReducedMotion ? '0ms' : '200ms',
                }}
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </>
          )}

          {/* Image Indicators (Dots) - Compact mobile design */}
          {showNavigation && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
              {images.map((_, index) => {
                const isActive = index === selectedIndex;
                return (
                  <span
                    key={`indicator-${index}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectImage(index);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectImage(index);
                      }
                    }}
                    className={cn(
                      'gallery-indicator rounded-full cursor-pointer block',
                      !prefersReducedMotion && 'transition-all duration-200',
                      isActive && 'active',
                      isActive
                        ? 'bg-yellow-500'
                        : 'bg-white/50 hover:bg-white/70'
                    )}
                    style={{
                      transitionDuration: prefersReducedMotion ? '0ms' : '200ms',
                    }}
                    aria-label={`Go to image ${index + 1}`}
                    aria-current={isActive ? 'true' : 'false'}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {showNavigation && (
          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  'relative aspect-square rounded-lg overflow-hidden border-2',
                  !prefersReducedMotion && 'transition-all duration-200',
                  'min-h-[60px] min-w-[60px] md:min-h-[80px] md:min-w-[80px] touch-manipulation',
                  index === selectedIndex
                    ? 'border-yellow-500 ring-2 ring-yellow-500/20'
                    : 'border-neutral-800 hover:border-neutral-600'
                )}
                style={{
                  transitionDuration: prefersReducedMotion ? '0ms' : '200ms',
                }}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`${productTitle} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, (max-width: 1024px) 20vw, 120px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {isLightboxOpen && (
        <div
          className={cn(
            "fixed inset-0 z-50 bg-black/95 backdrop-blur-sm",
            !prefersReducedMotion && "animate-fade-in"
          )}
          style={{
            animationDuration: prefersReducedMotion ? '0ms' : '300ms',
          }}
          onClick={closeLightbox}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className={cn(
                "absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 min-h-[44px] min-w-[44px] z-10 touch-manipulation",
                !prefersReducedMotion && "transition-colors duration-200"
              )}
              style={{
                transitionDuration: prefersReducedMotion ? '0ms' : '200ms',
              }}
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm z-10">
              {selectedIndex + 1} / {images.length}
            </div>

            {/* Main Lightbox Image */}
            <div
              className="relative w-full h-full max-w-6xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[selectedIndex]}
                alt={`${productTitle} - Image ${selectedIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Navigation Arrows in Lightbox */}
            {showNavigation && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    previousImage();
                  }}
                  className={cn(
                    "absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 min-h-[48px] min-w-[48px] touch-manipulation",
                    !prefersReducedMotion && "transition-colors duration-200"
                  )}
                  style={{
                    transitionDuration: prefersReducedMotion ? '0ms' : '200ms',
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className={cn(
                    "absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 min-h-[48px] min-w-[48px] touch-manipulation",
                    !prefersReducedMotion && "transition-colors duration-200"
                  )}
                  style={{
                    transitionDuration: prefersReducedMotion ? '0ms' : '200ms',
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
