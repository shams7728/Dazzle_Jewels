"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { animatePageEntrance, animateFloatingElement, cleanupAnimations } from '@/lib/utils/auth-animations';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLink,
  footerLinkText,
}: AuthLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const decorRef1 = useRef<HTMLDivElement>(null);
  const decorRef2 = useRef<HTMLDivElement>(null);
  const decorRef3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      // Animate page entrance
      animatePageEntrance(containerRef.current);

      // Animate floating decorative elements
      if (decorRef1.current) animateFloatingElement(decorRef1.current, { duration: 4, distance: 30 });
      if (decorRef2.current) animateFloatingElement(decorRef2.current, { duration: 5, distance: 25 });
      if (decorRef3.current) animateFloatingElement(decorRef3.current, { duration: 6, distance: 35 });
    }

    return () => {
      if (containerRef.current) {
        cleanupAnimations(containerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-gradient-to-br from-background via-pink-50/50 to-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div
          ref={decorRef1}
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/20 to-pink-300/20 rounded-full blur-3xl"
        />
        <div
          ref={decorRef2}
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-400/15 to-primary/10 rounded-full blur-3xl"
        />
        <div
          ref={decorRef3}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="relative w-full max-w-md z-10">
        {/* Card Container */}
        <div
          data-animate
          className="relative backdrop-blur-xl bg-card/80 border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />

          {/* Content */}
          <div className="relative p-8">
            {/* Logo */}
            <div data-animate className="text-center mb-6">
              <Link href="/" className="inline-block">
                <div className="relative group">
                  <div className="w-16 h-16 mx-auto rounded-xl overflow-hidden bg-white p-2">
                    <img
                      src="/logo-white.jpg"
                      alt="Dazzle Jewelry"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </Link>
            </div>

            {/* Header */}
            <div data-animate className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>

            {/* Form Content */}
            {children}

            {/* Footer */}
            <div data-animate className="mt-6 text-center text-sm text-muted-foreground">
              {footerText}{' '}
              <Link
                href={footerLink}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {footerLinkText}
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div data-animate className="mt-6 flex items-center justify-center gap-6 text-xs text-neutral-500">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span>Encrypted</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Trusted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
