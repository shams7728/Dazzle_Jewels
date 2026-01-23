"use client";

import { useState, useEffect } from 'react';
import { useSearchStore } from '@/lib/store/search';
import { cn } from '@/lib/utils';

export function PriceRangeFilter() {
  const { filters, updateFilter } = useSearchStore();
  const [localMin, setLocalMin] = useState(filters.priceRange.min);
  const [localMax, setLocalMax] = useState(filters.priceRange.max);

  // Sync with store
  useEffect(() => {
    setLocalMin(filters.priceRange.min);
    setLocalMax(filters.priceRange.max);
  }, [filters.priceRange]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setLocalMin(value);
    if (value <= localMax) {
      updateFilter('priceRange', { min: value, max: localMax });
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setLocalMax(value);
    if (value >= localMin) {
      updateFilter('priceRange', { min: localMin, max: value });
    }
  };

  return (
    <div className="space-y-4" role="group" aria-labelledby="price-range-label">
      <div id="price-range-label" className="sr-only">Price range filter</div>
      <div className="flex items-center justify-between text-sm" aria-live="polite">
        <span className="text-muted-foreground" aria-label={`Minimum price: ${localMin} rupees`}>₹{localMin.toLocaleString()}</span>
        <span className="text-muted-foreground" aria-label={`Maximum price: ${localMax} rupees`}>₹{localMax.toLocaleString()}</span>
      </div>

      <div className="space-y-3">
        {/* Min Price Slider */}
        <div>
          <input
            type="range"
            min="0"
            max="100000"
            step="1000"
            value={localMin}
            onChange={handleMinChange}
            className={cn(
              'w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer',
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:w-4',
              '[&::-webkit-slider-thumb]:h-4',
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:bg-primary',
              '[&::-webkit-slider-thumb]:cursor-pointer',
              '[&::-moz-range-thumb]:w-4',
              '[&::-moz-range-thumb]:h-4',
              '[&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:bg-primary',
              '[&::-moz-range-thumb]:border-0',
              '[&::-moz-range-thumb]:cursor-pointer'
            )}
            aria-label="Minimum price"
          />
        </div>

        {/* Max Price Slider */}
        <div>
          <input
            type="range"
            min="0"
            max="100000"
            step="1000"
            value={localMax}
            onChange={handleMaxChange}
            className={cn(
              'w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer',
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:w-4',
              '[&::-webkit-slider-thumb]:h-4',
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:bg-primary',
              '[&::-webkit-slider-thumb]:cursor-pointer',
              '[&::-moz-range-thumb]:w-4',
              '[&::-moz-range-thumb]:h-4',
              '[&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:bg-primary',
              '[&::-moz-range-thumb]:border-0',
              '[&::-moz-range-thumb]:cursor-pointer'
            )}
            aria-label="Maximum price"
          />
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="price-min-input" className="text-xs text-muted-foreground mb-1 block">Min</label>
          <input
            id="price-min-input"
            type="number"
            value={localMin}
            onChange={handleMinChange}
            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            min="0"
            max={localMax}
            aria-label="Minimum price in rupees"
          />
        </div>
        <div>
          <label htmlFor="price-max-input" className="text-xs text-muted-foreground mb-1 block">Max</label>
          <input
            id="price-max-input"
            type="number"
            value={localMax}
            onChange={handleMaxChange}
            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            min={localMin}
            max="100000"
            aria-label="Maximum price in rupees"
          />
        </div>
      </div>
    </div>
  );
}
