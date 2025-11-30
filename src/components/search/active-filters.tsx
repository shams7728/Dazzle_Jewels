"use client";

import { X } from 'lucide-react';
import { useSearchStore } from '@/lib/store/search';
import { cn } from '@/lib/utils';

export function ActiveFilters() {
  const { filters, clearFilter, clearAllFilters, getActiveFilterCount } = useSearchStore();
  const activeCount = getActiveFilterCount();

  if (activeCount === 0) return null;

  const activeFilters: Array<{ type: string; label: string; onRemove: () => void }> = [];

  // Price Range
  if (filters.priceRange.min > 0 || filters.priceRange.max < 100000) {
    activeFilters.push({
      type: 'price',
      label: `₹${filters.priceRange.min.toLocaleString()} - ₹${filters.priceRange.max.toLocaleString()}`,
      onRemove: () => clearFilter('priceRange'),
    });
  }

  // Materials
  filters.materials.forEach((material) => {
    activeFilters.push({
      type: 'material',
      label: material.charAt(0).toUpperCase() + material.slice(1),
      onRemove: () => {
        const updated = filters.materials.filter((m) => m !== material);
        clearFilter('materials');
        if (updated.length > 0) {
          // Re-apply remaining materials
          setTimeout(() => {
            useSearchStore.getState().updateFilter('materials', updated);
          }, 0);
        }
      },
    });
  });

  // Colors
  filters.colors.forEach((color) => {
    activeFilters.push({
      type: 'color',
      label: color.charAt(0).toUpperCase() + color.slice(1),
      onRemove: () => {
        const updated = filters.colors.filter((c) => c !== color);
        clearFilter('colors');
        if (updated.length > 0) {
          setTimeout(() => {
            useSearchStore.getState().updateFilter('colors', updated);
          }, 0);
        }
      },
    });
  });

  // Categories
  filters.categories.forEach((categoryId) => {
    activeFilters.push({
      type: 'category',
      label: 'Category',
      onRemove: () => {
        const updated = filters.categories.filter((c) => c !== categoryId);
        clearFilter('categories');
        if (updated.length > 0) {
          setTimeout(() => {
            useSearchStore.getState().updateFilter('categories', updated);
          }, 0);
        }
      },
    });
  });

  // Rating
  if (filters.minRating !== null) {
    activeFilters.push({
      type: 'rating',
      label: `${filters.minRating}+ Stars`,
      onRemove: () => clearFilter('minRating'),
    });
  }

  // Availability
  if (filters.availability !== 'all') {
    activeFilters.push({
      type: 'availability',
      label: filters.availability === 'in_stock' ? 'In Stock' : 'Out of Stock',
      onRemove: () => clearFilter('availability'),
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="region" aria-label="Active filters">
      <span className="text-sm text-neutral-400" aria-hidden="true">Active Filters:</span>
      
      {activeFilters.map((filter, index) => (
        <button
          key={`${filter.type}-${index}`}
          onClick={filter.onRemove}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
            'bg-yellow-500/10 border border-yellow-500/30',
            'text-yellow-500 text-sm',
            'hover:bg-yellow-500/20 hover:border-yellow-500/50',
            'transition-all duration-200',
            'group'
          )}
          aria-label={`Remove ${filter.label} filter`}
        >
          <span>{filter.label}</span>
          <X className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" aria-hidden="true" />
        </button>
      ))}

      {activeFilters.length > 1 && (
        <button
          onClick={clearAllFilters}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
            'bg-neutral-800 border border-neutral-700',
            'text-neutral-300 text-sm',
            'hover:bg-neutral-700 hover:text-white',
            'transition-all duration-200'
          )}
          aria-label={`Clear all ${activeFilters.length} filters`}
        >
          Clear All
        </button>
      )}
    </div>
  );
}
