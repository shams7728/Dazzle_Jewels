"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HorizontalScrollContainerProps {
  children: ReactNode;
  className?: string;
  showGradients?: boolean;
  gap?: "sm" | "md" | "lg";
}

const gapClasses = {
  sm: "gap-3 sm:gap-4",
  md: "gap-4 sm:gap-5 lg:gap-6",
  lg: "gap-5 sm:gap-6 lg:gap-7",
};

export function HorizontalScrollContainer({
  children,
  className,
  showGradients = true,
  gap = "md",
}: HorizontalScrollContainerProps) {
  return (
    <div className={cn("relative -mx-4 sm:-mx-6 lg:-mx-8", className)}>
      {/* Gradient Fade Edges */}
      {showGradients && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-black to-transparent sm:w-12 lg:w-16" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-black to-transparent sm:w-12 lg:w-16" />
        </>
      )}

      {/* Scrollable Container */}
      <div
        className={cn(
          "flex overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8 scrollbar-hide snap-x snap-mandatory scroll-smooth",
          gapClasses[gap]
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface HorizontalScrollItemProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

export function HorizontalScrollItem({
  children,
  className,
  index = 0,
}: HorizontalScrollItemProps) {
  return (
    <div
      className={cn(
        "flex-none w-[160px] xs:w-[180px] sm:w-[220px] md:w-[260px] lg:w-[280px] xl:w-[300px] snap-start transform transition-all duration-300 hover:scale-105",
        className
      )}
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
      }}
    >
      {children}
    </div>
  );
}
