"use client";

import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { animateInputFocus, animateInputBlur } from '@/lib/utils/auth-animations';
import gsap from 'gsap';

interface AnimatedInputProps {
  id: string;
  name: string;
  type: 'text' | 'email' | 'password';
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  error?: string;
}

export function AnimatedInput({
  id,
  name,
  type,
  label,
  value,
  onChange,
  required = false,
  autoComplete,
  error,
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLLabelElement>(null);

  const isPasswordType = type === 'password';
  const inputType = isPasswordType && showPassword ? 'text' : type;

  useEffect(() => {
    if (error && containerRef.current) {
      // Shake animation on error
      gsap.to(containerRef.current, {
        x: [-5, 5, -5, 5, 0],
        duration: 0.4,
        ease: 'power2.inOut',
      });
    }
  }, [error]);

  const handleFocus = () => {
    setIsFocused(true);
    if (containerRef.current) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        animateInputFocus(containerRef.current);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (containerRef.current) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        animateInputBlur(containerRef.current);
      }
    }
  };

  const isFloating = isFocused || value.length > 0;

  return (
    <div ref={containerRef} data-animate className="relative">
      <div
        className={`relative rounded-lg border transition-all duration-300 ${
          error
            ? 'border-red-500/50 bg-red-500/5'
            : isFocused
            ? 'border-gold-500/50 bg-gold-500/5'
            : 'border-neutral-800 bg-neutral-900/50'
        }`}
      >
        {/* Floating Label */}
        <label
          ref={labelRef}
          htmlFor={id}
          className={`absolute left-4 transition-all duration-300 pointer-events-none ${
            isFloating
              ? 'top-2 text-xs text-gold-500'
              : 'top-1/2 -translate-y-1/2 text-sm text-neutral-400'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Input */}
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          autoComplete={autoComplete}
          className={`w-full bg-transparent border-0 outline-none text-white px-4 transition-all duration-300 ${
            isFloating ? 'pt-7 pb-2' : 'py-4'
          } ${isPasswordType ? 'pr-12' : ''}`}
        />

        {/* Password Toggle */}
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-gold-500 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}

        {/* Focus Ring */}
        {isFocused && !error && (
          <div className="absolute inset-0 rounded-lg ring-2 ring-gold-500/30 pointer-events-none" />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
