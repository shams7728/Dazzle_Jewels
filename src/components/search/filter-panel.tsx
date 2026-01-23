"use client";

import { useState, memo, useMemo } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useSearchStore } from '@/lib/store/search';
import { cn } from '@/lib/utils';
import { PriceRangeFilter } from './filters/price-range-filter';
import { MaterialFilter } from './filters/material-filter';
import { ColorFilter } from './filters/color-filter';
import { CategoryFilter } from './filters/category-filter';
import { RatingFilter } from './filters/rating-filter';
import { AvailabilityFilter } from './filters/availability-filter';

interface FilterSection {
  id: string;
  title: string;
  component: React.ComponentType;
  defaultOpen?: boolean;
}

const filterSections: FilterSection[] = [
  { id: 'price', title: 'Price Range', component: PriceRangeFilter, defaultOpen: true },
  { id: 'material', title: 'Material', component: MaterialFilter, defaultOpen: true },
  { id: 'color', title: 'Color', component: ColorFilter, defaultOpen: true },
  { id: 'category', title: 'Category', component: CategoryFilter },
  { id: 'rating', title: 'Rating', component: RatingFilter },
  { id: 'availability', title: 'Availability', component: AvailabilityFilter },
];

function FilterPanelComponent() {
  const { clearAllFilters, getActiveFilterCount, filters } = useSearchStore();
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(filterSections.filter((s) => s.defaultOpen).map((s) => s.id))
  );

  // Memoize active count calculation
  const activeCount = useMemo(() => {
    return getActiveFilterCount();
  }, [filters, getActiveFilterCount]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with Clear All */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        {activeCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            aria-label={`Clear all ${activeCount} active filters`}
          >
            <X className="w-4 h-4" aria-hidden="true" />
            Clear All ({activeCount})
          </button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="space-y-3">
        {filterSections.map((section) => {
          const isOpen = openSections.has(section.id);
          const Component = section.component;

          return (
            <div
              key={section.id}
              className="border border-border rounded-lg bg-card overflow-hidden shadow-sm"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                aria-expanded={isOpen}
                aria-controls={`filter-section-${section.id}`}
                aria-label={`${section.title} filter section`}
              >
                <span className="font-medium text-foreground">{section.title}</span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                )}
              </button>

              {/* Section Content */}
              {isOpen && (
                <div
                  id={`filter-section-${section.id}`}
                  className="p-4 pt-0 border-t border-border"
                  role="region"
                  aria-label={`${section.title} filter options`}
                >
                  <Component />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const FilterPanel = memo(FilterPanelComponent);
