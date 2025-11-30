'use client';

import { useState } from 'react';
import { ProductVariant } from '@/types';
import { VariantSelectorProps } from '@/types/product-detail';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export function VariantSelector({
  variants,
  selectedVariant,
  onSelect,
  type,
}: VariantSelectorProps) {
  const [hoveredVariant, setHoveredVariant] = useState<ProductVariant | null>(null);

  // Group variants by the specified type
  const getVariantValue = (variant: ProductVariant): string | undefined => {
    if (type === 'color') return variant.color;
    if (type === 'material') return variant.material;
    return undefined;
  };

  // Get unique values for the specified type
  const uniqueValues = Array.from(
    new Set(
      variants
        .map(getVariantValue)
        .filter((value): value is string => !!value)
    )
  );

  // Find variant by value
  const findVariantByValue = (value: string): ProductVariant | undefined => {
    return variants.find((v) => getVariantValue(v) === value);
  };

  // Render color swatches
  if (type === 'color') {
    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-400">
          Select Color
        </label>
        <div className="flex flex-wrap gap-3" data-testid="color-selector">
          {uniqueValues.map((color) => {
            const variant = findVariantByValue(color);
            if (!variant) return null;

            const isSelected = selectedVariant?.id === variant.id;
            const isOutOfStock = variant.stock_quantity === 0;

            return (
              <div
                key={variant.id}
                className="relative"
                onMouseEnter={() => setHoveredVariant(variant)}
                onMouseLeave={() => setHoveredVariant(null)}
              >
                <button
                  onClick={() => !isOutOfStock && onSelect(variant)}
                  disabled={isOutOfStock}
                  className={cn(
                    'relative rounded-full border-2 transition-all touch-manipulation',
                    'h-12 w-12 min-h-[48px] min-w-[48px]', // Minimum 48px for better touch
                    'md:h-12 md:w-12',
                    isSelected && 'border-yellow-500 ring-2 ring-yellow-500/30',
                    !isSelected && !isOutOfStock && 'border-neutral-700 hover:border-neutral-500',
                    isOutOfStock && 'border-neutral-800 opacity-50 cursor-not-allowed'
                  )}
                  style={{
                    backgroundColor: getColorHex(color),
                  }}
                  data-testid={`color-swatch-${variant.id}`}
                  data-color={color}
                  aria-label={`Select ${color} color`}
                  aria-disabled={isOutOfStock}
                >
                  {isSelected && (
                    <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-lg" />
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-0.5 w-full rotate-45 bg-red-500" />
                    </div>
                  )}
                </button>

                {/* Hover Preview Tooltip */}
                {hoveredVariant?.id === variant.id && (
                  <div
                    className="absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 animate-in fade-in slide-in-from-top-1 duration-200"
                    data-testid="variant-preview"
                  >
                    <div className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 shadow-xl">
                      <p className="text-xs font-medium text-white whitespace-nowrap">
                        {color}
                      </p>
                      {variant.material && (
                        <p className="text-xs text-neutral-400 whitespace-nowrap">
                          {variant.material}
                        </p>
                      )}
                      <p className="text-xs text-neutral-400 whitespace-nowrap">
                        {isOutOfStock ? 'Out of Stock' : `${variant.stock_quantity} in stock`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render button groups for material/size
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-neutral-400">
        Select {type === 'material' ? 'Material' : 'Size'}
      </label>
      <div className="flex flex-wrap gap-3" data-testid={`${type}-selector`}>
        {uniqueValues.map((value) => {
          const variant = findVariantByValue(value);
          if (!variant) return null;

          const isSelected = selectedVariant?.id === variant.id;
          const isOutOfStock = variant.stock_quantity === 0;

          return (
            <div
              key={variant.id}
              className="relative"
              onMouseEnter={() => setHoveredVariant(variant)}
              onMouseLeave={() => setHoveredVariant(null)}
            >
              <button
                onClick={() => !isOutOfStock && onSelect(variant)}
                disabled={isOutOfStock}
                className={cn(
                  'rounded-lg border px-4 py-3 text-sm font-medium transition-all touch-manipulation',
                  'min-w-[80px] min-h-[44px]', // Minimum touch target
                  'md:py-2 md:min-h-[40px]',
                  isSelected && 'border-yellow-500 bg-yellow-500/10 text-yellow-500',
                  !isSelected && !isOutOfStock && 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-600',
                  isOutOfStock && 'border-neutral-800 bg-neutral-900/50 text-neutral-600 cursor-not-allowed opacity-50'
                )}
                data-testid={`${type}-button-${variant.id}`}
                data-value={value}
                aria-label={`Select ${value}`}
                aria-disabled={isOutOfStock}
              >
                {value}
                {isOutOfStock && (
                  <span className="ml-1 text-xs">(Out of Stock)</span>
                )}
              </button>

              {/* Hover Preview Tooltip */}
              {hoveredVariant?.id === variant.id && (
                <div
                  className="absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 animate-in fade-in slide-in-from-top-1 duration-200"
                  data-testid="variant-preview"
                >
                  <div className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 shadow-xl">
                    <p className="text-xs font-medium text-white whitespace-nowrap">
                      {value}
                    </p>
                    {variant.color && (
                      <p className="text-xs text-neutral-400 whitespace-nowrap">
                        {variant.color}
                      </p>
                    )}
                    <p className="text-xs text-neutral-400 whitespace-nowrap">
                      {isOutOfStock ? 'Out of Stock' : `${variant.stock_quantity} in stock`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Helper function to get hex color code from color name
 * This is a simple mapping - in production, you might want to store hex codes in the database
 */
function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    'Gold': '#FFD700',
    'Silver': '#C0C0C0',
    'Rose Gold': '#B76E79',
    'Platinum': '#E5E4E2',
    'White Gold': '#F4F4F4',
    'Yellow Gold': '#FFD700',
    'Red': '#DC2626',
    'Blue': '#2563EB',
    'Green': '#16A34A',
    'Black': '#000000',
    'White': '#FFFFFF',
    'Pink': '#EC4899',
    'Purple': '#9333EA',
    'Orange': '#EA580C',
    'Brown': '#92400E',
  };

  return colorMap[colorName] || '#6B7280'; // Default to gray if color not found
}
