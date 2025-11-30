"use client";

import { useSearchStore } from '@/lib/store/search';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

const ratingOptions = [
  { value: 4, label: '4+ Stars' },
  { value: 3, label: '3+ Stars' },
  { value: 2, label: '2+ Stars' },
  { value: 1, label: '1+ Stars' },
];

export function RatingFilter() {
  const { filters, updateFilter } = useSearchStore();

  const handleSelect = (rating: number) => {
    // Toggle: if same rating is clicked, clear it
    const newRating = filters.minRating === rating ? null : rating;
    updateFilter('minRating', newRating);
  };

  return (
    <div className="space-y-2" role="group" aria-label="Rating filter options">
      {ratingOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleSelect(option.value)}
          className={cn(
            'w-full flex items-center gap-3 p-3 rounded-lg transition-all',
            'hover:bg-neutral-800',
            filters.minRating === option.value
              ? 'bg-yellow-500/10 border border-yellow-500'
              : 'bg-neutral-800/50 border border-transparent'
          )}
          aria-label={`Filter by ${option.label}`}
          aria-pressed={filters.minRating === option.value}
        >
          <div className="flex items-center gap-1" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-4 h-4',
                  i < option.value
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'text-neutral-600'
                )}
              />
            ))}
          </div>
          <span className="text-white text-sm" aria-hidden="true">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
