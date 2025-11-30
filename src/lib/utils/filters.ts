/**
 * Filtering logic for the Advanced Search and Filtering System
 */

import { Product, ProductVariant, SearchableProduct, SearchFilters } from '@/types';

/**
 * Calculate the effective price for a product (considering discounts)
 * @param product - The product to calculate price for
 * @param variant - Optional variant for price adjustment
 * @returns The effective price
 */
export function getEffectivePrice(
  product: Product,
  variant?: ProductVariant
): number {
  // Use discount price if available and lower than base price
  const basePrice =
    product.discount_price && product.discount_price < product.base_price
      ? product.discount_price
      : product.base_price;

  // Add variant price adjustment if variant exists
  return variant ? basePrice + variant.price_adjustment : basePrice;
}

/**
 * Check if a product is in stock (has at least one variant with stock)
 * @param product - The product to check
 * @returns True if in stock, false otherwise
 */
export function isProductInStock(product: Product): boolean {
  if (!product.variants || product.variants.length === 0) return false;
  return product.variants.some((v) => v.stock_quantity > 0);
}

/**
 * Get all unique materials from a product's variants
 * @param product - The product to extract materials from
 * @returns Array of unique materials
 */
export function getProductMaterials(product: Product): string[] {
  if (!product.variants || product.variants.length === 0) return [];
  
  const materials = product.variants
    .map((v) => v.material)
    .filter((m): m is string => !!m);
  
  return [...new Set(materials)];
}

/**
 * Get all unique colors from a product's variants
 * @param product - The product to extract colors from
 * @returns Array of unique colors
 */
export function getProductColors(product: Product): string[] {
  if (!product.variants || product.variants.length === 0) return [];
  
  const colors = product.variants
    .map((v) => v.color)
    .filter((c): c is string => !!c);
  
  return [...new Set(colors)];
}

/**
 * Filter products by price range
 * @param products - Array of products to filter
 * @param priceRange - Min and max price range
 * @returns Filtered products within price range
 */
export function applyPriceFilter(
  products: SearchableProduct[],
  priceRange: { min: number; max: number }
): SearchableProduct[] {
  return products.filter((product) => {
    const price = product.effectivePrice;
    return price >= priceRange.min && price <= priceRange.max;
  });
}

/**
 * Filter products by materials (OR logic - matches any selected material)
 * @param products - Array of products to filter
 * @param materials - Array of material names to filter by
 * @returns Filtered products matching any of the materials
 */
export function applyMaterialFilter(
  products: SearchableProduct[],
  materials: string[]
): SearchableProduct[] {
  if (materials.length === 0) return products;

  return products.filter((product) => {
    return product.availableMaterials.some((material) =>
      materials.includes(material)
    );
  });
}

/**
 * Filter products by colors (OR logic - matches any selected color)
 * @param products - Array of products to filter
 * @param colors - Array of color names to filter by
 * @returns Filtered products matching any of the colors
 */
export function applyColorFilter(
  products: SearchableProduct[],
  colors: string[]
): SearchableProduct[] {
  if (colors.length === 0) return products;

  return products.filter((product) => {
    return product.availableColors.some((color) => colors.includes(color));
  });
}

/**
 * Filter products by category
 * @param products - Array of products to filter
 * @param categories - Array of category IDs to filter by
 * @returns Filtered products matching the categories
 */
export function applyCategoryFilter(
  products: SearchableProduct[],
  categories: string[]
): SearchableProduct[] {
  if (categories.length === 0) return products;

  return products.filter((product) => {
    return product.category_id && categories.includes(product.category_id);
  });
}

/**
 * Filter products by minimum rating
 * Excludes products with no reviews
 * @param products - Array of products to filter
 * @param minRating - Minimum average rating threshold
 * @returns Filtered products with rating >= minRating
 */
export function applyRatingFilter(
  products: SearchableProduct[],
  minRating: number | null
): SearchableProduct[] {
  if (minRating === null) return products;

  return products.filter((product) => {
    // Exclude products with no reviews
    if (product.reviewCount === 0) return false;
    return product.averageRating >= minRating;
  });
}

/**
 * Filter products by stock availability
 * @param products - Array of products to filter
 * @param availability - 'all', 'in_stock', or 'out_of_stock'
 * @returns Filtered products based on availability
 */
export function applyAvailabilityFilter(
  products: SearchableProduct[],
  availability: 'all' | 'in_stock' | 'out_of_stock'
): SearchableProduct[] {
  if (availability === 'all') return products;

  if (availability === 'in_stock') {
    return products.filter((product) => product.isInStock);
  }

  // out_of_stock
  return products.filter((product) => !product.isInStock);
}

/**
 * Apply all filters to a product list
 * @param products - Array of products to filter
 * @param filters - Complete filter state
 * @returns Filtered products
 */
export function applyAllFilters(
  products: SearchableProduct[],
  filters: SearchFilters
): SearchableProduct[] {
  let filtered = products;

  // Apply price filter
  filtered = applyPriceFilter(filtered, filters.priceRange);

  // Apply material filter
  filtered = applyMaterialFilter(filtered, filters.materials);

  // Apply color filter
  filtered = applyColorFilter(filtered, filters.colors);

  // Apply category filter
  filtered = applyCategoryFilter(filtered, filters.categories);

  // Apply rating filter
  filtered = applyRatingFilter(filtered, filters.minRating);

  // Apply availability filter
  filtered = applyAvailabilityFilter(filtered, filters.availability);

  return filtered;
}

// Memoization cache for filter counts
let memoizedFilterCounts: {
  materials: Record<string, number>;
  colors: Record<string, number>;
} | null = null;
let memoizedCountsKey: string | null = null;

/**
 * Generate cache key for filter counts
 */
function generateCountsKey(
  productsLength: number,
  filters: SearchFilters
): string {
  return JSON.stringify({
    productsLength,
    filters,
  });
}

/**
 * Calculate filter counts for each filter option (with memoization)
 * @param products - All products
 * @param currentFilters - Current filter state
 * @returns Object with counts for each filter type
 */
export function calculateFilterCounts(
  products: SearchableProduct[],
  currentFilters: SearchFilters
) {
  // Generate cache key
  const currentKey = generateCountsKey(products.length, currentFilters);

  // Return cached result if available
  if (memoizedCountsKey === currentKey && memoizedFilterCounts) {
    return memoizedFilterCounts;
  }

  // Get all unique materials
  const allMaterials = new Set<string>();
  products.forEach((p) => {
    p.availableMaterials.forEach((m) => allMaterials.add(m));
  });

  // Get all unique colors
  const allColors = new Set<string>();
  products.forEach((p) => {
    p.availableColors.forEach((c) => allColors.add(c));
  });

  // Calculate counts for each material
  const materialCounts: Record<string, number> = {};
  allMaterials.forEach((material) => {
    const tempFilters = { ...currentFilters, materials: [material] };
    const filtered = applyAllFilters(products, tempFilters);
    materialCounts[material] = filtered.length;
  });

  // Calculate counts for each color
  const colorCounts: Record<string, number> = {};
  allColors.forEach((color) => {
    const tempFilters = { ...currentFilters, colors: [color] };
    const filtered = applyAllFilters(products, tempFilters);
    colorCounts[color] = filtered.length;
  });

  const result = {
    materials: materialCounts,
    colors: colorCounts,
  };

  // Cache the result
  memoizedFilterCounts = result;
  memoizedCountsKey = currentKey;

  return result;
}

/**
 * Invalidate filter counts cache (call when products change)
 */
export function invalidateFilterCountsCache() {
  memoizedFilterCounts = null;
  memoizedCountsKey = null;
}
