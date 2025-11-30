/**
 * Animation utilities with reduced motion support
 * 
 * This module provides animation classes and utilities that respect
 * the user's prefers-reduced-motion preference.
 */

import { useEffect, useState } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 * @returns boolean indicating if reduced motion is preferred
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') return;

    // Create media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add listener (use deprecated addListener for older browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Animation timing constants
 */
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

/**
 * Animation easing functions
 */
export const ANIMATION_EASING = {
  default: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
  easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
} as const;

/**
 * Get animation class based on reduced motion preference
 * @param animationClass - The animation class to apply
 * @param reducedMotionClass - The class to apply when reduced motion is preferred (optional)
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns The appropriate class name
 */
export function getAnimationClass(
  animationClass: string,
  reducedMotionClass: string = '',
  prefersReducedMotion: boolean = false
): string {
  if (prefersReducedMotion) {
    return reducedMotionClass;
  }
  return animationClass;
}

/**
 * Get transition duration based on reduced motion preference
 * @param duration - Normal duration in milliseconds
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns Duration in milliseconds (1ms if reduced motion is preferred)
 */
export function getTransitionDuration(
  duration: number,
  prefersReducedMotion: boolean = false
): number {
  return prefersReducedMotion ? 1 : duration;
}

/**
 * Animation class names for common animations
 * These respect the prefers-reduced-motion media query via CSS
 */
export const ANIMATION_CLASSES = {
  // Fade animations
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  
  // Slide animations
  slideInFromTop: 'animate-slide-in-from-top',
  slideInFromBottom: 'animate-slide-in-from-bottom',
  slideInFromLeft: 'animate-slide-in-from-left',
  slideInFromRight: 'animate-slide-in-from-right',
  
  // Scale animations
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',
  
  // Rotate animations
  spin: 'animate-spin',
  
  // Combined animations
  fadeInUp: 'animate-fade-in-up',
  fadeInDown: 'animate-fade-in-down',
  
  // Button states
  buttonHover: 'transition-all duration-200 hover:scale-105 active:scale-95',
  buttonPress: 'transition-transform duration-100 active:scale-95',
  
  // Image transitions
  imageTransition: 'transition-opacity duration-300',
  imageZoom: 'transition-transform duration-300 hover:scale-110',
  
  // Modal animations
  modalOverlay: 'animate-fade-in',
  modalContent: 'animate-scale-in',
  
  // Stagger delays
  staggerDelay1: 'animation-delay-100',
  staggerDelay2: 'animation-delay-200',
  staggerDelay3: 'animation-delay-300',
  staggerDelay4: 'animation-delay-400',
  staggerDelay5: 'animation-delay-500',
} as const;

/**
 * Stagger animation delays for sequential animations
 */
export function getStaggerDelay(index: number, baseDelay: number = 100): string {
  return `animation-delay-${index * baseDelay}`;
}
