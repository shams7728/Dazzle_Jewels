"use client";

import { useMemo, useCallback, memo } from 'react';
import { useSearchStore } from '@/lib/store/search';
import { cn } from '@/lib/utils';
import { calculateFilterCounts } from '@/lib/utils/filters';

function MaterialFilterComponent() {
  const { filters, updateFilter, products } = useSearchStore();

  // Get all unique materials and their counts (memoized)
  const materialOptions = useMemo(() => {
    const allMaterials = new Set<string>();
    products.forEach((p) => {
      p.availableMaterials.forEach((m) => allMaterials.add(m));
    });

    const counts = calculateFilterCounts(products, filters);
    
    return Array.from(allMaterials).map((material) => ({
      value: material,
      label: material.charAt(0).toUpperCase() + material.slice(1),
      count: counts.materials[material] || 0,
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [products, filters]);

  // Memoize toggle handler to prevent re-renders
  const handleToggle = useCallback((material: string) => {
    const current = filters.materials;
    const updated = current.includes(material)
      ? current.filter((m) => m !== material)
      : [...current, material];
    updateFilter('materials', updated);
  }, [filters.materials, updateFilter]);

  if (materialOptions.length === 0) {
    return (
      <div className="text-sm text-neutral-500 text-center py-4">
        No materials available
      </div>
    );
  }

  return (
    <div className="space-y-2" role="group" aria-label="Material filter options">
      {materialOptions.map((option) => (
        <label
          key={option.value}
          className={cn(
            'flex items-center justify-between p-3 rounded-lg cursor-pointer',
            'hover:bg-neutral-800 transition-colors',
            'active:scale-95 touch-manipulation', // Mobile optimization
            filters.materials.includes(option.value) && 'bg-neutral-800'
          )}
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={filters.materials.includes(option.value)}
              onChange={() => handleToggle(option.value)}
              className={cn(
                'w-4 h-4 rounded border-neutral-600 bg-neutral-700',
                'text-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-0',
                'cursor-pointer touch-manipulation' // Mobile optimization
              )}
              aria-label={`${option.label} (${option.count} products)`}
            />
            <span className="text-white text-sm" aria-hidden="true">{option.label}</span>
          </div>
          <span className="text-xs text-neutral-500" aria-hidden="true">({option.count})</span>
        </label>
      ))}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export const MaterialFilter = memo(MaterialFilterComponent);
