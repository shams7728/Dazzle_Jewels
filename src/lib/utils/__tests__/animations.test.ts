/**
 * Tests for animation utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  usePrefersReducedMotion,
  getAnimationClass,
  getTransitionDuration,
  ANIMATION_DURATION,
  ANIMATION_EASING,
  getStaggerDelay,
} from '../animations';

describe('Animation Utilities', () => {
  describe('usePrefersReducedMotion', () => {
    let matchMediaMock: any;

    beforeEach(() => {
      // Mock matchMedia
      matchMediaMock = {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      };
      
      window.matchMedia = vi.fn().mockImplementation(() => matchMediaMock);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return false when reduced motion is not preferred', () => {
      matchMediaMock.matches = false;
      
      const { result } = renderHook(() => usePrefersReducedMotion());
      
      expect(result.current).toBe(false);
    });

    it('should return true when reduced motion is preferred', () => {
      matchMediaMock.matches = true;
      
      const { result } = renderHook(() => usePrefersReducedMotion());
      
      expect(result.current).toBe(true);
    });

    it('should add event listener for media query changes', () => {
      renderHook(() => usePrefersReducedMotion());
      
      // Should call either addEventListener or addListener (for older browsers)
      expect(
        matchMediaMock.addEventListener.mock.calls.length > 0 ||
        matchMediaMock.addListener.mock.calls.length > 0
      ).toBe(true);
    });

    it('should cleanup event listener on unmount', () => {
      const { unmount } = renderHook(() => usePrefersReducedMotion());
      
      unmount();
      
      // Should call either removeEventListener or removeListener
      expect(
        matchMediaMock.removeEventListener.mock.calls.length > 0 ||
        matchMediaMock.removeListener.mock.calls.length > 0
      ).toBe(true);
    });
  });

  describe('getAnimationClass', () => {
    it('should return animation class when reduced motion is false', () => {
      const result = getAnimationClass('animate-fade-in', '', false);
      expect(result).toBe('animate-fade-in');
    });

    it('should return reduced motion class when reduced motion is true', () => {
      const result = getAnimationClass('animate-fade-in', 'no-animation', true);
      expect(result).toBe('no-animation');
    });

    it('should return empty string when reduced motion is true and no fallback provided', () => {
      const result = getAnimationClass('animate-fade-in', '', true);
      expect(result).toBe('');
    });
  });

  describe('getTransitionDuration', () => {
    it('should return original duration when reduced motion is false', () => {
      const result = getTransitionDuration(300, false);
      expect(result).toBe(300);
    });

    it('should return 1ms when reduced motion is true', () => {
      const result = getTransitionDuration(300, true);
      expect(result).toBe(1);
    });

    it('should handle different duration values', () => {
      expect(getTransitionDuration(150, false)).toBe(150);
      expect(getTransitionDuration(500, false)).toBe(500);
      expect(getTransitionDuration(1000, false)).toBe(1000);
    });
  });

  describe('ANIMATION_DURATION constants', () => {
    it('should have correct duration values', () => {
      expect(ANIMATION_DURATION.fast).toBe(150);
      expect(ANIMATION_DURATION.normal).toBe(300);
      expect(ANIMATION_DURATION.slow).toBe(500);
    });
  });

  describe('ANIMATION_EASING constants', () => {
    it('should have correct easing values', () => {
      expect(ANIMATION_EASING.default).toBe('cubic-bezier(0.4, 0.0, 0.2, 1)');
      expect(ANIMATION_EASING.easeIn).toBe('cubic-bezier(0.4, 0.0, 1, 1)');
      expect(ANIMATION_EASING.easeOut).toBe('cubic-bezier(0.0, 0.0, 0.2, 1)');
      expect(ANIMATION_EASING.easeInOut).toBe('cubic-bezier(0.4, 0.0, 0.2, 1)');
    });
  });

  describe('getStaggerDelay', () => {
    it('should calculate correct delay for index 0', () => {
      const result = getStaggerDelay(0, 100);
      expect(result).toBe('animation-delay-0');
    });

    it('should calculate correct delay for index 1', () => {
      const result = getStaggerDelay(1, 100);
      expect(result).toBe('animation-delay-100');
    });

    it('should calculate correct delay for index 2', () => {
      const result = getStaggerDelay(2, 100);
      expect(result).toBe('animation-delay-200');
    });

    it('should use default base delay of 100ms', () => {
      const result = getStaggerDelay(3);
      expect(result).toBe('animation-delay-300');
    });

    it('should handle custom base delays', () => {
      expect(getStaggerDelay(2, 50)).toBe('animation-delay-100');
      expect(getStaggerDelay(2, 200)).toBe('animation-delay-400');
    });
  });
});
