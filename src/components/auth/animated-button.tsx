"use client";

import { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import gsap from 'gsap';

interface AnimatedButtonProps {
  type?: 'button' | 'submit';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function AnimatedButton({
  type = 'button',
  loading = false,
  disabled = false,
  children,
  onClick,
  variant = 'primary',
}: AnimatedButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading && buttonRef.current) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        gsap.to(buttonRef.current, {
          scale: 0.98,
          duration: 0.2,
        });
      }
    } else if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1,
        duration: 0.2,
      });
    }
  }, [loading]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Ripple effect
    if (rippleRef.current && buttonRef.current) {
      const button = buttonRef.current;
      const ripple = rippleRef.current;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        gsap.set(ripple, {
          width: size,
          height: size,
          x,
          y,
          opacity: 0.5,
          scale: 0,
        });

        gsap.to(ripple, {
          scale: 2,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
        });
      }
    }

    onClick?.();
  };

  const isPrimary = variant === 'primary';

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`relative w-full py-4 px-6 rounded-lg font-semibold text-base overflow-hidden transition-all duration-300 ${isPrimary
          ? 'bg-gradient-to-r from-primary via-pink-500 to-pink-600 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40'
          : 'bg-muted text-foreground hover:bg-muted/80'
        } ${disabled || loading
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:scale-[1.02] active:scale-[0.98]'
        }`}
    >
      {/* Ripple Effect */}
      <div
        ref={rippleRef}
        className="absolute rounded-full bg-white pointer-events-none"
        style={{ opacity: 0 }}
      />

      {/* Shine Effect */}
      {!loading && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      )}

      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {children}
      </span>
    </button>
  );
}
