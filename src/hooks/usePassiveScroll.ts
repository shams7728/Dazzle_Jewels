/**
 * Custom hook for optimized scroll performance on mobile
 * Uses passive event listeners to improve scrolling performance
 */

import { useEffect, RefObject } from 'react';

export function usePassiveScroll(
  ref: RefObject<HTMLElement>,
  onScroll?: (event: Event) => void
) {
  useEffect(() => {
    const element = ref.current;
    if (!element || !onScroll) return;

    // Use passive event listener for better scroll performance
    element.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', onScroll);
    };
  }, [ref, onScroll]);
}

/**
 * Custom hook for optimized touch events on mobile
 * Uses passive event listeners to improve touch performance
 */
export function usePassiveTouch(
  ref: RefObject<HTMLElement>,
  onTouchStart?: (event: TouchEvent) => void,
  onTouchMove?: (event: TouchEvent) => void,
  onTouchEnd?: (event: TouchEvent) => void
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const options = { passive: true };

    if (onTouchStart) {
      element.addEventListener('touchstart', onTouchStart, options);
    }
    if (onTouchMove) {
      element.addEventListener('touchmove', onTouchMove, options);
    }
    if (onTouchEnd) {
      element.addEventListener('touchend', onTouchEnd, options);
    }

    return () => {
      if (onTouchStart) {
        element.removeEventListener('touchstart', onTouchStart);
      }
      if (onTouchMove) {
        element.removeEventListener('touchmove', onTouchMove);
      }
      if (onTouchEnd) {
        element.removeEventListener('touchend', onTouchEnd);
      }
    };
  }, [ref, onTouchStart, onTouchMove, onTouchEnd]);
}
