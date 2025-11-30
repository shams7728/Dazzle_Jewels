"use client";

import { useMemo, useCallback, memo } from 'react';
import { useSearchStore } from '@/lib/store/search';
import { cn } from '@/lib/utils';
import { calculateFilterCounts } from '@/lib/utils/filters';
import { Check } from 'lucide-react';

// Color mapping for visual swatches
const colorMap: Record<string, string> = {
  gold: 'bg-yellow-500',
  silver: 'bg-gray-300',
  'rose gold': 'bg-rose-400',
  platinum: 'bg-gray-100',
  white: 'bg-white',
  yellow: 'bg-yellow-400',
  pink: 'bg-pink-400',
  blue: 'bg-blue-400',
  green: 'bg-green-400',
  black: 'bg-black',
  red: 'bg-red-500',
};

function ColorFilterComponent() {
  const { filters, updateFilter, products } = useSearchStore();

  // Get all unique colors and their counts (memoized)
  const colorOptions = useMemo(() => {
    const allColors = new Set<string>();
    products.forEach((p) => {
      p.availableColors.forEach((c) => allColors.add(c));
    });

    const counts = calculateFilterCounts(products, filters);
    
    return Array.from(allColors).map((color) => ({
      value: color,
      label: color.charAt(0).toUpperCase() + color.slice(1),
      count: counts.colors[color] || 0,
      colorClass: colorMap[color.toLowerCase()] || 'bg-neutral-500',
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [products, filters]);

  // Memoize toggle handler
  const handleToggle = useCallback((color: string) => {
    const current = filters.colors;
    const updated = current.includes(color)
      ? current.filter((c) => c !== color)
      : [...current, color];
    updateFilter('colors', updated);
  }, [filters.colors, updateFilter]);

  if (colorOptions.length === 0) {
    return (
      <div className="text-sm text-neutral-500 text-center py-4">
        No colors available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3" role="group" aria-label="Color filter options">
      {colorOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleToggle(option.value)}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
            'hover:border-yellow-500 active:scale-95 touch-manipulation', // Mobile optimization
            filters.colors.includes(option.value)
              ? 'border-yellow-500 bg-yellow-500/10'
              : 'border-neutral-600 bg-neutral-800'
          )}
          aria-label={`${option.label} color (${option.count} products)`}
          aria-pressed={filters.colors.includes(option.value)}
        >
          {/* Color Swatch */}
          <div className="relative flex-shrink-0" aria-hidden="true">
            <div
              className={cn(
                'w-6 h-6 rounded-full border-[3px]',
                option.colorClass,
                filters.colors.includes(option.value)
                  ? 'border-yellow-500'
                  : 'border-neutral-500'
              )}
            />
            {filters.colors.includes(option.value) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="w-4 h-4 text-white drop-shadow-lg" strokeWidth={3} />
              </div>
            )}
          </div>

          {/* Label and Count */}
          <div className="flex-1 text-left min-w-0" aria-hidden="true">
            <div className="text-white text-sm truncate">{option.label}</div>
            <div className="text-xs text-neutral-500">({option.count})</div>
          </div>
        </button>
      ))}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export const ColorFilter = memo(ColorFilterComponent);
