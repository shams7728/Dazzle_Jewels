'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallback?: string;
  showLoader?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
  onLoadSuccess?: () => void;
  onLoadError?: (error: Error) => void;
}

/**
 * Optimized Image component with loading states, fallback, and retry logic
 * Automatically handles lazy loading, blur placeholder, error states, and retry attempts
 */
export function OptimizedImage({
  src,
  alt,
  fallback = '/placeholder.svg',
  showLoader = true,
  retryOnError = true,
  maxRetries = 2,
  className,
  priority = false,
  onLoadSuccess,
  onLoadError,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setError(false);
    setIsLoading(true);
    setRetryCount(0);
    setUsedFallback(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
    onLoadSuccess?.();
  };

  const handleError = () => {
    // If we haven't exceeded retry limit and retry is enabled
    if (retryOnError && retryCount < maxRetries && !usedFallback) {
      setRetryCount(prev => prev + 1);
      
      // Add cache-busting parameter to retry
      const separator = src.toString().includes('?') ? '&' : '?';
      const retrySrc = `${src}${separator}retry=${retryCount + 1}`;
      setImageSrc(retrySrc);
      
      console.log(`Retrying image load (attempt ${retryCount + 1}/${maxRetries}):`, src);
      return;
    }

    // All retries exhausted or retry disabled, use fallback
    setError(true);
    setIsLoading(false);
    
    if (fallback && imageSrc !== fallback) {
      setImageSrc(fallback);
      setUsedFallback(true);
      console.log('Image load failed, using fallback:', fallback);
    }

    const errorObj = new Error(`Failed to load image: ${src}`);
    onLoadError?.(errorObj);
  };

  return (
    <>
      {/* Loading skeleton */}
      {isLoading && showLoader && (
        <div className="absolute inset-0 animate-pulse bg-neutral-800/50 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-neutral-600 border-t-neutral-400 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Image */}
      <Image
        {...props}
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          error && usedFallback && 'opacity-60',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        quality={props.quality || 85}
        unoptimized={usedFallback} // Don't optimize fallback images
      />
      
      {/* Error indicator */}
      {error && usedFallback && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/80 gap-2 z-20">
          <ImageOff className="h-8 w-8 text-neutral-500" />
          <p className="text-xs text-neutral-500 px-2 text-center">Image unavailable</p>
        </div>
      )}

      {/* Retry indicator */}
      {retryCount > 0 && !error && (
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-neutral-400 z-20">
          Retrying... ({retryCount}/{maxRetries})
        </div>
      )}
    </>
  );
}
