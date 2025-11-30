"use client";

import { useSearchStore } from '@/lib/store/search';
import { cn } from '@/lib/utils';
import { Package, PackageX } from 'lucide-react';

export function AvailabilityFilter() {
  const { filters, updateFilter } = useSearchStore();

  const options = [
    { value: 'all' as const, label: 'All Products', icon: Package },
    { value: 'in_stock' as const, label: 'In Stock', icon: Package },
    { value: 'out_of_stock' as const, label: 'Out of Stock', icon: PackageX },
  ];

  return (
    <div className="space-y-2" role="group" aria-label="Availability filter options">
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            onClick={() => updateFilter('availability', option.value)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-lg transition-all',
              'hover:bg-neutral-800',
              filters.availability === option.value
                ? 'bg-yellow-500/10 border border-yellow-500'
                : 'bg-neutral-800/50 border border-transparent'
            )}
            aria-label={`Filter by ${option.label}`}
            aria-pressed={filters.availability === option.value}
          >
            <Icon className="w-5 h-5 text-neutral-400" aria-hidden="true" />
            <span className="text-white text-sm" aria-hidden="true">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
