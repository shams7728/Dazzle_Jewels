import { useState, useEffect, useMemo } from 'react';
import { Product, ProductVariant } from '@/types';
import { VariantState } from '@/types/product-detail';
import {
  calculateEffectivePrice,
  getStockStatus,
  getAvailableColors,
  getAvailableMaterials,
} from '@/lib/utils/product-detail';

interface UseProductStateReturn {
  selectedVariant: ProductVariant | null;
  selectVariant: (variant: ProductVariant) => void;
  currentPrice: number;
  displayedImages: string[];
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  variantState: VariantState;
}

/**
 * Custom hook for managing product state including variant selection
 * @param product - The product object
 * @returns Product state and handlers
 */
export function useProductState(product: Product): UseProductStateReturn {
  const variants = product.variants ?? [];
  
  // Initialize with first available variant or null
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.length > 0 ? variants[0] : null
  );

  // Calculate current price based on selected variant
  const currentPrice = useMemo(
    () => calculateEffectivePrice(product, selectedVariant),
    [product, selectedVariant]
  );

  // Get displayed images based on selected variant or product
  const displayedImages = useMemo(() => {
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      return selectedVariant.images;
    }
    // Fallback to empty array if no images available
    return [];
  }, [selectedVariant]);

  // Calculate stock status
  const stockStatus = useMemo(() => {
    if (selectedVariant) {
      return getStockStatus(selectedVariant.stock_quantity);
    }
    // If no variant selected, check if any variant is in stock
    const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0);
    return getStockStatus(totalStock);
  }, [selectedVariant, variants]);

  // Build variant state
  const variantState: VariantState = useMemo(
    () => ({
      selectedVariant,
      availableColors: getAvailableColors(variants),
      availableMaterials: getAvailableMaterials(variants),
      stockStatus,
    }),
    [selectedVariant, variants, stockStatus]
  );

  // Handler for variant selection
  const selectVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  return {
    selectedVariant,
    selectVariant,
    currentPrice,
    displayedImages,
    stockStatus,
    variantState,
  };
}
