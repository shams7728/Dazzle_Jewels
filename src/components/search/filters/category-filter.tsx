"use client";

import { useSearchStore } from '@/lib/store/search';
import { cn } from '@/lib/utils';

export function CategoryFilter() {
  const { filters, updateFilter, categories, isLoading } = useSearchStore();

  const handleToggle = (categoryId: string) => {
    const current = filters.categories;
    const updated = current.includes(categoryId)
      ? current.filter((c) => c !== categoryId)
      : [...current, categoryId];
    updateFilter('categories', updated);
  };

  if (isLoading) {
    return <div className="text-sm text-neutral-500 text-center py-4">Loading...</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="text-sm text-neutral-500 text-center py-4">
        No categories available
      </div>
    );
  }

  return (
    <div className="space-y-2" role="group" aria-label="Category filter options">
      {categories.map((category) => (
        <label
          key={category.id}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg cursor-pointer',
            'hover:bg-neutral-800 transition-colors',
            filters.categories.includes(category.id) && 'bg-neutral-800'
          )}
        >
          <input
            type="checkbox"
            checked={filters.categories.includes(category.id)}
            onChange={() => handleToggle(category.id)}
            className={cn(
              'w-4 h-4 rounded border-neutral-600 bg-neutral-700',
              'text-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-0',
              'cursor-pointer'
            )}
            aria-label={`${category.name} category`}
          />
          <span className="text-white text-sm" aria-hidden="true">{category.name}</span>
        </label>
      ))}
    </div>
  );
}
